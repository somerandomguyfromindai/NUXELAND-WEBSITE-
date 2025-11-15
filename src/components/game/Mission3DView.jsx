import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, Bot, Heart, Package } from "lucide-react";
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
  const [leverStates, setLeverStates] = useState({});
  const [activatedButtons, setActivatedButtons] = useState([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showHackingPuzzle, setShowHackingPuzzle] = useState(false);
  const [collectedResources, setCollectedResources] = useState([]);
  const queryClient = useQueryClient();

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const collectResourceMutation = useMutation({
    mutationFn: async (resourceName) => {
      const inventory = user?.resource_inventory || {};
      const newInventory = { ...inventory, [resourceName]: (inventory[resourceName] || 0) + 1 };
      return base44.auth.updateMe({ resource_inventory: newInventory });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    }
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
    scene.background = new THREE.Color(0xf5f5dc);
    scene.fog = new THREE.Fog(0xf5f5dc, 60, 250);

    const camera = new THREE.PerspectiveCamera(
      65,
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
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // Ultra-realistic lighting
    const ambientLight = new THREE.AmbientLight(0xfff8e8, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaf0, 3);
    sunLight.position.set(100, 150, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 8192;
    sunLight.shadow.mapSize.height = 8192;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 600;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 2;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
    fillLight.position.set(-80, 40, -80);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-100, 60, 100);
    scene.add(rimLight);

    // Realistic counter with grain
    const counterGeometry = new THREE.PlaneGeometry(300, 300, 150, 150);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xfaf8f0,
      roughness: 0.88,
      metalness: 0.02,
      envMapIntensity: 0.3
    });
    
    const positions = counterGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, (Math.random() - 0.5) * 0.05);
    }
    positions.needsUpdate = true;
    counterGeometry.computeVertexNormals();
    
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.rotation.x = -Math.PI / 2;
    counter.receiveShadow = true;
    scene.add(counter);

    // Realistic grid
    const gridHelper = new THREE.GridHelper(300, 120, 0xe0e0e0, 0xf0f0f0);
    gridHelper.position.y = 0.02;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);
    
    // Ultra-realistic human character
    const playerGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.5, 20, 40);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e40af,
      roughness: 0.45,
      metalness: 0.75,
      envMapIntensity: 1.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.38, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      roughness: 0.15,
      metalness: 0.98,
      envMapIntensity: 2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.35;
    head.castShadow = true;
    playerGroup.add(head);

    // Visor
    const visorGeometry = new THREE.SphereGeometry(0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const visorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x001a40,
      transparent: true,
      opacity: 0.5,
      metalness: 1,
      roughness: 0.05,
      transmission: 0.4,
      ior: 1.5
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.y = 1.35;
    visor.rotation.x = -0.4;
    playerGroup.add(visor);

    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.28, 20, 20);
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.55, metalness: 0.6 });
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-0.5, 0.7, 0);
    leftShoulder.scale.set(1, 0.65, 0.85);
    leftShoulder.castShadow = true;
    playerGroup.add(leftShoulder);
    
    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = 0.5;
    playerGroup.add(rightShoulder);

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.15, 0.8, 12, 24);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5, metalness: 0.7 });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);
    
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.5;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.18, 0.9, 12, 24);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6, metalness: 0.5 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, -1, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);
    
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.2;
    playerGroup.add(rightLeg);

    playerGroup.position.set(0, 1.3, 0);
    scene.add(playerGroup);
    const player = playerGroup;

    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let collectibles = [];
    let missionComplete = false;
    
    let playerVelocityY = 0;
    let isOnGround = true;
    let isOnRope = false;
    let ropeLine = null;
    let isCrouching = false;
    const gravity = -30;
    const ropeSpeed = 12;
    const playerHalfHeight = 1.3;
    const ceilingHeight = 70;
    let headBob = 0;
    let armSwing = 0;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Navigate kitchen. SPACE=rope, E=interact", 'info');
      
      const wallHeight = 70;
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0ead6, 
        roughness: 0.92,
        metalness: 0.01
      });
      
      // Kitchen walls
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(300, wallHeight, 4), wallMaterial);
      backWall.position.set(0, wallHeight/2, -150);
      backWall.receiveShadow = true;
      backWall.castShadow = true;
      scene.add(backWall);
      obstacles.push(backWall);
      
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(4, wallHeight, 300), wallMaterial);
      leftWall.position.set(-150, wallHeight/2, 0);
      leftWall.receiveShadow = true;
      leftWall.castShadow = true;
      scene.add(leftWall);
      obstacles.push(leftWall);
      
      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(4, wallHeight, 300), wallMaterial);
      rightWall.position.set(150, wallHeight/2, 0);
      rightWall.receiveShadow = true;
      rightWall.castShadow = true;
      scene.add(rightWall);
      obstacles.push(rightWall);

      // Wooden cabinets with realistic detail
      const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b4423, 
        roughness: 0.75,
        metalness: 0.08
      });
      
      for (let i = 0; i < 5; i++) {
        const cabinetGroup = new THREE.Group();
        
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(32, 18, 12), cabinetMaterial);
        cabinet.castShadow = true;
        cabinet.receiveShadow = true;
        cabinetGroup.add(cabinet);
        
        // Cabinet handles
        const handleMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xb8b8b8, 
          roughness: 0.15, 
          metalness: 0.98 
        });
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 16), handleMaterial);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, -3, 6.5);
        handle.castShadow = true;
        cabinetGroup.add(handle);
        
        cabinetGroup.position.set(-80 + i * 40, 40, -142);
        scene.add(cabinetGroup);
        obstacles.push(cabinet);
      }

      // Ultra-realistic sink (flat, going down)
      const sinkGroup = new THREE.Group();
      
      // Sink rim (flat countertop level)
      const sinkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0, 
        metalness: 0.98, 
        roughness: 0.12,
        envMapIntensity: 2.5
      });
      const sinkRim = new THREE.Mesh(new THREE.BoxGeometry(35, 1, 28), sinkMaterial);
      sinkRim.position.y = 0.5;
      sinkRim.castShadow = true;
      sinkRim.receiveShadow = true;
      sinkGroup.add(sinkRim);
      
      // Sink basin (going DOWN into counter)
      const sinkBasinGeometry = new THREE.BoxGeometry(32, 8, 25);
      const sinkBasin = new THREE.Mesh(sinkBasinGeometry, sinkMaterial);
      sinkBasin.position.y = -3.5;  // Below counter level
      sinkBasin.castShadow = true;
      sinkBasin.receiveShadow = true;
      sinkGroup.add(sinkBasin);
      
      // Faucet outside the basin
      const faucetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc8c8c8, 
        metalness: 0.98, 
        roughness: 0.08 
      });
      const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 2.5, 20), faucetMaterial);
      faucetBase.position.set(0, 1.7, -12);
      faucetBase.castShadow = true;
      sinkGroup.add(faucetBase);
      
      const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 10, 20), faucetMaterial);
      faucetPipe.position.set(0, 7, -12);
      faucetPipe.castShadow = true;
      sinkGroup.add(faucetPipe);
      
      const faucetHead = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 4, 20), faucetMaterial);
      faucetHead.position.set(0, 12, -6);
      faucetHead.rotation.x = Math.PI / 3;
      faucetHead.castShadow = true;
      sinkGroup.add(faucetHead);
      
      sinkGroup.position.set(-10, 0, -30);
      scene.add(sinkGroup);
      obstacles.push(sinkRim);
      
      // Interactive button on sink
      const buttonGeometry = new THREE.CylinderGeometry(1.8, 1.8, 1, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.9,
        metalness: 0.85,
        roughness: 0.25
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.position.set(-10, 1.5, -30);
      button1.userData = { type: 'button', id: 'button1' };
      button1.castShadow = true;
      scene.add(button1);
      puzzleElements.push(button1);
      
      // Button glow
      const buttonGlow = new THREE.PointLight(
        activatedButtons.includes('button1') ? 0x10b981 : 0xef4444, 
        activatedButtons.includes('button1') ? 3 : 1, 
        15
      );
      buttonGlow.position.copy(button1.position);
      scene.add(buttonGlow);

      // Realistic knife OUTSIDE (visible lever)
      const knifeGroup = new THREE.Group();
      
      // Blade
      const bladeGeometry = new THREE.BoxGeometry(2, 0.25, 28);
      const bladeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf8f8f8, 
        metalness: 0.99, 
        roughness: 0.02,
        envMapIntensity: 3
      });
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      blade.position.z = 14;
      blade.castShadow = true;
      knifeGroup.add(blade);
      
      // Handle
      const handleGeometry = new THREE.CylinderGeometry(0.75, 0.75, 7, 20);
      const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d2817, 
        roughness: 0.85,
        metalness: 0.05
      });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.rotation.x = Math.PI / 2;
      handle.position.z = -2;
      handle.castShadow = true;
      knifeGroup.add(handle);
      
      // Position OUTSIDE kitchen area, clearly visible
      knifeGroup.position.set(100, 1.5, 50);
      knifeGroup.rotation.y = leverStates.lever1 ? Math.PI / 3 : 0;
      knifeGroup.userData = { type: 'lever', id: 'lever1' };
      scene.add(knifeGroup);
      puzzleElements.push(knifeGroup);

      // Ceramic mug
      const mugGeometry = new THREE.CylinderGeometry(5, 4.5, 14, 32);
      const mugMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.35,
        metalness: 0.05
      });
      const mug = new THREE.Mesh(mugGeometry, mugMaterial);
      mug.position.set(60, 7, -25);
      mug.castShadow = true;
      mug.receiveShadow = true;
      scene.add(mug);
      obstacles.push(mug);
      
      // Mug handle
      const mugHandleGeometry = new THREE.TorusGeometry(2.5, 0.6, 16, 24, Math.PI);
      const mugHandle = new THREE.Mesh(mugHandleGeometry, mugMaterial);
      mugHandle.rotation.y = Math.PI / 2;
      mugHandle.position.set(60, 7, -25);
      mugHandle.position.x += 5;
      mugHandle.castShadow = true;
      scene.add(mugHandle);

      // Flat plate (pressure plate - stays on ground)
      const plateGeometry = new THREE.CylinderGeometry(3, 3, 0.6, 64);
      const plateMaterial = new THREE.MeshStandardMaterial({ 
        color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
        emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
        emissiveIntensity: puzzleStates.plate1 ? 0.9 : 0,
        metalness: 0.92,
        roughness: 0.15
      });
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      plate.position.set(45, 0.3, -10);  // Stays on ground
      plate.userData = { type: 'pressure_plate', id: 'plate1' };
      plate.castShadow = true;
      plate.receiveShadow = true;
      scene.add(plate);
      puzzleElements.push(plate);

      // Water droplet ON GROUND after completion
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      const waterDrop = new THREE.Mesh(
        new THREE.SphereGeometry(4, 64, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.65,
          transmission: 0.98,
          roughness: 0,
          metalness: 0,
          ior: 1.33,
          thickness: 4,
          envMapIntensity: 2.5,
          clearcoat: 1,
          clearcoatRoughness: 0
        })
      );
      waterDrop.position.set(80, canReachWater ? 2 : 35, 10);  // Ground level when accessible
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);
      
      // Water glow
      const waterLight = new THREE.PointLight(0x4dd0e1, canReachWater ? 3 : 0.8, 25);
      waterLight.position.copy(waterDrop.position);
      scene.add(waterLight);

      // Resource collectibles
      const resourcePositions = [
        { name: 'Iron Scrap', pos: [20, 0.5, 20], color: 0x888888 },
        { name: 'Copper Wire', pos: [-40, 0.5, -40], color: 0xb87333 },
        { name: 'Plastic Chip', pos: [70, 0.5, -60], color: 0x4169e1 },
      ];

      resourcePositions.forEach(res => {
        if (!collectedResources.includes(res.name)) {
          const resourceMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.8, 0),
            new THREE.MeshStandardMaterial({ 
              color: res.color, 
              emissive: res.color, 
              emissiveIntensity: 0.5,
              metalness: 0.8,
              roughness: 0.2
            })
          );
          resourceMesh.position.set(...res.pos);
          resourceMesh.userData = { type: 'resource', name: res.name };
          resourceMesh.castShadow = true;
          scene.add(resourceMesh);
          collectibles.push(resourceMesh);
        }
      });

    } else if (activeMission.mission_number === 2) {
      scene.background = new THREE.Color(0x0a0a1a);
      scene.fog = new THREE.Fog(0x0a0a1a, 40, 220);
      
      addLog("Mission 2: Extract data core", 'warning');
      player.position.set(-100, 1.3, 100);

      const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 80, 80),
        new THREE.MeshStandardMaterial({ 
          color: 0x1a1a2a, 
          roughness: 0.95,
          metalness: 0.35
        })
      );
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

      const dataCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(6, 2),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 2.5,
          transparent: true,
          opacity: 0.75,
          metalness: 0.95,
          roughness: 0.08
        })
      );
      dataCore.position.set(0, 20, 0);
      dataCore.userData = { type: 'data_core', accessible: true };
      dataCore.castShadow = true;
      scene.add(dataCore);
      objectives.push(dataCore);
      
      const coreLight = new THREE.PointLight(0x00ffff, 4, 50);
      coreLight.position.copy(dataCore.position);
      scene.add(coreLight);

    } else if (activeMission.mission_number === 3) {
      scene.background = new THREE.Color(0x050510);
      scene.fog = new THREE.Fog(0x050510, 30, 180);
      
      addLog("Mission 3: Specimen retrieval", 'warning');
      addLog("Press C to CROUCH under lasers", 'info');
      player.position.set(-90, 1.3, 90);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 90, 90),
        new THREE.MeshStandardMaterial({ 
          color: 0x0a0a15, 
          roughness: 0.98,
          metalness: 0.25
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const redLight = new THREE.PointLight(0xff0000, 4, 150);
      redLight.position.set(0, 30, 0);
      scene.add(redLight);

      const powerCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(5, 1),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 3,
          transparent: true,
          opacity: 0.8,
          metalness: 0.98,
          roughness: 0.03
        })
      );
      powerCore.position.set(0, 7, -120);
      powerCore.userData = { type: 'power_core', accessible: true, needsHack: true };
      powerCore.castShadow = true;
      scene.add(powerCore);
      objectives.push(powerCore);
      
      const coreLight = new THREE.PointLight(0x00ff00, 5, 60);
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
          if (distance < 5) {
            if (elem.userData.type === 'button') {
              if (!activatedButtons.includes(elem.userData.id)) {
                setActivatedButtons(prev => [...prev, elem.userData.id]);
                addLog(`✓ Button activated!`, 'success');
              }
            } else if (elem.userData.type === 'lever') {
              setLeverStates(prev => ({ ...prev, [elem.userData.id]: !prev[elem.userData.id] }));
              addLog(`✓ Knife lever toggled!`, 'info');
            }
          }
        });

        collectibles.forEach((obj, idx) => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 4 && obj.userData.type === 'resource') {
            setCollectedResources(prev => [...prev, obj.userData.name]);
            collectResourceMutation.mutate(obj.userData.name);
            addLog(`✓ Collected: ${obj.userData.name}`, 'success');
            scene.remove(obj);
            collectibles.splice(idx, 1);
          }
        });

        objectives.forEach(obj => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 7 && obj.userData.type === 'power_core' && obj.userData.needsHack) {
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

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const isSpacePressed = keys[' '];

      // Rope mechanics
      if (isSpacePressed && !isOnRope) {
        const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xd0d0d0, linewidth: 2 });
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

      // Crouching animation
      if (isCrouching) {
        player.scale.y = THREE.MathUtils.lerp(player.scale.y, 0.5, delta * 10);
      } else {
        player.scale.y = THREE.MathUtils.lerp(player.scale.y, 1, delta * 10);
      }

      const speed = (isCrouching ? 7 : 15) * delta;
      const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'];

      if (isOnRope) {
        if (keys['w']) player.position.y += ropeSpeed * delta;
        if (keys['s']) player.position.y -= ropeSpeed * delta;
        if (keys['a']) player.position.x -= ropeSpeed * delta * 0.7;
        if (keys['d']) player.position.x += ropeSpeed * delta * 0.7;

        ropeLine.geometry.setFromPoints([
          new THREE.Vector3(player.position.x, player.position.y, player.position.z),
          new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
        ]);
      } else {
        if (!isOnGround) playerVelocityY += gravity * delta;

        if (keys['w']) player.position.z -= speed;
        if (keys['s']) player.position.z += speed;
        if (keys['a']) player.position.x -= speed;
        if (keys['d']) player.position.x += speed;

        player.position.y += playerVelocityY * delta;

        if (player.position.y <= playerHalfHeight) {
          player.position.y = playerHalfHeight;
          playerVelocityY = 0;
          isOnGround = true;
        }
      }

      // Realistic animations
      if (isMoving && isOnGround && !isCrouching) {
        headBob += delta * 10;
        player.position.y = playerHalfHeight + Math.sin(headBob) * 0.12;
        
        armSwing += delta * 8;
        leftArm.rotation.x = Math.sin(armSwing) * 0.5;
        rightArm.rotation.x = -Math.sin(armSwing) * 0.5;
        leftLeg.rotation.x = -Math.sin(armSwing) * 0.4;
        rightLeg.rotation.x = Math.sin(armSwing) * 0.4;
      } else {
        headBob = 0;
        armSwing = 0;
        player.position.y = THREE.MathUtils.lerp(player.position.y, playerHalfHeight, delta * 6);
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, delta * 8);
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, delta * 8);
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, delta * 8);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, delta * 8);
      }

      // Player rotation
      if (isMoving) {
        let targetRotation = 0;
        if (keys['w']) targetRotation = 0;
        if (keys['s']) targetRotation = Math.PI;
        if (keys['a']) targetRotation = Math.PI / 2;
        if (keys['d']) targetRotation = -Math.PI / 2;
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, delta * 10);
      }

      // Puzzle interactions
      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          if (distance < 3 && !puzzleStates[elem.userData.id]) {
            setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
            addLog(`✓ Pressure plate activated!`, 'info');
          }
        }
      });

      // Objective completion
      objectives.forEach(obj => {
        const distance = player.position.distanceTo(obj.position);
        if (!missionComplete && distance < 7) {
          if (obj.userData.type === 'water_source' && obj.userData.accessible) {
            missionComplete = true;
            completeMission();
          } else if (obj.userData.type === 'data_core') {
            missionComplete = true;
            completeMission();
          }
        }
        // Floating animation
        obj.position.y += Math.sin(time * 2 + obj.position.x) * 0.02;
        obj.rotation.y += delta;
        obj.rotation.x = Math.sin(time * 0.5) * 0.15;
      });

      // Collectibles floating
      collectibles.forEach(obj => {
        obj.position.y = obj.userData.originalY || obj.position.y;
        obj.userData.originalY = obj.position.y;
        obj.position.y += Math.sin(time * 3 + obj.position.x) * 0.015;
        obj.rotation.y += delta * 2;
      });

      // Advanced camera with cinematic look
      const cameraOffset = new THREE.Vector3(
        mouseX * 12,
        22 + mouseY * 6,
        32
      );
      const targetCameraPos = player.position.clone().add(cameraOffset);
      camera.position.lerp(targetCameraPos, delta * 5);
      
      const lookAtTarget = player.position.clone();
      lookAtTarget.y += 3;
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
  }, [activeMission, puzzleStates, missionStarted, leverStates, activatedButtons, collectedResources]);

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
            
            <div className="absolute top-4 left-4 bg-black/95 backdrop-blur-md border border-red-500/60 rounded-lg p-3 z-10 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Heart className={`w-5 h-5 ${playerHealth > 50 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white font-mono text-sm font-bold">HP: {playerHealth}%</span>
              </div>
              <div className="w-40 bg-gray-900 rounded-full h-3 border border-gray-700 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${playerHealth > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-500'}`} 
                  style={{ width: `${playerHealth}%` }} 
                />
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-black/95 backdrop-blur-md border border-blue-500/60 rounded-lg p-3 z-10 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-mono text-xs font-bold">RESOURCES</span>
              </div>
              <p className="text-gray-300 font-mono text-xs">{collectedResources.length} collected</p>
            </div>

            <div className="absolute top-28 left-4 bg-black/95 backdrop-blur-md border border-blue-500/60 rounded-lg p-3 z-10 shadow-2xl">
              <p className="text-blue-400 font-mono text-sm font-bold tracking-wider">MISSION {activeMission.mission_number}</p>
              <p className="text-gray-300 font-mono text-xs mt-1">{activeMission.title}</p>
              <p className="text-gray-500 font-mono text-xs mt-0.5">{activeMission.location}</p>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <Button onClick={() => setShowAIAssistant(true)} className="bg-cyan-600/95 hover:bg-cyan-700 backdrop-blur-md font-mono text-xs shadow-lg" size="sm">
                <Bot className="w-4 h-4 mr-1" />AI ASSIST
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/95 backdrop-blur-md rounded-lg p-3 font-mono text-xs text-gray-300 hidden md:block z-10 border border-gray-700 shadow-2xl">
              <p className="font-bold text-white mb-1">CONTROLS:</p>
              <p>WASD: Move | SPACE: Rope | C: Crouch | E: Interact | Mouse: Look</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-[#0F1729] border-gray-700 shadow-xl">
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-orange-900/30 to-transparent">
            <h3 className="text-white font-mono font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />OBJECTIVES
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {activeMission.mission_number === 1 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded transition-all ${activatedButtons.includes('button1') ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40 border border-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${activatedButtons.includes('button1') ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Sink Button</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded transition-all ${puzzleStates.plate1 ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40 border border-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${puzzleStates.plate1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Pressure Plate</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded transition-all ${leverStates.lever1 ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40 border border-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${leverStates.lever1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Knife Lever</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="bg-[#0F1729] border-gray-700 shadow-xl">
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/30 to-transparent">
            <h3 className="text-white font-mono font-bold text-sm">ACTIVITY LOG</h3>
          </div>
          <div className="p-4 space-y-1 max-h-[300px] overflow-y-auto">
            {missionLog.slice(-10).reverse().map((log, i) => (
              <div key={i} className="text-xs font-mono animate-fade-in">
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