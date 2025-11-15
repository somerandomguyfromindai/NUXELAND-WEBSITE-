import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, Lightbulb, MoveUp, Hand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot, Heart } from "lucide-react";
import MissionBriefing from "./MissionBriefing";
import GameAIAssistant from "./GameAIAssistant";
import PowerCoreHackingPuzzle from "./PowerCoreHackingPuzzle";

export default function Mission3DView({ gameState, setGameState }) {
  const mountRef = useRef(null);
  const [missionLog, setMissionLog] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 0 });
  const [inventory, setInventory] = useState([]);
  const [puzzleStates, setPuzzleStates] = useState({});
  const [showBriefing, setShowBriefing] = useState(true);
  const [missionStarted, setMissionStarted] = useState(false);
  const [destroyedObjects, setDestroyedObjects] = useState([]);
  const [leverStates, setLeverStates] = useState({});
  const [activatedButtons, setActivatedButtons] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [mobileControls, setMobileControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    crouch: false
  });
  const mobileControlsRef = useRef(mobileControls);
  const [environmentVariant, setEnvironmentVariant] = useState(null);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showHackingPuzzle, setShowHackingPuzzle] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    mobileControlsRef.current = mobileControls;
  }, [mobileControls]);

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const activeMission = missions.find(m => m.status === 'active');
  const nextMission = missions.find(m => m.status === 'locked' && m.mission_number === (activeMission?.mission_number || 0) + 1);

  const addLog = (message, type = 'info') => {
    setMissionLog(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const completeMission = () => {
    if (activeMission) {
      addLog(`Mission ${activeMission.mission_number} COMPLETE`, 'success');
      
      updateMissionMutation.mutate({
        id: activeMission.id,
        data: { status: 'completed' }
      });

      setGameState(prev => ({
        ...prev,
        completedMissions: [...prev.completedMissions, activeMission.id],
        unlockedChannels: [...prev.unlockedChannels, ...(activeMission.unlocks || [])]
      }));

      if (nextMission) {
        setTimeout(() => {
          updateMissionMutation.mutate({
            id: nextMission.id,
            data: { status: 'active' }
          });
          addLog(`Mission ${nextMission.mission_number} UNLOCKED`, 'warning');
          setShowBriefing(true);
          setMissionStarted(false);
          setInventory([]);
          setPuzzleStates({});
          setDestroyedObjects([]);
          setLeverStates({});
          setActivatedButtons([]);
          setEnvironmentVariant(null);
          setPlayerHealth(100);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current || !activeMission || !missionStarted) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb8d4e8);
    scene.fog = new THREE.FogExp2(0xb8d4e8, 0.008);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.5);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);

    const counterGeometry = new THREE.PlaneGeometry(200, 200);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f0,
      roughness: 0.3,
      metalness: 0.2,
      envMapIntensity: 1
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.rotation.x = -Math.PI / 2;
    counter.receiveShadow = true;
    scene.add(counter);

    const gridHelper = new THREE.GridHelper(200, 40, 0xe0e0e0, 0xf0f0f0);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    
    const playerGroup = new THREE.Group();
    
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e40af,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    const helmetGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const helmetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.9;
    helmet.castShadow = true;
    playerGroup.add(helmet);

    const visorGeometry = new THREE.RingGeometry(0.15, 0.2, 16);
    const visorMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 0.9, 0.3);
    playerGroup.add(visor);

    playerGroup.position.set(0, 1, 0);
    scene.add(playerGroup);
    const player = playerGroup;

    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let destructibleObjects = [];
    let interactiveObjects = [];
    let mistParticles = [];
    let missionComplete = false;
    let resourceObjects = [];
    
    let playerVelocityY = 0;
    let isOnGround = true;
    let isOnRope = false;
    let ropeLine = null;
    let isCrouching = false;
    const gravity = -25;
    const ropeSpeed = 8;
    const playerHalfHeight = 0.8;
    const playerRadius = 0.4;
    let jumpCount = 0;
    const ceilingHeight = 50;
    let lastDamageTime = 0;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Hold SPACE to deploy rope!", 'info');
      
      obstacles = [];
      
      const wallHeight = 50;
      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c5b9, roughness: 0.8 });
      
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(200, wallHeight, 2), wallMaterial);
      backWall.position.set(0, wallHeight/2, -100);
      backWall.receiveShadow = true;
      scene.add(backWall);
      
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(2, wallHeight, 200), wallMaterial);
      leftWall.position.set(-100, wallHeight/2, 0);
      leftWall.receiveShadow = true;
      scene.add(leftWall);
      
      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(2, wallHeight, 200), wallMaterial);
      rightWall.position.set(100, wallHeight/2, 0);
      rightWall.receiveShadow = true;
      scene.add(rightWall);
      
      const cabinetMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4e37, roughness: 0.6 });
      for (let i = 0; i < 4; i++) {
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 10), cabinetMaterial);
        cabinet.position.set(-60 + i * 40, 35, -95);
        cabinet.castShadow = true;
        scene.add(cabinet);
        obstacles.push(cabinet);
      }
      
      const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b7355, 
        roughness: 0.8,
        metalness: 0.1
      });
      const borderHeight = 3;
      
      const frontBorder = new THREE.Mesh(new THREE.BoxGeometry(200, borderHeight, 2), borderMaterial);
      frontBorder.position.set(0, borderHeight/2, 100);
      frontBorder.castShadow = true;
      scene.add(frontBorder);
      obstacles.push(frontBorder);
      
      const backBorder = new THREE.Mesh(new THREE.BoxGeometry(200, borderHeight, 2), borderMaterial);
      backBorder.position.set(0, borderHeight/2, -100);
      backBorder.castShadow = true;
      scene.add(backBorder);
      obstacles.push(backBorder);
      
      const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(2, borderHeight, 200), borderMaterial);
      leftBorder.position.set(-100, borderHeight/2, 0);
      leftBorder.castShadow = true;
      scene.add(leftBorder);
      obstacles.push(leftBorder);
      
      const rightBorder = new THREE.Mesh(new THREE.BoxGeometry(2, borderHeight, 200), borderMaterial);
      rightBorder.position.set(100, borderHeight/2, 0);
      rightBorder.castShadow = true;
      scene.add(rightBorder);
      obstacles.push(rightBorder);
      
      const sinkOuterRim = new THREE.Mesh(
        new THREE.BoxGeometry(30, 0.8, 22),
        new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.95, roughness: 0.05 })
      );
      sinkOuterRim.position.set(-5, 0.4, -25);
      sinkOuterRim.castShadow = true;
      scene.add(sinkOuterRim);
      obstacles.push(sinkOuterRim);
      
      const buttonGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: activatedButtons.includes('button1') ? 0.8 : 0.6,
        roughness: 0.3,
        metalness: 0.7
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.position.set(-5, 1.1, -25);
      button1.userData = { type: 'button', id: 'button1' };
      button1.castShadow = true;
      scene.add(button1);
      puzzleElements.push(button1);
      obstacles.push(button1);

      const knife = new THREE.Group();
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 20),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.98, roughness: 0.02 })
      );
      blade.position.z = 10;
      blade.castShadow = true;
      knife.add(blade);
      
      knife.position.set(80, 0.8, 35);
      knife.userData = { type: 'lever', id: 'lever1' };
      scene.add(knife);
      puzzleElements.push(knife);
      obstacles.push(knife);

      const napkin = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 })
      );
      napkin.position.set(35, 0.15, -5);
      napkin.castShadow = true;
      scene.add(napkin);
      obstacles.push(napkin);

      const plateDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.4, 64),
        new THREE.MeshStandardMaterial({ 
          color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
          emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
          emissiveIntensity: puzzleStates.plate1 ? 0.6 : 0,
          metalness: 0.8
        })
      );
      plateDisc.position.set(35, 0.35, -5);
      plateDisc.userData = { type: 'pressure_plate', id: 'plate1' };
      plateDisc.castShadow = true;
      scene.add(plateDisc);
      puzzleElements.push(plateDisc);
      obstacles.push(plateDisc);

      const waterDrop = new THREE.Mesh(
        new THREE.SphereGeometry(3, 64, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.7,
          transmission: 0.95,
          roughness: 0,
          metalness: 0
        })
      );
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      waterDrop.position.set(70, canReachWater ? 3 : 25, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);

    } else if (activeMission.mission_number === 2) {
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 30, 150);
      
      addLog("Mission 2: Lab infiltration", 'warning');
      
      player.position.set(-80, 1, 80);
      obstacles = [];

      const labFloorGeometry = new THREE.PlaneGeometry(200, 200);
      const labFloorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a4a,
        roughness: 0.9,
        metalness: 0.1
      });
      const labFloor = new THREE.Mesh(labFloorGeometry, labFloorMaterial);
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

      for (let i = 0; i < 3; i++) {
        const laser = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 8, 60),
          new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.6
          })
        );
        laser.position.set(-60 + i * 30, 4, 20);
        laser.userData = { type: 'laser', deadly: true, damage: 10 };
        scene.add(laser);
        interactiveObjects.push(laser);
      }

      const dataCore = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1,
          transparent: true,
          opacity: 0.8
        })
      );
      dataCore.position.set(0, 16, 0);
      dataCore.userData = { type: 'data_core', accessible: true };
      dataCore.castShadow = true;
      scene.add(dataCore);
      objectives.push(dataCore);

    } else if (activeMission.mission_number === 3) {
      scene.background = new THREE.Color(0x0d0d1a);
      scene.fog = new THREE.Fog(0x0d0d1a, 20, 120);
      
      addLog("Mission 3: Specimen Retrieval - Agent Pip", 'warning');
      addLog("Use C to CROUCH under lasers!", 'info');
      
      player.position.set(-70, 1, 70);
      obstacles = [];

      const floorGeometry = new THREE.PlaneGeometry(200, 200);
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2a,
        roughness: 0.95,
        metalness: 0.05
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const redLight = new THREE.PointLight(0xff0000, 2, 100);
      redLight.position.set(0, 20, 0);
      scene.add(redLight);

      const laserPositions = [
        { x: -50, z: 20, width: 60 },
        { x: -20, z: -10, width: 50 },
        { x: 20, z: -40, width: 55 }
      ];

      laserPositions.forEach((pos) => {
        const laser = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 4, pos.width),
          new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.7,
            emissive: 0xff0000,
            emissiveIntensity: 1
          })
        );
        laser.position.set(pos.x, 2, pos.z);
        laser.userData = { type: 'laser', deadly: true, damage: 15 };
        scene.add(laser);
        interactiveObjects.push(laser);
      });

      const powerCore = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.8,
          transmission: 0.5
        })
      );
      powerCore.position.set(0, 5, -90);
      powerCore.userData = { type: 'power_core', accessible: true, needsHack: true };
      powerCore.castShadow = true;
      scene.add(powerCore);
      objectives.push(powerCore);

      addLog("Bio-stress warning: Agent Pip vitals unstable!", 'error');
    }

    const keys = {};
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      
      if (e.key.toLowerCase() === 'c') {
        isCrouching = true;
      }
      
      if (e.key.toLowerCase() === 'e') {
        puzzleElements.forEach(elem => {
          const distance = player.position.distanceTo(elem.position);
          if (distance < 3) {
            if (elem.userData.type === 'button') {
              if (!activatedButtons.includes(elem.userData.id)) {
                setActivatedButtons(prev => [...prev, elem.userData.id]);
                addLog(`✓ Button activated!`, 'success');
              }
            } else if (elem.userData.type === 'lever') {
              const leverId = elem.userData.id;
              setLeverStates(prev => ({ ...prev, [leverId]: !prev[leverId] }));
              addLog(`✓ Lever toggled!`, 'info');
            }
          }
        });

        objectives.forEach(obj => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 5 && obj.userData.type === 'power_core' && obj.userData.needsHack) {
            addLog('Accessing Power Core...', 'info');
            setShowHackingPuzzle(true);
          }
        });
      }
    };
    
    const handleKeyUp = (e) => { 
      keys[e.key.toLowerCase()] = false;
      if (e.key.toLowerCase() === 'c') {
        isCrouching = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let mouseX = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    
    const animate = () => {
      const delta = clock.getDelta();
      const currentTime = clock.elapsedTime;

      const isSpaceOrMobileJumpPressed = keys[' '] || mobileControlsRef.current.jump;

      if (isSpaceOrMobileJumpPressed) {
        if (!isOnRope) {
          const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
          const ropeGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(player.position.x, player.position.y, player.position.z),
            new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
          ]);
          ropeLine = new THREE.Line(ropeGeometry, ropeMaterial);
          scene.add(ropeLine);
          isOnRope = true;
          playerVelocityY = 0;
          isOnGround = false;
          jumpCount = 0;
        }
      } else {
        if (ropeLine) {
          scene.remove(ropeLine);
          ropeLine.geometry.dispose();
          ropeLine.material.dispose();
          ropeLine = null;
          isOnRope = false;
        }
      }
      
      if (mobileControlsRef.current.jump) {
        setMobileControls(prev => ({ ...prev, jump: false }));
      }

      if (isCrouching || mobileControlsRef.current.crouch) {
        player.scale.y = 0.5;
      } else {
        player.scale.y = 1;
      }

      if (isOnRope) {
        playerVelocityY = 0;

        if (keys['w'] || mobileControlsRef.current.up) {
          player.position.y += ropeSpeed * delta;
          if (player.position.y > ceilingHeight - playerHalfHeight - 0.5) {
            player.position.y = ceilingHeight - playerHalfHeight - 0.5;
          }
        }
        if (keys['s'] || mobileControlsRef.current.down) {
          player.position.y -= ropeSpeed * delta;
          if (player.position.y < playerHalfHeight) {
            player.position.y = playerHalfHeight;
          }
        }

        const ropeHorizontalSpeed = (keys['shift'] ? 20 : 10) * 0.5;
        if (keys['a'] || mobileControlsRef.current.left) {
          player.position.x -= ropeHorizontalSpeed * delta;
        }
        if (keys['d'] || mobileControlsRef.current.right) {
          player.position.x += ropeHorizontalSpeed * delta;
        }

        const ropePoints = [
          new THREE.Vector3(player.position.x, player.position.y, player.position.z),
          new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
        ];
        ropeLine.geometry.setFromPoints(ropePoints);

        isOnGround = false;
        jumpCount = 0;
      } else {
        if (!isOnGround) {
          playerVelocityY += gravity * delta;
        }

        const baseSpeed = keys['shift'] ? 20 : 10;
        const speed = isCrouching ? baseSpeed * 0.5 : baseSpeed;
        const direction = new THREE.Vector3();

        if (keys['w'] || mobileControlsRef.current.up) direction.z -= 1;
        if (keys['s'] || mobileControlsRef.current.down) direction.z += 1;
        if (keys['a'] || mobileControlsRef.current.left) direction.x -= 1;
        if (keys['d'] || mobileControlsRef.current.right) direction.x += 1;

        const targetHorizontalPosition = new THREE.Vector3(player.position.x, 0, player.position.z);

        if (direction.length() > 0) {
          direction.normalize();
          targetHorizontalPosition.x += direction.x * speed * delta;
          targetHorizontalPosition.z += direction.z * speed * delta;
        }
        
        let newPlayerPositionY = player.position.y + playerVelocityY * delta;

        isOnGround = false;

        if (newPlayerPositionY - playerHalfHeight <= 0) {
          newPlayerPositionY = playerHalfHeight;
          playerVelocityY = 0;
          isOnGround = true;
          jumpCount = 0;
        }

        let actualHorizontalPosition = new THREE.Vector3(targetHorizontalPosition.x, player.position.y, targetHorizontalPosition.z);
        
        obstacles.forEach(obs => {
          const obsBox = new THREE.Box3().setFromObject(obs);

          const playerBoxAtTargetPos = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(targetHorizontalPosition.x, newPlayerPositionY, targetHorizontalPosition.z),
            new THREE.Vector3(playerRadius * 2, playerHalfHeight * 2, playerRadius * 2)
          );

          if (playerVelocityY < 0 && 
            (player.position.y - playerHalfHeight) >= (obsBox.max.y - 0.1) &&
            (newPlayerPositionY - playerHalfHeight) < (obsBox.max.y + 0.1) &&
            playerBoxAtTargetPos.intersectsBox(obsBox)
          ) {
            newPlayerPositionY = obsBox.max.y + playerHalfHeight;
            playerVelocityY = 0;
            isOnGround = true;
            jumpCount = 0;
          }
          else if (playerVelocityY > 0 && 
            (player.position.y + playerHalfHeight) <= (obsBox.min.y + 0.1) &&
            (newPlayerPositionY + playerHalfHeight) > (obsBox.min.y - 0.1) &&
            playerBoxAtTargetPos.intersectsBox(obsBox)
          ) {
            playerVelocityY = 0;
            newPlayerPositionY = obsBox.min.y - playerHalfHeight;
          }
          if (playerBoxAtTargetPos.intersectsBox(obsBox)) {
            actualHorizontalPosition.x = player.position.x;
            actualHorizontalPosition.z = player.position.z;
          }
        });

        player.position.x = actualHorizontalPosition.x;
        player.position.z = actualHorizontalPosition.z;
        player.position.y = newPlayerPositionY;
      }

      setPlayerPosition({ x: player.position.x, y: player.position.y, z: player.position.z });

      interactiveObjects.forEach(obj => {
        if (obj.userData.type === 'laser' && obj.userData.deadly) {
          const distance = player.position.distanceTo(obj.position);
          const playerEffectiveHeight = isCrouching ? 0.4 : 0.8;
          
          if (distance < 5 && 
              player.position.y < obj.position.y + 2 && 
              player.position.y + playerEffectiveHeight > obj.position.y - 2) {
            
            if (isCrouching && obj.position.y > 1.5) {
              // Successfully crouched under laser
            } else if (currentTime - lastDamageTime > 0.5) {
              setPlayerHealth(prev => {
                const newHealth = Math.max(0, prev - obj.userData.damage);
                if (newHealth <= 0) {
                  addLog("CRITICAL: Health depleted!", 'error');
                }
                return newHealth;
              });
              addLog("LASER HIT! -" + obj.userData.damage + " HP", 'error');
              lastDamageTime = currentTime;
            }
          }
        }
      });

      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          
          const plateHalfHeight = elem.geometry.parameters.height / 2;
          const plateTopY = elem.position.y + plateHalfHeight;

          const playerIsOnPlate = distance < 2 &&
                                 (player.position.y - playerHalfHeight <= plateTopY + 0.2) &&
                                 (player.position.y - playerHalfHeight >= plateTopY - 0.5);
          
          if (playerIsOnPlate) {
            if (!puzzleStates[elem.userData.id]) {
              setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
              addLog(`✓ Pressure plate activated!`, 'info');
            }
          }
        }
      });

      objectives.forEach(obj => {
        if (obj.userData.type === 'water_source' && obj.userData.accessible) {
          const distance = player.position.distanceTo(obj.position);
          if (!missionComplete && distance < 5) {
            missionComplete = true;
            completeMission();
          }
        }

        if (obj.userData.type === 'data_core' && obj.userData.accessible) {
          const distance = player.position.distanceTo(obj.position);
          if (!missionComplete && distance < 5) {
            missionComplete = true;
            addLog('DATA CORE EXTRACTED!', 'success');
            completeMission();
          }
        }

        obj.position.y += Math.sin(clock.elapsedTime * 2) * 0.02;
        obj.rotation.y += delta * 0.5;
      });

      camera.position.x = player.position.x + mouseX * 8;
      camera.position.y = player.position.y + 15;
      camera.position.z = player.position.z + 22;
      camera.lookAt(player.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      if (ropeLine) {
        scene.remove(ropeLine);
        ropeLine.geometry.dispose();
        ropeLine.material.dispose();
      }

      renderer.dispose();
    };
  }, [activeMission, puzzleStates, inventory, missionStarted, destroyedObjects, leverStates, activatedButtons]);

  const handleMobileJump = () => {
    setMobileControls(prev => ({ ...prev, jump: true }));
  };

  const handleMobileCrouch = () => {
    setMobileControls(prev => ({ ...prev, crouch: !prev.crouch }));
  };

  const handleMobileInteract = () => {
    const keyEvent = new KeyboardEvent('keydown', { key: 'e' });
    window.dispatchEvent(keyEvent);
  };

  const handleHackingComplete = () => {
    setShowHackingPuzzle(false);
    addLog('Power Core HACKED!', 'success');
    completeMission();
  };

  if (!activeMission) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900 text-white">
        <p className="font-mono">No active mission. Please select a mission from the main console.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-4 p-6">
      {showBriefing && activeMission && (
        <MissionBriefing
          mission={activeMission}
          onStart={() => {
            setShowBriefing(false);
            setMissionStarted(true);
            addLog(`Mission ${activeMission.mission_number} started`, 'info');
          }}
          puzzleStates={puzzleStates}
          inventory={inventory}
        />
      )}

      <GameAIAssistant
        mission={activeMission}
        puzzleStates={puzzleStates}
        inventory={inventory}
        playerPosition={playerPosition}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      {showHackingPuzzle && (
        <PowerCoreHackingPuzzle
          onComplete={handleHackingComplete}
          onClose={() => setShowHackingPuzzle(false)}
        />
      )}

      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div ref={mountRef} className="w-full h-[600px] bg-gray-900" />
            
            {!missionStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-white font-mono text-xl">Loading mission briefing...</p>
              </div>
            )}
            
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-red-500/50 rounded p-3 z-10 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Heart className={`w-5 h-5 ${playerHealth > 50 ? 'text-green-400' : playerHealth > 25 ? 'text-yellow-400' : 'text-red-400'}`} />
                <span className="text-white font-mono text-sm font-bold">HEALTH: {playerHealth}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    playerHealth > 50 ? 'bg-green-500' : 
                    playerHealth > 25 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${playerHealth}%` }}
                />
              </div>
            </div>

            <div className="absolute top-24 left-4 bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded p-3 z-10">
              <p className="text-blue-400 font-mono text-sm font-bold mb-1">
                {activeMission ? `MISSION ${activeMission.mission_number}` : 'AWAITING MISSION'}
              </p>
              <p className="text-gray-300 font-mono text-xs">
                {activeMission?.title || 'No active mission'}
              </p>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                onClick={() => setShowAIAssistant(true)}
                className="bg-cyan-600/80 hover:bg-cyan-700/80 backdrop-blur-sm font-mono text-xs"
                size="sm"
              >
                <Bot className="w-4 h-4 mr-1" />
                AI
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300 hidden md:block z-10">
              <p>W/A/S/D: Move | SPACE: Rope | C: CROUCH | E: Interact</p>
              {activeMission?.mission_number === 3 && (
                <p className="text-yellow-400 mt-1 font-bold">
                  CROUCH (C) under lasers to avoid damage!
                </p>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 md:hidden flex justify-between items-end gap-4 z-10">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-1">
                  <div></div>
                  <button
                    onTouchStart={() => setMobileControls(prev => ({ ...prev, up: true }))}
                    onTouchEnd={() => setMobileControls(prev => ({ ...prev, up: false }))}
                    className="w-12 h-12 bg-blue-500/80 rounded flex items-center justify-center active:bg-blue-600"
                  >
                    <ArrowUp className="w-6 h-6 text-white" />
                  </button>
                  <div></div>
                  <button
                    onTouchStart={() => setMobileControls(prev => ({ ...prev, left: true }))}
                    onTouchEnd={() => setMobileControls(prev => ({ ...prev, left: false }))}
                    className="w-12 h-12 bg-blue-500/80 rounded flex items-center justify-center active:bg-blue-600"
                  >
                    <ArrowLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onTouchStart={() => setMobileControls(prev => ({ ...prev, down: true }))}
                    onTouchEnd={() => setMobileControls(prev => ({ ...prev, down: false }))}
                    className="w-12 h-12 bg-blue-500/80 rounded flex items-center justify-center active:bg-blue-600"
                  >
                    <ArrowDown className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onTouchStart={() => setMobileControls(prev => ({ ...prev, right: true }))}
                    onTouchEnd={() => setMobileControls(prev => ({ ...prev, right: false }))}
                    className="w-12 h-12 bg-blue-500/80 rounded flex items-center justify-center active:bg-blue-600"
                  >
                    <ArrowRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onTouchStart={handleMobileJump}
                  className="w-14 h-14 bg-green-500/80 rounded-full flex items-center justify-center active:bg-green-600"
                >
                  <MoveUp className="w-7 h-7 text-white" />
                </button>
                <button
                  onTouchStart={handleMobileCrouch}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    mobileControls.crouch ? 'bg-orange-600/80' : 'bg-orange-500/80'
                  }`}
                >
                  <ArrowDown className="w-7 h-7 text-white" />
                </button>
                <button
                  onTouchStart={handleMobileInteract}
                  className="w-14 h-14 bg-yellow-500/80 rounded-full flex items-center justify-center active:bg-yellow-600"
                >
                  <Hand className="w-7 h-7 text-white" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-mono font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              STATUS
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {activeMission?.mission_number === 1 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${activatedButtons.includes('button1') ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${activatedButtons.includes('button1') ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Sink Button</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${puzzleStates.plate1 ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${puzzleStates.plate1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Pressure Plate</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${leverStates.lever1 ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${leverStates.lever1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Knife Lever</span>
                </div>
              </>
            )}
            {activeMission?.mission_number === 3 && (
              <>
                <div className="flex items-center gap-2 p-2 rounded bg-red-900/20 border border-red-500/50">
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-sm font-mono text-red-300">Agent Pip: Bio-Stress HIGH</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-yellow-900/20 border border-yellow-500/50">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-mono text-yellow-300">Target: Power Core</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-mono font-bold text-sm">ACTIVITY LOG</h3>
          </div>
          <div className="p-4 space-y-1 max-h-[300px] overflow-y-auto">
            {missionLog.slice(-10).map((log, i) => (
              <div key={i} className="text-xs font-mono">
                <span className="text-gray-600">[{log.time}]</span>{' '}
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-400'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}