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
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.5);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const counterGeometry = new THREE.PlaneGeometry(200, 200);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f0,
      roughness: 0.3,
      metalness: 0.2
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
      metalness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    const helmetGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const helmetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa,
      roughness: 0.1,
      metalness: 0.9
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.9;
    helmet.castShadow = true;
    playerGroup.add(helmet);

    playerGroup.position.set(0, 1, 0);
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
    const gravity = -25;
    const ropeSpeed = 8;
    const playerHalfHeight = 0.8;
    const playerRadius = 0.4;
    const ceilingHeight = 50;
    let lastDamageTime = 0;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Hold SPACE to deploy rope!", 'info');
      
      const wallHeight = 50;
      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c5b9, roughness: 0.8 });
      
      const walls = [
        new THREE.Mesh(new THREE.BoxGeometry(200, wallHeight, 2), wallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(2, wallHeight, 200), wallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(2, wallHeight, 200), wallMaterial)
      ];
      walls[0].position.set(0, wallHeight/2, -100);
      walls[1].position.set(-100, wallHeight/2, 0);
      walls[2].position.set(100, wallHeight/2, 0);
      walls.forEach(wall => {
        wall.receiveShadow = true;
        scene.add(wall);
      });
      
      const cabinetMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4e37, roughness: 0.6 });
      for (let i = 0; i < 4; i++) {
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 10), cabinetMaterial);
        cabinet.position.set(-60 + i * 40, 35, -95);
        cabinet.castShadow = true;
        scene.add(cabinet);
        obstacles.push(cabinet);
      }
      
      const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
      const borderHeight = 3;
      
      const borders = [
        new THREE.Mesh(new THREE.BoxGeometry(200, borderHeight, 2), borderMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(200, borderHeight, 2), borderMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(2, borderHeight, 200), borderMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(2, borderHeight, 200), borderMaterial)
      ];
      borders[0].position.set(0, borderHeight/2, 100);
      borders[1].position.set(0, borderHeight/2, -100);
      borders[2].position.set(-100, borderHeight/2, 0);
      borders[3].position.set(100, borderHeight/2, 0);
      borders.forEach(border => {
        border.castShadow = true;
        scene.add(border);
        obstacles.push(border);
      });
      
      const sinkRim = new THREE.Mesh(
        new THREE.BoxGeometry(30, 0.8, 22),
        new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.95, roughness: 0.05 })
      );
      sinkRim.position.set(-5, 0.4, -25);
      sinkRim.castShadow = true;
      scene.add(sinkRim);
      obstacles.push(sinkRim);
      
      const buttonGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.7,
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

      const mugGeometry = new THREE.CylinderGeometry(5, 4.2, 10, 32);
      const mugMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
      const mug = new THREE.Mesh(mugGeometry, mugMaterial);
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      scene.add(mug);
      obstacles.push(mug);

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

      const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.9 })
      );
      labFloor.rotation.x = -Math.PI / 2;
      labFloor.receiveShadow = true;
      scene.add(labFloor);

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
      
      addLog("Mission 3: Specimen Retrieval", 'warning');
      addLog("Use C to CROUCH under lasers!", 'info');
      player.position.set(-70, 1, 70);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.95 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const redLight = new THREE.PointLight(0xff0000, 2, 100);
      redLight.position.set(0, 20, 0);
      scene.add(redLight);

      const powerCore = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.8
        })
      );
      powerCore.position.set(0, 5, -90);
      powerCore.userData = { type: 'power_core', accessible: true, needsHack: true };
      powerCore.castShadow = true;
      scene.add(powerCore);
      objectives.push(powerCore);
    }

    const keys = {};
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'c') isCrouching = true;
      
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
              setLeverStates(prev => ({ ...prev, [elem.userData.id]: !prev[elem.userData.id] }));
              addLog(`✓ Lever toggled!`, 'info');
            }
          }
        });

        objectives.forEach(obj => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 5 && obj.userData.type === 'power_core' && obj.userData.needsHack) {
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
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    
    const animate = () => {
      const delta = clock.getDelta();

      const isSpacePressed = keys[' '] || mobileControlsRef.current.jump;

      if (isSpacePressed && !isOnRope) {
        const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
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

      if (isCrouching || mobileControlsRef.current.crouch) {
        player.scale.y = 0.5;
      } else {
        player.scale.y = 1;
      }

      if (isOnRope) {
        if (keys['w'] || mobileControlsRef.current.up) player.position.y += ropeSpeed * delta;
        if (keys['s'] || mobileControlsRef.current.down) player.position.y -= ropeSpeed * delta;
        if (keys['a'] || mobileControlsRef.current.left) player.position.x -= ropeSpeed * delta * 0.5;
        if (keys['d'] || mobileControlsRef.current.right) player.position.x += ropeSpeed * delta * 0.5;

        ropeLine.geometry.setFromPoints([
          new THREE.Vector3(player.position.x, player.position.y, player.position.z),
          new THREE.Vector3(player.position.x, ceilingHeight, player.position.z)
        ]);
      } else {
        if (!isOnGround) playerVelocityY += gravity * delta;

        const speed = (isCrouching ? 5 : 10) * delta;
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

      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          if (distance < 2 && !puzzleStates[elem.userData.id]) {
            setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
            addLog(`✓ Pressure plate activated!`, 'info');
          }
        }
      });

      objectives.forEach(obj => {
        const distance = player.position.distanceTo(obj.position);
        if (!missionComplete && distance < 5) {
          if (obj.userData.type === 'water_source' && obj.userData.accessible) {
            missionComplete = true;
            completeMission();
          } else if (obj.userData.type === 'data_core') {
            missionComplete = true;
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
            
            <div className="absolute top-4 left-4 bg-black/80 border border-red-500/50 rounded p-3 z-10">
              <div className="flex items-center gap-2 mb-2">
                <Heart className={`w-5 h-5 ${playerHealth > 50 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white font-mono text-sm">HP: {playerHealth}%</span>
              </div>
              <div className="w-40 bg-gray-700 rounded h-2">
                <div className={`h-2 rounded ${playerHealth > 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${playerHealth}%` }} />
              </div>
            </div>

            <div className="absolute top-24 left-4 bg-black/80 border border-blue-500/50 rounded p-3 z-10">
              <p className="text-blue-400 font-mono text-sm font-bold">MISSION {activeMission.mission_number}</p>
              <p className="text-gray-300 font-mono text-xs">{activeMission.title}</p>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <Button onClick={() => setShowAIAssistant(true)} className="bg-cyan-600/80 font-mono text-xs" size="sm">
                <Bot className="w-4 h-4 mr-1" />AI
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/80 rounded p-2 font-mono text-xs text-gray-300 hidden md:block z-10">
              <p>WASD: Move | SPACE: Rope | C: Crouch | E: Interact</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-mono font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />STATUS
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {activeMission.mission_number === 1 && (
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