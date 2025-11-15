
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
  const [mobileControls, setMobileControls] = useState({ w: false, a: false, s: false, d: false, space: false, c: false });
  const [objectiveCompletion, setObjectiveCompletion] = useState({});
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

  // Check if all objectives for current mission are complete
  const checkMissionCompletion = () => {
    if (!activeMission || !missionStarted) return false;
    
    if (activeMission.mission_number === 1) {
      return objectiveCompletion.button1 && objectiveCompletion.plate1 && objectiveCompletion.lever1 && objectiveCompletion.water;
    } else if (activeMission.mission_number === 2) {
      return objectiveCompletion.keycard && objectiveCompletion.terminal && objectiveCompletion.dataCore;
    } else if (activeMission.mission_number === 3) {
      return objectiveCompletion.wirePuzzle && objectiveCompletion.specimen;
    }
    return false;
  };

  const completeMission = () => {
    if (activeMission && checkMissionCompletion() && !gameState.completedMissions.includes(activeMission?.id)) {
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
          setObjectiveCompletion({});
          setCollectedResources([]);
        }, 2000);
      }
    }
  };

  // Check for mission completion whenever objectives change
  useEffect(() => {
    if (activeMission && checkMissionCompletion() && !gameState.completedMissions.includes(activeMission?.id)) {
      completeMission();
    }
  }, [objectiveCompletion, activeMission, gameState.completedMissions]);

  // Create text sprite for labels
  const createTextLabel = (text, color = '#ffffff', size = 2) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 48px monospace';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size * 8, size * 2, 1);
    
    return sprite;
  };

  useEffect(() => {
    if (!mountRef.current || !activeMission || !missionStarted) return;

    const scene = new THREE.Scene();
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

    // Ultra-realistic human character
    const playerGroup = new THREE.Group();
    
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

    const armGeometry = new THREE.CapsuleGeometry(0.15, 0.8, 12, 24);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5, metalness: 0.7 });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);
    
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.5;
    playerGroup.add(rightArm);

    const legGeometry = new THREE.CapsuleGeometry(0.18, 0.9, 12, 24);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6, metalness: 0.5 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, -1, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);
    
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.2;
    playerGroup.add(rightLeg);

    // Player name label
    const playerLabel = createTextLabel('AGENT PIP', '#3b82f6', 1.5);
    playerLabel.position.y = 3;
    playerGroup.add(playerLabel);

    playerGroup.position.set(0, 1.3, 0);
    scene.add(playerGroup);
    const player = playerGroup;

    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let collectibles = [];
    let missionComplete = false;
    let laserGrids = [];
    
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
      // MISSION 1: KITCHEN
      scene.background = new THREE.Color(0xf5f5dc);
      
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

      addLog("Mission 1: Complete ALL objectives to finish", 'info');
      
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

      const gridHelper = new THREE.GridHelper(300, 120, 0xe0e0e0, 0xf0f0f0);
      gridHelper.position.y = 0.02;
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.15;
      scene.add(gridHelper);
      
      const wallHeight = 70;
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0ead6, 
        roughness: 0.92,
        metalness: 0.01
      });
      
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
        
        const cabinetLabel = createTextLabel('CABINET', '#6b4423', 1);
        cabinetLabel.position.y = 12;
        cabinetGroup.add(cabinetLabel);
        
        cabinetGroup.position.set(-80 + i * 40, 40, -142);
        scene.add(cabinetGroup);
        obstacles.push(cabinet);
      }

      const sinkGroup = new THREE.Group();
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
      
      const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(32, 8, 25), sinkMaterial);
      sinkBasin.position.y = -3.5;
      sinkBasin.castShadow = true;
      sinkBasin.receiveShadow = true;
      sinkGroup.add(sinkBasin);
      
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

      const sinkLabel = createTextLabel('SINK', '#ffffff', 1.5);
      sinkLabel.position.y = 15;
      sinkGroup.add(sinkLabel);
      
      sinkGroup.position.set(-10, 0, -30);
      scene.add(sinkGroup);
      obstacles.push(sinkRim);
      
      const buttonGroup = new THREE.Group();
      const buttonGeometry = new THREE.CylinderGeometry(1.8, 1.8, 1, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.9,
        metalness: 0.85,
        roughness: 0.25
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.userData = { type: 'button', id: 'button1' };
      button1.castShadow = true;
      buttonGroup.add(button1);
      
      const buttonLabel = createTextLabel(
        objectiveCompletion.button1 ? 'BUTTON [ON]' : 'BUTTON [PRESS E]',
        objectiveCompletion.button1 ? '#10b981' : '#ef4444',
        1.2
      );
      buttonLabel.position.y = 4;
      buttonGroup.add(buttonLabel);

      buttonGroup.position.set(-10, 1.5, -30);
      scene.add(buttonGroup);
      puzzleElements.push(button1);
      
      const buttonGlow = new THREE.PointLight(
        activatedButtons.includes('button1') ? 0x10b981 : 0xef4444, 
        activatedButtons.includes('button1') ? 3 : 1, 
        15
      );
      buttonGlow.position.set(-10, 1.5, -30);
      scene.add(buttonGlow);

      const knifeGroup = new THREE.Group();
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

      const knifeLabel = createTextLabel(
        leverStates.lever1 ? 'KNIFE [MOVED]' : 'KNIFE [PRESS E]',
        leverStates.lever1 ? '#10b981' : '#fbbf24',
        1.5
      );
      knifeLabel.position.y = 6;
      knifeGroup.add(knifeLabel);
      
      knifeGroup.position.set(100, 1.5, 50);
      knifeGroup.rotation.y = leverStates.lever1 ? Math.PI / 3 : 0;
      knifeGroup.userData = { type: 'lever', id: 'lever1' };
      scene.add(knifeGroup);
      puzzleElements.push(knifeGroup);

      const mugGroup = new THREE.Group();
      const mugGeometry = new THREE.CylinderGeometry(5, 4.5, 14, 32);
      const mugMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.35,
        metalness: 0.05
      });
      const mug = new THREE.Mesh(mugGeometry, mugMaterial);
      mug.castShadow = true;
      mug.receiveShadow = true;
      mugGroup.add(mug);
      
      const mugHandleGeometry = new THREE.TorusGeometry(2.5, 0.6, 16, 24, Math.PI);
      const mugHandle = new THREE.Mesh(mugHandleGeometry, mugMaterial);
      mugHandle.rotation.y = Math.PI / 2;
      mugHandle.position.x = 5;
      mugHandle.castShadow = true;
      mugGroup.add(mugHandle);

      const mugLabel = createTextLabel('COFFEE MUG', '#ffffff', 1.5);
      mugLabel.position.y = 10;
      mugGroup.add(mugLabel);

      mugGroup.position.set(60, 7, -25);
      scene.add(mugGroup);
      obstacles.push(mug);
      
      const plateGroup = new THREE.Group();
      const plateGeometry = new THREE.CylinderGeometry(3, 3, 0.6, 64);
      const plateMaterial = new THREE.MeshStandardMaterial({ 
        color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
        emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
        emissiveIntensity: puzzleStates.plate1 ? 0.9 : 0,
        metalness: 0.92,
        roughness: 0.15
      });
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      plate.userData = { type: 'pressure_plate', id: 'plate1' };
      plate.castShadow = true;
      plate.receiveShadow = true;
      plateGroup.add(plate);

      const plateLabel = createTextLabel(
        objectiveCompletion.plate1 ? 'PLATE [ACTIVE]' : 'PLATE [STEP ON]',
        objectiveCompletion.plate1 ? '#10b981' : '#6b7280',
        1.2
      );
      plateLabel.position.y = 3;
      plateGroup.add(plateLabel);

      plateGroup.position.set(45, 0.3, -10);
      scene.add(plateGroup);
      puzzleElements.push(plate);

      const waterGroup = new THREE.Group();
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
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      waterGroup.add(waterDrop);
      
      const waterLabel = createTextLabel(
        canReachWater ? 'WATER [REACH ME]' : 'WATER [LOCKED]',
        canReachWater ? '#4dd0e1' : '#ef4444',
        2
      );
      waterLabel.position.y = 8;
      waterGroup.add(waterLabel);

      waterGroup.position.set(80, canReachWater ? 2 : 35, 10);
      scene.add(waterGroup);
      objectives.push(waterDrop);
      
      const waterLight = new THREE.PointLight(0x4dd0e1, canReachWater ? 3 : 0.8, 25);
      waterLight.position.copy(waterGroup.position);
      scene.add(waterLight);

      const resourcePositions = [
        { name: 'Iron Scrap', pos: [20, 0.5, 20], color: 0x888888 },
        { name: 'Copper Wire', pos: [-40, 0.5, -40], color: 0xb87333 },
        { name: 'Plastic Chip', pos: [70, 0.5, -60], color: 0x4169e1 },
      ];

      resourcePositions.forEach(res => {
        if (!collectedResources.includes(res.name)) {
          const resourceGroup = new THREE.Group();
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
          resourceMesh.userData = { type: 'resource', name: res.name };
          resourceMesh.castShadow = true;
          resourceGroup.add(resourceMesh);

          const resourceLabel = createTextLabel(res.name, '#ffffff', 0.8);
          resourceLabel.position.y = 2;
          resourceGroup.add(resourceLabel);

          resourceGroup.position.set(...res.pos);
          scene.add(resourceGroup);
          collectibles.push(resourceMesh);
        }
      });

    } else if (activeMission.mission_number === 2) {
      // MISSION 2: LAB WITH SPIDER
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 40, 220);
      
      const ambientLight = new THREE.AmbientLight(0x4a5568, 0.3);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
      mainLight.position.set(50, 100, 50);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 4096;
      mainLight.shadow.mapSize.height = 4096;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 500;
      mainLight.shadow.camera.left = -150;
      mainLight.shadow.camera.right = 150;
      mainLight.shadow.camera.top = 150;
      mainLight.shadow.camera.bottom = -150;
      scene.add(mainLight);

      const redLight = new THREE.PointLight(0xff0000, 2, 100);
      redLight.position.set(0, 30, 0);
      scene.add(redLight);

      addLog("Mission 2: Complete ALL objectives. Avoid hazards!", 'warning');
      player.position.set(-100, 1.3, 100);

      const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 100, 100),
        new THREE.MeshStandardMaterial({ 
          color: 0x2d3748, 
          roughness: 0.85,
          metalness: 0.45
        })
      );
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

      const floorGrid = new THREE.GridHelper(300, 100, 0x4a5568, 0x2d3748);
      floorGrid.position.y = 0.05;
      scene.add(floorGrid);

      // Lab walls
      const labWallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x374151, 
        roughness: 0.9,
        metalness: 0.1
      });
      
      const wallHeight = 50;
      const walls = [
        new THREE.Mesh(new THREE.BoxGeometry(300, wallHeight, 3), labWallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 300), labWallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 300), labWallMaterial),
      ];
      walls[0].position.set(0, wallHeight/2, -150);
      walls[1].position.set(-150, wallHeight/2, 0);
      walls[2].position.set(150, wallHeight/2, 0);
      walls.forEach(wall => {
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        obstacles.push(wall);
      });

      // Lab equipment - microscopes
      for (let i = 0; i < 3; i++) {
        const microscopeGroup = new THREE.Group();
        
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 4, 1.5, 32),
          new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.7, roughness: 0.4 })
        );
        base.castShadow = true;
        microscopeGroup.add(base);
        
        const arm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 12, 16),
          new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.3 })
        );
        arm.position.y = 6.75;
        arm.castShadow = true;
        microscopeGroup.add(arm);
        
        const lens = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1, 3, 32),
          new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.2 })
        );
        lens.position.y = 13;
        lens.castShadow = true;
        microscopeGroup.add(lens);

        const microscopeLabel = createTextLabel('MICROSCOPE', '#9ca3af', 1);
        microscopeLabel.position.y = 16;
        microscopeGroup.add(microscopeLabel);
        
        microscopeGroup.position.set(-80 + i * 50, 0.75, -100);
        scene.add(microscopeGroup);
        obstacles.push(base);
      }

      // Lab tables with computers
      for (let i = 0; i < 4; i++) {
        const tableGroup = new THREE.Group();
        const table = new THREE.Mesh(
          new THREE.BoxGeometry(30, 1.5, 20),
          new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.7, metalness: 0.3 })
        );
        table.castShadow = true;
        table.receiveShadow = true;
        tableGroup.add(table);
        
        // Computer monitor
        const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(8, 10, 1),
          new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.6, roughness: 0.4 })
        );
        monitor.position.y = 6.5;
        monitor.castShadow = true;
        tableGroup.add(monitor);
        
        // Screen glow
        const screenGlow = new THREE.Mesh(
          new THREE.BoxGeometry(7, 9, 0.5),
          new THREE.MeshStandardMaterial({ 
            color: 0x00ff88, 
            emissive: 0x00ff88, 
            emissiveIntensity: 1.5 
          })
        );
        screenGlow.position.set(0, 6.5, 0.6);
        tableGroup.add(screenGlow);

        const computerLabel = createTextLabel('COMPUTER', '#00ff88', 1);
        computerLabel.position.y = 12;
        tableGroup.add(computerLabel);
        
        tableGroup.position.set(-60 + i * 40, 0.75, 50);
        scene.add(tableGroup);
        obstacles.push(table);
      }

      // Storage cabinets
      const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x374151, 
        roughness: 0.8,
        metalness: 0.2
      });
      
      for (let i = 0; i < 6; i++) {
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(15, 25, 10), cabinetMaterial);
        cabinet.position.set(-120, 12.5, -80 + i * 30);
        cabinet.castShadow = true;
        cabinet.receiveShadow = true;
        scene.add(cabinet);
        obstacles.push(cabinet);
      }

      // Deadly LASER GRID (red, lethal)
      if (!puzzleStates.laser_disabled) {
        const laserMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xff0000, 
          transparent: true, 
          opacity: 0.7 
        });
        
        for (let i = 0; i < 8; i++) {
          const laser = new THREE.Mesh(
            new THREE.BoxGeometry(60, 0.3, 0.3),
            laserMaterial
          );
          laser.position.set(20, 2 + i * 3, 0);
          laser.userData = { type: 'laser', lethal: true };
          scene.add(laser);
          laserGrids.push(laser);
          
          const laserGlow = new THREE.PointLight(0xff0000, 1.5, 8);
          laserGlow.position.copy(laser.position);
          scene.add(laserGlow);
        }
        
        const laserLabel = createTextLabel('LASER GRID [DEADLY]', '#ff0000', 2);
        laserLabel.position.set(20, 28, 0);
        scene.add(laserLabel);

        addLog("⚠️ LETHAL LASER GRID DETECTED", 'error');
      }

      // KEYCARD (needed to disable lasers)
      if (!inventory.includes('keycard')) {
        const keycardGroup = new THREE.Group();
        const keycard = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.2, 3),
          new THREE.MeshStandardMaterial({ 
            color: 0xfbbf24, 
            emissive: 0xfbbf24, 
            emissiveIntensity: 1.2,
            metalness: 0.9,
            roughness: 0.1
          })
        );
        keycard.userData = { type: 'keycard' };
        keycard.castShadow = true;
        keycardGroup.add(keycard);

        const keycardLabel = createTextLabel('KEYCARD [PRESS E]', '#fbbf24', 1.2);
        keycardLabel.position.y = 3;
        keycardGroup.add(keycardLabel);
        
        keycardGroup.position.set(50, 1, -20);
        scene.add(keycardGroup);
        collectibles.push(keycard);
        
        const keycardGlow = new THREE.PointLight(0xfbbf24, 2, 15);
        keycardGlow.position.copy(keycardGroup.position);
        scene.add(keycardGlow);
      }

      // TERMINAL to disable lasers
      const terminalGroup = new THREE.Group();
      const terminalBase = new THREE.Mesh(
        new THREE.BoxGeometry(8, 12, 3),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7, roughness: 0.3 })
      );
      terminalBase.castShadow = true;
      terminalGroup.add(terminalBase);
      
      const terminalScreen = new THREE.Mesh(
        new THREE.BoxGeometry(7, 10, 0.5),
        new THREE.MeshStandardMaterial({ 
          color: puzzleStates.terminal_active ? 0x10b981 : 0x3b82f6,
          emissive: puzzleStates.terminal_active ? 0x10b981 : 0x3b82f6,
          emissiveIntensity: 2
        })
      );
      terminalScreen.position.z = 1.8;
      terminalGroup.add(terminalScreen);

      const terminalLabel = createTextLabel(
        puzzleStates.terminal_active ? 'TERMINAL [ACTIVE]' : 'TERMINAL [PRESS E]',
        puzzleStates.terminal_active ? '#10b981' : '#3b82f6',
        1.5
      );
      terminalLabel.position.y = 10;
      terminalGroup.add(terminalLabel);
      
      terminalGroup.position.set(-30, 6, 30);
      terminalGroup.userData = { type: 'terminal', id: 'terminal1' };
      scene.add(terminalGroup);
      puzzleElements.push(terminalGroup);

      // GIANT SPIDER (hostile entity)
      const spider = new THREE.Group();
      const spiderBody = new THREE.Mesh(
        new THREE.SphereGeometry(6, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.3 })
      );
      spiderBody.castShadow = true;
      spider.add(spiderBody);
      
      const spiderHead = new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.7, metalness: 0.2 })
      );
      spiderHead.position.set(0, 0, 8);
      spiderHead.castShadow = true;
      spider.add(spiderHead);
      
      // Spider eyes (red glowing)
      const eyeGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000, 
        emissive: 0xff0000, 
        emissiveIntensity: 2 
      });
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-1.5, 1, 10);
      spider.add(leftEye);
      
      const rightEye = leftEye.clone();
      rightEye.position.x = 1.5;
      spider.add(rightEye);

      // Spider legs
      for (let i = 0; i < 8; i++) {
        const leg = new THREE.Group();
        const segment1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.3, 8, 12),
          new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.3 })
        );
        segment1.rotation.z = Math.PI / 4;
        segment1.castShadow = true;
        leg.add(segment1);
        
        const angle = (i / 8) * Math.PI * 2;
        leg.position.set(Math.cos(angle) * 5, -3, Math.sin(angle) * 5);
        leg.rotation.y = angle;
        spider.add(leg);
      }
      
      const spiderLabel = createTextLabel('GIANT SPIDER [AVOID!]', '#ff0000', 2);
      spiderLabel.position.y = 12;
      spider.add(spiderLabel);

      spider.position.set(0, 6, -50);
      spider.userData = { type: 'spider', hostile: true };
      scene.add(spider);

      // DATA CORE objective
      const dataCoreGroup = new THREE.Group();
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
      dataCore.userData = { type: 'data_core', accessible: puzzleStates.terminal_active };
      dataCore.castShadow = true;
      dataCoreGroup.add(dataCore);

      const coreLabel = createTextLabel(
        puzzleStates.terminal_active ? 'DATA CORE [REACH ME]' : 'DATA CORE [LOCKED]',
        puzzleStates.terminal_active ? '#00ffff' : '#ff0000',
        2
      );
      coreLabel.position.y = 10;
      dataCoreGroup.add(coreLabel);

      dataCoreGroup.position.set(80, 8, -80);
      scene.add(dataCoreGroup);
      objectives.push(dataCore);
      
      const coreLight = new THREE.PointLight(0x00ffff, 4, 50);
      coreLight.position.copy(dataCoreGroup.position);
      scene.add(coreLight);

      // Resources
      const mission2Resources = [
        { name: 'Data Chip', pos: [-40, 0.5, 70], color: 0x3b82f6 },
        { name: 'Circuit Board', pos: [60, 0.5, 20], color: 0x10b981 },
      ];

      mission2Resources.forEach(res => {
        if (!collectedResources.includes(res.name)) {
          const resourceGroup = new THREE.Group();
          const resourceMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.8, 0),
            new THREE.MeshStandardMaterial({ 
              color: res.color, 
              emissive: res.color, 
              emissiveIntensity: 0.6,
              metalness: 0.9,
              roughness: 0.1
            })
          );
          resourceMesh.userData = { type: 'resource', name: res.name };
          resourceMesh.castShadow = true;
          resourceGroup.add(resourceMesh);

          const resourceLabel = createTextLabel(res.name, '#ffffff', 0.8);
          resourceLabel.position.y = 2;
          resourceGroup.add(resourceLabel);

          resourceGroup.position.set(...res.pos);
          scene.add(resourceGroup);
          collectibles.push(resourceMesh);
        }
      });

    } else if (activeMission.mission_number === 3) {
      // MISSION 3: DEEP FACILITY
      scene.background = new THREE.Color(0x050510);
      scene.fog = new THREE.Fog(0x050510, 30, 180);
      
      const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.2);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0x6366f1, 1);
      mainLight.position.set(40, 80, 40);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 4096;
      mainLight.shadow.mapSize.height = 4096;
      scene.add(mainLight);

      const redLight = new THREE.PointLight(0xff0000, 3, 120);
      redLight.position.set(0, 25, 0);
      scene.add(redLight);

      addLog("Mission 3: Complete objectives. CROUCH (C) under barriers!", 'warning');
      player.position.set(-90, 1.3, 90);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 120, 120),
        new THREE.MeshStandardMaterial({ 
          color: 0x0f0f1e, 
          roughness: 0.95,
          metalness: 0.3
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const floorGrid = new THREE.GridHelper(300, 120, 0x3730a3, 0x1e1b4b);
      floorGrid.position.y = 0.05;
      scene.add(floorGrid);

      // Facility walls
      const facilityWallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1e1b4b, 
        roughness: 0.95,
        metalness: 0.15
      });
      
      const wallHeight = 45;
      const facilityWalls = [
        new THREE.Mesh(new THREE.BoxGeometry(300, wallHeight, 3), facilityWallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 300), facilityWallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 300), facilityWallMaterial),
      ];
      facilityWalls[0].position.set(0, wallHeight/2, -150);
      facilityWalls[1].position.set(-150, wallHeight/2, 0);
      facilityWalls[2].position.set(150, wallHeight/2, 0);
      facilityWalls.forEach(wall => {
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        obstacles.push(wall);
      });

      // Containment pods
      for (let i = 0; i < 5; i++) {
        const pod = new THREE.Group();
        
        const podBase = new THREE.Mesh(
          new THREE.CylinderGeometry(5, 6, 20, 32),
          new THREE.MeshStandardMaterial({ 
            color: 0x312e81, 
            metalness: 0.8, 
            roughness: 0.3 
          })
        );
        podBase.castShadow = true;
        pod.add(podBase);
        
        const podGlass = new THREE.Mesh(
          new THREE.CylinderGeometry(4.5, 5.5, 18, 32, 1, true),
          new THREE.MeshPhysicalMaterial({ 
            color: 0x4c1d95,
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9
          })
        );
        pod.add(podGlass);
        
        pod.position.set(-80 + i * 40, 10, -100);
        scene.add(pod);
        obstacles.push(podBase);
        
        const podLight = new THREE.PointLight(0x8b5cf6, 1.5, 20);
        podLight.position.copy(pod.position);
        scene.add(podLight);
      }

      // Control panels
      for (let i = 0; i < 4; i++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(12, 15, 2),
          new THREE.MeshStandardMaterial({ 
            color: 0x1e293b, 
            metalness: 0.7, 
            roughness: 0.4 
          })
        );
        panel.position.set(-70 + i * 45, 7.5, 80);
        panel.castShadow = true;
        scene.add(panel);
        
        const panelScreen = new THREE.Mesh(
          new THREE.BoxGeometry(10, 12, 0.5),
          new THREE.MeshStandardMaterial({ 
            color: 0xef4444, 
            emissive: 0xef4444, 
            emissiveIntensity: 1.5 
          })
        );
        panelScreen.position.set(panel.position.x, panel.position.y, panel.position.z + 1.3);
        scene.add(panelScreen);
      }

      // Cryo chamber obstacles
      for (let i = 0; i < 3; i++) {
        const chamber = new THREE.Mesh(
          new THREE.BoxGeometry(20, 30, 15),
          new THREE.MeshStandardMaterial({ 
            color: 0x1e3a8a, 
            metalness: 0.85, 
            roughness: 0.25 
          })
        );
        chamber.position.set(40 + i * 35, 15, -20);
        chamber.castShadow = true;
        chamber.receiveShadow = true;
        scene.add(chamber);
        obstacles.push(chamber);
        
        const chamberGlow = new THREE.PointLight(0x3b82f6, 2, 25);
        chamberGlow.position.copy(chamber.position);
        scene.add(chamberGlow);
      }

      // Electric barrier (must crouch under)
      if (!puzzleStates.barrier_disabled) {
        for (let i = 0; i < 10; i++) {
          const barrier = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 8, 80),
            new THREE.MeshBasicMaterial({ 
              color: 0x00ffff, 
              transparent: true, 
              opacity: 0.8 
            })
          );
          barrier.position.set(-20 + i * 2, 8, 0);
          barrier.userData = { type: 'electric_barrier', lethal: true, canCrouch: true };
          scene.add(barrier);
          laserGrids.push(barrier);
          
          const barrierGlow = new THREE.PointLight(0x00ffff, 1, 12);
          barrierGlow.position.copy(barrier.position);
          scene.add(barrierGlow);
        }

        const barrierLabel = createTextLabel('ELECTRIC BARRIER [CROUCH!]', '#00ffff', 2);
        barrierLabel.position.set(-10, 18, 0);
        scene.add(barrierLabel);
        
        addLog("⚠️ ELECTRIC BARRIER - CROUCH to pass", 'error');
      }

      // Wire puzzle button
      const wirePuzzleGroup = new THREE.Group();
      const wirePuzzle = new THREE.Mesh(
        new THREE.BoxGeometry(8, 10, 3),
        new THREE.MeshStandardMaterial({ 
          color: puzzleStates.wire_solved ? 0x10b981 : 0xef4444,
          emissive: puzzleStates.wire_solved ? 0x10b981 : 0xef4444,
          emissiveIntensity: 1.5,
          metalness: 0.8,
          roughness: 0.3
        })
      );
      wirePuzzle.userData = { type: 'wire_puzzle', id: 'wire1' };
      wirePuzzle.castShadow = true;
      wirePuzzleGroup.add(wirePuzzle);

      const wirePuzzleLabel = createTextLabel(
        puzzleStates.wire_solved ? 'PUZZLE [SOLVED]' : 'WIRE PUZZLE [PRESS E]',
        puzzleStates.wire_solved ? '#10b981' : '#ef4444',
        1.5
      );
      wirePuzzleLabel.position.y = 8;
      wirePuzzleGroup.add(wirePuzzleLabel);

      wirePuzzleGroup.position.set(-50, 5, -50);
      wirePuzzleGroup.userData = { type: 'wire_puzzle', id: 'wire1' }; // Added userData to the group
      scene.add(wirePuzzleGroup);
      puzzleElements.push(wirePuzzleGroup);

      // Specimen in containment
      const specimenGroup = new THREE.Group();
      const specimen = new THREE.Mesh(
        new THREE.IcosahedronGeometry(4, 1),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xff00ff,
          emissive: 0xff00ff,
          emissiveIntensity: 3,
          transparent: true,
          opacity: 0.85,
          metalness: 0.95,
          roughness: 0.05
        })
      );
      specimen.userData = { type: 'specimen', accessible: puzzleStates.wire_solved };
      specimen.castShadow = true;
      specimenGroup.add(specimen);

      const specimenLabel = createTextLabel(
        puzzleStates.wire_solved ? 'SPECIMEN [REACH ME]' : 'SPECIMEN [LOCKED]',
        puzzleStates.wire_solved ? '#ff00ff' : '#ff0000',
        2
      );
      specimenLabel.position.y = 8;
      specimenGroup.add(specimenLabel);

      specimenGroup.position.set(0, 5, -120);
      scene.add(specimenGroup);
      objectives.push(specimen);
      
      const specimenLight = new THREE.PointLight(0xff00ff, 5, 60);
      specimenLight.position.copy(specimenGroup.position);
      scene.add(specimenLight);

      // Resources
      const mission3Resources = [
        { name: 'Quantum Core', pos: [-70, 0.5, 40], color: 0x8b5cf6 },
        { name: 'Energy Cell', pos: [50, 0.5, -70], color: 0xfbbf24 },
      ];

      mission3Resources.forEach(res => {
        if (!collectedResources.includes(res.name)) {
          const resourceGroup = new THREE.Group();
          const resourceMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.8, 0),
            new THREE.MeshStandardMaterial({ 
              color: res.color, 
              emissive: res.color, 
              emissiveIntensity: 0.7,
              metalness: 0.95,
              roughness: 0.05
            })
          );
          resourceMesh.userData = { type: 'resource', name: res.name };
          resourceMesh.castShadow = true;
          resourceGroup.add(resourceMesh);

          const resourceLabel = createTextLabel(res.name, '#ffffff', 0.8);
          resourceLabel.position.y = 2;
          resourceGroup.add(resourceLabel);

          resourceGroup.position.set(...res.pos);
          scene.add(resourceGroup);
          collectibles.push(resourceMesh);
        }
      });
    }

    const keys = {};
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'c') isCrouching = true;
      
      if (e.key.toLowerCase() === 'e') {
        puzzleElements.forEach(elem => {
          const elemPos = elem.parent && elem.parent.type === 'Group' ? elem.parent.position : elem.position;
          const distance = player.position.distanceTo(elemPos);
          if (distance < 8) {
            if (elem.userData.type === 'button') {
              if (!activatedButtons.includes(elem.userData.id)) {
                setActivatedButtons(prev => [...prev, elem.userData.id]);
                setObjectiveCompletion(prev => ({ ...prev, button1: true }));
                addLog(`✓ Button activated!`, 'success');
              }
            } else if (elem.userData.type === 'lever') {
              setLeverStates(prev => ({ ...prev, [elem.userData.id]: !prev[elem.userData.id] }));
              setObjectiveCompletion(prev => ({ ...prev, lever1: true }));
              addLog(`✓ Knife lever toggled!`, 'info');
            } else if (elem.userData.type === 'terminal') {
              if (inventory.includes('keycard')) {
                setPuzzleStates(prev => ({ ...prev, terminal_active: true, laser_disabled: true }));
                setObjectiveCompletion(prev => ({ ...prev, terminal: true }));
                addLog(`✓ Terminal activated! Lasers disabled`, 'success');
              } else {
                addLog(`⚠️ Keycard required!`, 'error');
              }
            } else if (elem.userData.type === 'wire_puzzle') {
              setPuzzleStates(prev => ({ ...prev, wire_solved: true, barrier_disabled: true }));
              setObjectiveCompletion(prev => ({ ...prev, wirePuzzle: true }));
              addLog(`✓ Wire puzzle solved! Barrier disabled`, 'success');
            }
          }
        });

        collectibles.forEach((obj, idx) => {
          const objPos = obj.parent && obj.parent.type === 'Group' ? obj.parent.position : obj.position;
          const distance = player.position.distanceTo(objPos);
          if (distance < 5) {
            if (obj.userData.type === 'resource') {
              setCollectedResources(prev => [...prev, obj.userData.name]);
              collectResourceMutation.mutate(obj.userData.name);
              addLog(`✓ Collected: ${obj.userData.name}`, 'success');
              if (obj.parent && obj.parent.type === 'Group') {
                scene.remove(obj.parent);
              } else {
                scene.remove(obj);
              }
              collectibles.splice(idx, 1);
            } else if (obj.userData.type === 'keycard') {
              setInventory(prev => [...prev, 'keycard']);
              setObjectiveCompletion(prev => ({ ...prev, keycard: true }));
              addLog(`✓ Keycard acquired!`, 'success');
              if (obj.parent && obj.parent.type === 'Group') {
                scene.remove(obj.parent);
              } else {
                scene.remove(obj);
              }
              collectibles.splice(idx, 1);
            }
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

      const isSpacePressed = keys[' '] || mobileControls.space;

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

      if (isCrouching || mobileControls.c) {
        player.scale.y = THREE.MathUtils.lerp(player.scale.y, 0.5, delta * 10);
      } else {
        player.scale.y = THREE.MathUtils.lerp(player.scale.y, 1, delta * 10);
      }

      const speed = ((isCrouching || mobileControls.c) ? 7 : 15) * delta;
      const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'] || mobileControls.w || mobileControls.s || mobileControls.a || mobileControls.d;

      if (isOnRope) {
        if (keys['w'] || mobileControls.w) player.position.y += ropeSpeed * delta;
        if (keys['s'] || mobileControls.s) player.position.y -= ropeSpeed * delta;
        if (keys['a'] || mobileControls.a) player.position.x -= ropeSpeed * delta * 0.7;
        if (keys['d'] || mobileControls.d) player.position.x += ropeSpeed * delta * 0.7;

        if (ropeLine) {
          ropeLine.geometry.setFromPoints([
            new THREE.Vector3(player.position.x, player.position.y, player.position.z),
            new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
          ]);
        }
      } else {
        if (!isOnGround) playerVelocityY += gravity * delta;

        if (keys['w'] || mobileControls.w) player.position.z -= speed;
        if (keys['s'] || mobileControls.s) player.position.z += speed;
        if (keys['a'] || mobileControls.a) player.position.x -= speed;
        if (keys['d'] || mobileControls.d) player.position.x += speed;

        player.position.y += playerVelocityY * delta;

        if (player.position.y <= playerHalfHeight) {
          player.position.y = playerHalfHeight;
          playerVelocityY = 0;
          isOnGround = true;
        }
      }

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

      if (isMoving) {
        let targetRotation = 0;
        if (keys['w'] || mobileControls.w) targetRotation = 0;
        if (keys['s'] || mobileControls.s) targetRotation = Math.PI;
        if (keys['a'] || mobileControls.a) targetRotation = Math.PI / 2;
        if (keys['d'] || mobileControls.d) targetRotation = -Math.PI / 2;
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, delta * 10);
      }

      // Laser collision detection
      laserGrids.forEach(laser => {
        const distance = player.position.distanceTo(laser.position);
        if (distance < 5) {
          if (laser.userData.canCrouch && (isCrouching || mobileControls.c)) {
            // Safe - crouching under barrier
          } else if (!laser.userData.canCrouch || !(isCrouching || mobileControls.c)) {
            setPlayerHealth(prev => {
              const newHealth = Math.max(0, prev - 50 * delta);
              if (newHealth <= 0) {
                addLog("💀 MISSION FAILED - Lethal hazard", 'error');
                setTimeout(() => {
                  setShowBriefing(true);
                  setMissionStarted(false);
                  setPlayerHealth(100);
                  setObjectiveCompletion({});
                }, 1000);
              }
              return newHealth;
            });
          }
        }
      });

      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const elemPos = elem.parent && elem.parent.type === 'Group' ? elem.parent.position : elem.position;
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elemPos.x, elemPos.z));
          if (distance < 3 && !puzzleStates[elem.userData.id]) {
            setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
            setObjectiveCompletion(prev => ({ ...prev, plate1: true }));
            addLog(`✓ Pressure plate activated!`, 'info');
          }
        }
      });

      objectives.forEach(obj => {
        const objPos = obj.parent && obj.parent.type === 'Group' ? obj.parent.position : obj.position;
        const distance = player.position.distanceTo(objPos);
        if (!missionComplete && distance < 8) {
          if (obj.userData.type === 'water_source' && obj.userData.accessible) {
            if (!objectiveCompletion.water) {
              setObjectiveCompletion(prev => ({ ...prev, water: true }));
              addLog(`✓ Water reached!`, 'success');
            }
          } else if (obj.userData.type === 'data_core' && obj.userData.accessible) {
            if (!objectiveCompletion.dataCore) {
              setObjectiveCompletion(prev => ({ ...prev, dataCore: true }));
              addLog(`✓ Data core acquired!`, 'success');
            }
          } else if (obj.userData.type === 'specimen' && obj.userData.accessible) {
            if (!objectiveCompletion.specimen) {
              setObjectiveCompletion(prev => ({ ...prev, specimen: true }));
              addLog(`✓ Specimen retrieved!`, 'success');
            }
          } else if (!obj.userData.accessible) {
            if (distance < 6 && !obj.userData.loggedLocked) {
              addLog(`⚠️ Objective locked - complete puzzles first!`, 'error');
              obj.userData.loggedLocked = true;
            }
          }
        } else if (distance >= 8) {
          obj.userData.loggedLocked = false;
        }
        obj.position.y += Math.sin(time * 2 + obj.position.x) * 0.02;
        obj.rotation.y += delta;
        obj.rotation.x = Math.sin(time * 0.5) * 0.15;
      });

      collectibles.forEach(obj => {
        const animatedObject = obj.parent && obj.parent.type === 'Group' ? obj.parent : obj;
        animatedObject.position.y = animatedObject.userData.originalY || animatedObject.position.y;
        animatedObject.userData.originalY = animatedObject.position.y;
        animatedObject.position.y += Math.sin(time * 3 + animatedObject.position.x) * 0.015;
        animatedObject.rotation.y += delta * 2;
      });

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
  }, [activeMission, puzzleStates, missionStarted, leverStates, activatedButtons, collectedResources, inventory, mobileControls, objectiveCompletion, gameState.completedMissions]);

  if (!activeMission) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900 text-white">
        <p className="font-mono">No active mission</p>
      </div>
    );
  }

  const handleMobileInteract = () => {
    const event = new KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true });
    window.dispatchEvent(event);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-4 p-6">
      {showBriefing && <MissionBriefing mission={activeMission} onStart={() => { setShowBriefing(false); setMissionStarted(true); }} puzzleStates={puzzleStates} inventory={inventory} />}
      {showAIAssistant && <GameAIAssistant mission={activeMission} puzzleStates={puzzleStates} inventory={inventory} playerPosition={playerPosition} isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />}
      {showHackingPuzzle && <PowerCoreHackingPuzzle onComplete={() => { setShowHackingPuzzle(false); completeMission(); }} onClose={() => setShowHackingPuzzle(false)} />}

      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div ref={mountRef} className="w-full h-[600px] bg-gray-900" />
            
            <div className="absolute top-4 left-4 bg-black/95 backdrop-blur-md border border-red-500/60 rounded-lg p-3 z-10 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Heart className={`w-5 h-5 ${playerHealth > 50 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white font-mono text-sm font-bold">HP: {Math.round(playerHealth)}%</span>
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
                <span className="text-blue-400 font-mono text-xs font-bold">RESOURCES: {collectedResources.length}</span>
              </div>
              {inventory.includes('keycard') && (
                <p className="text-yellow-400 font-mono text-xs">🔑 Keycard</p>
              )}
            </div>

            <div className="absolute top-28 left-4 bg-black/95 backdrop-blur-md border border-blue-500/60 rounded-lg p-3 z-10 shadow-2xl">
              <p className="text-blue-400 font-mono text-sm font-bold tracking-wider">MISSION {activeMission.mission_number}</p>
              <p className="text-gray-300 font-mono text-xs mt-1">{activeMission.title}</p>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <Button onClick={() => setShowAIAssistant(true)} className="bg-cyan-600/95 hover:bg-cyan-700 backdrop-blur-md font-mono text-xs shadow-lg" size="sm">
                <Bot className="w-4 h-4 mr-1" />AI
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/95 backdrop-blur-md rounded-lg p-3 font-mono text-xs text-gray-300 hidden md:block z-10 border border-gray-700 shadow-2xl">
              <p className="font-bold text-white mb-1">CONTROLS:</p>
              <p>WASD: Move | SPACE: Rope | C: Crouch | E: Interact</p>
            </div>

            {/* Mobile Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end md:hidden z-20">
              {/* Movement Joystick */}
              <div className="relative w-32 h-32 bg-black/50 backdrop-blur-md rounded-full border-2 border-blue-500/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-blue-500/30"></div>
                </div>
                
                {/* Up */}
                <button
                  onTouchStart={() => setMobileControls(prev => ({ ...prev, w: true }))}
                  onTouchEnd={() => setMobileControls(prev => ({ ...prev, w: false }))}
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500/80 rounded-full flex items-center justify-center active:bg-blue-600"
                >
                  <span className="text-white font-bold text-xs">W</span>
                </button>
                
                {/* Down */}
                <button
                  onTouchStart={() => setMobileControls(prev => ({ ...prev, s: true }))}
                  onTouchEnd={() => setMobileControls(prev => ({ ...prev, s: false }))}
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500/80 rounded-full flex items-center justify-center active:bg-blue-600"
                >
                  <span className="text-white font-bold text-xs">S</span>
                </button>
                
                {/* Left */}
                <button
                  onTouchStart={() => setMobileControls(prev => ({ ...prev, a: true }))}
                  onTouchEnd={() => setMobileControls(prev => ({ ...prev, a: false }))}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 w-10 h-10 bg-blue-500/80 rounded-full flex items-center justify-center active:bg-blue-600"
                >
                  <span className="text-white font-bold text-xs">A</span>
                </button>
                
                {/* Right */}
                <button
                  onTouchStart={() => setMobileControls(prev => ({ ...prev, d: true }))}
                  onTouchEnd={() => setMobileControls(prev => ({ ...prev, d: false }))}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-blue-500/80 rounded-full flex items-center justify-center active:bg-blue-600"
                >
                  <span className="text-white font-bold text-xs">D</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Interact */}
                <button
                  onClick={handleMobileInteract}
                  className="w-14 h-14 bg-green-500/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-green-400/50 active:bg-green-600 shadow-lg"
                >
                  <span className="text-white font-bold text-xs">E</span>
                </button>
                
                {/* Rope */}
                <button
                  onTouchStart={() => setMobileControls(prev => ({ ...prev, space: true }))}
                  onTouchEnd={() => setMobileControls(prev => ({ ...prev, space: false }))}
                  className="w-14 h-14 bg-yellow-500/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-yellow-400/50 active:bg-yellow-600 shadow-lg"
                >
                  <span className="text-white font-bold text-xs">⬆</span>
                </button>
                
                {/* Crouch */}
                <button
                  onTouchStart={() => setMobileControls(prev => ({ ...prev, c: true }))}
                  onTouchEnd={() => setMobileControls(prev => ({ ...prev, c: false }))}
                  className="w-14 h-14 bg-purple-500/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-purple-400/50 active:bg-purple-600 shadow-lg"
                >
                  <span className="text-white font-bold text-xs">C</span>
                </button>
              </div>
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
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.button1 ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.button1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Activate sink button</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.plate1 ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.plate1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Step on pressure plate</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.lever1 ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.lever1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Toggle knife lever</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.water ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.water ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Reach water droplet</span>
                </div>
              </>
            )}
            {activeMission.mission_number === 2 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.keycard ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.keycard ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Collect keycard</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.terminal ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.terminal ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Activate terminal</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.dataCore ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.dataCore ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Reach data core</span>
                </div>
              </>
            )}
            {activeMission.mission_number === 3 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.wirePuzzle ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.wirePuzzle ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Solve wire puzzle</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${objectiveCompletion.specimen ? 'bg-green-900/40 border border-green-500/40' : 'bg-gray-800/40'}`}>
                  <CheckCircle className={`w-4 h-4 ${objectiveCompletion.specimen ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Retrieve specimen</span>
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
