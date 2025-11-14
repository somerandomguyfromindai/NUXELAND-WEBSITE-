
import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, FileText, Hammer, Lightbulb, Bug } from "lucide-react";
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
  const [playerHealth, setPlayerHealth] = useState(100);
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

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.2);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
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

    const playerGroup = new THREE.Group();
    
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e40af,
      roughness: 0.4,
      metalness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    const helmetGeometry = new THREE.SphereGeometry(0.35, 8, 8);
    const helmetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa,
      roughness: 0.1,
      metalness: 0.9
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.9;
    playerGroup.add(helmet);

    playerGroup.position.set(0, 1, 0);
    scene.add(playerGroup);
    const player = playerGroup;

    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let destructibleObjects = [];
    let interactiveObjects = []; // Not used after removing butter, but kept for consistency
    let mistParticles = []; // Not used after removing mist, but kept for consistency
    let enemies = [];
    let missionComplete = false;
    
    let playerVelocityY = 0;
    let isOnGround = true;
    const gravity = -25;
    const jumpForce = 10;
    const playerHalfHeight = 0.8;
    const playerRadius = 0.4;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Avoid hostile insects and reach water!", 'info');

      // Simplified mission objects for performance
      const simpleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(15, 12, 8, 16), simpleMaterial);
      bowl.position.set(30, 4, 20);
      bowl.castShadow = true;
      scene.add(bowl);
      obstacles.push(bowl);

      const spoon = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 18), new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.9 }));
      spoon.position.set(-15, 1.2, -10);
      spoon.castShadow = true;
      scene.add(spoon);
      obstacles.push(spoon);

      const mug = new THREE.Mesh(new THREE.CylinderGeometry(5, 4.2, 10, 16), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      scene.add(mug);
      obstacles.push(mug);

      for (let i = 0; i < 5; i++) {
        const crumb = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), new THREE.MeshStandardMaterial({ color: 0xdaa520 }));
        crumb.position.set(10 + i * 5, 0.75, 5);
        crumb.userData = { type: 'destructible', id: `crumb_${i}`, health: 2 };
        if (!destroyedObjects.includes(`crumb_${i}`)) {
          scene.add(crumb);
          destructibleObjects.push(crumb);
          obstacles.push(crumb);
        }
      }

      const saltShaker = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 15, 16), simpleMaterial);
      saltShaker.position.set(-5, 7.5, -25);
      saltShaker.castShadow = true;
      scene.add(saltShaker);
      obstacles.push(saltShaker);

      const button1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.6, 16), new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.5
      }));
      button1.position.set(-5, 20.5, -25);
      button1.userData = { type: 'button', id: 'button1' };
      scene.add(button1);
      puzzleElements.push(button1);

      if (activatedButtons.includes('button1')) {
        const fork = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 25), new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }));
        fork.position.set(15, 1.3, -15);
        fork.rotation.y = Math.PI / 6;
        scene.add(fork);
        obstacles.push(fork);
      }

      const napkin = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 12), simpleMaterial);
      napkin.position.set(35, 0.15, -5);
      scene.add(napkin);
      obstacles.push(napkin);

      const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 32), new THREE.MeshStandardMaterial({ 
        color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
        emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
        emissiveIntensity: puzzleStates.plate1 ? 0.6 : 0
      }));
      plate1.position.set(35, 0.35, -5);
      plate1.userData = { type: 'pressure_plate', id: 'plate1' };
      scene.add(plate1);
      puzzleElements.push(plate1);

      const knife = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xe0e0e0 }));
      knife.position.set(40, 0.6, 10);
      knife.userData = { type: 'lever', id: 'lever1' };
      scene.add(knife);
      puzzleElements.push(knife);

      const plate = new THREE.Mesh(new THREE.CylinderGeometry(8, 7, 1.2, 32), simpleMaterial);
      const plateHeight = leverStates.lever1 ? 8 : 0.6;
      plate.position.set(55, plateHeight, 0);
      plate.castShadow = true;
      scene.add(plate);
      obstacles.push(plate);

      const waterDrop = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), new THREE.MeshStandardMaterial({ 
        color: 0x4dd0e1,
        emissive: 0x4dd0e1,
        emissiveIntensity: 0.5
      }));
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      waterDrop.position.set(70, canReachWater ? 10 : 25, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      scene.add(waterDrop);
      objectives.push(waterDrop);

      // Optimized enemies - only 2 instead of 3
      const enemyRoutes = [
        { path: [{x: 10, z: 10}, {x: 10, z: -10}, {x: -10, z: -10}], speed: 3 },
        { path: [{x: 45, z: 0}, {x: 45, z: 15}, {x: 60, z: 15}], speed: 3.5 }
      ];

      enemyRoutes.forEach((route, idx) => {
        const enemyGroup = new THREE.Group();
        
        // Simplified enemy geometry
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 8, 8),
          new THREE.MeshStandardMaterial({ 
            color: 0x8B0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.3
          })
        );
        enemyGroup.add(body);

        const eye1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        eye1.position.set(-0.2, 0.3, 0.7);
        enemyGroup.add(eye1);

        const eye2 = eye1.clone();
        eye2.position.set(0.2, 0.3, 0.7);
        enemyGroup.add(eye2);

        enemyGroup.position.set(route.path[0].x, 1, route.path[0].z);
        scene.add(enemyGroup);
        
        enemies.push({
          mesh: enemyGroup,
          patrolPath: route.path,
          pathIndex: 0,
          speed: route.speed,
          detectionRange: 12,
          chaseSpeed: 5,
          state: 'patrol',
          attackCooldown: 0,
          attackDamage: 15
        });
      });

    } else if (activeMission.mission_number === 2) {
      addLog("Mission 2: Lab infiltration", 'warning');
      scene.background = new THREE.Color(0x1a1a2e);
    }

    const keys = {};
    
    const handleKeyDown = (e) => { 
      keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && isOnGround) {
        playerVelocityY = jumpForce;
        isOnGround = false;
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
              setLeverStates(prev => ({ ...prev, [elem.userData.id]: !prev[elem.userData.id] }));
              addLog(`✓ Lever activated!`, 'info');
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
            }
          }
        });
      }
    };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const clock = new THREE.Clock();
    let aiUpdateTimer = 0;
    
    const animate = () => {
      const delta = clock.getDelta();
      aiUpdateTimer += delta;

      playerVelocityY += gravity * delta;
      
      const speed = keys['shift'] ? 20 : 10;
      const direction = new THREE.Vector3();

      if (keys['w']) direction.z -= 1;
      if (keys['s']) direction.z += 1;
      if (keys['a']) direction.x -= 1;
      if (keys['d']) direction.x += 1;

      const targetPosition = new THREE.Vector3(player.position.x, 0, player.position.z);

      if (direction.length() > 0) {
        direction.normalize();
        targetPosition.x += direction.x * speed * delta;
        targetPosition.z += direction.z * speed * delta;
      }
      
      let newY = player.position.y + playerVelocityY * delta;

      isOnGround = false;

      if (newY - playerHalfHeight <= 0) {
          newY = playerHalfHeight;
          playerVelocityY = 0;
          isOnGround = true;
      }

      let actualX = targetPosition.x;
      let actualZ = targetPosition.z;
      
      obstacles.forEach(obs => {
        const obsBox = new THREE.Box3().setFromObject(obs);
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(targetPosition.x, newY, targetPosition.z),
            new THREE.Vector3(playerRadius * 2, playerHalfHeight * 2, playerRadius * 2)
        );

        if (playerVelocityY < 0 && 
            (player.position.y - playerHalfHeight) >= (obsBox.max.y - 0.1) &&
            (newY - playerHalfHeight) < (obsBox.max.y + 0.1) &&
            playerBox.intersectsBox(obsBox)
        ) {
            newY = obsBox.max.y + playerHalfHeight;
            playerVelocityY = 0;
            isOnGround = true;
        }
        
        if (playerBox.intersectsBox(obsBox)) {
            actualX = player.position.x;
            actualZ = player.position.z;
        }
      });

      player.position.set(actualX, newY, actualZ);
      setPlayerPosition({ x: actualX, y: newY, z: actualZ });

      // Update AI less frequently (every 0.1 seconds instead of every frame)
      if (aiUpdateTimer > 0.1) {
        aiUpdateTimer = 0;
        
        enemies.forEach(enemy => {
          const distanceToPlayer = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(enemy.mesh.position.x, enemy.mesh.position.z));
          
          if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= 0.1;
          }

          if (distanceToPlayer < enemy.detectionRange) {
            enemy.state = 'chase';
            
            const dir = new THREE.Vector2(
              player.position.x - enemy.mesh.position.x,
              player.position.z - enemy.mesh.position.z
            ).normalize();
            
            enemy.mesh.position.x += dir.x * enemy.chaseSpeed * 0.1;
            enemy.mesh.position.z += dir.y * enemy.chaseSpeed * 0.1;
            
            enemy.mesh.lookAt(new THREE.Vector3(player.position.x, enemy.mesh.position.y, player.position.z));
            
            if (distanceToPlayer < 2 && enemy.attackCooldown <= 0) {
              setPlayerHealth(prev => {
                const newHealth = Math.max(0, prev - enemy.attackDamage);
                if (newHealth <= 0) {
                  addLog("DEFEATED! Respawning...", 'error');
                  player.position.set(0, 1, 0);
                  return 100;
                }
                addLog(`Enemy attacked! Health: ${newHealth}`, 'error');
                return newHealth;
              });
              enemy.attackCooldown = 2;
            }
          } else {
            enemy.state = 'patrol';
            
            const target = enemy.patrolPath[enemy.pathIndex];
            const targetPos = new THREE.Vector2(target.x, target.z);
            const enemyPos = new THREE.Vector2(enemy.mesh.position.x, enemy.mesh.position.z);
            
            if (enemyPos.distanceTo(targetPos) < 1) {
              enemy.pathIndex = (enemy.pathIndex + 1) % enemy.patrolPath.length;
            } else {
              const dir = new THREE.Vector2(
                target.x - enemy.mesh.position.x,
                target.z - enemy.mesh.position.z
              ).normalize();
              
              enemy.mesh.position.x += dir.x * enemy.speed * 0.1;
              enemy.mesh.position.z += dir.y * enemy.speed * 0.1;
            }
          }
        });
      }

      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          
          if (distance < 2 && player.position.y < 2) {
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
      });

      camera.position.set(player.position.x, player.position.y + 15, player.position.z + 22);
      camera.lookAt(player.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
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
              
              {/* Health bar */}
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-mono">HEALTH:</span>
                  <span className={`text-xs font-mono font-bold ${
                    playerHealth > 60 ? 'text-green-400' : 
                    playerHealth > 30 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{playerHealth}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      playerHealth > 60 ? 'bg-green-500' : 
                      playerHealth > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${playerHealth}%` }}
                  />
                </div>
              </div>
              
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
              <p>W/A/S/D: Move | SPACE: Jump | E: Interact | Shift: Sprint</p>
              <p className="text-red-400 mt-1 font-bold flex items-center gap-1">
                <Bug className="w-3 h-3" />
                Avoid hostile insects!
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
                  <li>Avoid red ant enemies - they patrol and chase!</li>
                  <li>Jump (SPACE) to climb the SALT SHAKER</li>
                  <li>Press [E] on button → activate fork bridge</li>
                  <li>Step on PRESSURE PLATE</li>
                  <li>Press [E] on KNIFE lever</li>
                  <li>Jump onto rising plate → reach WATER</li>
                </ol>
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
                  <span className="text-sm font-mono text-white">Button</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${puzzleStates.plate1 ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${puzzleStates.plate1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Plate</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${leverStates.lever1 ? 'bg-green-900/20' : 'bg-gray-800/20'}`}>
                  <CheckCircle className={`w-4 h-4 ${leverStates.lever1 ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className="text-sm font-mono text-white">Lever</span>
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
