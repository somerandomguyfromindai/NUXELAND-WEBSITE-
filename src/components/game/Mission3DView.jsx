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
          setPlayerHealth(100);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current || !activeMission || !missionStarted) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce8f5);
    scene.fog = new THREE.Fog(0xdce8f5, 50, 200);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // Realistic lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e1, 2.5);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Ambient occlusion light
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.6);
    fillLight.position.set(-50, 30, -50);
    scene.add(fillLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(-80, 50, 80);
    scene.add(rimLight);

    // Ultra-realistic counter/floor with bump mapping simulation
    const counterGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5dc,
      roughness: 0.85,
      metalness: 0.05,
      envMapIntensity: 0.5
    });
    
    // Add subtle height variation for realism
    const positions = counterGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, Math.random() * 0.02);
    }
    positions.needsUpdate = true;
    counterGeometry.computeVertexNormals();
    
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.rotation.x = -Math.PI / 2;
    counter.receiveShadow = true;
    scene.add(counter);

    // Subtle grid for scale reference
    const gridHelper = new THREE.GridHelper(200, 80, 0xd3d3d3, 0xe8e8e8);
    gridHelper.position.y = 0.02;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);
    
    // Ultra-realistic player character
    const playerGroup = new THREE.Group();
    
    // Body with better proportions
    const bodyGeometry = new THREE.CapsuleGeometry(0.35, 1.2, 16, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2563eb,
      roughness: 0.5,
      metalness: 0.7,
      envMapIntensity: 1.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    // Helmet with visor
    const helmetGeometry = new THREE.SphereGeometry(0.32, 32, 32);
    const helmetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      roughness: 0.2,
      metalness: 0.95,
      envMapIntensity: 1.5
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 1.1;
    helmet.castShadow = true;
    playerGroup.add(helmet);

    // Visor (transparent dark glass)
    const visorGeometry = new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const visorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x001a33,
      transparent: true,
      opacity: 0.4,
      metalness: 1,
      roughness: 0.1,
      transmission: 0.3
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.y = 1.1;
    visor.rotation.x = -0.3;
    playerGroup.add(visor);

    // Shoulder pads
    const shoulderGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6, metalness: 0.5 });
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-0.45, 0.6, 0);
    leftShoulder.scale.set(1, 0.6, 0.8);
    leftShoulder.castShadow = true;
    playerGroup.add(leftShoulder);
    
    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = 0.45;
    playerGroup.add(rightShoulder);

    playerGroup.position.set(0, 1.1, 0);
    scene.add(playerGroup);
    const player = playerGroup;

    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let missionComplete = false;
    
    let playerVelocityY = 0;
    let isOnGround = true;
    let isOnRope = false;
    let ropeLine = null;
    let isCrouching = false;
    const gravity = -28;
    const ropeSpeed = 10;
    const playerHalfHeight = 1.1;
    const playerRadius = 0.35;
    const ceilingHeight = 60;
    let lastDamageTime = 0;
    let headBob = 0;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Reach water! SPACE for rope", 'info');
      
      const wallHeight = 60;
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8dcc8, 
        roughness: 0.9,
        metalness: 0.02
      });
      
      // Kitchen walls with realistic texture
      const walls = [
        new THREE.Mesh(new THREE.BoxGeometry(200, wallHeight, 3), wallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 200), wallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 200), wallMaterial)
      ];
      walls[0].position.set(0, wallHeight/2, -100);
      walls[1].position.set(-100, wallHeight/2, 0);
      walls[2].position.set(100, wallHeight/2, 0);
      walls.forEach(wall => {
        wall.receiveShadow = true;
        wall.castShadow = true;
        scene.add(wall);
      });
      
      // Realistic wooden cabinets
      const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b4423, 
        roughness: 0.7,
        metalness: 0.1
      });
      for (let i = 0; i < 4; i++) {
        const cabinetGroup = new THREE.Group();
        
        // Cabinet body
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 9), cabinetMaterial);
        cabinet.castShadow = true;
        cabinetGroup.add(cabinet);
        
        // Cabinet handles (metal)
        const handleMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xc0c0c0, 
          roughness: 0.2, 
          metalness: 0.95 
        });
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 16), handleMaterial);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, -2, 4.8);
        handle.castShadow = true;
        cabinetGroup.add(handle);
        
        cabinetGroup.position.set(-60 + i * 40, 35, -93);
        scene.add(cabinetGroup);
        obstacles.push(cabinet);
      }
      
      // Realistic sink with faucet
      const sinkGroup = new THREE.Group();
      
      // Sink basin (stainless steel)
      const sinkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd3d3d3, 
        metalness: 0.98, 
        roughness: 0.15,
        envMapIntensity: 2
      });
      const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(28, 6, 20), sinkMaterial);
      sinkBasin.position.y = -2;
      sinkBasin.castShadow = true;
      sinkGroup.add(sinkBasin);
      
      // Sink rim
      const sinkRim = new THREE.Mesh(new THREE.BoxGeometry(30, 0.8, 22), sinkMaterial);
      sinkRim.position.y = 0.8;
      sinkRim.castShadow = true;
      sinkGroup.add(sinkRim);
      
      // Faucet
      const faucetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0, 
        metalness: 0.95, 
        roughness: 0.1 
      });
      const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 2, 16), faucetMaterial);
      faucetBase.position.set(0, 1.5, -8);
      faucetBase.castShadow = true;
      sinkGroup.add(faucetBase);
      
      const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 8, 16), faucetMaterial);
      faucetPipe.position.set(0, 5, -8);
      faucetPipe.castShadow = true;
      sinkGroup.add(faucetPipe);
      
      const faucetHead = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 3, 16), faucetMaterial);
      faucetHead.position.set(0, 9, -4);
      faucetHead.rotation.x = Math.PI / 3;
      faucetHead.castShadow = true;
      sinkGroup.add(faucetHead);
      
      sinkGroup.position.set(-5, 0, -25);
      scene.add(sinkGroup);
      obstacles.push(sinkRim);
      
      // Realistic interactive button
      const buttonGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.8, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.3
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.position.set(-5, 1.2, -25);
      button1.userData = { type: 'button', id: 'button1' };
      button1.castShadow = true;
      scene.add(button1);
      puzzleElements.push(button1);
      
      // Glowing ring around button
      const ringGeometry = new THREE.TorusGeometry(1.8, 0.1, 16, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(button1.position);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      // Realistic knife
      const knife = new THREE.Group();
      
      // Blade (sharp metallic)
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.2, 22),
        new THREE.MeshStandardMaterial({ 
          color: 0xf5f5f5, 
          metalness: 0.99, 
          roughness: 0.05,
          envMapIntensity: 2
        })
      );
      blade.position.z = 11;
      blade.castShadow = true;
      knife.add(blade);
      
      // Handle (wood texture)
      const handleGeometry = new THREE.CylinderGeometry(0.6, 0.6, 5, 16);
      const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5d4e37, 
        roughness: 0.8,
        metalness: 0.1
      });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.rotation.x = Math.PI / 2;
      handle.position.z = -1;
      handle.castShadow = true;
      knife.add(handle);
      
      knife.position.set(80, 1.2, 35);
      knife.rotation.y = leverStates.lever1 ? Math.PI / 4 : 0;
      knife.userData = { type: 'lever', id: 'lever1' };
      knife.castShadow = true;
      scene.add(knife);
      puzzleElements.push(knife);

      // Realistic ceramic mug
      const mugGeometry = new THREE.CylinderGeometry(4.5, 4, 12, 32);
      const mugMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.4,
        metalness: 0.1
      });
      const mug = new THREE.Mesh(mugGeometry, mugMaterial);
      mug.position.set(50, 6, -20);
      mug.castShadow = true;
      mug.receiveShadow = true;
      scene.add(mug);
      obstacles.push(mug);
      
      // Mug handle
      const handleTorusGeometry = new THREE.TorusGeometry(2, 0.5, 16, 16, Math.PI);
      const mugHandle = new THREE.Mesh(handleTorusGeometry, mugMaterial);
      mugHandle.rotation.y = Math.PI / 2;
      mugHandle.position.set(50, 6, -20);
      mugHandle.position.x += 4.5;
      mugHandle.castShadow = true;
      scene.add(mugHandle);

      // Fabric napkin
      const napkin = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.4, 12),
        new THREE.MeshStandardMaterial({ 
          color: 0xfafafa, 
          roughness: 0.95,
          metalness: 0
        })
      );
      napkin.position.set(35, 0.2, -5);
      napkin.castShadow = true;
      napkin.receiveShadow = true;
      scene.add(napkin);

      // Pressure plate with glow
      const plateGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 64);
      const plateMaterial = new THREE.MeshStandardMaterial({ 
        color: puzzleStates.plate1 ? 0x10b981 : 0x4b5563,
        emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
        emissiveIntensity: puzzleStates.plate1 ? 0.8 : 0,
        metalness: 0.9,
        roughness: 0.2
      });
      const plateDisc = new THREE.Mesh(plateGeometry, plateMaterial);
      plateDisc.position.set(35, 0.45, -5);
      plateDisc.userData = { type: 'pressure_plate', id: 'plate1' };
      plateDisc.castShadow = true;
      scene.add(plateDisc);
      puzzleElements.push(plateDisc);
      
      // Plate glow ring
      if (puzzleStates.plate1) {
        const plateRingGeometry = new THREE.TorusGeometry(2.8, 0.15, 16, 32);
        const plateRingMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const plateRing = new THREE.Mesh(plateRingGeometry, plateRingMaterial);
        plateRing.position.copy(plateDisc.position);
        plateRing.position.y = 0.25;
        plateRing.rotation.x = -Math.PI / 2;
        scene.add(plateRing);
      }

      // Ultra-realistic water droplet with refraction
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      const waterDrop = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 64, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.6,
          transmission: 0.98,
          roughness: 0,
          metalness: 0,
          ior: 1.33,
          thickness: 3,
          envMapIntensity: 2,
          clearcoat: 1,
          clearcoatRoughness: 0
        })
      );
      waterDrop.position.set(70, canReachWater ? 4 : 28, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);
      
      // Water glow light
      const waterLight = new THREE.PointLight(0x4dd0e1, canReachWater ? 2 : 0.5, 20);
      waterLight.position.copy(waterDrop.position);
      scene.add(waterLight);

    } else if (activeMission.mission_number === 2) {
      scene.background = new THREE.Color(0x0a0a1a);
      scene.fog = new THREE.Fog(0x0a0a1a, 30, 180);
      
      addLog("Mission 2: Extract data core", 'warning');
      player.position.set(-80, 1.1, 80);

      const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200, 50, 50),
        new THREE.MeshStandardMaterial({ 
          color: 0x1a1a2a, 
          roughness: 0.95,
          metalness: 0.3
        })
      );
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

      // Futuristic data core
      const dataCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(5, 2),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 2,
          transparent: true,
          opacity: 0.7,
          metalness: 0.9,
          roughness: 0.1
        })
      );
      dataCore.position.set(0, 18, 0);
      dataCore.userData = { type: 'data_core', accessible: true };
      dataCore.castShadow = true;
      scene.add(dataCore);
      objectives.push(dataCore);
      
      const coreLight = new THREE.PointLight(0x00ffff, 3, 40);
      coreLight.position.copy(dataCore.position);
      scene.add(coreLight);

    } else if (activeMission.mission_number === 3) {
      scene.background = new THREE.Color(0x050510);
      scene.fog = new THREE.Fog(0x050510, 20, 140);
      
      addLog("Mission 3: Retrieve specimen", 'warning');
      addLog("Press C to CROUCH", 'info');
      player.position.set(-70, 1.1, 70);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200, 60, 60),
        new THREE.MeshStandardMaterial({ 
          color: 0x0a0a15, 
          roughness: 0.98,
          metalness: 0.2
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const redLight = new THREE.PointLight(0xff0000, 3, 120);
      redLight.position.set(0, 25, 0);
      scene.add(redLight);

      const powerCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(4, 1),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 2.5,
          transparent: true,
          opacity: 0.75,
          metalness: 0.95,
          roughness: 0.05
        })
      );
      powerCore.position.set(0, 6, -90);
      powerCore.userData = { type: 'power_core', accessible: true, needsHack: true };
      powerCore.castShadow = true;
      scene.add(powerCore);
      objectives.push(powerCore);
      
      const coreLight = new THREE.PointLight(0x00ff00, 4, 50);
      coreLight.position.copy(powerCore.position);
      scene.add(coreLight);
    }

    const keys = {};
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'c') isCrouching = true;
      
      if (e.key.toLowerCase() === 'e') {
        puzzleElements.forEach(elem => {
          const distance = player.position.distanceTo(elem.position);
          if (distance < 4) {
            if (elem.userData.type === 'button') {
              if (!activatedButtons.includes(elem.userData.id)) {
                setActivatedButtons(prev => [...prev, elem.userData.id]);
                addLog(`✓ Button activated!`, 'success');
              }
            } else if (elem.userData.type === 'lever') {
              setLeverStates(prev => ({ ...prev, [elem.userData.id]: !prev[elem.userData.id] }));
              addLog(`✓ Lever toggled!`, 'info');
            }
          }
        });

        objectives.forEach(obj => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 6 && obj.userData.type === 'power_core' && obj.userData.needsHack) {
            setShowHackingPuzzle(true);
          }
        });
      }
    };
    
    const handleKeyUp = (e) => { 
      keys[e.key.toLowerCase()] = false;
      if (e.key.toLowerCase() === 'c') isCrouching = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const isSpacePressed = keys[' '] || mobileControlsRef.current.jump;

      // Realistic rope mechanics
      if (isSpacePressed && !isOnRope) {
        const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 2 });
        const ropeGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(player.position.x, player.position.y, player.position.z),
          new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
        ]);
        ropeLine = new THREE.Line(ropeGeometry, ropeMaterial);
        scene.add(ropeLine);
        isOnRope = true;
        playerVelocityY = 0;
        isOnGround = false;
      } else if (!isSpacePressed && ropeLine) {
        scene.remove(ropeLine);
        ropeLine = null;
        isOnRope = false;
      }

      // Realistic crouching animation
      if (isCrouching || mobileControlsRef.current.crouch) {
        player.scale.y = THREE.MathUtils.lerp(player.scale.y, 0.5, delta * 8);
      } else {
        player.scale.y = THREE.MathUtils.lerp(player.scale.y, 1, delta * 8);
      }

      // Realistic movement
      const speed = (isCrouching ? 6 : 12) * delta;
      const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'] || 
                       mobileControlsRef.current.up || mobileControlsRef.current.down ||
                       mobileControlsRef.current.left || mobileControlsRef.current.right;

      if (isOnRope) {
        if (keys['w'] || mobileControlsRef.current.up) player.position.y += ropeSpeed * delta;
        if (keys['s'] || mobileControlsRef.current.down) player.position.y -= ropeSpeed * delta;
        if (keys['a'] || mobileControlsRef.current.left) player.position.x -= ropeSpeed * delta * 0.6;
        if (keys['d'] || mobileControlsRef.current.right) player.position.x += ropeSpeed * delta * 0.6;

        ropeLine.geometry.setFromPoints([
          new THREE.Vector3(player.position.x, player.position.y, player.position.z),
          new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
        ]);
      } else {
        if (!isOnGround) playerVelocityY += gravity * delta;

        if (keys['w'] || mobileControlsRef.current.up) player.position.z -= speed;
        if (keys['s'] || mobileControlsRef.current.down) player.position.z += speed;
        if (keys['a'] || mobileControlsRef.current.left) player.position.x -= speed;
        if (keys['d'] || mobileControlsRef.current.right) player.position.x += speed;

        player.position.y += playerVelocityY * delta;

        if (player.position.y <= playerHalfHeight) {
          player.position.y = playerHalfHeight;
          playerVelocityY = 0;
          isOnGround = true;
        }
      }

      // Realistic head bobbing
      if (isMoving && isOnGround && !isCrouching) {
        headBob += delta * 8;
        player.position.y = playerHalfHeight + Math.sin(headBob) * 0.08;
      } else {
        headBob = 0;
        player.position.y = THREE.MathUtils.lerp(player.position.y, playerHalfHeight, delta * 5);
      }

      // Player rotation based on movement
      if (isMoving) {
        let targetRotation = 0;
        if (keys['w'] || mobileControlsRef.current.up) targetRotation = 0;
        if (keys['s'] || mobileControlsRef.current.down) targetRotation = Math.PI;
        if (keys['a'] || mobileControlsRef.current.left) targetRotation = Math.PI / 2;
        if (keys['d'] || mobileControlsRef.current.right) targetRotation = -Math.PI / 2;
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, delta * 8);
      }

      // Puzzle interactions
      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          if (distance < 2.5 && !puzzleStates[elem.userData.id]) {
            setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
            addLog(`✓ Pressure plate activated!`, 'info');
          }
        }
      });

      // Objective completion
      objectives.forEach(obj => {
        const distance = player.position.distanceTo(obj.position);
        if (!missionComplete && distance < 6) {
          if (obj.userData.type === 'water_source' && obj.userData.accessible) {
            missionComplete = true;
            completeMission();
          } else if (obj.userData.type === 'data_core') {
            missionComplete = true;
            completeMission();
          }
        }
        // Floating animation
        obj.position.y += Math.sin(time * 1.5 + obj.position.x) * 0.015;
        obj.rotation.y += delta * 0.8;
        obj.rotation.x = Math.sin(time) * 0.1;
      });

      // Realistic camera with smooth follow and look-ahead
      const cameraOffset = new THREE.Vector3(
        mouseX * 10,
        18 + mouseY * 5,
        28
      );
      const targetCameraPos = player.position.clone().add(cameraOffset);
      camera.position.lerp(targetCameraPos, delta * 4);
      
      const lookAtTarget = player.position.clone();
      lookAtTarget.y += 2;
      camera.lookAt(lookAtTarget);

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
      if (ropeLine) scene.remove(ropeLine);
      renderer.dispose();
    };
  }, [activeMission, puzzleStates, missionStarted, leverStates, activatedButtons]);

  const handleMobileControl = (control, value) => {
    setMobileControls(prev => ({ ...prev, [control]: value }));
  };

  const handleHackingComplete = () => {
    setShowHackingPuzzle(false);
    completeMission();
  };

  if (!activeMission) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900 text-white">
        <p className="font-mono">No active mission</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-4 p-6">
      {showBriefing && <MissionBriefing mission={activeMission} onStart={() => { setShowBriefing(false); setMissionStarted(true); }} puzzleStates={puzzleStates} inventory={inventory} />}
      <GameAIAssistant mission={activeMission} puzzleStates={puzzleStates} inventory={inventory} playerPosition={playerPosition} isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
      {showHackingPuzzle && <PowerCoreHackingPuzzle onComplete={handleHackingComplete} onClose={() => setShowHackingPuzzle(false)} />}

      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div ref={mountRef} className="w-full h-[600px] bg-gray-900" />
            
            <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm border border-red-500/50 rounded-lg p-3 z-10">
              <div className="flex items-center gap-2 mb-2">
                <Heart className={`w-5 h-5 ${playerHealth > 50 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white font-mono text-sm font-bold">HP: {playerHealth}%</span>
              </div>
              <div className="w-40 bg-gray-800 rounded-full h-3 border border-gray-700">
                <div 
                  className={`h-3 rounded-full transition-all ${playerHealth > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-500'}`} 
                  style={{ width: `${playerHealth}%` }} 
                />
              </div>
            </div>

            <div className="absolute top-24 left-4 bg-black/90 backdrop-blur-sm border border-blue-500/50 rounded-lg p-3 z-10">
              <p className="text-blue-400 font-mono text-sm font-bold tracking-wider">MISSION {activeMission.mission_number}</p>
              <p className="text-gray-300 font-mono text-xs mt-1">{activeMission.title}</p>
              <p className="text-gray-500 font-mono text-xs mt-0.5">{activeMission.location}</p>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <Button onClick={() => setShowAIAssistant(true)} className="bg-cyan-600/90 hover:bg-cyan-700 backdrop-blur-sm font-mono text-xs" size="sm">
                <Bot className="w-4 h-4 mr-1" />AI ASSIST
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 font-mono text-xs text-gray-300 hidden md:block z-10 border border-gray-700">
              <p className="font-bold text-white mb-1">CONTROLS:</p>
              <p>WASD: Move | SPACE: Rope | C: Crouch | E: Interact | Mouse: Look</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-orange-900/20 to-transparent">
            <h3 className="text-white font-mono font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />OBJECTIVES
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {activeMission.mission_number === 1 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded transition-all ${activatedButtons.includes('button1') ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-800/30 border border-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${activatedButtons.includes('button1') ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Sink Button</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded transition-all ${puzzleStates.plate1 ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-800/30 border border-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${puzzleStates.plate1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Pressure Plate</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded transition-all ${leverStates.lever1 ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-800/30 border border-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${leverStates.lever1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Knife Lever</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-transparent">
            <h3 className="text-white font-mono font-bold text-sm">ACTIVITY LOG</h3>
          </div>
          <div className="p-4 space-y-1 max-h-[300px] overflow-y-auto">
            {missionLog.slice(-10).reverse().map((log, i) => (
              <div key={i} className="text-xs font-mono">
                <span className="text-gray-600">[{log.time}]</span>{' '}
                <span className={log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-400'}>
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