import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Target, Play } from "lucide-react";

export default function Mission3DView({ gameState, setGameState }) {
  const mountRef = useRef(null);
  const [missionLog, setMissionLog] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 0 });
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
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current || !activeMission) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f2e);
    scene.fog = new THREE.Fog(0x1a0f2e, 30, 80);

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
    const ambientLight = new THREE.AmbientLight(0x404070, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add point lights for atmosphere
    const blueLight = new THREE.PointLight(0x3b82f6, 2, 20);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xef4444, 1.5, 15);
    redLight.position.set(10, 5, 10);
    scene.add(redLight);

    // Ground - massive to show miniaturization scale
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

    // Grid for scale reference
    const gridHelper = new THREE.GridHelper(200, 100, 0x3b82f6, 0x1a1a3a);
    scene.add(gridHelper);

    // Player (you - the operative)
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

    // Mission-specific objects
    let objectives = [];

    if (activeMission.mission_number === 1) {
      // MISSION 1: Water Source
      addLog("Mission 1: Navigate to water source", 'info');
      
      // Giant water droplet (goal)
      const waterGeometry = new THREE.SphereGeometry(2, 32, 32);
      const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.7,
        emissive: 0x60a5fa,
        emissiveIntensity: 0.5
      });
      const waterDrop = new THREE.Mesh(waterGeometry, waterMaterial);
      waterDrop.position.set(25, 2, 25);
      waterDrop.userData.type = 'water_source';
      scene.add(waterDrop);
      objectives.push(waterDrop);

      // Floating text "NUXELAND" (password hint)
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
      sprite.position.set(15, 5, 15);
      sprite.scale.set(10, 2.5, 1);
      scene.add(sprite);
    } else if (activeMission.mission_number === 2) {
      // MISSION 2: Spider Threat
      addLog("Mission 2: Neutralize hostile threat", 'warning');
      
      // Giant spider (hostile)
      const spiderBody = new THREE.SphereGeometry(2.5, 16, 16);
      const spiderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.8
      });
      const spider = new THREE.Mesh(spiderBody, spiderMaterial);
      spider.position.set(20, 2.5, 20);
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

      // CS-Gas marker
      const gasMarker = new THREE.BoxGeometry(1, 1, 1);
      const gasMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.5
      });
      const gas = new THREE.Mesh(gasMarker, gasMaterial);
      gas.position.set(-10, 0.5, -10);
      gas.userData.type = 'gas_pellet';
      scene.add(gas);
      objectives.push(gas);
    } else if (activeMission.mission_number === 3) {
      // MISSION 3: Specimen Retrieval (moral dilemma)
      addLog("Mission 3: Retrieve specimen - WARNING: High bio-stress", 'error');
      
      // Giant specimen (fly)
      const specimenGeometry = new THREE.SphereGeometry(3, 16, 16);
      const specimenMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.4
      });
      const specimen = new THREE.Mesh(specimenGeometry, specimenMaterial);
      specimen.position.set(30, 3, 30);
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
    
    const handleKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
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
    let missionComplete = false;
    
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
        velocity.x = direction.x * speed * delta;
        velocity.z = direction.z * speed * delta;
        player.position.add(velocity);
        setPlayerPosition({ x: player.position.x, y: player.position.y, z: player.position.z });
      }

      // Camera follow
      camera.position.x = player.position.x + mouseX * 8;
      camera.position.y = player.position.y + 8;
      camera.position.z = player.position.z + 15;
      camera.lookAt(player.position);

      // Check objectives
      objectives.forEach(obj => {
        if (!missionComplete && player.position.distanceTo(obj.position) < 4) {
          missionComplete = true;
          completeMission();
        }

        // Animate objectives
        obj.position.y += Math.sin(clock.elapsedTime * 2) * 0.01;
        obj.rotation.y += delta;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [activeMission]);

  return (
    <div className="grid lg:grid-cols-4 gap-4 p-6">
      {/* 3D View */}
      <div className="lg:col-span-3">
        <Card className="bg-black border-blue-500/20 overflow-hidden">
          <div className="relative">
            <div 
              ref={mountRef} 
              className="w-full h-[600px]"
            />
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-blue-500/50 rounded p-3">
              <p className="text-blue-400 font-mono text-sm font-bold mb-1">
                {activeMission ? `MISSION ${activeMission.mission_number}` : 'AWAITING MISSION'}
              </p>
              <p className="text-gray-300 font-mono text-xs">
                {activeMission?.title || 'No active mission'}
              </p>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300">
              W/A/S/D: Move | Mouse: Look | Shift: Sprint
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

      {/* Mission Info */}
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
    </div>
  );
}