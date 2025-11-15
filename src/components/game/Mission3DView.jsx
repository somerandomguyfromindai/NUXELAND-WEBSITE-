
import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, FileText, Lightbulb, MoveUp, Hand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot, Heart, ChevronDown } from "lucide-react";
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
  const [isCrouching, setIsCrouching] = useState(false);
  const [showHackingPuzzle, setShowHackingPuzzle] = useState(false);
  const [hackingCode, setHackingCode] = useState('');
  const [hackingAttempts, setHackingAttempts] = useState(3);
  const [mobileControls, setMobileControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    crouch: false
  });
  const mobileControlsRef = useRef(mobileControls);
  const isCrouchingRef = useRef(isCrouching);
  const [environmentVariant, setEnvironmentVariant] = useState(null);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    mobileControlsRef.current = mobileControls;
  }, [mobileControls]);

  useEffect(() => {
    isCrouchingRef.current = isCrouching;
  }, [isCrouching]);

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

  const takeDamage = (amount) => {
    setHealth(prev => {
      const newHealth = Math.max(0, prev - amount);
      if (newHealth <= 0) {
        addLog('MISSION FAILED - Health depleted', 'error');
      }
      return newHealth;
    });
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
          setHackingCode('');
          setHackingAttempts(3);
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

Generate environmental variations based on player progress. Add 2-3 hazards or dynamic elements.

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

  const handleHackingSubmit = () => {
    // Prime numbers between 10 and 20 are 11, 13, 17, 19. Their sum is 60.
    // Let's use a simpler, fixed code for demonstration: "7394" (a common placeholder code)
    const correctCode = "7394"; 
    
    if (hackingCode === correctCode) {
      addLog('✓ POWER CORE HACKED SUCCESSFULLY!', 'success');
      setPuzzleStates(prev => ({ ...prev, power_core_hacked: true }));
      setShowHackingPuzzle(false);
    } else {
      setHackingAttempts(prev => prev - 1);
      if (hackingAttempts - 1 <= 0) {
        addLog('HACKING FAILED - Security alert triggered!', 'error');
        takeDamage(50);
        setShowHackingPuzzle(false);
        setHackingAttempts(3); // Reset attempts for next try
      } else {
        addLog(`Wrong code! ${hackingAttempts - 1} attempts remaining`, 'error');
      }
      setHackingCode('');
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

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.physicallyCorrectLights = true;
    mountRef.current.appendChild(renderer.domElement);

    let ambientLight, sunLight, fillLight;

    const playerGroup = new THREE.Group();
    
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 16, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x1e40af,
      emissiveIntensity: 0.25,
      envMapIntensity: 1.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    const helmetGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const helmetMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x60a5fa,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.85,
      transmission: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.9;
    helmet.castShadow = true;
    playerGroup.add(helmet);

    const visorGeometry = new THREE.RingGeometry(0.15, 0.2, 32);
    const visorMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      transmission: 0.2,
      roughness: 0,
      metalness: 0
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
    let lastDamageTime = 0;
    
    let playerVelocityY = 0;
    let isOnGround = true;
    let isOnRope = false;
    let ropeLine = null;
    const gravity = -25;
    const ropeSpeed = 8;
    const playerHalfHeight = 0.8; // Default standing height
    const playerRadius = 0.4;
    let jumpCount = 0;
    const maxJumps = 2;
    const ceilingHeight = 50;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Kitchen Infiltration", 'info');
      
      obstacles = [];
      
      scene.background = new THREE.Color(0xcce5f5);
      scene.fog = new THREE.FogExp2(0xcce5f5, 0.006);

      ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
      scene.add(ambientLight);

      sunLight = new THREE.DirectionalLight(0xfff5e1, 2.2);
      sunLight.position.set(60, 120, 60);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -120;
      sunLight.shadow.camera.right = 120;
      sunLight.shadow.camera.top = 120;
      sunLight.shadow.camera.bottom = -120;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.bias = -0.00005;
      sunLight.shadow.radius = 4;
      scene.add(sunLight);

      fillLight = new THREE.DirectionalLight(0xa8d5e2, 0.5);
      fillLight.position.set(-60, 60, -60);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffa500, 0.3);
      rimLight.position.set(80, 30, 80);
      scene.add(rimLight);
      
      const counterGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
      const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f0e8,
        roughness: 0.35,
        metalness: 0.15,
        envMapIntensity: 1.2,
        bumpScale: 0.02
      });
      const counter = new THREE.Mesh(counterGeometry, counterMaterial);
      counter.rotation.x = -Math.PI / 2;
      counter.receiveShadow = true;
      scene.add(counter);

      const gridHelper = new THREE.GridHelper(200, 50, 0xd8d8d0, 0xe8e8e0);
      gridHelper.position.y = 0.005;
      gridHelper.material.opacity = 0.3;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
      
      const wallHeight = 50;
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5ebe0, 
        roughness: 0.92,
        metalness: 0.02,
        bumpScale: 0.5
      });
      
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(200, wallHeight, 3), wallMaterial);
      backWall.position.set(0, wallHeight/2, -100);
      backWall.receiveShadow = true;
      backWall.castShadow = true;
      scene.add(backWall);
      
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 200), wallMaterial);
      leftWall.position.set(-100, wallHeight/2, 0);
      leftWall.receiveShadow = true;
      leftWall.castShadow = true;
      scene.add(leftWall);
      
      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 200), wallMaterial);
      rightWall.position.set(100, wallHeight/2, 0);
      rightWall.receiveShadow = true;
      rightWall.castShadow = true;
      scene.add(rightWall);
      
      const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7d6854, 
        roughness: 0.65,
        metalness: 0.08,
        envMapIntensity: 0.8
      });
      for (let i = 0; i < 4; i++) {
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 10), cabinetMaterial);
        cabinet.position.set(-60 + i * 40, 35, -95);
        cabinet.castShadow = true;
        cabinet.receiveShadow = true;
        scene.add(cabinet);
        obstacles.push(cabinet);

        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 8, 16),
          new THREE.MeshStandardMaterial({ 
            color: 0xc0c0c0,
            metalness: 0.95,
            roughness: 0.1
          })
        );
        handle.rotation.z = Math.PI / 2;
        handle.position.set(-60 + i * 40, 35, -88);
        handle.castShadow = true;
        scene.add(handle);
      }
      
      const windowGlass = new THREE.Mesh(
        new THREE.BoxGeometry(40, 25, 0.5),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xe0f4ff, 
          transparent: true, 
          opacity: 0.3,
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          ior: 1.5
        })
      );
      windowGlass.position.set(50, 30, -99);
      scene.add(windowGlass);

      const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(42, 27, 1),
        new THREE.MeshStandardMaterial({
          color: 0x4a4a4a,
          roughness: 0.6,
          metalness: 0.4
        })
      );
      windowFrame.position.set(50, 30, -98.5);
      windowFrame.castShadow = true;
      scene.add(windowFrame);
      
      const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9a8570, 
        roughness: 0.88,
        metalness: 0.02,
        bumpScale: 0.3
      });
      const borderHeight = 3;
      
      const frontBorder = new THREE.Mesh(new THREE.BoxGeometry(200, borderHeight, 3), borderMaterial);
      frontBorder.position.set(0, borderHeight/2, 100);
      frontBorder.castShadow = true;
      frontBorder.receiveShadow = true;
      scene.add(frontBorder);
      obstacles.push(frontBorder);
      
      const backBorder = new THREE.Mesh(new THREE.BoxGeometry(200, borderHeight, 3), borderMaterial);
      backBorder.position.set(0, borderHeight/2, -100);
      backBorder.castShadow = true;
      backBorder.receiveShadow = true;
      scene.add(backBorder);
      obstacles.push(backBorder);
      
      const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(3, borderHeight, 200), borderMaterial);
      leftBorder.position.set(-100, borderHeight/2, 0);
      leftBorder.castShadow = true;
      leftBorder.receiveShadow = true;
      scene.add(leftBorder);
      obstacles.push(leftBorder);
      
      const rightBorder = new THREE.Mesh(new THREE.BoxGeometry(3, borderHeight, 200), borderMaterial);
      rightBorder.position.set(100, borderHeight/2, 0);
      rightBorder.castShadow = true;
      rightBorder.receiveShadow = true;
      scene.add(rightBorder);
      obstacles.push(rightBorder);
      
      const sinkOuterRim = new THREE.Mesh(
        new THREE.BoxGeometry(30, 0.8, 22),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xf0f0f0, 
          metalness: 0.99, 
          roughness: 0.01,
          envMapIntensity: 2,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
          reflectivity: 1
        })
      );
      sinkOuterRim.position.set(-5, 0.4, -25);
      sinkOuterRim.castShadow = true;
      sinkOuterRim.receiveShadow = true;
      scene.add(sinkOuterRim);
      obstacles.push(sinkOuterRim);
      
      const sinkBasin = new THREE.Mesh(
        new THREE.BoxGeometry(26, 6, 18),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xdcdcdc, 
          metalness: 0.98, 
          roughness: 0.03,
          envMapIntensity: 1.8,
          clearcoat: 0.8,
          clearcoatRoughness: 0.1
        })
      );
      sinkBasin.position.set(-5, -2.6, -25);
      sinkBasin.castShadow = true;
      sinkBasin.receiveShadow = true;
      scene.add(sinkBasin);

      const faucet = new THREE.Group();
      const faucetBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 8, 32),
        new THREE.MeshPhysicalMaterial({
          color: 0xd4d4d4,
          metalness: 0.99,
          roughness: 0.02,
          clearcoat: 1,
          envMapIntensity: 2
        })
      );
      faucetBody.position.set(-5, 4, -30);
      faucetBody.castShadow = true;
      faucet.add(faucetBody);
      
      const faucetSpout = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.6, 16, 32, Math.PI),
        faucetBody.material
      );
      faucetSpout.rotation.x = Math.PI / 2;
      faucetSpout.rotation.z = Math.PI;
      faucetSpout.position.set(-5, 6, -25);
      faucetSpout.castShadow = true;
      faucet.add(faucetSpout);
      scene.add(faucet);
      
      const buttonGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 64);
      const buttonMaterial = new THREE.MeshPhysicalMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: activatedButtons.includes('button1') ? 1 : 0.7,
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 1,
        clearcoatRoughness: 0.1
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.position.set(-5, 1.1, -25);
      button1.userData = { type: 'button', id: 'button1' };
      button1.castShadow = true;
      scene.add(button1);
      puzzleElements.push(button1);
      obstacles.push(button1);
      
      if (activatedButtons.includes('button1')) {
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.12, 16, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 1
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(-5, 1.1, -25);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        const buttonLight = new THREE.PointLight(0x10b981, 1.5, 8);
        buttonLight.position.set(-5, 2, -25);
        scene.add(buttonLight);
      }

      const knife = new THREE.Group();
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 20),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xfafafa,
          metalness: 0.995,
          roughness: 0.005,
          emissive: 0xffffff,
          emissiveIntensity: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0,
          envMapIntensity: 3,
          reflectivity: 1
        })
      );
      blade.position.z = 10;
      blade.castShadow = true;
      blade.receiveShadow = true;
      
      const handleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 7, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0x2d1810,
          roughness: 0.85,
          metalness: 0.02,
          bumpScale: 0.2
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
        new THREE.SphereGeometry(2, 32, 32),
        new THREE.MeshBasicMaterial({ 
          color: leverStates.lever1 ? 0x10b981 : 0xffff00, 
          transparent: true, 
          opacity: 0.25 
        })
      );
      knifeGlow.position.copy(knife.position);
      knifeGlow.position.y += 2;
      scene.add(knifeGlow);

      const knifeSparkleLights = new THREE.PointLight(leverStates.lever1 ? 0x10b981 : 0xffff00, 0.8, 6);
      knifeSparkleLights.position.copy(knife.position);
      knifeSparkleLights.position.y += 2;
      scene.add(knifeSparkleLights);

      const bowlRadius = 15;
      const bowl = new THREE.Mesh(
        new THREE.SphereGeometry(bowlRadius, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xffffff,
          roughness: 0.08,
          metalness: 0.02,
          side: THREE.DoubleSide,
          envMapIntensity: 1.5,
          clearcoat: 0.9,
          clearcoatRoughness: 0.05,
          thickness: 2,
          transmission: 0.05
        })
      );
      bowl.position.set(30, 4, 20);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      scene.add(bowl);
      obstacles.push(bowl);
      
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(bowlRadius, 0.5, 24, 96),
        bowl.material
      );
      rim.position.set(30, 8, 20);
      rim.rotation.x = Math.PI / 2;
      rim.castShadow = true;
      rim.receiveShadow = true;
      scene.add(rim);
      obstacles.push(rim);

      const spoonGroup = new THREE.Group();
      const spoonMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xf5f5f5,
        metalness: 0.98,
        roughness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.01,
        envMapIntensity: 2.5,
        reflectivity: 1
      });
      
      const spoonHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 18, 32),
        spoonMaterial
      );
      spoonHandle.rotation.z = Math.PI / 2;
      spoonHandle.castShadow = true;
      spoonHandle.receiveShadow = true;
      
      const spoonHead = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 64, 64),
        spoonMaterial
      );
      spoonHead.position.x = 10;
      spoonHead.scale.set(1, 0.4, 1);
      spoonHead.castShadow = true;
      spoonHead.receiveShadow = true;
      
      spoonGroup.add(spoonHandle);
      spoonGroup.add(spoonHead);
      spoonGroup.position.set(-15, 1.2, -10);
      spoonGroup.rotation.y = Math.PI / 4;
      scene.add(spoonGroup);
      obstacles.push(spoonGroup);

      const mugMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7a4419, 
        roughness: 0.65,
        metalness: 0.08,
        envMapIntensity: 0.9
      });
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 4.2, 10, 64),
        mugMaterial
      );
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      mug.receiveShadow = true;
      scene.add(mug);
      obstacles.push(mug);
      
      const mugHandle = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.6, 24, 64, Math.PI),
        mugMaterial
      );
      mugHandle.position.set(50, 5, -20);
      mugHandle.rotation.y = -Math.PI / 2;
      mugHandle.rotation.x = Math.PI / 2;
      mugHandle.castShadow = true;
      mugHandle.receiveShadow = true;
      scene.add(mugHandle);
      obstacles.push(mugHandle);
      
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(4.8, 4, 0.5, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x4a2f23,
          roughness: 0.2,
          metalness: 0.05,
          transmission: 0.1,
          thickness: 0.5
        })
      );
      coffee.position.set(50, 9.5, -20);
      coffee.receiveShadow = true;
      scene.add(coffee);

      const steam = [];
      for (let i = 0; i < 20; i++) {
        const steamParticle = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 12, 12),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
          })
        );
        steamParticle.position.set(
          50 + (Math.random() - 0.5) * 3,
          10 + Math.random() * 8,
          -20 + (Math.random() - 0.5) * 3
        );
        steamParticle.userData = { velocity: { y: Math.random() * 0.03 + 0.02 }, resetY: 10 };
        scene.add(steamParticle);
        steam.push(steamParticle);
      }

      for (let i = 0; i < 8; i++) {
        const crumbSize = 1.2 + Math.random() * 1.8;
        const crumb = new THREE.Mesh(
          new THREE.DodecahedronGeometry(crumbSize, 2),
          new THREE.MeshStandardMaterial({ 
            color: 0xe6b84d,
            roughness: 0.95,
            metalness: 0,
            bumpScale: 0.3
          })
        );
        crumb.position.set(10 + i * 4 + Math.random() * 2, crumbSize / 2, 5 + Math.random() * 4);
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

      const butter = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2, 4),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xffe45e, 
          roughness: 0.12,
          metalness: 0.02,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2,
          transmission: 0.05,
          thickness: 1
        })
      );
      butter.position.set(-25, 1, 15);
      butter.castShadow = true;
      butter.receiveShadow = true;
      butter.userData = { type: 'slippery' };
      scene.add(butter);
      interactiveObjects.push(butter);
      obstacles.push(butter);

      if (activatedButtons.includes('button1')) {
        const forkMaterial = new THREE.MeshPhysicalMaterial({ 
          color: 0xf0f0f0, 
          metalness: 0.98, 
          roughness: 0.02,
          envMapIntensity: 2.5,
          clearcoat: 1,
          clearcoatRoughness: 0.01,
          reflectivity: 1
        });
        const forkHandle = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 25), forkMaterial);
        forkHandle.position.set(15, 1.3, -15);
        forkHandle.rotation.y = Math.PI / 6;
        forkHandle.castShadow = true;
        forkHandle.receiveShadow = true;
        scene.add(forkHandle);
        obstacles.push(forkHandle);
        
        for (let i = 0; i < 4; i++) {
          const prong = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 6), forkMaterial);
          prong.position.set(15 + (i - 1.5) * 0.8, 1.3, -27);
          prong.rotation.y = Math.PI / 6;
          prong.castShadow = true;
          prong.receiveShadow = true;
          scene.add(prong);
          obstacles.push(prong);
        }
      }

      const napkin = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.3, 12),
        new THREE.MeshStandardMaterial({ 
          color: 0xfafafa,
          roughness: 0.98,
          metalness: 0,
          bumpScale: 0.1
        })
      );
      napkin.position.set(35, 0.15, -5);
      napkin.rotation.y = Math.PI / 8;
      napkin.castShadow = true;
      napkin.receiveShadow = true;
      scene.add(napkin);
      obstacles.push(napkin);

      const plateDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.4, 64),
        new THREE.MeshPhysicalMaterial({ 
          color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
          emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
          emissiveIntensity: puzzleStates.plate1 ? 0.8 : 0,
          metalness: 0.95,
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.05
        })
      );
      plateDisc.position.set(35, 0.35, -5);
      plateDisc.userData = { type: 'pressure_plate', id: 'plate1' };
      plateDisc.castShadow = true;
      plateDisc.receiveShadow = true;
      scene.add(plateDisc);
      puzzleElements.push(plateDisc);
      obstacles.push(plateDisc);

      const dinnerPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 7, 1.2, 128),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xffffff,
          roughness: 0.15,
          metalness: 0.02,
          clearcoat: 0.95,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.3
        })
      );
      dinnerPlate.position.set(55, 0.6, 0);
      dinnerPlate.castShadow = true;
      dinnerPlate.receiveShadow = true;
      scene.add(dinnerPlate);
      obstacles.push(dinnerPlate);

      const plateDecoration = new THREE.Mesh(
        new THREE.TorusGeometry(7, 0.2, 16, 64),
        new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          roughness: 0.3,
          metalness: 0.5
        })
      );
      plateDecoration.rotation.x = Math.PI / 2;
      plateDecoration.position.set(55, 1.3, 0);
      scene.add(plateDecoration);

      const sugarPositions = [
        { x: 20, y: 1, z: -8 },
        { x: 22, y: 1, z: -8 },
        { x: 21, y: 3, z: -8 },
        { x: 24, y: 1, z: -6 }
      ];
      sugarPositions.forEach((pos, i) => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            roughness: 0.75,
            metalness: 0.02,
            transmission: 0.05,
            thickness: 0.5,
            clearcoat: 0.3
          })
        );
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

      const resourcePositions = [
        { name: 'Metal Scrap', x: -30, y: 1, z: 10, color: 0xc0c0c0 },
        { name: 'Energy Cell', x: 40, y: 1, z: -10, color: 0xffff00 },
        { name: 'Data Chip', x: 60, y: 1, z: 15, color: 0x00ffff },
        { name: 'Chemical Sample', x: -20, y: 1, z: -15, color: 0x00ff00 },
        { name: 'Nano Circuit', x: 45, y: 5, z: 5, color: 0xff00ff },
      ];

      resourcePositions.forEach((res, i) => {
        const resourceMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.8, 1),
          new THREE.MeshPhysicalMaterial({
            color: res.color,
            emissive: res.color,
            emissiveIntensity: 0.6,
            metalness: 0.9,
            roughness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.1
          })
        );
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);

        const resourceLight = new THREE.PointLight(res.color, 0.5, 5);
        resourceLight.position.copy(resourceMesh.position);
        scene.add(resourceLight);
      });

      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      const waterDrop = new THREE.Mesh(
        new THREE.SphereGeometry(3, 128, 128),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x89d4e8,
          transparent: true,
          opacity: 0.6,
          transmission: 0.98,
          roughness: 0,
          metalness: 0,
          thickness: 3,
          envMapIntensity: 2,
          clearcoat: 1,
          clearcoatRoughness: 0,
          ior: 1.33,
          reflectivity: 0.9
        })
      );
      waterDrop.position.set(70, canReachWater ? 3 : 25, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      waterDrop.receiveShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(3.8, 64, 64),
        new THREE.MeshBasicMaterial({ 
          color: 0x4dd0e1,
          transparent: true,
          opacity: 0.35
        })
      );
      glow.position.copy(waterDrop.position);
      scene.add(glow);

      const waterLight = new THREE.PointLight(0x4dd0e1, 1.5, 15);
      waterLight.position.copy(waterDrop.position);
      scene.add(waterLight);

      if (canReachWater) {
        for (let i = 0; i < 60; i++) {
          const mist = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 12, 12),
            new THREE.MeshBasicMaterial({ 
              color: 0xffffff,
              transparent: true,
              opacity: 0.35
            })
          );
          mist.position.set(
            65 + Math.random() * 12, 
            1 + Math.random() * 8, 
            0 + Math.random() * 12
          );
          mist.userData = { velocity: { y: Math.random() * 0.025 + 0.015 }, resetY: 1 };
          scene.add(mist);
          mistParticles.push(mist);
        }
      }

      mistParticles.push(...steam);

    } else if (activeMission.mission_number === 2) {
      addLog("Mission 2: Lab Infiltration - AVOID LASERS!", 'warning');
      
      player.position.set(-80, 1, 80);
      obstacles = [];
      
      scene.background = new THREE.Color(0x0f1218);
      scene.fog = new THREE.Fog(0x0f1218, 25, 160);

      ambientLight = new THREE.AmbientLight(0x4488ff, 0.15);
      scene.add(ambientLight);

      sunLight = new THREE.DirectionalLight(0x6699ff, 0.6);
      sunLight.position.set(40, 80, 40);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -120;
      sunLight.shadow.camera.right = 120;
      sunLight.shadow.camera.top = 120;
      sunLight.shadow.camera.bottom = -120;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.bias = -0.00005;
      scene.add(sunLight);

      fillLight = new THREE.DirectionalLight(0x00ccff, 0.2);
      fillLight.position.set(-50, 40, -50);
      scene.add(fillLight);

      const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200, 40, 40),
        new THREE.MeshStandardMaterial({ 
          color: 0x1e2433,
          roughness: 0.92,
          metalness: 0.08,
          envMapIntensity: 0.8,
          bumpScale: 0.05
        })
      );
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if (Math.random() > 0.7) {
            const tile = new THREE.Mesh(
              new THREE.PlaneGeometry(2, 2),
              new THREE.MeshStandardMaterial({
                color: 0x2a3444,
                roughness: 0.85,
                metalness: 0.15
              })
            );
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(i * 13 - 90, 0.01, j * 13 - 90);
            tile.receiveShadow = true;
            scene.add(tile);
          }
        }
      }

      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x252b38, 
        roughness: 0.88,
        metalness: 0.08,
        envMapIntensity: 0.6
      });
      const wallHeight = 40;
      
      const walls = [
        { pos: [0, wallHeight/2, -100], size: [200, wallHeight, 3] },
        { pos: [-100, wallHeight/2, 0], size: [3, wallHeight, 200] },
        { pos: [100, wallHeight/2, 0], size: [3, wallHeight, 200] },
        { pos: [0, wallHeight/2, 100], size: [200, wallHeight, 3] }
      ];

      walls.forEach(wall => {
        const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(...wall.size), wallMaterial);
        wallMesh.position.set(...wall.pos);
        wallMesh.receiveShadow = true;
        wallMesh.castShadow = true;
        scene.add(wallMesh);
      });

      for (let i = 0; i < 6; i++) {
        const serverRack = new THREE.Mesh(
          new THREE.BoxGeometry(15, 25, 8),
          new THREE.MeshStandardMaterial({ 
            color: 0x0d0d18, 
            roughness: 0.75, 
            metalness: 0.5,
            emissive: 0x000044,
            emissiveIntensity: 0.25,
            envMapIntensity: 1.2
          })
        );
        serverRack.position.set(-60 + i * 25, 12.5, -90);
        serverRack.castShadow = true;
        serverRack.receiveShadow = true;
        scene.add(serverRack);
        obstacles.push(serverRack);
        
        for (let j = 0; j < 5; j++) {
          const lightColor = Math.random() > 0.5 ? 0x00ff00 : 0xff0000;
          const light = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.6, 0.6),
            new THREE.MeshBasicMaterial({ 
              color: lightColor,
              emissive: lightColor,
              emissiveIntensity: 1
            })
          );
          light.position.set(-60 + i * 25, 5 + j * 4, -85.5);
          scene.add(light);

          const pointLight = new THREE.PointLight(lightColor, 0.3, 3);
          pointLight.position.copy(light.position);
          scene.add(pointLight);
        }

        const ventGeometry = new THREE.PlaneGeometry(12, 3);
        const ventMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a1a1a,
          roughness: 0.9,
          metalness: 0.3
        });
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(-60 + i * 25, 2, -86);
        vent.rotation.y = Math.PI;
        vent.receiveShadow = true;
        scene.add(vent);
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
          new THREE.BoxGeometry(20, 1.5, 15),
          new THREE.MeshStandardMaterial({ 
            color: 0x3d4354, 
            roughness: 0.65,
            metalness: 0.35,
            envMapIntensity: 1.1
          })
        );
        table.position.set(pos.x, 6, pos.z);
        table.castShadow = true;
        table.receiveShadow = true;
        scene.add(table);
        obstacles.push(table);
        
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 6, 32),
            new THREE.MeshStandardMaterial({ 
              color: 0x2a2f3d,
              roughness: 0.75,
              metalness: 0.45,
              envMapIntensity: 1
            })
          );
          leg.position.set(
            pos.x + (i % 2 === 0 ? -8 : 8),
            3,
            pos.z + (i < 2 ? -6 : 6)
          );
          leg.castShadow = true;
          leg.receiveShadow = true;
          scene.add(leg);
          obstacles.push(leg);
        }

        const equipment = new THREE.Mesh(
          new THREE.BoxGeometry(8, 5, 6),
          new THREE.MeshPhysicalMaterial({ 
            color: 0x5a6070,
            emissive: 0x0077dd,
            emissiveIntensity: 0.5,
            roughness: 0.5,
            metalness: 0.6,
            clearcoat: 0.8,
            clearcoatRoughness: 0.2
          })
        );
        equipment.position.set(pos.x, 9, pos.z);
        equipment.castShadow = true;
        equipment.receiveShadow = true;
        scene.add(equipment);
        obstacles.push(equipment);

        const screenLight = new THREE.PointLight(0x0077dd, 0.8, 8);
        screenLight.position.set(pos.x, 10, pos.z);
        scene.add(screenLight);
      });

      const terminal = new THREE.Mesh(
        new THREE.BoxGeometry(12, 15, 8),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x1a1f2e,
          emissive: 0x00ddff,
          emissiveIntensity: 0.7,
          metalness: 0.75,
          roughness: 0.35,
          clearcoat: 0.9,
          clearcoatRoughness: 0.15,
          envMapIntensity: 1.5
        })
      );
      terminal.position.set(0, 7.5, 0);
      terminal.castShadow = true;
      terminal.receiveShadow = true;
      terminal.userData = { type: 'terminal', id: 'main_terminal' };
      scene.add(terminal);
      puzzleElements.push(terminal);
      obstacles.push(terminal);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 6),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 1
        })
      );
      screen.position.set(0, 10, 4.2);
      scene.add(screen);

      const screenLight = new THREE.PointLight(0x00ff00, 2, 15);
      screenLight.position.set(0, 10, 6);
      scene.add(screenLight);

      const dataCore = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.75,
          transmission: 0.7,
          roughness: 0,
          metalness: 0,
          clearcoat: 1,
          thickness: 2,
          ior: 2.4,
          reflectivity: 1
        })
      );
      dataCore.position.set(0, 16, 0);
      dataCore.userData = { type: 'data_core', accessible: true };
      dataCore.castShadow = true;
      scene.add(dataCore);
      objectives.push(dataCore);

      const dataCoreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 64, 64),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ffff,
          transparent: true,
          opacity: 0.25
        })
      );
      dataCoreGlow.position.copy(dataCore.position);
      scene.add(dataCoreGlow);

      const dataCoreLight = new THREE.PointLight(0x00ffff, 3, 25);
      dataCoreLight.position.copy(dataCore.position);
      scene.add(dataCoreLight);

      for (let i = 0; i < 4; i++) {
        const laser = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 12, 80),
          new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.75,
            emissive: 0xff0000,
            emissiveIntensity: 1.2
          })
        );
        laser.position.set(-70 + i * 35, 6, 10);
        laser.userData = { type: 'laser', deadly: true, damage: 18 };
        scene.add(laser);
        interactiveObjects.push(laser);

        const laserLight = new THREE.PointLight(0xff0000, 1.2, 12);
        laserLight.position.copy(laser.position);
        scene.add(laserLight);

        for (let j = 0; j < 3; j++) {
          const laserGlow = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 16),
            new THREE.MeshBasicMaterial({
              color: 0xff0000,
              transparent: true,
              opacity: 0.5
            })
          );
          laserGlow.position.set(laser.position.x, laser.position.y + j * 4, laser.position.z + j * 15);
          scene.add(laserGlow);
        }
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
            color: 0x5d4d3d,
            roughness: 0.93,
            metalness: 0.03,
            bumpScale: 0.4
          })
        );
        crate.position.set(pos.x, 5, pos.z);
        crate.castShadow = true;
        crate.receiveShadow = true;
        scene.add(crate);
        obstacles.push(crate);

        const crateBands = new THREE.Mesh(
          new THREE.BoxGeometry(10.5, 1, 10.5),
          new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.3
          })
        );
        crateBands.position.set(pos.x, 5, pos.z);
        crateBands.castShadow = true;
        scene.add(crateBands);
      });

      const labResources = [
        { name: 'Research Data', x: -70, y: 1, z: -70, color: 0x00ffff },
        { name: 'Security Key', x: 70, y: 1, z: -70, color: 0xffaa00 },
        { name: 'Lab Sample', x: -70, y: 1, z: 70, color: 0xff00ff },
        { name: 'Prototype Chip', x: 70, y: 1, z: 70, color: 0x00ff00 }
      ];

      labResources.forEach((res, i) => {
        const resourceMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.8, 1),
          new THREE.MeshPhysicalMaterial({
            color: res.color,
            emissive: res.color,
            emissiveIntensity: 0.7,
            metalness: 0.9,
            roughness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.1
          })
        );
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `lab_resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);

        const resLight = new THREE.PointLight(res.color, 0.6, 6);
        resLight.position.copy(resourceMesh.position);
        scene.add(resLight);
      });

      addLog("Advanced security active - LASERS DEAL DAMAGE!", 'error');

    } else if (activeMission.mission_number === 3) {
      addLog("Mission 3: Power Core - USE CROUCH (C) TO AVOID LASERS!", 'error');
      
      player.position.set(0, 1, 85);
      obstacles = [];
      
      scene.background = new THREE.Color(0x050508);
      scene.fog = new THREE.FogExp2(0x050508, 0.014);

      ambientLight = new THREE.AmbientLight(0xff00ff, 0.1);
      scene.add(ambientLight);

      sunLight = new THREE.DirectionalLight(0xff00ff, 0.35);
      sunLight.position.set(30, 60, 30);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -120;
      sunLight.shadow.camera.right = 120;
      sunLight.shadow.camera.top = 120;
      sunLight.shadow.camera.bottom = -120;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.bias = -0.0001;
      scene.add(sunLight);

      fillLight = new THREE.DirectionalLight(0x6600ff, 0.12);
      fillLight.position.set(-40, 40, -40);
      scene.add(fillLight);

      const undergroundFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200, 80, 80),
        new THREE.MeshStandardMaterial({ 
          color: 0x0a0a0a,
          roughness: 0.98,
          metalness: 0.01,
          bumpScale: 0.15
        })
      );
      undergroundFloor.rotation.x = -Math.PI / 2;
      undergroundFloor.receiveShadow = true;
      scene.add(undergroundFloor);

      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if (Math.random() > 0.88) {
            const crack = new THREE.Mesh(
              new THREE.PlaneGeometry(2.5 + Math.random(), 0.2 + Math.random() * 0.2),
              new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                emissive: 0xff00ff,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.65
              })
            );
            crack.rotation.x = -Math.PI / 2;
            crack.rotation.z = Math.random() * Math.PI;
            crack.position.set(i * 8 - 95, 0.02, j * 8 - 95);
            scene.add(crack);
          }
        }
      }

      const concreteWallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x151515, 
        roughness: 0.97,
        metalness: 0,
        bumpScale: 0.8
      });
      const wallHeight = 35;
      
      const undergroundWalls = [
        { pos: [0, wallHeight/2, -100], size: [200, wallHeight, 4] },
        { pos: [-100, wallHeight/2, 0], size: [4, wallHeight, 200] },
        { pos: [100, wallHeight/2, 0], size: [4, wallHeight, 200] },
        { pos: [0, wallHeight/2, 100], size: [200, wallHeight, 4] }
      ];

      undergroundWalls.forEach(wall => {
        const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(...wall.size), concreteWallMaterial);
        wallMesh.position.set(...wall.pos);
        wallMesh.receiveShadow = true;
        wallMesh.castShadow = true;
        scene.add(wallMesh);
      });

      const pillarPositions = [
        { x: -65, z: -65 },
        { x: 65, z: -65 },
        { x: -65, z: 65 },
        { x: 65, z: 65 }
      ];

      pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(3.5, 4, 32, 64),
          new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.94,
            metalness: 0.06,
            bumpScale: 0.6
          })
        );
        pillar.position.set(pos.x, 16, pos.z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
        obstacles.push(pillar);

        for (let i = 0; i < 5; i++) {
          const band = new THREE.Mesh(
            new THREE.CylinderGeometry(3.9, 3.9, 1.2, 64),
            new THREE.MeshStandardMaterial({
              color: 0x3a3a3a,
              roughness: 0.7,
              metalness: 0.5,
              emissive: 0xff00ff,
              emissiveIntensity: 0.05
            })
          );
          band.position.set(pos.x, 6 + i * 6, pos.z);
          band.castShadow = true;
          scene.add(band);
        }

        const pillarLight = new THREE.PointLight(0xff00ff, 0.4, 12);
        pillarLight.position.set(pos.x, 20, pos.z);
        scene.add(pillarLight);
      });

      const pipeMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x454545,
        roughness: 0.6,
        metalness: 0.88,
        clearcoat: 0.75,
        clearcoatRoughness: 0.25,
        envMapIntensity: 1.6
      });
      
      for (let i = 0; i < 12; i++) {
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.2, 95, 32),
          pipeMaterial
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(i * 9 - 50, 29, -93);
        pipe.castShadow = true;
        pipe.receiveShadow = true;
        scene.add(pipe);

        if (i % 2 === 0) {
          const valve = new THREE.Mesh(
            new THREE.TorusGeometry(1.6, 0.45, 20, 48),
            new THREE.MeshPhysicalMaterial({
              color: 0xcc3300,
              roughness: 0.35,
              metalness: 0.75,
              emissive: 0xff4400,
              emissiveIntensity: 0.1,
              clearcoat: 0.8
            })
          );
          valve.position.set(i * 9 - 50, 29, -93);
          valve.rotation.y = Math.PI / 2;
          valve.castShadow = true;
          scene.add(valve);
        }
      }

      for (let i = 0; i < 6; i++) {
        const container = new THREE.Mesh(
          new THREE.CylinderGeometry(6.5, 6.5, 24, 64),
          new THREE.MeshPhysicalMaterial({ 
            color: 0x1a2a1a,
            roughness: 0.52,
            metalness: 0.62,
            emissive: 0x00ff00,
            emissiveIntensity: 0.18,
            transparent: true,
            opacity: 0.88,
            clearcoat: 0.92,
            clearcoatRoughness: 0.18,
            transmission: 0.08,
            thickness: 1.2
          })
        );
        container.position.set(-75 + i * 30, 12, 70);
        container.castShadow = true;
        container.receiveShadow = true;
        scene.add(container);
        obstacles.push(container);

        const containerLight = new THREE.PointLight(0x00ff00, 0.6, 12);
        containerLight.position.copy(container.position);
        scene.add(containerLight);

        const liquidLevel = new THREE.Mesh(
          new THREE.CylinderGeometry(6, 6, 17, 64),
          new THREE.MeshPhysicalMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.65,
            transmission: 0.85,
            roughness: 0,
            metalness: 0,
            thickness: 2.5,
            emissive: 0x00ff00,
            emissiveIntensity: 0.2
          })
        );
        liquidLevel.position.set(container.position.x, 8.5, container.position.z);
        scene.add(liquidLevel);
      }

      // Lasers with varying heights for crouching mechanic
      for (let i = 0; i < 10; i++) {
        const laserHeight = i % 2 === 0 ? 3 : 1.8; // Alternate between high (3m) and low (1.8m)
        const laserBarrier = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, laserHeight, 100),
          new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.85,
            emissive: 0xff0000,
            emissiveIntensity: 1.8
          })
        );
        laserBarrier.position.set(-85 + i * 18, laserHeight / 2 + 0.5, -10);
        laserBarrier.userData = { type: 'laser', deadly: true, damage: 25, canDuckUnder: laserHeight < playerHalfHeight * 2 * 0.7 }; // Can duck if laser is low enough
        scene.add(laserBarrier);
        interactiveObjects.push(laserBarrier);

        const laserLight = new THREE.PointLight(0xff0000, 1.8, 16);
        laserLight.position.copy(laserBarrier.position);
        scene.add(laserLight);

        for (let j = 0; j < 5; j++) {
          const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 12, 12),
            new THREE.MeshBasicMaterial({
              color: 0xff0000,
              transparent: true,
              opacity: 0.7,
              emissive: 0xff0000,
              emissiveIntensity: 1.2
            })
          );
          particle.position.set(
            laserBarrier.position.x,
            laserBarrier.position.y,
            laserBarrier.position.z - 40 + j * 20
          );
          scene.add(particle);
        }
      }

      const powerCore = new THREE.Mesh(
        new THREE.SphereGeometry(6, 128, 128),
        new THREE.MeshPhysicalMaterial({ 
          color: 0xff00ff,
          emissive: 0xff00ff,
          emissiveIntensity: 2.2,
          transparent: true,
          opacity: 0.88,
          transmission: 0.55,
          roughness: 0,
          metalness: 0,
          clearcoat: 1,
          thickness: 5,
          ior: 2.6,
          reflectivity: 1
        })
      );
      powerCore.position.set(0, 6, -70);
      powerCore.userData = { type: 'power_core', requiresHacking: true };
      powerCore.castShadow = true;
      scene.add(powerCore);
      puzzleElements.push(powerCore);

      const coreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(9, 64, 64),
        new THREE.MeshBasicMaterial({ 
          color: 0xff00ff,
          transparent: true,
          opacity: 0.4
        })
      );
      coreGlow.position.copy(powerCore.position);
      scene.add(coreGlow);

      const coreLight = new THREE.PointLight(0xff00ff, 5, 70);
      coreLight.position.copy(powerCore.position);
      scene.add(coreLight);

      const coreRings = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(8 + i * 2, 0.8, 24, 96),
          new THREE.MeshPhysicalMaterial({
            color: 0x9900ff,
            emissive: 0x9900ff,
            emissiveIntensity: 0.9,
            metalness: 0.92,
            roughness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.05
          })
        );
        ring.position.copy(powerCore.position);
        ring.rotation.x = Math.PI / 2;
        ring.castShadow = true;
        scene.add(ring);
        coreRings.push(ring);
      }

      const platformPositions = [
        { x: 0, z: 60 },
        { x: -30, z: 40 },
        { x: 30, z: 40 },
        { x: -50, z: 10 },
        { x: 50, z: 10 },
        { x: -40, z: -30 },
        { x: 40, z: -30 },
        { x: 0, z: -50 }
      ];

      platformPositions.forEach(pos => {
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(16, 2, 16),
          new THREE.MeshStandardMaterial({ 
            color: 0x2a2a3a,
            roughness: 0.78,
            metalness: 0.38,
            envMapIntensity: 1.25,
            emissive: 0x330033,
            emissiveIntensity: 0.15
          })
        );
        platform.position.set(pos.x, 4, pos.z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        scene.add(platform);
        obstacles.push(platform);

        const platformEdge = new THREE.Mesh(
          new THREE.BoxGeometry(17, 0.4, 17),
          new THREE.MeshPhysicalMaterial({
            color: 0xff8800,
            emissive: 0xff8800,
            emissiveIntensity: 0.5,
            metalness: 0.75,
            roughness: 0.25,
            clearcoat: 0.9
          })
        );
        platformEdge.position.set(pos.x, 5.3, pos.z);
        platformEdge.castShadow = true;
        scene.add(platformEdge);

        const edgeLight = new THREE.PointLight(0xff8800, 0.6, 12);
        edgeLight.position.set(pos.x, 5.8, pos.z);
        scene.add(edgeLight);
      });

      const undergroundResources = [
        { name: 'Reactor Core', x: -85, y: 1, z: -85, color: 0xff00ff },
        { name: 'Plasma Cell', x: 85, y: 1, z: -85, color: 0xff6600 },
        { name: 'Quantum Data', x: -85, y: 1, z: 85, color: 0x00ffff },
        { name: 'Dark Matter', x: 85, y: 1, z: 85, color: 0x9900ff }
      ];

      undergroundResources.forEach((res, i) => {
        const resourceMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.2, 2),
          new THREE.MeshPhysicalMaterial({
            color: res.color,
            emissive: res.color,
            emissiveIntensity: 1,
            metalness: 0.95,
            roughness: 0.08,
            clearcoat: 1,
            clearcoatRoughness: 0.03,
            transmission: 0.1
          })
        );
        resourceMesh.position.set(res.x, res.y, res.z);
        resourceMesh.userData = { type: 'resource', resourceName: res.name, id: `underground_resource_${i}` };
        resourceMesh.castShadow = true;
        scene.add(resourceMesh);
        resourceObjects.push(resourceMesh);

        const resLight = new THREE.PointLight(res.color, 1, 10);
        resLight.position.copy(resourceMesh.position);
        scene.add(resLight);
      });

      for (let i = 0; i < 50; i++) {
        const spark = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 12, 12),
          new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 0.8
          })
        );
        spark.position.set(
          Math.random() * 180 - 90,
          Math.random() * 28 + 3,
          Math.random() * 180 - 90
        );
        spark.userData = { 
          velocity: { 
            x: (Math.random() - 0.5) * 0.06, 
            y: Math.random() * 0.025 + 0.015,
            z: (Math.random() - 0.5) * 0.06
          },
          lifetime: Math.random() * 6 + 4
        };
        scene.add(spark);
        mistParticles.push(spark);
      }

      addLog("Deep facility - Radiation Hazard! Lasers deal 25 HP!", 'error');
    }

    const keys = {};
    let onSlippery = false;
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      
      if (e.key.toLowerCase() === 'c') {
        setIsCrouching(true);
      }
      
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
            } else if (elem.userData.type === 'power_core' && elem.userData.requiresHacking) {
                if (puzzleStates.power_core_hacked) {
                  if (!missionComplete) {
                    missionComplete = true;
                    addLog('✓ POWER CORE SECURED!', 'success');
                    completeMission();
                  }
                } else {
                  addLog('Initiating hack sequence...', 'warning');
                  setShowHackingPuzzle(true);
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
    
    const handleKeyUp = (e) => { 
      keys[e.key.toLowerCase()] = false;
      
      if (e.key.toLowerCase() === 'c') {
        setIsCrouching(false);
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

      const crouching = keys['c'] || mobileControlsRef.current.crouch;
      const currentPlayerHalfHeight = crouching ? playerHalfHeight * 0.4 : playerHalfHeight;
      
      if (crouching !== isCrouchingRef.current) {
        player.scale.y = crouching ? 0.5 : 1;
        player.position.y = crouching ? player.position.y - (playerHalfHeight - currentPlayerHalfHeight) : player.position.y + (playerHalfHeight - currentPlayerHalfHeight);
        isCrouchingRef.current = crouching; // Update ref to reflect current state
      }

      const isSpaceOrMobileJumpPressed = keys[' '] || mobileControlsRef.current.jump;

      if (isSpaceOrMobileJumpPressed && !crouching) {
        if (!isOnRope) {
          const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
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
          if (player.position.y > ceilingHeight - currentPlayerHalfHeight - 0.5) {
            player.position.y = ceilingHeight - currentPlayerHalfHeight - 0.5;
          }
        }
        if (keys['s'] || mobileControlsRef.current.down) {
          player.position.y -= ropeSpeed * delta;
          if (player.position.y < currentPlayerHalfHeight) {
            player.position.y = currentPlayerHalfHeight;
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

        const baseSpeed = crouching ? 6 : (keys['shift'] ? 20 : 10);
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

        if (newPlayerPositionY - currentPlayerHalfHeight <= 0) {
          newPlayerPositionY = currentPlayerHalfHeight;
          playerVelocityY = 0;
          isOnGround = true;
          jumpCount = 0;
        }

        let actualHorizontalPosition = new THREE.Vector3(targetHorizontalPosition.x, player.position.y, targetHorizontalPosition.z);
        
        obstacles.forEach(obs => {
          const obsBox = new THREE.Box3().setFromObject(obs);

          const playerBoxAtTargetPos = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(targetHorizontalPosition.x, newPlayerPositionY, targetHorizontalPosition.z),
            new THREE.Vector3(playerRadius * 2, currentPlayerHalfHeight * 2, playerRadius * 2)
          );

          if (playerVelocityY < 0 && 
            (player.position.y - currentPlayerHalfHeight) >= (obsBox.max.y - 0.1) &&
            (newPlayerPositionY - currentPlayerHalfHeight) < (obsBox.max.y + 0.1) &&
            playerBoxAtTargetPos.intersectsBox(obsBox)
          ) {
            newPlayerPositionY = obsBox.max.y + currentPlayerHalfHeight;
            playerVelocityY = 0;
            isOnGround = true;
            jumpCount = 0;
          }
          else if (playerVelocityY > 0 && 
            (player.position.y + currentPlayerHalfHeight) <= (obsBox.min.y + 0.1) &&
            (newPlayerPositionY + currentPlayerHalfHeight) > (obsBox.min.y - 0.1) &&
            playerBoxAtTargetPos.intersectsBox(obsBox)
          ) {
            playerVelocityY = 0;
            newPlayerPositionY = obsBox.min.y - currentPlayerHalfHeight;
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
                                 (player.position.y - currentPlayerHalfHeight <= plateTopY + 0.2) &&
                                 (player.position.y - currentPlayerHalfHeight >= plateTopY - 0.5);
          
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
          const objBox = new THREE.Box3().setFromObject(obj);
          
          const playerBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(player.position.x, player.position.y, player.position.z),
            new THREE.Vector3(playerRadius * 2, currentPlayerHalfHeight * 2, playerRadius * 2)
          );
          
          const canDuckUnder = obj.userData.canDuckUnder && crouching;
          
          if (playerBox.intersectsBox(objBox) && !canDuckUnder) {
            const currentTime = clock.elapsedTime;
            if (currentTime - lastDamageTime > 0.5) {
              takeDamage(obj.userData.damage || 10);
              addLog(`LASER HIT! -${obj.userData.damage || 10} HP`, 'error');
              lastDamageTime = currentTime;
              
              body.material.emissive.setHex(0xff0000);
              body.material.emissiveIntensity = 1.2;
              setTimeout(() => {
                body.material.emissive.setHex(0x1e40af); // Original emissive color
                body.material.emissiveIntensity = 0.25;
              }, 180);
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
          if (!missionComplete && distance < 6) {
            missionComplete = true;
            addLog('DATA CORE EXTRACTED!', 'success');
            completeMission();
          }
        }

        obj.position.y += Math.sin(clock.elapsedTime * 2.5) * 0.03;
        obj.rotation.y += delta * 0.65;
      });

      mistParticles.forEach((particle, index) => {
        if (particle.userData.velocity) {
          particle.position.x += particle.userData.velocity.x || 0;
          particle.position.y += particle.userData.velocity.y;
          particle.position.z += particle.userData.velocity.z || 0;
          
          if (particle.userData.resetY !== undefined && particle.position.y > particle.userData.resetY + 16) {
            particle.position.y = particle.userData.resetY;
          } else if (particle.position.y > 32 || particle.position.y < 0) {
            particle.position.y = 5;
          }

          if (particle.userData.lifetime !== undefined) {
            particle.userData.lifetime -= delta;
            if (particle.userData.lifetime <= 0) {
              particle.position.set(
                Math.random() * 180 - 90,
                Math.random() * 28 + 3,
                Math.random() * 180 - 90
              );
              particle.userData.lifetime = Math.random() * 6 + 4;
            }
          }
        }
      });

      if (environmentVariant) {
        environmentVariant.effects?.forEach(effect => {
          if (effect.type === 'flickering_lights' && ambientLight) {
            // Apply flickering relative to current intensity
            ambientLight.intensity = Math.max(0, (ambientLight.intensity || 0.5) + Math.sin(clock.elapsedTime * 6) * (effect.intensity || 0.1));
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

  const handleMobileCrouch = (isDown) => {
    setMobileControls(prev => ({ ...prev, crouch: isDown }));
    setIsCrouching(isDown); // Also update direct state for visual feedback
  };

  const getHealthColor = () => {
    if (health > 60) return 'bg-green-500';
    if (health > 30) return 'bg-yellow-500';
    return 'bg-red-500';
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
            setHackingCode('');
            setHackingAttempts(3);
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
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    Health
                  </span>
                  <span className="text-white font-mono text-xs font-bold">{health}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getHealthColor()}`}
                    style={{ width: `${health}%` }}
                  />
                </div>
              </div>

              {isCrouching && (
                <div className="mt-2 flex items-center gap-1 text-yellow-400 font-mono text-xs">
                  <ChevronDown className="w-3 h-3" />
                  CROUCHING
                </div>
              )}

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
              <p>W/A/S/D: Move | SPACE: Rope | E: Interact | Shift: Sprint</p>
              {activeMission?.mission_number === 1 && (
                <p className="text-cyan-400 mt-1 font-bold">
                  Hold SPACE to deploy rope - W/S up/down, A/D left/right!
                </p>
              )}
              {activeMission?.mission_number === 3 && (
                <p className="text-yellow-400 mt-1 font-bold animate-pulse">
                  C: CROUCH - Duck under lasers!
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
                  className="w-16 h-16 bg-green-500/80 rounded-full flex items-center justify-center active:bg-green-600 flex-col"
                >
                  <MoveUp className="w-8 h-8 text-white" />
                  <span className="text-[10px] text-white font-bold">ROPE</span>
                </button>
                {activeMission?.mission_number === 3 && (
                  <button
                    onTouchStart={() => handleMobileCrouch(true)}
                    onTouchEnd={() => handleMobileCrouch(false)}
                    className="w-16 h-16 bg-orange-500/80 rounded-full flex items-center justify-center active:bg-orange-600 flex-col"
                  >
                    <ChevronDown className="w-8 h-8 text-white" />
                    <span className="text-[10px] text-white font-bold">DUCK</span>
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
                  <li>Deploy rope to reach sink button</li>
                  <li>Activate button (turns green)</li>
                  <li>Cross fork bridge</li>
                  <li>Step on pressure plate</li>
                  <li>Activate knife lever</li>
                  <li>Reach water droplet</li>
                </ol>
              </div>
            )}

            {showHint && activeMission?.mission_number === 3 && (
              <div className="absolute top-20 left-4 bg-yellow-900/90 backdrop-blur-sm border border-yellow-500/50 rounded p-4 max-w-md z-20">
                <h4 className="text-yellow-300 font-mono font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Mission 3 Hints:
                </h4>
                <ol className="text-yellow-100 font-mono text-xs space-y-1 list-decimal list-inside">
                  <li>Navigate through laser field</li>
                  <li>Hold C to CROUCH under tall lasers</li>
                  <li>Reach the purple POWER CORE</li>
                  <li>Press E to hack (code is 7394)</li>
                  <li>Avoid damage - lasers deal 25 HP!</li>
                </ol>
              </div>
            )}

            {showHackingPuzzle && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm z-30">
                <Card className="bg-gradient-to-br from-purple-900/90 to-black/90 border-purple-500 p-6 max-w-md">
                  <h3 className="text-2xl font-bold text-purple-300 mb-4 font-mono flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    POWER CORE HACK
                  </h3>
                  <p className="text-gray-300 mb-4 font-mono text-sm">
                    Enter the access code to unlock the power core
                  </p>
                  <div className="mb-4">
                    <p className="text-cyan-400 font-mono text-xs mb-2">HINT: Sum of prime numbers between 10-20</p>
                    <input
                      type="text"
                      value={hackingCode}
                      onChange={(e) => setHackingCode(e.target.value)}
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                      className="w-full bg-black/50 border-2 border-purple-500 rounded p-3 text-white font-mono text-xl text-center tracking-widest focus:border-cyan-400 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-400 font-mono text-xs">
                      Attempts remaining: <span className="text-red-400 font-bold">{hackingAttempts}</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowHackingPuzzle(false);
                        setHackingCode('');
                      }}
                      variant="outline"
                      className="flex-1 font-mono"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleHackingSubmit}
                      disabled={hackingCode.length !== 4}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 font-mono"
                    >
                      Submit Code
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {!activeMission && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white font-mono text-xl mb-2">ALL MISSIONS COMPLETE</p>
                  <p className="text-gray-400 font-mono text-sm">Check File Browser and Comms</p>
                </div>
              </div>
            )}

            {health <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 backdrop-blur-sm z-30">
                <div className="text-center">
                  <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-white font-mono text-3xl mb-2 font-bold">MISSION FAILED</p>
                  <p className="text-gray-200 font-mono text-sm mb-4">Critical health depletion</p>
                  <Button
                    onClick={() => {
                      setHealth(100);
                      setMissionStarted(false);
                      setShowBriefing(true);
                      setInventory([]);
                      setPuzzleStates({});
                      setDestroyedObjects([]);
                      setLeverStates({});
                      setActivatedButtons([]);
                      setHackingCode('');
                      setHackingAttempts(3);
                      addLog('Mission restarted', 'warning');
                    }}
                    className="bg-red-600 hover:bg-red-700 font-mono font-bold"
                  >
                    Restart Mission
                  </Button>
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
                  <span className="text-sm font-mono text-white">Security Key</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-yellow-900/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-mono text-yellow-400">Lasers: -18 HP</span>
                </div>
              </>
            )}
            {activeMission?.mission_number === 3 && (
              <>
                <div className={`flex items-center gap-2 p-2 rounded ${puzzleStates.power_core_hacked ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${puzzleStates.power_core_hacked ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Hack Power Core</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-red-900/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-sm font-mono text-red-400">Lasers: -25 HP!</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-yellow-900/20">
                  <ChevronDown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-mono text-yellow-400">Hold C to crouch</span>
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
