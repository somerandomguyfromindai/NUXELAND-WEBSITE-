import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, FileText, Hammer, Lightbulb } from "lucide-react";
import MissionBriefing from "./MissionBriefing";

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
  const queryClient = useQueryClient();

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

    // Realistic marble counter
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

    // Add subtle grid pattern
    const gridHelper = new THREE.GridHelper(200, 40, 0xe0e0e0, 0xf0f0f0);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Realistic player (ant-sized agent)
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

    // Helmet
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

    // Visor glow
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

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Navigate kitchen obstacles and reach the water source", 'info');
      
      // CERAMIC BOWL - realistic china
      const bowlGroup = new THREE.Group();
      const bowlRadius = 15;
      const bowlGeometry = new THREE.SphereGeometry(bowlRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
      const bowlMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
      bowl.position.set(30, 4, 20);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      
      // Bowl rim detail
      const rimGeometry = new THREE.TorusGeometry(bowlRadius, 0.5, 16, 64);
      const rim = new THREE.Mesh(rimGeometry, bowlMaterial);
      rim.position.set(30, 8, 20);
      rim.rotation.x = Math.PI / 2;
      scene.add(rim);
      
      bowlGroup.add(bowl);
      scene.add(bowlGroup);
      obstacles.push(bowl);

      // REALISTIC SPOON with reflection
      const spoonGroup = new THREE.Group();
      const handleGeometry = new THREE.CylinderGeometry(0.4, 0.5, 18, 16);
      const headGeometry = new THREE.SphereGeometry(2.5, 32, 32);
      const spoonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8e8e8,
        metalness: 0.95,
        roughness: 0.05,
        envMapIntensity: 1.5
      });
      
      const handle = new THREE.Mesh(handleGeometry, spoonMaterial);
      handle.rotation.z = Math.PI / 2;
      handle.castShadow = true;
      
      const head = new THREE.Mesh(headGeometry, spoonMaterial);
      head.position.x = 10;
      head.scale.set(1, 0.4, 1);
      head.castShadow = true;
      
      spoonGroup.add(handle);
      spoonGroup.add(head);
      spoonGroup.position.set(-15, 1.2, -10);
      spoonGroup.rotation.y = Math.PI / 4;
      scene.add(spoonGroup);
      obstacles.push(spoonGroup);

      // CERAMIC COFFEE MUG with handle
      const mugGeometry = new THREE.CylinderGeometry(5, 4.2, 10, 32);
      const mugMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.6,
        metalness: 0.1
      });
      const mug = new THREE.Mesh(mugGeometry, mugMaterial);
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      mug.receiveShadow = true;
      scene.add(mug);
      
      const handleTorusGeometry = new THREE.TorusGeometry(3, 0.6, 16, 32, Math.PI);
      const mugHandleMesh = new THREE.Mesh(handleTorusGeometry, mugMaterial);
      mugHandleMesh.position.set(50, 5, -20);
      mugHandleMesh.rotation.y = -Math.PI / 2;
      mugHandleMesh.rotation.x = Math.PI / 2;
      mugHandleMesh.castShadow = true;
      scene.add(mugHandleMesh);
      obstacles.push(mug);

      // BREADCRUMBS - realistic texture
      for (let i = 0; i < 8; i++) {
        const crumbSize = 1.2 + Math.random() * 1.8;
        const crumbGeometry = new THREE.DodecahedronGeometry(crumbSize, 1);
        const crumbMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xdaa520,
          roughness: 0.95,
          metalness: 0
        });
        const crumb = new THREE.Mesh(crumbGeometry, crumbMaterial);
        crumb.position.set(
          10 + i * 4 + Math.random() * 2,
          crumbSize / 2,
          5 + Math.random() * 4
        );
        crumb.rotation.set(Math.random(), Math.random(), Math.random());
        crumb.castShadow = true;
        crumb.receiveShadow = true;
        crumb.userData = { type: 'destructible', id: `crumb_${i}`, health: 2 };
        if (!destroyedObjects.includes(`crumb_${i}`)) {
          scene.add(crumb);
          destructibleObjects.push(crumb);
          obstacles.push(crumb);
        }
      }

      // BUTTER STICK - glossy realistic
      const butterGeometry = new THREE.BoxGeometry(8, 2, 4);
      const butterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        roughness: 0.2,
        metalness: 0.1
      });
      const butter = new THREE.Mesh(butterGeometry, butterMaterial);
      butter.position.set(-25, 1, 15);
      butter.castShadow = true;
      butter.receiveShadow = true;
      butter.userData = { type: 'slippery', slipFactor: 3 };
      scene.add(butter);
      interactiveObjects.push(butter);

      // GLASS SALT SHAKER - transparent
      const saltBaseGeometry = new THREE.CylinderGeometry(3, 3, 15, 32);
      const saltMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0,
        transparent: true,
        opacity: 0.3,
        transmission: 0.9,
        thickness: 0.5
      });
      const saltShaker = new THREE.Mesh(saltBaseGeometry, saltMaterial);
      saltShaker.position.set(-5, 7.5, -25);
      saltShaker.castShadow = true;
      saltShaker.receiveShadow = true;
      scene.add(saltShaker);
      
      const saltTopGeometry = new THREE.ConeGeometry(3, 5, 32);
      const saltTopMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        roughness: 0.4,
        metalness: 0.8
      });
      const saltTop = new THREE.Mesh(saltTopGeometry, saltTopMaterial);
      saltTop.position.set(-5, 17.5, -25);
      saltTop.castShadow = true;
      scene.add(saltTop);
      obstacles.push(saltShaker);

      // INTERACTIVE BUTTON on salt shaker
      const buttonGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: activatedButtons.includes('button1') ? 0.8 : 0.6,
        roughness: 0.3,
        metalness: 0.7
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.position.set(-5, 20.5, -25);
      button1.userData = { type: 'button', id: 'button1' };
      button1.castShadow = true;
      scene.add(button1);
      puzzleElements.push(button1);

      // Indicator light ring
      if (activatedButtons.includes('button1')) {
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(-5, 20.5, -25);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
      }

      // METAL FORK - activated bridge
      if (activatedButtons.includes('button1')) {
        const forkHandleGeometry = new THREE.BoxGeometry(2, 0.6, 25);
        const forkMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xd3d3d3,
          metalness: 0.9,
          roughness: 0.1
        });
        const fork = new THREE.Mesh(forkHandleGeometry, forkMaterial);
        fork.position.set(15, 1.3, -15);
        fork.rotation.y = Math.PI / 6;
        fork.castShadow = true;
        fork.receiveShadow = true;
        scene.add(fork);
        
        for (let i = 0; i < 4; i++) {
          const prongGeometry = new THREE.BoxGeometry(0.5, 0.5, 6);
          const prong = new THREE.Mesh(prongGeometry, forkMaterial);
          prong.position.set(15 + (i - 1.5) * 0.8, 1.3, -27);
          prong.rotation.y = Math.PI / 6;
          prong.castShadow = true;
          scene.add(prong);
        }
      }

      // CLOTH NAPKIN
      const napkinGeometry = new THREE.BoxGeometry(12, 0.3, 12);
      const napkinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfafafa,
        roughness: 0.9,
        metalness: 0
      });
      const napkin = new THREE.Mesh(napkinGeometry, napkinMaterial);
      napkin.position.set(35, 0.15, -5);
      napkin.rotation.y = Math.PI / 8;
      napkin.receiveShadow = true;
      napkin.castShadow = true;
      scene.add(napkin);

      // PRESSURE PLATE
      const plateDiscGeometry = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 64);
      const plateMaterial = new THREE.MeshStandardMaterial({ 
        color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
        emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
        emissiveIntensity: puzzleStates.plate1 ? 0.6 : 0,
        metalness: 0.8,
        roughness: 0.2
      });
      const plate1 = new THREE.Mesh(plateDiscGeometry, plateMaterial);
      plate1.position.set(35, 0.35, -5);
      plate1.userData = { type: 'pressure_plate', id: 'plate1' };
      plate1.castShadow = true;
      scene.add(plate1);
      puzzleElements.push(plate1);

      // KNIFE LEVER
      const knifeBladeGeometry = new THREE.BoxGeometry(1.2, 0.2, 16);
      const knifeHandleGeometry = new THREE.CylinderGeometry(0.7, 0.7, 5, 16);
      const knifeBladeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0,
        metalness: 0.95,
        roughness: 0.05
      });
      const knifeHandleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a2511,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const knife = new THREE.Group();
      const blade = new THREE.Mesh(knifeBladeGeometry, knifeBladeMaterial);
      blade.position.z = 8;
      blade.castShadow = true;
      
      const handleMesh = new THREE.Mesh(knifeHandleGeometry, knifeHandleMaterial);
      handleMesh.rotation.x = Math.PI / 2;
      handleMesh.position.z = -2.5;
      handleMesh.castShadow = true;
      
      knife.add(blade);
      knife.add(handleMesh);
      knife.position.set(40, 0.6, 10);
      knife.rotation.y = -Math.PI / 4;
      knife.userData = { type: 'lever', id: 'lever1' };
      scene.add(knife);
      puzzleElements.push(knife);

      // CERAMIC PLATE (rises when lever activated)
      const dishGeometry = new THREE.CylinderGeometry(8, 7, 1.2, 64);
      const dishMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.25,
        metalness: 0.1
      });
      const plate = new THREE.Mesh(dishGeometry, dishMaterial);
      const plateHeight = leverStates.lever1 ? 8 : 0.6;
      plate.position.set(55, plateHeight, 0);
      plate.castShadow = true;
      plate.receiveShadow = true;
      scene.add(plate);
      interactiveObjects.push(plate);

      // SUGAR CUBES - white crystalline
      const sugarPositions = [
        { x: 20, y: 1, z: -8 },
        { x: 22, y: 1, z: -8 },
        { x: 21, y: 3, z: -8 },
        { x: 24, y: 1, z: -6 }
      ];
      sugarPositions.forEach((pos, i) => {
        const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        const cubeMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          roughness: 0.7,
          metalness: 0.1
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(pos.x, pos.y, pos.z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.userData = { type: 'destructible', id: `sugar_${i}`, health: 3 };
        if (!destroyedObjects.includes(`sugar_${i}`)) {
          scene.add(cube);
          destructibleObjects.push(cube);
          obstacles.push(cube);
        }
      });

      // WATER DROPLET OBJECTIVE - glowing liquid
      const waterGeometry = new THREE.SphereGeometry(3, 64, 64);
      const waterMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x4dd0e1,
        transparent: true,
        opacity: 0.7,
        transmission: 0.95,
        roughness: 0,
        metalness: 0,
        thickness: 2,
        envMapIntensity: 1.5
      });
      const waterDrop = new THREE.Mesh(waterGeometry, waterMaterial);
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      waterDrop.position.set(70, canReachWater ? 10 : 25, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);

      // Add glow effect around water
      const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4dd0e1,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(waterDrop.position);
      scene.add(glow);

      // MIST PARTICLES
      if (canReachWater) {
        for (let i = 0; i < 40; i++) {
          const mistGeometry = new THREE.SphereGeometry(0.4, 8, 8);
          const mistMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
          });
          const mist = new THREE.Mesh(mistGeometry, mistMaterial);
          mist.position.set(
            65 + Math.random() * 10,
            5 + Math.random() * 15,
            0 + Math.random() * 10
          );
          mist.userData = { 
            type: 'mist',
            velocity: { y: Math.random() * 0.02 + 0.01 }
          };
          scene.add(mist);
          mistParticles.push(mist);
        }
      }

    } else if (activeMission.mission_number === 2) {
      addLog("Mission 2: Lab infiltration and data extraction", 'warning');
      
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 30, 100);

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

      addLog("Advanced security systems active", 'warning');
    }

    const keys = {};
    let onSlippery = false;
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      
      if (e.key.toLowerCase() === 'e') {
        puzzleElements.forEach(elem => {
          const distance = player.position.distanceTo(elem.position);
          if (distance < 3) {
            if (elem.userData.type === 'button') {
              if (!activatedButtons.includes(elem.userData.id)) {
                setActivatedButtons(prev => [...prev, elem.userData.id]);
                addLog(`✓ Button activated! Fork bridge appeared.`, 'success');
              }
            } else if (elem.userData.type === 'lever') {
              const leverId = elem.userData.id;
              setLeverStates(prev => ({ ...prev, [leverId]: !prev[leverId] }));
              addLog(`✓ Lever ${!leverStates[leverId] ? 'activated' : 'deactivated'}! Plate moved.`, 'info');
            } else if (elem.userData.type === 'pressure_plate') {
              setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
              addLog(`✓ Pressure plate activated!`, 'info');
            }
          }
        });

        destructibleObjects.forEach((obj, index) => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 3) {
            obj.userData.health -= 1;
            if (obj.userData.health <= 0) {
              addLog(`Destroyed ${obj.userData.id}`, 'info');
              setDestroyedObjects(prev => [...prev, obj.userData.id]);
              scene.remove(obj);
              destructibleObjects.splice(index, 1);
              obstacles = obstacles.filter(o => o !== obj);
            } else {
              addLog(`Hit ${obj.userData.id} - Health: ${obj.userData.health}`, 'warning');
              obj.material.emissive.setHex(0xff0000);
              obj.material.emissiveIntensity = 0.5;
              setTimeout(() => {
                obj.material.emissive.setHex(0x000000);
                obj.material.emissiveIntensity = 0;
              }, 200);
            }
          }
        });
      }
    };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    
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

      const baseSpeed = keys['shift'] ? 20 : 10;
      const speed = onSlippery ? baseSpeed * 1.5 : baseSpeed;
      const direction = new THREE.Vector3();

      if (keys['w']) direction.z -= 1;
      if (keys['s']) direction.z += 1;
      if (keys['a']) direction.x -= 1;
      if (keys['d']) direction.x += 1;

      if (direction.length() > 0) {
        direction.normalize();
        const newVelocity = new THREE.Vector3(
          direction.x * speed * delta,
          0,
          direction.z * speed * delta
        );
        
        const newPosition = player.position.clone().add(newVelocity);
        
        let collision = false;
        onSlippery = false;

        obstacles.forEach(obs => {
          const obsBox = new THREE.Box3().setFromObject(obs);
          const playerBox = new THREE.Box3().setFromCenterAndSize(
            newPosition,
            new THREE.Vector3(1, 2, 1)
          );
          if (obsBox.intersectsBox(playerBox)) {
            collision = true;
          }
        });

        interactiveObjects.forEach(obj => {
          if (obj.userData.type === 'slippery') {
            const distance = new THREE.Vector2(newPosition.x, newPosition.z)
              .distanceTo(new THREE.Vector2(obj.position.x, obj.position.z));
            if (distance < 5) {
              onSlippery = true;
            }
          }
        });

        if (!collision) {
          player.position.add(newVelocity);
          setPlayerPosition({ x: player.position.x, y: player.position.y, z: player.position.z });
        }
      }

      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          
          if (distance < 2) {
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

        obj.position.y += Math.sin(clock.elapsedTime * 2) * 0.02;
        obj.rotation.y += delta * 0.5;
      });

      interactiveObjects.forEach((obj, index) => {
        if (obj.userData.type === 'falling_hazard') {
          obj.position.y += obj.userData.velocity;
          obj.rotation.x += 0.1;
          obj.rotation.y += 0.05;
          
          if (obj.position.y < 0) {
            scene.remove(obj);
            interactiveObjects.splice(index, 1);
          }
          
          const distance = player.position.distanceTo(obj.position);
          if (distance < 2) {
            addLog("Hit by falling object!", 'error');
            player.position.set(0, 1, 0);
          }
        }
      });

      mistParticles.forEach(mist => {
        if (mist.userData.velocity) {
          mist.position.y += mist.userData.velocity.y;
          if (mist.position.y > 20) {
            mist.position.y = 5;
          }
        }
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
      
      renderer.dispose();
    };
  }, [activeMission, puzzleStates, inventory, missionStarted, destroyedObjects, leverStates, activatedButtons]);

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

      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div ref={mountRef} className="w-full h-[600px]" />
            
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded p-3">
              <p className="text-blue-400 font-mono text-sm font-bold mb-1">
                {activeMission ? `MISSION ${activeMission.mission_number}` : 'AWAITING MISSION'}
              </p>
              <p className="text-gray-300 font-mono text-xs">
                {activeMission?.title || 'No active mission'}
              </p>
              {activeMission && !missionStarted && (
                <Button
                  onClick={() => setShowBriefing(true)}
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full font-mono text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  View Briefing
                </Button>
              )}
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300">
              <p>W/A/S/D: Move | E: Interact/Destroy | Shift: Sprint</p>
              <p className="text-yellow-400 mt-1">
                <Hammer className="w-3 h-3 inline mr-1" />
                Hit objects multiple times to destroy
              </p>
            </div>

            <div className="absolute bottom-4 right-4">
              <Button
                onClick={() => setShowHint(!showHint)}
                className="bg-yellow-600/80 hover:bg-yellow-700/80 backdrop-blur-sm font-mono text-xs"
                size="sm"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {showHint ? 'Hide' : 'Show'} Hints
              </Button>
            </div>

            {showHint && activeMission?.mission_number === 1 && (
              <div className="absolute top-20 left-4 bg-yellow-900/90 backdrop-blur-sm border border-yellow-500/50 rounded p-4 max-w-md">
                <h4 className="text-yellow-300 font-mono font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Mission 1 Solution:
                </h4>
                <ol className="text-yellow-100 font-mono text-xs space-y-1 list-decimal list-inside">
                  <li>Climb the SALT SHAKER (cylindrical white object)</li>
                  <li>Press button [E] on top (turns green)</li>
                  <li>Fork bridge appears - cross it</li>
                  <li>Step on PRESSURE PLATE on napkin</li>
                  <li>Go to KNIFE, press [E] to activate lever</li>
                  <li>White plate rises up</li>
                  <li>Climb plate to reach WATER DROPLET</li>
                </ol>
                <p className="text-yellow-200 text-xs mt-2 italic">
                  All 3 puzzles must be completed to lower the water droplet!
                </p>
              </div>
            )}

            {!activeMission && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white font-mono text-xl mb-2">ALL MISSIONS COMPLETE</p>
                  <p className="text-gray-400 font-mono text-sm">Check File Browser and Comms for intel</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-mono font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              PUZZLE STATUS
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {activeMission?.mission_number === 1 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${activatedButtons.includes('button1') ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${activatedButtons.includes('button1') ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Salt Shaker Button</span>
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