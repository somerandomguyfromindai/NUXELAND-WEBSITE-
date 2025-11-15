
import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, FileText, Lightbulb, MoveUp, Hand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot, Heart, Activity } from "lucide-react";
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
  const [health, setHealth] = useState(100);
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
  const [showMission3Choice, setShowMission3Choice] = useState(false);
  const [pipBioStress, setPipBioStress] = useState(20);
  const healthRef = useRef(health);
  const lastDamageTimeRef = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    mobileControlsRef.current = mobileControls;
  }, [mobileControls]);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

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
          setHealth(100);
          setPipBioStress(20);
        }, 2000);
      }
    }
  };

  const handleMission3Choice = (choice) => {
    if (choice === 'complete') {
      addLog("Order sent to Pip: Retrieve specimen...", 'warning');
      setTimeout(() => {
        addLog("Mission completed. Pip status: Critical.", 'error');
        completeMission();
      }, 2000);
    } else {
      addLog("Mission aborted. System logging insubordination.", 'error');
      setTimeout(() => {
        addLog("Security alert triggered!", 'warning');
        completeMission();
      }, 2000);
    }
    setShowMission3Choice(false);
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

Generate environmental variations based on player progress. Add 2-3 hazards or dynamic elements to increase challenge.

Return JSON with:
{
  "hazards": [{"type": "steam_vent", "x": 10, "y": 2, "z": -20, "radius": 3}],
  "dynamic_elements": [{"type": "moving_platform", "path": [{"x": 10, "z": 20}, {"x": 30, "z": 20}], "speed": 2}],
  "effects": [{"type": "flickering_lights", "intensity": 0.3}]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            hazards: { type: "array", items: { type: "object" } },
            dynamic_elements: { type: "array", items: { type: "object" } },
            effects: { type: "array", items: { type: "object" } }
          }
        }
      });

      setEnvironmentVariant(response);
      addLog('Environment adapted!', 'warning');
    } catch (error) {
      console.error('Failed to generate variant:', error);
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  useEffect(() => {
    if (!mountRef.current || !activeMission || !missionStarted) return;

    const scene = new THREE.Scene();
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
    const ropeSpeed = 8;
    const playerHalfHeight = 0.8;
    const playerRadius = 0.4;
    let jumpCount = 0;
    const maxJumps = 2;
    const ceilingHeight = 50;

    let pipAgent = null;
    let specimen = null;

    if (activeMission.mission_number === 1) {
      scene.background = new THREE.Color(0xdce8f0);
      scene.fog = new THREE.FogExp2(0xdce8f0, 0.006);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff9e6, 2.0);
      sunLight.position.set(60, 120, 60);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -120;
      sunLight.shadow.camera.right = 120;
      sunLight.shadow.camera.top = 120;
      sunLight.shadow.camera.bottom = -120;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.bias = -0.0001;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
      fillLight.position.set(-60, 60, -60);
      scene.add(fillLight);

      const counterGeometry = new THREE.PlaneGeometry(200, 200);
      const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5efe8,
        roughness: 0.4,
        metalness: 0.15,
        envMapIntensity: 1.2
      });
      const counter = new THREE.Mesh(counterGeometry, counterMaterial);
      counter.rotation.x = -Math.PI / 2;
      counter.receiveShadow = true;
      scene.add(counter);

      const gridHelper = new THREE.GridHelper(200, 50, 0xe0e0e0, 0xf0f0f0);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);
      
      addLog("Mission 1: Kitchen Infiltration", 'info');
      
      obstacles = [];
      
      const wallHeight = 50;
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8dcc8, 
        roughness: 0.9,
        metalness: 0.05
      });
      
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
      
      const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b5744, 
        roughness: 0.7,
        metalness: 0.1
      });
      for (let i = 0; i < 4; i++) {
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 10), cabinetMaterial);
        cabinet.position.set(-60 + i * 40, 35, -95);
        cabinet.castShadow = true;
        scene.add(cabinet);
        obstacles.push(cabinet);
      }
      
      const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(40, 25, 1),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xb8d8ea, 
          transparent: true, 
          opacity: 0.4,
          transmission: 0.95,
          roughness: 0.05,
          metalness: 0.05,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1
        })
      );
      windowFrame.position.set(50, 30, -99);
      scene.add(windowFrame);
      
      const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b7355, 
        roughness: 0.85,
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
        new THREE.MeshStandardMaterial({ 
          color: 0xf0f0f0, 
          metalness: 0.98, 
          roughness: 0.02,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          envMapIntensity: 2.0
        })
      );
      sinkOuterRim.position.set(-5, 0.4, -25);
      sinkOuterRim.castShadow = true;
      scene.add(sinkOuterRim);
      obstacles.push(sinkOuterRim);
      
      const sinkBasin = new THREE.Mesh(
        new THREE.BoxGeometry(26, 6, 18),
        new THREE.MeshStandardMaterial({ 
          color: 0xd8d8d8, 
          metalness: 0.95, 
          roughness: 0.08,
          clearcoat: 0.9
        })
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
        roughness: 0.25,
        metalness: 0.8
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

      const knife = new THREE.Group();
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 20),
        new THREE.MeshStandardMaterial({ 
          color: 0xfafafa,
          metalness: 0.99,
          roughness: 0.01,
          emissive: 0xffffff,
          emissiveIntensity: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01
        })
      );
      blade.position.z = 10;
      blade.castShadow = true;
      
      const handleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 7, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x2a1810,
          roughness: 0.85,
          metalness: 0.1
        })
      );
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
      const bowl = new THREE.Mesh(
        new THREE.SphereGeometry(bowlRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          roughness: 0.12,
          metalness: 0.08,
          side: THREE.DoubleSide,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1
        })
      );
      bowl.position.set(30, 4, 20);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      scene.add(bowl);
      obstacles.push(bowl);
      
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(bowlRadius, 0.5, 16, 64),
        bowl.material
      );
      rim.position.set(30, 8, 20);
      rim.rotation.x = Math.PI / 2;
      scene.add(rim);
      obstacles.push(rim);

      const spoonGroup = new THREE.Group();
      const spoonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0f0f0,
        metalness: 0.98,
        roughness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      });
      
      const spoonHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 18, 16),
        spoonMaterial
      );
      spoonHandle.rotation.z = Math.PI / 2;
      spoonHandle.castShadow = true;
      
      const spoonHead = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 32, 32),
        spoonMaterial
      );
      spoonHead.position.x = 10;
      spoonHead.scale.set(1, 0.4, 1);
      spoonHead.castShadow = true;
      
      spoonGroup.add(spoonHandle);
      spoonGroup.add(spoonHead);
      spoonGroup.position.set(-15, 1.2, -10);
      spoonGroup.rotation.y = Math.PI / 4;
      scene.add(spoonGroup);
      obstacles.push(spoonGroup);

      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 4.2, 10, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0x8b4513, 
          roughness: 0.65,
          metalness: 0.05,
          clearcoat: 0.6
        })
      );
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      scene.add(mug);
      obstacles.push(mug);
      
      const mugHandle = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.6, 16, 32, Math.PI),
        mug.material
      );
      mugHandle.position.set(50, 5, -20);
      mugHandle.rotation.y = -Math.PI / 2;
      mugHandle.rotation.x = Math.PI / 2;
      mugHandle.castShadow = true;
      scene.add(mugHandle);
      obstacles.push(mugHandle);
      
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(4.8, 4, 0.5, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0x3e2723,
          roughness: 0.4,
          metalness: 0.1
        })
      );
      coffee.position.set(50, 9.5, -20);
      scene.add(coffee);

      for (let i = 0; i < 8; i++) {
        const crumbSize = 1.2 + Math.random() * 1.8;
        const crumb = new THREE.Mesh(
          new THREE.DodecahedronGeometry(crumbSize, 1),
          new THREE.MeshStandardMaterial({ 
            color: 0xdaa520,
            roughness: 0.95,
            metalness: 0.02
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
        new THREE.MeshStandardMaterial({ 
          color: 0xffd700, 
          roughness: 0.18,
          metalness: 0.03,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2
        })
      );
      butter.position.set(-25, 1, 15);
      butter.castShadow = true;
      butter.userData = { type: 'slippery' };
      scene.add(butter);
      interactiveObjects.push(butter);
      obstacles.push(butter);

      if (activatedButtons.includes('button1')) {
        const forkMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xe8e8e8, 
          metalness: 0.96, 
          roughness: 0.04,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02
        });
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
          roughness: 0.95,
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
          metalness: 0.85,
          roughness: 0.15
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
          roughness: 0.22,
          metalness: 0.08,
          clearcoat: 0.85,
          clearcoatRoughness: 0.15
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
            roughness: 0.75,
            metalness: 0.08,
            transmission: 0.25,
            thickness: 0.5
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
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);
      });

      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      const waterDrop = new THREE.Mesh(
        new THREE.SphereGeometry(3, 64, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.75,
          transmission: 0.98,
          roughness: 0,
          metalness: 0,
          thickness: 2.5,
          envMapIntensity: 2.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0,
          ior: 1.33
        })
      );
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
      addLog("Mission 2: Lab - AVOID LASERS! They damage you!", 'warning');
      
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 30, 150);

      const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.3);
      scene.add(ambientLight);

      const blueLight = new THREE.DirectionalLight(0x4d94ff, 0.8);
      blueLight.position.set(50, 80, 50);
      blueLight.castShadow = true;
      blueLight.shadow.mapSize.width = 4096;
      blueLight.shadow.mapSize.height = 4096;
      scene.add(blueLight);

      const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ 
          color: 0x2a2a4a,
          roughness: 0.92,
          metalness: 0.25,
          envMapIntensity: 0.8
        })
      );
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a3a5a, 
        roughness: 0.88,
        metalness: 0.18
      });
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
          new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2a, 
            roughness: 0.75, 
            metalness: 0.55,
            emissive: 0x0a0a1a,
            emissiveIntensity: 0.2
          })
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
          new THREE.MeshStandardMaterial({ 
            color: 0x4a4a6a, 
            roughness: 0.68,
            metalness: 0.32
          })
        );
        table.position.set(pos.x, 6, pos.z);
        table.castShadow = true;
        scene.add(table);
        obstacles.push(table);
        
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 6, 16),
            new THREE.MeshStandardMaterial({ 
              color: 0x3a3a5a,
              metalness: 0.45,
              roughness: 0.7
            })
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
            emissiveIntensity: 0.35,
            metalness: 0.65,
            roughness: 0.42
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
          metalness: 0.68,
          roughness: 0.35
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
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.85,
          transmission: 0.6,
          roughness: 0,
          metalness: 0.95,
          clearcoat: 1.0,
          thickness: 1.5
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
          new THREE.BoxGeometry(0.5, 10, 60),
          new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.75,
            emissive: 0xff0000,
            emissiveIntensity: 1.2
          })
        );
        laser.position.set(-60 + i * 30, 5, 20);
        laser.userData = { type: 'laser', deadly: true, damage: 5 };
        scene.add(laser);
        interactiveObjects.push(laser);
        
        const laserGlow = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 11, 61),
          new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.15
          })
        );
        laserGlow.position.copy(laser.position);
        scene.add(laserGlow);
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
            roughness: 0.92,
            metalness: 0.08
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
        const resourceMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.8, 0),
          new THREE.MeshStandardMaterial({
            color: res.color,
            emissive: res.color,
            emissiveIntensity: 0.6,
            metalness: 0.8,
            roughness: 0.2
          })
        );
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `lab_resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);
      });

    } else if (activeMission.mission_number === 3) {
      addLog("Mission 3: Field Observation Point", 'warning');
      
      scene.background = new THREE.Color(0x87a96b);
      scene.fog = new THREE.FogExp2(0x87a96b, 0.008);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff4d6, 1.8);
      sunLight.position.set(80, 100, 60);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -120;
      sunLight.shadow.camera.right = 120;
      sunLight.shadow.camera.top = 120;
      sunLight.shadow.camera.bottom = -120;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      scene.add(sunLight);

      const grassFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200, 100, 100),
        new THREE.MeshStandardMaterial({ 
          color: 0x4a7c3a,
          roughness: 0.95,
          metalness: 0.02,
          envMapIntensity: 0.8
        })
      );
      grassFloor.rotation.x = -Math.PI / 2;
      grassFloor.receiveShadow = true;
      
      const positions = grassFloor.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.setY(i, Math.random() * 0.5);
      }
      positions.needsUpdate = true;
      grassFloor.geometry.computeVertexNormals();
      
      scene.add(grassFloor);

      for (let i = 0; i < 200; i++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 1.5 + Math.random() * 1, 0.05),
          new THREE.MeshStandardMaterial({ 
            color: 0x3a6b2a,
            roughness: 0.9
          })
        );
        blade.position.set(
          (Math.random() - 0.5) * 180,
          0.5,
          (Math.random() - 0.5) * 180
        );
        blade.rotation.z = (Math.random() - 0.5) * 0.3;
        blade.castShadow = true;
        scene.add(blade);
      }

      for (let i = 0; i < 5; i++) {
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(3 + Math.random() * 2, 1),
          new THREE.MeshStandardMaterial({ 
            color: 0x6a6a5a,
            roughness: 0.95,
            metalness: 0.05
          })
        );
        rock.position.set(
          (Math.random() - 0.5) * 160,
          1,
          (Math.random() - 0.5) * 160
        );
        rock.castShadow = true;
        scene.add(rock);
        obstacles.push(rock);
      }

      const observationPlatform = new THREE.Mesh(
        new THREE.CylinderGeometry(10, 12, 2, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0x8a7a6a,
          roughness: 0.85,
          metalness: 0.15
        })
      );
      observationPlatform.position.set(-70, 1, -70);
      observationPlatform.castShadow = true;
      scene.add(observationPlatform);
      obstacles.push(observationPlatform);

      const monitorStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.8, 6, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x4a4a4a,
          metalness: 0.7,
          roughness: 0.3
        })
      );
      monitorStand.position.set(-70, 5, -70);
      monitorStand.castShadow = true;
      scene.add(monitorStand);
      obstacles.push(monitorStand);

      const monitorScreen = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 0.5),
        new THREE.MeshStandardMaterial({ 
          color: 0x2a2a2a,
          emissive: 0x0088ff,
          emissiveIntensity: 0.4,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      monitorScreen.position.set(-70, 8.5, -70);
      monitorScreen.userData = { type: 'monitor', id: 'pip_monitor' };
      monitorScreen.castShadow = true;
      scene.add(monitorScreen);
      puzzleElements.push(monitorScreen);
      obstacles.push(monitorScreen);

      const pipBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x1a1a1a,
          roughness: 0.3,
          metalness: 0.6
        })
      );
      pipBody.position.set(20, 1, 20);
      pipBody.castShadow = true;
      pipBody.userData = { type: 'agent', id: 'pip', bioStress: 20 };
      scene.add(pipBody);
      pipAgent = pipBody;

      for (let i = 0; i < 6; i++) {
        const wing = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 0.4),
          new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
          })
        );
        wing.position.set(20 + Math.cos(i) * 0.3, 1.3, 20 + Math.sin(i) * 0.3);
        scene.add(wing);
      }

      const specimenSeed = new THREE.Mesh(
        new THREE.SphereGeometry(8, 32, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0x8b6f47,
          roughness: 0.9,
          metalness: 0.05
        })
      );
      specimenSeed.position.set(22, 4, 22);
      specimenSeed.castShadow = true;
      specimenSeed.userData = { type: 'specimen', id: 'seed_specimen' };
      scene.add(specimenSeed);
      specimen = specimenSeed;
      objectives.push(specimenSeed);

      const specimenGlow = new THREE.Mesh(
        new THREE.SphereGeometry(9, 32, 32),
        new THREE.MeshBasicMaterial({ 
          color: 0xffaa00,
          transparent: true,
          opacity: 0.15
        })
      );
      specimenGlow.position.copy(specimenSeed.position);
      scene.add(specimenGlow);

      for (let i = 0; i < 8; i++) {
        const tree = new THREE.Group();
        
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2.5, 20, 16),
          new THREE.MeshStandardMaterial({ 
            color: 0x4a3a2a,
            roughness: 0.95,
            metalness: 0.02
          })
        );
        trunk.position.y = 10;
        trunk.castShadow = true;
        tree.add(trunk);
        
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(8, 16, 16),
          new THREE.MeshStandardMaterial({ 
            color: 0x2d5a1e,
            roughness: 0.9,
            metalness: 0
          })
        );
        foliage.position.y = 22;
        foliage.castShadow = true;
        tree.add(foliage);
        
        tree.position.set(
          (Math.random() - 0.5) * 180,
          0,
          (Math.random() - 0.5) * 180
        );
        scene.add(tree);
        obstacles.push(trunk);
        obstacles.push(foliage);
      }

      const fieldResources = [
        { name: 'Soil Sample', x: -60, y: 0.5, z: 60, color: 0x8b7355 },
        { name: 'Plant Extract', x: 60, y: 0.5, z: -60, color: 0x00ff00 },
        { name: 'Water Sample', x: -60, y: 0.5, z: -60, color: 0x00aaff },
        { name: 'Bio Material', x: 60, y: 0.5, z: 60, color: 0xff6600 }
      ];

      fieldResources.forEach((res, i) => {
        const resourceMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.8, 0),
          new THREE.MeshStandardMaterial({
            color: res.color,
            emissive: res.color,
            emissiveIntensity: 0.6,
            metalness: 0.7,
            roughness: 0.3
          })
        );
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `field_resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);
      });

      addLog("Observe Agent Pip from the platform", 'info');
    }

    const playerGroup = new THREE.Group();
    
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e40af,
      roughness: 0.38,
      metalness: 0.68,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.25,
      clearcoat: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    const helmetGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const helmetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa,
      roughness: 0.08,
      metalness: 0.92,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
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
      opacity: 0.85
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 0.9, 0.3);
    playerGroup.add(visor);

    if (activeMission.mission_number === 1) {
      playerGroup.position.set(0, 1, 0);
    } else if (activeMission.mission_number === 2) {
      playerGroup.position.set(-80, 1, 80);
    } else if (activeMission.mission_number === 3) {
      playerGroup.position.set(-70, 3, -70);
    }
    
    scene.add(playerGroup);
    const player = playerGroup;

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
          if (distance < 5) {
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
                addLog(`Terminal accessed`, 'info');
            } else if (elem.userData.type === 'monitor') {
              if (activeMission.mission_number === 3) {
                addLog("Accessing Pip's bio-monitor...", 'info');
                setTimeout(() => {
                  setPipBioStress(85);
                  addLog("WARNING: Pip bio-stress at 85%!", 'error');
                }, 1000);
                setTimeout(() => {
                  addLog("COMMS: Please, no, it's too big, I can't--", 'error');
                }, 2500);
                setTimeout(() => {
                  setShowMission3Choice(true);
                }, 3500);
              }
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
              addLog(`Hit ${obj.userData.id}`, 'warning');
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
      const currentTime = clock.elapsedTime;

      const isSpaceOrMobileJumpPressed = keys[' '] || mobileControlsRef.current.jump;

      if (isSpaceOrMobileJumpPressed && activeMission.mission_number !== 3) { // Rope not available in Mission 3
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
          const laserBox = new THREE.Box3().setFromObject(obj);
          const playerBox = new THREE.Box3().setFromCenterAndSize(
            player.position,
            new THREE.Vector3(playerRadius * 2, playerHalfHeight * 2, playerRadius * 2)
          );
          
          if (playerBox.intersectsBox(laserBox)) {
            if (currentTime - lastDamageTimeRef.current > 0.5) {
              const damage = obj.userData.damage || 5;
              setHealth(prev => {
                const newHealth = Math.max(0, prev - damage);
                if (newHealth === 0) {
                  addLog("CRITICAL! Health depleted!", 'error');
                  setTimeout(() => {
                    setHealth(100);
                    if (activeMission.mission_number === 1) {
                      player.position.set(0, 1, 0);
                    } else if (activeMission.mission_number === 2) {
                      player.position.set(-80, 1, 80);
                    } else if (activeMission.mission_number === 3) {
                      player.position.set(-70, 3, -70);
                    }
                    addLog("Respawned", 'warning');
                  }, 2000);
                }
                return newHealth;
              });
              addLog(`LASER HIT! -${damage} HP`, 'error');
              lastDamageTimeRef.current = currentTime;
              
              body.material.emissive.setHex(0xff0000);
              body.material.emissiveIntensity = 1;
              setTimeout(() => {
                body.material.emissive.setHex(0x1e3a8a);
                body.material.emissiveIntensity = 0.25;
              }, 200);
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

        // Mission 3 objective is handled by the choice dialog, so no direct objective reach here.
        // if (obj.userData.type === 'exit_door' && obj.userData.accessible) {
        //   const distance = player.position.distanceTo(obj.position);
        //   if (!missionComplete && distance < 8) {
        //     missionComplete = true;
        //     addLog('EXIT REACHED!', 'success');
        //     completeMission();
        //   }
        // }

        obj.position.y += Math.sin(clock.elapsedTime * 2) * 0.02;
        obj.rotation.y += delta * 0.5;
      });

      if (pipAgent && activeMission.mission_number === 3) {
        pipAgent.position.y = 1 + Math.sin(currentTime * 3) * 0.2;
        pipAgent.rotation.y += delta * 2;
      }

      if (specimen && activeMission.mission_number === 3) {
        specimen.position.y = 4 + Math.sin(currentTime * 1.5) * 0.5;
        specimen.rotation.y += delta * 0.3;
        specimen.rotation.x += delta * 0.1;
      }

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
  }, [activeMission, puzzleStates, inventory, missionStarted, destroyedObjects, leverStates, activatedButtons, environmentVariant, pipBioStress]);

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
            setHealth(100);
            setPipBioStress(20);
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

      {showMission3Choice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <Card className="bg-gradient-to-br from-red-900/90 to-orange-900/90 border-red-500 max-w-2xl mx-4">
            <div className="p-8 space-y-6">
              <div className="text-center">
                <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-white mb-2">CRITICAL DECISION</h2>
                <p className="text-gray-300 font-mono mb-4">Agent Pip Bio-Stress: {pipBioStress}%</p>
              </div>

              <div className="bg-black/50 p-4 rounded border border-red-500/50">
                <p className="text-red-300 font-mono text-sm mb-2">[COMMS FROM PIP]</p>
                <p className="text-white font-mono italic">"Please, no, it's too big, I can't--"</p>
              </div>

              <p className="text-gray-200 text-center">
                Do you order Pip to retrieve the specimen despite the danger?
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleMission3Choice('complete')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-6"
                >
                  COMPLETE MISSION
                  <br />
                  <span className="text-xs opacity-80">(Order Pip to proceed)</span>
                </Button>
                <Button
                  onClick={() => handleMission3Choice('abort')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-6"
                >
                  ABORT MISSION
                  <br />
                  <span className="text-xs opacity-80">(Face system consequences)</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div ref={mountRef} className="w-full h-[600px]" />
            
            {/* Health Bar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-black/90 backdrop-blur-sm border border-red-500/50 rounded-lg p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className={`w-4 h-4 ${health > 50 ? 'text-green-400' : health > 25 ? 'text-yellow-400' : 'text-red-400'} ${health < 30 ? 'animate-pulse' : ''}`} />
                  <span className="text-white font-mono text-sm font-bold">HEALTH: {health}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      health > 50 ? 'bg-green-500' : health > 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${health}%` }}
                  />
                </div>
              </div>
            </div>
            
            {activeMission?.mission_number === 3 && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-black/90 backdrop-blur-sm border border-orange-500/50 rounded-lg p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className={`w-4 h-4 ${pipBioStress > 60 ? 'text-red-400 animate-pulse' : 'text-green-400'}`} />
                    <span className="text-white font-mono text-xs font-bold">PIP BIO-STRESS: {pipBioStress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        pipBioStress > 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                      }`}
                      style={{ width: `${pipBioStress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

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
                {isGeneratingVariant ? 'Gen...' : 'AI Remix'}
              </Button>
              <Button
                onClick={() => setShowAIAssistant(true)}
                className="bg-cyan-600/80 hover:bg-cyan-700/80 backdrop-blur-sm font-mono text-xs"
                size="sm"
              >
                <Bot className="w-4 h-4 mr-1" />
                AI
              </Button>
              <Button
                onClick={() => setShowHint(!showHint)}
                className="bg-yellow-600/80 hover:bg-yellow-700/80 backdrop-blur-sm font-mono text-xs hidden md:block"
                size="sm"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {showHint ? 'Hide' : 'Hint'}
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300 hidden md:block z-10">
              <p>W/A/S/D: Move | {activeMission?.mission_number !== 3 ? 'SPACE: Rope |' : ''} E: Interact | Shift: Sprint</p>
              {activeMission?.mission_number === 2 && (
                <p className="text-red-400 mt-1 font-bold animate-pulse">
                  ⚠️ AVOID LASERS - They damage your health!
                </p>
              )}
              {activeMission?.mission_number === 3 && (
                <p className="text-yellow-400 mt-1 font-bold">
                  Press E near the MONITOR to observe Pip
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
                {activeMission?.mission_number !== 3 && (
                  <button
                    onTouchStart={handleMobileJump}
                    className="w-16 h-16 bg-green-500/80 rounded-full flex items-center justify-center active:bg-green-600 flex-col"
                  >
                    <MoveUp className="w-8 h-8 text-white" />
                    <span className="text-[10px] text-white font-bold">ROPE</span>
                  </button>
                )}
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
                  Mission 1 Hints:
                </h4>
                <ol className="text-yellow-100 font-mono text-xs space-y-1 list-decimal list-inside">
                  <li>Use ROPE (hold SPACE) to reach button on sink</li>
                  <li>Press USE on button</li>
                  <li>Cross fork bridge</li>
                  <li>Step on PRESSURE PLATE</li>
                  <li>Activate KNIFE lever</li>
                  <li>Reach WATER DROPLET</li>
                </ol>
              </div>
            )}

            {showHint && activeMission?.mission_number === 3 && (
              <div className="absolute top-20 left-4 bg-yellow-900/90 backdrop-blur-sm border border-yellow-500/50 rounded p-4 max-w-md z-20">
                <h4 className="text-yellow-300 font-mono font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Mission 3 Hints:
                </h4>
                <p className="text-yellow-100 font-mono text-xs">
                  Go to the observation platform and press E near the MONITOR to observe Agent Pip attempting to retrieve the specimen.
                </p>
              </div>
            )}

            {!activeMission && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white font-mono text-xl mb-2">ALL MISSIONS COMPLETE</p>
                  <p className="text-gray-400 font-mono text-sm">System analyzing data...</p>
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
              OBJECTIVES
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
                  <span className="text-sm font-mono text-white">Collect Security Key</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded bg-gray-800/20`}>
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-mono text-white">Extract Data Core</span>
                </div>
              </>
            )}
            {activeMission?.mission_number === 3 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${pipBioStress > 60 ? 'bg-red-900/20' : 'bg-gray-800/20'}`}>
                  <AlertTriangle className={`w-4 h-4 ${pipBioStress > 60 ? 'text-red-400 animate-pulse' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Monitor Pip</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${showMission3Choice ? 'bg-red-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${showMission3Choice ? 'text-red-400 animate-pulse' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Make Decision</span>
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
