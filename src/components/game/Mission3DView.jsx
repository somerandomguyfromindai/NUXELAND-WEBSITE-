import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, FileText, Lightbulb, MoveUp, Hand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot } from "lucide-react";
import MissionBriefing from "./MissionBriefing";
import GameAIAssistant from "./GameAIAssistant";

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
    jump: false
  });
  const mobileControlsRef = useRef(mobileControls);
  const [environmentVariant, setEnvironmentVariant] = useState(null);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
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
        }, 2000);
      }
    }
  };

  const generateEnvironmentVariant = async () => {
    if (!activeMission || isGeneratingVariant) return;
    
    setIsGeneratingVariant(true);
    try {
      const playerActions = {
        puzzles_completed: Object.keys(puzzleStates).filter(k => puzzleStates[k]).length,
        buttons_activated: activatedButtons.length,
        levers_activated: Object.keys(leverStates).filter(k => leverStates[k]).length,
        items_collected: inventory.length,
        destroyed_objects: destroyedObjects.length
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a game environment designer for Mission ${activeMission.mission_number}: ${activeMission.title}.

Current player actions:
${JSON.stringify(playerActions, null, 2)}

Generate a JSON object with environmental variations to make the mission more challenging and unique based on player progress:

For Mission 1 (Kitchen):
- Add hazards like "steam vents", "water puddles", "falling utensils"
- Modify object positions slightly (small random offsets)
- Add dynamic elements like "moving platforms", "rotating obstacles"

For Mission 2 (Lab):
- Add "additional laser barriers", "moving security cameras", "patrol drones"
- Modify "terminal hack difficulty", "data core elevation"
- Add environmental effects like "flickering lights", "gas leaks"

Return JSON with this structure:
{
  "hazards": [{"type": "steam_vent", "x": 10, "y": 2, "z": -20, "radius": 3}],
  "modified_objects": [{"id": "sink", "position_offset": {"x": 0, "y": 0, "z": 2}}],
  "dynamic_elements": [{"type": "moving_platform", "path": [{"x": 10, "z": 20}, {"x": 30, "z": 20}], "speed": 2}],
  "effects": [{"type": "flickering_lights", "intensity": 0.3}]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            hazards: { type: "array", items: { type: "object" } },
            modified_objects: { type: "array", items: { type: "object" } },
            dynamic_elements: { type: "array", items: { type: "object" } },
            effects: { type: "array", items: { type: "object" } }
          }
        }
      });

      setEnvironmentVariant(response);
      addLog('Environment adapted to your progress!', 'warning');
    } catch (error) {
      console.error('Failed to generate variant:', error);
    } finally {
      setIsGeneratingVariant(false);
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
    const gravity = -25;
    const jumpForce = 10;
    const ropeSpeed = 8;
    const playerHalfHeight = 0.8;
    const playerRadius = 0.4;
    let jumpCount = 0;
    const maxJumps = 2;
    const ceilingHeight = 50;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Hold SPACE anywhere to deploy ROPE!", 'info');
      
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
      
      const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(40, 25, 1),
        new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.3 })
      );
      windowFrame.position.set(50, 30, -99);
      scene.add(windowFrame);
      
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
      
      const sinkBasin = new THREE.Mesh(
        new THREE.BoxGeometry(26, 6, 18),
        new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.1 })
      );
      sinkBasin.position.set(-5, -2.6, -25);
      sinkBasin.castShadow = true;
      sinkBasin.receiveShadow = true;
      scene.add(sinkBasin);
      
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
      
      if (activatedButtons.includes('button1')) {
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(-5, 1.1, -25);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
      }

      const knifeBladeGeometry = new THREE.BoxGeometry(2, 0.4, 20);
      const knifeHandleGeometry = new THREE.CylinderGeometry(1, 1, 7, 16);
      const knifeBladeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0f0f0,
        metalness: 0.98,
        roughness: 0.02,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      });
      const knifeHandleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a1810,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const knife = new THREE.Group();
      const blade = new THREE.Mesh(knifeBladeGeometry, knifeBladeMaterial);
      blade.position.z = 10;
      blade.castShadow = true;
      
      const handleMesh = new THREE.Mesh(knifeHandleGeometry, knifeHandleMaterial);
      handleMesh.rotation.x = Math.PI / 2;
      handleMesh.position.z = -3.5;
      handleMesh.castShadow = true;
      
      knife.add(blade);
      knife.add(handleMesh);
      knife.position.set(80, 0.8, 35);
      knife.rotation.y = -Math.PI / 4;
      knife.userData = { type: 'lever', id: 'lever1' };
      scene.add(knife);
      puzzleElements.push(knife);
      obstacles.push(knife);
      
      const knifeGlow = new THREE.Mesh(
        new THREE.SphereGeometry(2, 16, 16),
        new THREE.MeshBasicMaterial({ 
          color: leverStates.lever1 ? 0x10b981 : 0xffff00, 
          transparent: true, 
          opacity: 0.2 
        })
      );
      knifeGlow.position.copy(knife.position);
      knifeGlow.position.y += 2;
      scene.add(knifeGlow);

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
      scene.add(bowl);
      obstacles.push(bowl);
      
      const rimGeometry = new THREE.TorusGeometry(bowlRadius, 0.5, 16, 64);
      const rim = new THREE.Mesh(rimGeometry, bowlMaterial);
      rim.position.set(30, 8, 20);
      rim.rotation.x = Math.PI / 2;
      scene.add(rim);
      obstacles.push(rim);

      const spoonGroup = new THREE.Group();
      const spoonHandleGeometry = new THREE.CylinderGeometry(0.4, 0.5, 18, 16);
      const spoonHeadGeometry = new THREE.SphereGeometry(2.5, 32, 32);
      const spoonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8e8e8,
        metalness: 0.95,
        roughness: 0.05
      });
      
      const spoonHandle = new THREE.Mesh(spoonHandleGeometry, spoonMaterial);
      spoonHandle.rotation.z = Math.PI / 2;
      spoonHandle.castShadow = true;
      
      const spoonHead = new THREE.Mesh(spoonHeadGeometry, spoonMaterial);
      spoonHead.position.x = 10;
      spoonHead.scale.set(1, 0.4, 1);
      spoonHead.castShadow = true;
      
      spoonGroup.add(spoonHandle);
      spoonGroup.add(spoonHead);
      spoonGroup.position.set(-15, 1.2, -10);
      spoonGroup.rotation.y = Math.PI / 4;
      scene.add(spoonGroup);
      obstacles.push(spoonGroup);

      const mugGeometry = new THREE.CylinderGeometry(5, 4.2, 10, 32);
      const mugMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
      const mug = new THREE.Mesh(mugGeometry, mugMaterial);
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      scene.add(mug);
      obstacles.push(mug);
      
      const mugHandleGeometry = new THREE.TorusGeometry(3, 0.6, 16, 32, Math.PI);
      const mugHandle = new THREE.Mesh(mugHandleGeometry, mugMaterial);
      mugHandle.position.set(50, 5, -20);
      mugHandle.rotation.y = -Math.PI / 2;
      mugHandle.rotation.x = Math.PI / 2;
      mugHandle.castShadow = true;
      scene.add(mugHandle);
      obstacles.push(mugHandle);
      
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(4.8, 4, 0.5, 32),
        new THREE.MeshStandardMaterial({ color: 0x3e2723 })
      );
      coffee.position.set(50, 9.5, -20);
      scene.add(coffee);

      for (let i = 0; i < 8; i++) {
        const crumbSize = 1.2 + Math.random() * 1.8;
        const crumb = new THREE.Mesh(
          new THREE.DodecahedronGeometry(crumbSize, 1),
          new THREE.MeshStandardMaterial({ 
            color: 0xdaa520,
            roughness: 0.95
          })
        );
        crumb.position.set(10 + i * 4 + Math.random() * 2, crumbSize / 2, 5 + Math.random() * 4);
        crumb.rotation.set(Math.random(), Math.random(), Math.random());
        crumb.castShadow = true;
        crumb.userData = { type: 'destructible', id: `crumb_${i}`, health: 2 };
        if (!destroyedObjects.includes(`crumb_${i}`)) {
          scene.add(crumb);
          destructibleObjects.push(crumb);
          obstacles.push(crumb);
        }
      }

      const butter = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2, 4),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2 })
      );
      butter.position.set(-25, 1, 15);
      butter.castShadow = true;
      butter.userData = { type: 'slippery' };
      scene.add(butter);
      interactiveObjects.push(butter);
      obstacles.push(butter);

      if (activatedButtons.includes('button1')) {
        const forkMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, metalness: 0.9, roughness: 0.1 });
        const forkHandle = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 25), forkMaterial);
        forkHandle.position.set(15, 1.3, -15);
        forkHandle.rotation.y = Math.PI / 6;
        forkHandle.castShadow = true;
        scene.add(forkHandle);
        obstacles.push(forkHandle);
        
        for (let i = 0; i < 4; i++) {
          const prong = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 6), forkMaterial);
          prong.position.set(15 + (i - 1.5) * 0.8, 1.3, -27);
          prong.rotation.y = Math.PI / 6;
          prong.castShadow = true;
          scene.add(prong);
          obstacles.push(prong);
        }
      }

      const napkin = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.3, 12),
        new THREE.MeshStandardMaterial({ 
          color: 0xfafafa,
          roughness: 0.9,
          metalness: 0
        })
      );
      napkin.position.set(35, 0.15, -5);
      napkin.rotation.y = Math.PI / 8;
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

      const dinnerPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 7, 1.2, 64),
        new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          roughness: 0.25,
          metalness: 0.1
        })
      );
      dinnerPlate.position.set(55, 0.6, 0);
      dinnerPlate.castShadow = true;
      scene.add(dinnerPlate);
      obstacles.push(dinnerPlate);

      const sugarPositions = [
        { x: 20, y: 1, z: -8 },
        { x: 22, y: 1, z: -8 },
        { x: 21, y: 3, z: -8 },
        { x: 24, y: 1, z: -6 }
      ];
      sugarPositions.forEach((pos, i) => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.1
          })
        );
        cube.position.set(pos.x, pos.y, pos.z);
        cube.castShadow = true;
        cube.userData = { type: 'destructible', id: `sugar_${i}`, health: 3 };
        if (!destroyedObjects.includes(`sugar_${i}`)) {
          scene.add(cube);
          destructibleObjects.push(cube);
          obstacles.push(cube);
        }
      });

      const resourcePositions = [
        { name: 'Metal Scrap', x: -30, y: 1, z: 10, color: 0xc0c0c0 },
        { name: 'Energy Cell', x: 40, y: 1, z: -10, color: 0xffff00 },
        { name: 'Data Chip', x: 60, y: 1, z: 15, color: 0x00ffff },
        { name: 'Chemical Sample', x: -20, y: 1, z: -15, color: 0x00ff00 },
        { name: 'Nano Circuit', x: 45, y: 5, z: 5, color: 0xff00ff },
      ];

      resourcePositions.forEach((res, i) => {
        const resourceGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const resourceMaterial = new THREE.MeshStandardMaterial({
          color: res.color,
          emissive: res.color,
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2
        });
        const resourceMesh = new THREE.Mesh(resourceGeometry, resourceMaterial);
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);
      });

      const waterDrop = new THREE.Mesh(
        new THREE.SphereGeometry(3, 64, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.7,
          transmission: 0.95,
          roughness: 0,
          metalness: 0,
          thickness: 2,
          envMapIntensity: 1.5
        })
      );
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      waterDrop.position.set(70, canReachWater ? 3 : 25, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 32, 32),
        new THREE.MeshBasicMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.3
        })
      );
      glow.position.copy(waterDrop.position);
      scene.add(glow);

      if (canReachWater) {
        for (let i = 0; i < 40; i++) {
          const mist = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 8, 8),
            new THREE.MeshBasicMaterial({ 
              color: 0xffffff,
              transparent: true,
              opacity: 0.4
            })
          );
          mist.position.set(65 + Math.random() * 10, 1 + Math.random() * 6, 0 + Math.random() * 10);
          mist.userData = { type: 'mist', velocity: { y: Math.random() * 0.02 + 0.01 } };
          scene.add(mist);
          mistParticles.push(mist);
        }
      }

    } else if (activeMission.mission_number === 2) {
      addLog("Mission 2: Lab infiltration", 'warning');
      
      player.position.set(-80, 1, 80);
      obstacles = [];
      
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 30, 150);

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

      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a5a, roughness: 0.8 });
      const wallHeight = 40;
      
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

      for (let i = 0; i < 6; i++) {
        const serverRack = new THREE.Mesh(
          new THREE.BoxGeometry(15, 25, 8),
          new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.7, metalness: 0.3 })
        );
        serverRack.position.set(-60 + i * 25, 12.5, -90);
        serverRack.castShadow = true;
        scene.add(serverRack);
        obstacles.push(serverRack);
        
        for (let j = 0; j < 5; j++) {
          const light = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ 
              color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
              emissive: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
              emissiveIntensity: 0.8
            })
          );
          light.position.set(-60 + i * 25, 5 + j * 4, -85.5);
          scene.add(light);
        }
      }

      const tablePositions = [
        { x: -40, z: -30 },
        { x: 0, z: -30 },
        { x: 40, z: -30 },
        { x: -40, z: 30 },
        { x: 40, z: 30 }
      ];

      tablePositions.forEach(pos => {
        const table = new THREE.Mesh(
          new THREE.BoxGeometry(20, 1, 15),
          new THREE.MeshStandardMaterial({ color: 0x4a4a6a, roughness: 0.6 })
        );
        table.position.set(pos.x, 6, pos.z);
        table.castShadow = true;
        scene.add(table);
        obstacles.push(table);
        
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 6, 16),
            new THREE.MeshStandardMaterial({ color: 0x3a3a5a })
          );
          leg.position.set(
            pos.x + (i % 2 === 0 ? -8 : 8),
            3,
            pos.z + (i < 2 ? -6 : 6)
          );
          leg.castShadow = true;
          scene.add(leg);
          obstacles.push(leg);
        }

        const equipment = new THREE.Mesh(
          new THREE.BoxGeometry(8, 5, 6),
          new THREE.MeshStandardMaterial({ 
            color: 0x6a6a8a,
            emissive: 0x0066cc,
            emissiveIntensity: 0.3
          })
        );
        equipment.position.set(pos.x, 9, pos.z);
        equipment.castShadow = true;
        scene.add(equipment);
        obstacles.push(equipment);
      });

      const terminal = new THREE.Mesh(
        new THREE.BoxGeometry(12, 15, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0x2a2a4a,
          emissive: 0x00ccff,
          emissiveIntensity: 0.5,
          metalness: 0.6
        })
      );
      terminal.position.set(0, 7.5, 0);
      terminal.castShadow = true;
      terminal.userData = { type: 'terminal', id: 'main_terminal' };
      scene.add(terminal);
      puzzleElements.push(terminal);
      obstacles.push(terminal);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 6),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.8
        })
      );
      screen.position.set(0, 10, 4.1);
      scene.add(screen);

      const dataCore = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1,
          transparent: true,
          opacity: 0.8,
          transmission: 0.5
        })
      );
      dataCore.position.set(0, 16, 0);
      dataCore.userData = { type: 'data_core', accessible: true };
      dataCore.castShadow = true;
      scene.add(dataCore);
      objectives.push(dataCore);

      const dataCoreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ffff,
          transparent: true,
          opacity: 0.2
        })
      );
      dataCoreGlow.position.copy(dataCore.position);
      scene.add(dataCoreGlow);

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
        laser.userData = { type: 'laser', deadly: true };
        scene.add(laser);
        interactiveObjects.push(laser);
      }

      const cratePositions = [
        { x: -70, z: 40 },
        { x: -50, z: 60 },
        { x: 50, z: 60 },
        { x: 70, z: 40 },
        { x: -30, z: -60 },
        { x: 30, z: -60 }
      ];

      cratePositions.forEach(pos => {
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(10, 10, 10),
          new THREE.MeshStandardMaterial({ 
            color: 0x4a3a2a,
            roughness: 0.9
          })
        );
        crate.position.set(pos.x, 5, pos.z);
        crate.castShadow = true;
        scene.add(crate);
        obstacles.push(crate);
      });

      const labResources = [
        { name: 'Research Data', x: -70, y: 1, z: -70, color: 0x00ffff },
        { name: 'Security Key', x: 70, y: 1, z: -70, color: 0xffaa00 },
        { name: 'Lab Sample', x: -70, y: 1, z: 70, color: 0xff00ff },
        { name: 'Prototype Chip', x: 70, y: 1, z: 70, color: 0x00ff00 }
      ];

      labResources.forEach((res, i) => {
        const resourceGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const resourceMaterial = new THREE.MeshStandardMaterial({
          color: res.color,
          emissive: res.color,
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2
        });
        const resourceMesh = new THREE.Mesh(resourceGeometry, resourceMaterial);
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `lab_resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);
      });

      addLog("Advanced security systems active!", 'warning');
    }

    const keys = {};
    let onSlippery = false;
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      
      if (e.key.toLowerCase() === 'e') {
        resourceObjects.forEach((obj, index) => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 3) {
            base44.auth.me().then(user => {
              const inventory = user.resource_inventory || {};
              inventory[obj.userData.resourceName] = (inventory[obj.userData.resourceName] || 0) + 1;
              base44.auth.updateMe({ resource_inventory: inventory });
            }).catch(() => {});
            
            addLog(`Collected: ${obj.userData.resourceName}`, 'success');
            setInventory(prev => {
              const existingItemIndex = prev.findIndex(item => item.name === obj.userData.resourceName);
              if (existingItemIndex > -1) {
                const newInventory = [...prev];
                newInventory[existingItemIndex].quantity += 1;
                return newInventory;
              } else {
                return [...prev, { name: obj.userData.resourceName, quantity: 1 }];
              }
            });
            scene.remove(obj);
            resourceObjects.splice(index, 1);
          }
        });

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
            } else if (elem.userData.type === 'terminal') {
                addLog(`Interacted with terminal ${elem.userData.id}`, 'info');
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
          addLog('Rope deployed!', 'info');
        }
      } else {
        if (ropeLine) {
          scene.remove(ropeLine);
          ropeLine.geometry.dispose();
          ropeLine.material.dispose();
          ropeLine = null;
          isOnRope = false;
          addLog('Rope retracted', 'info');
        }
      }
      
      if (mobileControlsRef.current.jump) {
        setMobileControls(prev => ({ ...prev, jump: false }));
      }

      if (isOnRope) {
        playerVelocityY = 0;

        if (keys['w'] || mobileControlsRef.current.up) {
          player.position.y += ropeSpeed * delta;
          if (player.position.y > ceilingHeight - playerHalfHeight - 0.5) player.position.y = ceilingHeight - playerHalfHeight - 0.5;
        }
        if (keys['s'] || mobileControlsRef.current.down) {
          player.position.y -= ropeSpeed * delta;
          if (player.position.y < playerHalfHeight) player.position.y = playerHalfHeight;
        }

        const ropeHorizontalSpeed = (keys['shift'] ? 20 : 10) * 0.5;
        if (keys['a'] || mobileControlsRef.current.left) player.position.x -= ropeHorizontalSpeed * delta;
        if (keys['d'] || mobileControlsRef.current.right) player.position.x += ropeHorizontalSpeed * delta;

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
        const speed = onSlippery ? baseSpeed * 1.5 : baseSpeed;
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

        onSlippery = false;
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

      interactiveObjects.forEach(obj => {
        if (obj.userData.type === 'slippery') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(obj.position.x, obj.position.z));
          if (distance < 5) {
            onSlippery = true;
          }
        } else if (obj.userData.type === 'laser' && obj.userData.deadly) {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 5 && player.position.y < obj.position.y + 4 && player.position.y > obj.position.y - 4) {
            addLog("Laser detected!", 'error');
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

      mistParticles.forEach(mist => {
        if (mist.userData.velocity) {
          mist.position.y += mist.userData.velocity.y;
          if (mist.position.y > 20) {
            mist.position.y = 5;
          }
        }
      });

      if (environmentVariant) {
        environmentVariant.effects?.forEach(effect => {
          if (effect.type === 'flickering_lights') {
            ambientLight.intensity = 0.5 + Math.sin(clock.elapsedTime * 5) * effect.intensity;
          }
        });
      }

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
  }, [activeMission, puzzleStates, inventory, missionStarted, destroyedObjects, leverStates, activatedButtons, environmentVariant]);

  const handleMobileJump = () => {
    setMobileControls(prev => ({ ...prev, jump: true }));
  };

  const handleMobileInteract = () => {
    const keyEvent = new KeyboardEvent('keydown', { key: 'e' });
    window.dispatchEvent(keyEvent);
  };

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

      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div ref={mountRef} className="w-full h-[600px]" />
            
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded p-3 z-10">
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

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                onClick={generateEnvironmentVariant}
                disabled={isGeneratingVariant}
                className="bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm font-mono text-xs"
                size="sm"
              >
                {isGeneratingVariant ? 'Generating...' : 'AI Remix'}
              </Button>
              <Button
                onClick={() => setShowAIAssistant(true)}
                className="bg-cyan-600/80 hover:bg-cyan-700/80 backdrop-blur-sm font-mono text-xs"
                size="sm"
              >
                <Bot className="w-4 h-4 mr-1" />
                AI Assistant
              </Button>
              <Button
                onClick={() => setShowHint(!showHint)}
                className="bg-yellow-600/80 hover:bg-yellow-700/80 backdrop-blur-sm font-mono text-xs hidden md:block"
                size="sm"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {showHint ? 'Hide' : 'Show'} Hints
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300 hidden md:block z-10">
              <p>W/A/S/D: Move | SPACE: Deploy Rope | E: Interact | Shift: Sprint</p>
              <p className="text-cyan-400 mt-1 font-bold">
                Hold SPACE anywhere to deploy ROPE - Use W/S to move up/down, A/D to swing left/right!
              </p>
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
                  className="w-16 h-16 bg-green-500/80 rounded-full flex items-center justify-center active:bg-green-600 flex-col"
                >
                  <MoveUp className="w-8 h-8 text-white" />
                  <span className="text-[10px] text-white font-bold">ROPE</span>
                </button>
                <button
                  onTouchStart={handleMobileInteract}
                  className="w-16 h-16 bg-yellow-500/80 rounded-full flex items-center justify-center active:bg-yellow-600 flex-col"
                >
                  <Hand className="w-7 h-7 text-white" />
                  <span className="text-[10px] text-white font-bold">USE</span>
                </button>
              </div>
            </div>

            {showHint && activeMission?.mission_number === 1 && (
              <div className="absolute top-20 left-4 bg-yellow-900/90 backdrop-blur-sm border border-yellow-500/50 rounded p-4 max-w-md z-20">
                <h4 className="text-yellow-300 font-mono font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Mission 1 Solution:
                </h4>
                <ol className="text-yellow-100 font-mono text-xs space-y-1 list-decimal list-inside">
                  <li>Use ROPE (hold SPACE) to reach button on sink</li>
                  <li>Press USE on button (turns green)</li>
                  <li>Cross fork bridge that appears</li>
                  <li>Walk onto PRESSURE PLATE on napkin</li>
                  <li>Go to KNIFE, press USE to activate lever</li>
                  <li>Reach WATER DROPLET to complete mission</li>
                </ol>
                <p className="text-yellow-200 text-xs mt-2 italic font-bold">
                  Hold SPACE for rope - W/S to move up/down!
                </p>
              </div>
            )}

            {!activeMission && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
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
             {activeMission?.mission_number === 2 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${inventory.some(item => item.name === 'Security Key') ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${inventory.some(item => item.name === 'Security Key') ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Security Key Acquired</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${false ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${false ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Terminal Hacked</span>
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