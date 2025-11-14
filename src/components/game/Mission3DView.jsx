
import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, FileText, Hammer } from "lucide-react";
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
  const [waterDroplets, setWaterDroplets] = useState([]);
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
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8dc, 1);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Kitchen counter (ground for miniaturized agents)
    const counterGeometry = new THREE.PlaneGeometry(200, 200);
    const counterTexture = new THREE.TextureLoader().load('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik0wIDAgTDIwMCAyMDAiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTAgMjAwIEwyMDAgMCIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=');
    counterTexture.wrapS = counterTexture.wrapT = THREE.RepeatWrapping;
    counterTexture.repeat.set(20, 20);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
      map: counterTexture,
      roughness: 0.4,
      metalness: 0.1
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.rotation.x = -Math.PI / 2;
    counter.receiveShadow = true;
    scene.add(counter);

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

    let objectives = [];
    let obstacles = [];
    let puzzleElements = [];
    let destructibleObjects = [];
    let interactiveObjects = [];
    let missionComplete = false;

    if (activeMission.mission_number === 1) {
      addLog("Mission 1: Kitchen infiltration - reach the water source", 'info');
      
      // KITCHEN BOWL (massive obstacle)
      const bowlGroup = new THREE.Group();
      const bowlRadius = 15;
      const bowlHeight = 8;
      const bowlGeometry = new THREE.SphereGeometry(bowlRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const bowlMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.8,
        side: THREE.DoubleSide
      });
      const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
      bowl.position.set(30, bowlHeight / 2, 20);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      bowlGroup.add(bowl);
      scene.add(bowlGroup);
      obstacles.push(bowl);

      // SPOON (large interactive object)
      const spoonHandle = new THREE.CylinderGeometry(0.5, 0.5, 20, 16);
      const spoonHead = new THREE.SphereGeometry(2, 16, 16);
      const spoonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1
      });
      const spoonGroup = new THREE.Group();
      const handle = new THREE.Mesh(spoonHandle, spoonMaterial);
      handle.rotation.z = Math.PI / 2;
      const head = new THREE.Mesh(spoonHead, spoonMaterial);
      head.position.x = 10;
      head.scale.set(1, 0.5, 1);
      spoonGroup.add(handle);
      spoonGroup.add(head);
      spoonGroup.position.set(-15, 1, -10);
      spoonGroup.rotation.y = Math.PI / 4;
      spoonGroup.castShadow = true;
      scene.add(spoonGroup);
      obstacles.push(spoonGroup);

      // COFFEE MUG (climbable)
      const mugBody = new THREE.CylinderGeometry(5, 4, 10, 32);
      const mugHandle = new THREE.TorusGeometry(3, 0.5, 16, 32, Math.PI);
      const mugMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.7,
        metalness: 0.2
      });
      const mug = new THREE.Mesh(mugBody, mugMaterial);
      mug.position.set(50, 5, -20);
      mug.castShadow = true;
      mug.receiveShadow = true;
      scene.add(mug);
      const mugHandleMesh = new THREE.Mesh(mugHandle, mugMaterial);
      mugHandleMesh.position.set(50, 5, -20);
      mugHandleMesh.rotation.y = -Math.PI / 2;
      mugHandleMesh.rotation.x = Math.PI / 2;
      scene.add(mugHandleMesh);
      obstacles.push(mug);

      // BREADCRUMBS (destructible obstacles)
      for (let i = 0; i < 8; i++) {
        const crumbSize = 1 + Math.random() * 2;
        const crumbGeometry = new THREE.DodecahedronGeometry(crumbSize, 0);
        const crumbMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xf4a460,
          roughness: 0.9
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

      // BUTTER STICK (slippery hazard + platform)
      const butterGeometry = new THREE.BoxGeometry(8, 2, 4);
      const butterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffdb58,
        roughness: 0.1,
        metalness: 0.2,
        emissive: 0xffdb58,
        emissiveIntensity: 0.1
      });
      const butter = new THREE.Mesh(butterGeometry, butterMaterial);
      butter.position.set(-25, 1, 15);
      butter.castShadow = true;
      butter.receiveShadow = true;
      butter.userData = { type: 'slippery', slipFactor: 3 };
      scene.add(butter);
      interactiveObjects.push(butter);

      // SALT SHAKER (tall obstacle with button on top)
      const saltBase = new THREE.CylinderGeometry(3, 3, 15, 16);
      const saltTop = new THREE.ConeGeometry(3, 5, 16);
      const saltMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0.9
      });
      const saltShaker = new THREE.Mesh(saltBase, saltMaterial);
      saltShaker.position.set(-5, 7.5, -25);
      saltShaker.castShadow = true;
      scene.add(saltShaker);
      const saltTopMesh = new THREE.Mesh(saltTop, saltMaterial);
      saltTopMesh.position.set(-5, 17.5, -25);
      scene.add(saltTopMesh);
      obstacles.push(saltShaker);

      // BUTTON ON SALT SHAKER TOP
      const buttonGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 16);
      const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissive: activatedButtons.includes('button1') ? 0x10b981 : 0xef4444,
        emissiveIntensity: 0.6
      });
      const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button1.position.set(-5, 20.5, -25);
      button1.userData = { type: 'button', id: 'button1' };
      scene.add(button1);
      puzzleElements.push(button1);

      // FORK (creates bridge when button pressed)
      if (activatedButtons.includes('button1')) {
        const forkHandle = new THREE.BoxGeometry(2, 0.5, 25);
        const forkMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xc0c0c0,
          metalness: 0.9,
          roughness: 0.1
        });
        const fork = new THREE.Mesh(forkHandle, forkMaterial);
        fork.position.set(15, 1, -15);
        fork.rotation.y = Math.PI / 6;
        fork.castShadow = true;
        fork.receiveShadow = true;
        scene.add(fork);
        
        // Fork prongs
        for (let i = 0; i < 4; i++) {
          const prong = new THREE.BoxGeometry(0.5, 0.5, 5);
          const prongMesh = new THREE.Mesh(prong, forkMaterial);
          prongMesh.position.set(15 + (i - 1.5) * 0.7, 1, -27);
          prongMesh.rotation.y = Math.PI / 6;
          prongMesh.castShadow = true;
          scene.add(prongMesh);
        }
        obstacles.push(fork); // Add fork as an obstacle
      }

      // NAPKIN (climbable cloth)
      const napkinGeometry = new THREE.BoxGeometry(12, 0.2, 12);
      const napkinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.8,
        side: THREE.DoubleSide
      });
      const napkin = new THREE.Mesh(napkinGeometry, napkinMaterial);
      napkin.position.set(35, 0.1, -5);
      napkin.rotation.y = Math.PI / 8;
      napkin.receiveShadow = true;
      scene.add(napkin);
      obstacles.push(napkin); // Napkin can be an obstacle/platform

      // PRESSURE PLATE (on napkin)
      const plateGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 32);
      const plateMaterial = new THREE.MeshStandardMaterial({ 
        color: puzzleStates.plate1 ? 0x10b981 : 0x6b7280,
        emissive: puzzleStates.plate1 ? 0x10b981 : 0x000000,
        emissiveIntensity: 0.5,
        metalness: 0.7
      });
      const plate1 = new THREE.Mesh(plateGeometry, plateMaterial);
      plate1.position.set(35, 0.3, -5);
      plate1.userData = { type: 'pressure_plate', id: 'plate1' };
      scene.add(plate1);
      puzzleElements.push(plate1);

      // KNIFE (lever to activate)
      const knifeBlade = new THREE.BoxGeometry(1, 0.1, 15);
      const knifeHandle = new THREE.BoxGeometry(1.5, 0.5, 5);
      const knifeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1
      });
      const knifeHandleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.7
      });
      const knife = new THREE.Group();
      const blade = new THREE.Mesh(knifeBlade, knifeMaterial);
      blade.position.z = 7.5;
      const handleMesh = new THREE.Mesh(knifeHandle, knifeHandleMaterial);
      handleMesh.position.z = -2.5;
      knife.add(blade);
      knife.add(handleMesh);
      knife.position.set(40, 0.5, 10);
      knife.rotation.y = -Math.PI / 4;
      knife.castShadow = true;
      knife.userData = { type: 'lever', id: 'lever1' };
      scene.add(knife);
      puzzleElements.push(knife);

      // PLATE (platform that rises when lever activated)
      const dishGeometry = new THREE.CylinderGeometry(8, 7, 1, 32);
      const dishMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.6
      });
      const plate = new THREE.Mesh(dishGeometry, dishMaterial);
      const plateHeight = leverStates.lever1 ? 8 : 0.5;
      plate.position.set(55, plateHeight, 0);
      plate.castShadow = true;
      plate.receiveShadow = true;
      scene.add(plate);
      interactiveObjects.push(plate);
      obstacles.push(plate); // Plate can be an obstacle/platform

      // SUGAR CUBES (stackable/destructible)
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
          roughness: 0.8
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

      // WATER DROPLET (objective)
      const waterGeometry = new THREE.SphereGeometry(3, 32, 32);
      const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4dd0e1,
        transparent: true,
        opacity: 0.8,
        emissive: 0x4dd0e1,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.2
      });
      const waterDrop = new THREE.Mesh(waterGeometry, waterMaterial);
      const canReachWater = activatedButtons.includes('button1') && puzzleStates.plate1 && leverStates.lever1;
      waterDrop.position.set(70, canReachWater ? 10 : 25, 5);
      waterDrop.userData = { type: 'water_source', accessible: canReachWater };
      waterDrop.castShadow = true;
      scene.add(waterDrop);
      objectives.push(waterDrop);

      // STEAM/MIST (hazard near water)
      const mistParticles = [];
      if (canReachWater) {
        for (let i = 0; i < 30; i++) {
          const mistGeometry = new THREE.SphereGeometry(0.5, 8, 8);
          const mistMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
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

      // CRUMBS falling hazard
      // Randomly spawn a falling crumb
      if (Math.random() > 0.7) { 
        const fallingCrumb = new THREE.Mesh(
          new THREE.DodecahedronGeometry(2, 0),
          new THREE.MeshStandardMaterial({ color: 0xf4a460 })
        );
        fallingCrumb.position.set(
          Math.random() * 60 - 30,
          30,
          Math.random() * 40 - 20
        );
        fallingCrumb.userData = { type: 'falling_hazard', velocity: -0.2 };
        scene.add(fallingCrumb);
        interactiveObjects.push(fallingCrumb);
      }

    } else if (activeMission.mission_number === 2) {
      addLog("Mission 2: Lab infiltration and data extraction", 'warning');
      
      // Switch to lab environment
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 30, 100);

      // Lab floor
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
        // Interact with buttons, levers, pressure plates
        puzzleElements.forEach(elem => {
          const distance = player.position.distanceTo(elem.position);
          if (distance < 3) {
            if (elem.userData.type === 'button') {
              if (!activatedButtons.includes(elem.userData.id)) {
                setActivatedButtons(prev => [...prev, elem.userData.id]);
                addLog(`Button ${elem.userData.id} activated!`, 'success');
              }
            } else if (elem.userData.type === 'lever') {
              const leverId = elem.userData.id;
              setLeverStates(prev => ({ ...prev, [leverId]: !prev[leverId] }));
              addLog(`Lever ${leverId} ${!leverStates[leverId] ? 'activated' : 'deactivated'}`, 'info');
            } else if (elem.userData.type === 'pressure_plate') {
              // Pressure plates are often activated by just being on them, but 'E' can manually trigger them
              setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
              addLog(`Pressure plate ${elem.userData.id} manually activated`, 'info');
            }
          }
        });

        // Destroy objects
        destructibleObjects.forEach((obj, index) => {
          const distance = player.position.distanceTo(obj.position);
          if (distance < 3) {
            obj.userData.health -= 1;
            if (obj.userData.health <= 0) {
              addLog(`Destroyed ${obj.userData.id}`, 'info');
              setDestroyedObjects(prev => [...prev, obj.userData.id]);
              scene.remove(obj);
              // Remove from arrays
              destructibleObjects.splice(index, 1);
              obstacles = obstacles.filter(o => o !== obj);
            } else {
              addLog(`Hit ${obj.userData.id} - Health: ${obj.userData.health}`, 'warning');
              // Visual feedback for hitting an object
              obj.material.emissive.setHex(0xff0000);
              obj.material.emissiveIntensity = 0.5;
              setTimeout(() => {
                obj.material.emissive.setHex(obj.material.color.getHex()); // Revert to base color if it's not emissive by default
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

        // Check for collisions with obstacles
        obstacles.forEach(obs => {
          // A simple bounding box check for generic obstacles
          const obsBox = new THREE.Box3().setFromObject(obs);
          const playerBox = new THREE.Box3().setFromCenterAndSize(
            newPosition,
            new THREE.Vector3(1, 2, 1) // Player's approximate bounding box size
          );
          if (obsBox.intersectsBox(playerBox)) {
            collision = true;
          }
        });

        // Check slippery surfaces
        interactiveObjects.forEach(obj => {
          if (obj.userData.type === 'slippery') {
            const distance = new THREE.Vector2(newPosition.x, newPosition.z)
              .distanceTo(new THREE.Vector2(obj.position.x, obj.position.z));
            // Consider the player to be "on" the slippery object if within a certain radius
            if (distance < 5) { // Assuming slippery objects are somewhat large
              onSlippery = true;
            }
          }
        });

        if (!collision) {
          player.position.add(newVelocity);
          setPlayerPosition({ x: player.position.x, y: player.position.y, z: player.position.z });
        }
      }

      // Check pressure plates (continuous activation)
      puzzleElements.forEach(elem => {
        if (elem.userData.type === 'pressure_plate') {
          const distance = new THREE.Vector2(player.position.x, player.position.z)
            .distanceTo(new THREE.Vector2(elem.position.x, elem.position.z));
          
          if (distance < 2) { // If player is close enough to activate
            if (!puzzleStates[elem.userData.id]) {
              setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: true }));
              addLog(`Pressure plate ${elem.userData.id} activated by proximity`, 'info');
            }
          } else {
            // Optional: Deactivate if player moves off, if that's desired behavior
            // if (puzzleStates[elem.userData.id]) {
            //   setPuzzleStates(prev => ({ ...prev, [elem.userData.id]: false }));
            //   addLog(`Pressure plate ${elem.userData.id} deactivated`, 'info');
            // }
          }
        }
      });

      // Check objectives
      objectives.forEach(obj => {
        if (obj.userData.type === 'water_source' && obj.userData.accessible) {
          const distance = player.position.distanceTo(obj.position);
          if (!missionComplete && distance < 5) { // Reachable and within range
            missionComplete = true;
            completeMission();
          }
        }

        // Animate objectives
        obj.position.y += Math.sin(clock.elapsedTime * 2) * 0.02;
        obj.rotation.y += delta * 0.5;
      });

      // Animate falling hazards and check player collision
      interactiveObjects.forEach((obj, index) => {
        if (obj.userData.type === 'falling_hazard') {
          obj.position.y += obj.userData.velocity;
          obj.rotation.x += 0.1;
          obj.rotation.y += 0.05;
          
          if (obj.position.y < 0) { // Remove if falls below ground
            scene.remove(obj);
            interactiveObjects.splice(index, 1);
          }
          
          const distance = player.position.distanceTo(obj.position);
          if (distance < 2 && obj.position.y < player.position.y + 1) { // Close enough and below player's head
            addLog("Hit by falling object! Mission reset.", 'error');
            player.position.set(0, 1, 0); // Reset player position
          }
        }
      });

      // Animate mist particles
      mistParticles.forEach(mist => {
        mist.position.y += mist.userData.velocity.y;
        if (mist.position.y > 20) { // Reset mist particle position if too high
            mist.position.y = 5 + Math.random() * 5; // Reset lower, but still within the area
            mist.position.x = 65 + Math.random() * 10;
            mist.position.z = 0 + Math.random() * 10;
        }
      });

      camera.position.x = player.position.x + mouseX * 8;
      camera.position.y = player.position.y + 12; // Increased camera height
      camera.position.z = player.position.z + 20; // Increased camera distance
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
                Hit objects multiple times to destroy them
              </p>
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
