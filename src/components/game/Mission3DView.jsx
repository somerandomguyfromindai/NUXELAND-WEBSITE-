
import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, Play, Lock, Zap, Key, FileText } from "lucide-react";
import MissionBriefing from "./MissionBriefing";

export default function Mission3DView({ gameState, setGameState }) {
  const mountRef = useRef(null);
  const [missionLog, setMissionLog] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 0 });
  const [inventory, setInventory] = useState([]);
  const [puzzleStates, setPuzzleStates] = useState({});
  const [showPuzzleUI, setShowPuzzleUI] = useState(null);
  const [showBriefing, setShowBriefing] = useState(true);
  const [missionStarted, setMissionStarted] = useState(false);
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
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current || !activeMission || !missionStarted) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f2e);
    scene.fog = new THREE.Fog(0x1a0f2e, 30, 100);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404070, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Point lights
    const blueLight = new THREE.PointLight(0x3b82f6, 2, 20);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xef4444, 1.5, 15);
    redLight.position.set(10, 5, 10);
    scene.add(redLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a4a,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(200, 100, 0x3b82f6, 0x1a1a3a);
    scene.add(gridHelper);

    // Player
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.2
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    scene.add(player);

    // Mission-specific puzzles and obstacles
    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let missionComplete = false;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Navigate maze to water source", 'info');
      
      // Create maze walls
      const wallPositions = [
        { x: 10, z: 0, w: 2, d: 20 },
        { x: 20, z: 10, w: 2, d: 15 },
        { x: 15, z: -10, w: 15, d: 2 },
        { x: 30, z: 5, w: 2, d: 25 }
      ];

      wallPositions.forEach(wall => {
        const wallGeometry = new THREE.BoxGeometry(wall.w, 5, wall.d);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x1a1a3a,
          roughness: 0.8
        });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(wall.x, 2.5, wall.z);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        scene.add(wallMesh);
        obstacles.push(wallMesh);
      });

      // Pressure plates puzzle
      const platePositions = [
        { x: 15, z: 15, order: 1 },
        { x: 25, z: 20, order: 2 },
        { x: 35, z: 15, order: 3 }
      ];

      platePositions.forEach(pos => {
        const plateGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
        const plateMaterial = new THREE.MeshStandardMaterial({ 
          color: puzzleStates[`plate_${pos.order}`] ? 0x10b981 : 0x6b7280,
          emissive: puzzleStates[`plate_${pos.order}`] ? 0x10b981 : 0x000000,
          emissiveIntensity: 0.5
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(pos.x, 0.1, pos.z);
        plate.userData = { type: 'pressure_plate', order: pos.order };
        scene.add(plate);
        puzzleElements.push(plate);
      });

      // Locked door to water source
      const doorGeometry = new THREE.BoxGeometry(5, 6, 1);
      const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: puzzleStates.all_plates_pressed ? 0x10b981 : 0xef4444,
        emissive: puzzleStates.all_plates_pressed ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.5
      });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(40, 3, 25);
      door.userData = { type: 'door', locked: !puzzleStates.all_plates_pressed };
      scene.add(door);
      obstacles.push(door);

      // Water source behind door
      const waterGeometry = new THREE.SphereGeometry(2, 32, 32);
      const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.7,
        emissive: 0x60a5fa,
        emissiveIntensity: 0.5
      });
      const waterDrop = new THREE.Mesh(waterGeometry, waterMaterial);
      waterDrop.position.set(50, 2, 25);
      waterDrop.userData.type = 'water_source';
      scene.add(waterDrop);
      objectives.push(waterDrop);

      // Password hint
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      context.fillStyle = '#3b82f6';
      context.font = 'bold 48px monospace';
      context.fillText('NUXELAND', 50, 80);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(25, 8, 10);
      sprite.scale.set(10, 2.5, 1);
      scene.add(sprite);

    } else if (activeMission.mission_number === 2) {
      addLog("Mission 2: Collect keycard, avoid lasers, neutralize hostile", 'warning');
      
      // Laser grid obstacles
      const laserPositions = [
        { x: 10, z: 10 }, { x: 15, z: 15 }, { x: 20, z: 12 }, { x: 25, z: 18 }
      ];

      laserPositions.forEach((pos, i) => {
        const laserGeometry = new THREE.BoxGeometry(0.2, 5, 0.2);
        const laserMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xff0000,
          emissive: 0xff0000,
          emissiveIntensity: 1,
          transparent: true,
          opacity: 0.8
        });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.set(pos.x, 2.5, pos.z);
        laser.userData = { type: 'laser', deadly: true, index: i };
        scene.add(laser);
        obstacles.push(laser);
      });

      // Keycard
      const keycardGeometry = new THREE.BoxGeometry(0.6, 0.05, 1);
      const keycardMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.6,
        metalness: 0.8
      });
      const keycard = new THREE.Mesh(keycardGeometry, keycardMaterial);
      keycard.position.set(30, 1, 15);
      keycard.userData = { type: 'keycard', collected: inventory.includes('keycard') };
      if (!inventory.includes('keycard')) scene.add(keycard);
      puzzleElements.push(keycard);

      // Locked terminal
      const terminalGeometry = new THREE.BoxGeometry(2, 2, 1);
      const terminalMaterial = new THREE.MeshStandardMaterial({ 
        color: inventory.includes('keycard') ? 0x10b981 : 0x6b7280,
        emissive: inventory.includes('keycard') ? 0x00ff00 : 0xff0000,
        emissiveIntensity: 0.5
      });
      const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
      terminal.position.set(35, 1, 20);
      terminal.userData = { type: 'terminal', locked: !inventory.includes('keycard') };
      scene.add(terminal);
      puzzleElements.push(terminal);

      // Giant spider (hostile)
      const spiderBody = new THREE.SphereGeometry(2.5, 16, 16);
      const spiderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.8
      });
      const spider = new THREE.Mesh(spiderBody, spiderMaterial);
      spider.position.set(40, 2.5, 25);
      spider.userData.type = 'hostile';
      scene.add(spider);

      // Spider legs
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.1, 4, 8);
        const leg = new THREE.Mesh(legGeometry, spiderMaterial);
        const angle = (i / 8) * Math.PI * 2;
        leg.position.set(
          spider.position.x + Math.cos(angle) * 2,
          1,
          spider.position.z + Math.sin(angle) * 2
        );
        leg.rotation.z = Math.PI / 4;
        scene.add(leg);
      }

      objectives.push(spider);

    } else if (activeMission.mission_number === 3) {
      addLog("Mission 3: Wire puzzle + specimen retrieval - ETHICAL DECISION", 'error');
      
      // Wire puzzle control box
      const boxGeometry = new THREE.BoxGeometry(3, 3, 1.5);
      const boxMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a4a,
        metalness: 0.6
      });
      const controlBox = new THREE.Mesh(boxGeometry, boxMaterial);
      controlBox.position.set(20, 1.5, 20);
      controlBox.userData = { type: 'wire_puzzle', solved: puzzleStates.wire_solved };
      scene.add(controlBox);
      puzzleElements.push(controlBox);

      // Electric barrier
      for (let i = 0; i < 8; i++) {
        const barrierGeometry = new THREE.BoxGeometry(0.5, 6, 0.5);
        const barrierMaterial = new THREE.MeshStandardMaterial({ 
          color: puzzleStates.wire_solved ? 0x6b7280 : 0x3b82f6,
          emissive: puzzleStates.wire_solved ? 0x000000 : 0x3b82f6,
          emissiveIntensity: puzzleStates.wire_solved ? 0 : 1,
          transparent: true,
          opacity: puzzleStates.wire_solved ? 0.3 : 0.8
        });
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(30 + i * 2, 3, 25);
        barrier.userData = { type: 'barrier', active: !puzzleStates.wire_solved };
        scene.add(barrier);
        if (!puzzleStates.wire_solved) obstacles.push(barrier);
      }

      // Specimen (moral dilemma)
      const specimenGeometry = new THREE.SphereGeometry(3, 16, 16);
      const specimenMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.4
      });
      const specimen = new THREE.Mesh(specimenGeometry, specimenMaterial);
      specimen.position.set(50, 3, 25);
      specimen.userData.type = 'specimen';
      scene.add(specimen);
      objectives.push(specimen);

      // Danger markers
      for (let i = 0; i < 5; i++) {
        const dangerGeometry = new THREE.ConeGeometry(0.5, 2, 4);
        const dangerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const danger = new THREE.Mesh(dangerGeometry, dangerMaterial);
        const angle = (i / 5) * Math.PI * 2;
        danger.position.set(
          specimen.position.x + Math.cos(angle) * 6,
          1,
          specimen.position.z + Math.sin(angle) * 6
        );
        scene.add(danger);
      }
    }

    // Player controls
    const keys = {};
    const velocity = new THREE.Vector3();
    let pressedPlates = [];
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      
      // Interaction key
      if (e.key.toLowerCase() === 'e') {
        puzzleElements.forEach(elem => {
          const distance = player.position.distanceTo(elem.position);
          if (distance < 4) {
            if (elem.userData.type === 'wire_puzzle' && !puzzleStates.wire_solved) {
              setShowPuzzleUI('wire_puzzle');
            } else if (elem.userData.type === 'terminal' && inventory.includes('keycard')) {
              addLog("Terminal activated - Gas deployment ready", 'success');
              setPuzzleStates(prev => ({ ...prev, terminal_active: true }));
            }
          }
        });
      }
    };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse look
    let mouseX = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      const delta = clock.getDelta();

      // Player movement
      const speed = keys['shift'] ? 20 : 10;
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
        
        // Collision detection
        let collision = false;
        obstacles.forEach(obs => {
          if (obs.userData.type === 'laser' && obs.userData.deadly) {
            const dist = new THREE.Vector2(newPosition.x, newPosition.z)
              .distanceTo(new THREE.Vector2(obs.position.x, obs.position.z));
            if (dist < 1) {
              collision = true;
              addLog("LASER HIT - Mission failed! Restarting...", 'error');
              player.position.set(0, 1, 0);
            }
          } else if (obs.userData.type === 'door' && obs.userData.locked) {
            const dist = new THREE.Vector2(newPosition.x, newPosition.z)
              .distanceTo(new THREE.Vector2(obs.position.x, obs.position.z));
            if (dist < 3) {
              collision = true;
            }
          } else if (obs.userData.type === 'barrier' && obs.userData.active) {
            const dist = new THREE.Vector2(newPosition.x, newPosition.z)
              .distanceTo(new THREE.Vector2(obs.position.x, obs.position.z));
            if (dist < 1) {
              collision = true;
            }
          } else {
            const obsBox = new THREE.Box3().setFromObject(obs);
            const playerBox = new THREE.Box3().setFromCenterAndSize(
              newPosition,
              new THREE.Vector3(1, 2, 1)
            );
            if (obsBox.intersectsBox(playerBox)) {
              collision = true;
            }
          }
        });

        if (!collision) {
          player.position.add(newVelocity);
          setPlayerPosition({ x: player.position.x, y: player.position.y, z: player.position.z });
        }
      }

      // Camera follow
      camera.position.x = player.position.x + mouseX * 8;
      camera.position.y = player.position.y + 10;
      camera.position.z = player.position.z + 18;
      camera.lookAt(player.position);

      // Pressure plate detection
      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          
          if (distance < 1.5) {
            const plateKey = `plate_${elem.userData.order}`;
            if (!puzzleStates[plateKey]) {
              addLog(`Pressure plate ${elem.userData.order} activated`, 'info');
              setPuzzleStates(prev => ({ ...prev, [plateKey]: true }));
              
              if (!pressedPlates.includes(elem.userData.order)) {
                pressedPlates.push(elem.userData.order);
              }
              
              if (pressedPlates.length === 3) {
                addLog("All pressure plates activated - Door unlocked!", 'success');
                setPuzzleStates(prev => ({ ...prev, all_plates_pressed: true }));
              }
            }
          }
        }

        // Keycard collection
        if (elem.userData.type === 'keycard' && !elem.userData.collected) {
          const distance = player.position.distanceTo(elem.position);
          if (distance < 2) {
            addLog("Keycard collected", 'success');
            setInventory(prev => [...prev, 'keycard']);
            elem.userData.collected = true;
            scene.remove(elem);
          }
        }
      });

      // Check objectives
      objectives.forEach(obj => {
        const canComplete = 
          (activeMission.mission_number === 1 && puzzleStates.all_plates_pressed) ||
          (activeMission.mission_number === 2 && puzzleStates.terminal_active) ||
          (activeMission.mission_number === 3 && puzzleStates.wire_solved);

        if (!missionComplete && canComplete && player.position.distanceTo(obj.position) < 4) {
          missionComplete = true;
          completeMission();
        }

        // Animate objectives
        obj.position.y += Math.sin(clock.elapsedTime * 2) * 0.01;
        obj.rotation.y += delta;
      });

      // Animate lasers
      obstacles.forEach(obs => {
        if (obs.userData.type === 'laser') {
          obs.material.opacity = 0.6 + Math.sin(clock.elapsedTime * 10) * 0.2;
        }
      });

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
  }, [activeMission, puzzleStates, inventory, missionStarted]);

  const solveWirePuzzle = (wireColor) => {
    const correctWire = 'red'; // Mission 3 correct wire
    if (wireColor === correctWire) {
      addLog("Wire puzzle solved! Barrier deactivated", 'success');
      setPuzzleStates(prev => ({ ...prev, wire_solved: true }));
      setShowPuzzleUI(null);
    } else {
      addLog("Wrong wire! System locked for 5 seconds", 'error');
      setTimeout(() => {
        addLog("System reset - try again", 'warning');
      }, 5000);
    }
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

            {inventory.length > 0 && (
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-yellow-500/50 rounded p-3">
                <p className="text-yellow-400 font-mono text-xs font-bold mb-2">INVENTORY</p>
                {inventory.map(item => (
                  <div key={item} className="flex items-center gap-2 text-gray-300 text-xs font-mono">
                    <Key className="w-3 h-3" /> {item}
                  </div>
                ))}
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300">
              W/A/S/D: Move | Mouse: Look | E: Interact | Shift: Sprint
            </div>

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
              OBJECTIVES
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {activeMission ? (
              <>
                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                  <p className="text-orange-300 text-xs font-mono leading-relaxed">
                    {activeMission.briefing}
                  </p>
                </div>
                {activeMission.objectives?.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 ${
                      obj.completed ? 'text-green-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-mono ${
                      obj.completed ? 'text-gray-500 line-through' : 'text-white'
                    }`}>
                      {obj.description}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 font-mono text-sm">No active mission</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-[#0F1729] border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-mono font-bold text-sm">ACTIVITY LOG</h3>
          </div>
          <div className="p-4 space-y-1 max-h-[300px] overflow-y-auto">
            {missionLog.map((log, i) => (
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

      {showPuzzleUI === 'wire_puzzle' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-[#0F1729] border-red-500/50">
            <div className="p-6">
              <h3 className="text-red-400 font-mono font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                WIRE PUZZLE - CUT THE CORRECT WIRE
              </h3>
              <p className="text-gray-400 font-mono text-sm mb-6">
                Hint: The red wire has slightly higher voltage fluctuation
              </p>
              <div className="space-y-3">
                {['red', 'blue', 'green', 'yellow'].map(color => (
                  <Button
                    key={color}
                    onClick={() => solveWirePuzzle(color)}
                    className={`w-full bg-${color}-600 hover:bg-${color}-700 font-mono`}
                    style={{ backgroundColor: color === 'red' ? '#dc2626' : color === 'blue' ? '#2563eb' : color === 'green' ? '#16a34a' : '#ca8a04' }}
                  >
                    Cut {color.toUpperCase()} Wire
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setShowPuzzleUI(null)}
                variant="outline"
                className="w-full mt-4 font-mono"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
