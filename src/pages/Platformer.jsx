import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Lock, CheckCircle, AlertTriangle, FileText, HardDrive, Eye, ChevronRight } from "lucide-react";
import EnhancedHackingTerminal from "../components/platformer/EnhancedHackingTerminal";
import { getLevel, getAllLevelIds } from "../components/platformer/LevelDesigns";

export default function Platformer() {
  const mountRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState('lab_interior');
  const [showHacking, setShowHacking] = useState(false);
  const [currentTerminal, setCurrentTerminal] = useState(null);
  const [collectedIntel, setCollectedIntel] = useState([]);
  const [hackedTerminals, setHackedTerminals] = useState([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const levelConfig = getLevel(currentLevel);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(levelConfig.environment.background);
    scene.fog = new THREE.Fog(
      levelConfig.environment.fog.color,
      levelConfig.environment.fog.near,
      levelConfig.environment.fog.far
    );

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      levelConfig.environment.ambient,
      0.6
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      levelConfig.environment.lighting.color,
      levelConfig.environment.lighting.intensity
    );
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: levelConfig.environment.background,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create detailed humanoid player
    const playerGroup = new THREE.Group();

    // Body with texture
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.3,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      metalness: 0.1,
      roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.6;
    head.castShadow = true;
    playerGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 2.7, 0.35);
    playerGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 2.7, 0.35);
    playerGroup.add(rightEye);

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.15, 1.2, 8, 16);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.3,
      roughness: 0.7
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.65, 1.5, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.65, 1.5, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.2, 1, 8, 16);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      metalness: 0.3,
      roughness: 0.7
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0.5, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0.5, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);

    // Platforms
    const platforms = [];
    levelConfig.platforms.forEach(p => {
      const platformGeometry = new THREE.BoxGeometry(p.w, p.h, p.d);
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: p.color,
        metalness: 0.2,
        roughness: 0.8
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(p.x, p.y, p.z);
      platform.castShadow = true;
      platform.receiveShadow = true;
      scene.add(platform);
      platforms.push({ mesh: platform, ...p });
    });

    // Obstacles
    levelConfig.obstacles.forEach(obs => {
      if (obs.type === 'laser') {
        const laserGeometry = new THREE.BoxGeometry(0.1, 3, 0.1);
        const laserMaterial = new THREE.MeshStandardMaterial({
          color: obs.color,
          emissive: obs.color,
          emissiveIntensity: 1
        });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.set(obs.x, obs.y + 1.5, obs.z);
        scene.add(laser);
      }
    });

    // Terminals
    const terminalObjects = [];
    levelConfig.terminals.forEach(t => {
      const isHacked = hackedTerminals.includes(t.id);
      const terminalGroup = new THREE.Group();

      const screenGeometry = new THREE.BoxGeometry(1, 0.8, 0.1);
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: isHacked ? 0x10b981 : 0x1a1a1a,
        emissive: isHacked ? 0x10b981 : 0x00ff00,
        emissiveIntensity: isHacked ? 0.8 : 0.5,
        metalness: 0.8,
        roughness: 0.2
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.y = 0.5;
      terminalGroup.add(screen);

      const baseGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.8);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.6,
        roughness: 0.4
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      terminalGroup.add(base);

      terminalGroup.position.set(t.x, t.y, t.z);
      terminalGroup.userData = { terminal: t };
      scene.add(terminalGroup);
      terminalObjects.push(terminalGroup);
    });

    // Collectibles
    const collectibleObjects = [];
    levelConfig.collectibles.forEach(c => {
      const collectibleGroup = new THREE.Group();

      let geometry, material;
      if (c.type === 'data_chip') {
        geometry = new THREE.BoxGeometry(0.4, 0.05, 0.6);
        material = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          emissive: 0x3b82f6,
          emissiveIntensity: 0.5,
          metalness: 0.8
        });
      } else if (c.type === 'evidence') {
        geometry = new THREE.BoxGeometry(0.3, 0.4, 0.2);
        material = new THREE.MeshStandardMaterial({
          color: 0xeab308,
          emissive: 0xeab308,
          emissiveIntensity: 0.5
        });
      } else {
        geometry = new THREE.SphereGeometry(0.3, 16, 16);
        material = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0x8b5cf6,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.8
        });
      }

      const collectible = new THREE.Mesh(geometry, material);
      collectible.castShadow = true;
      collectibleGroup.add(collectible);
      collectibleGroup.position.set(c.x, c.y, c.z);
      collectibleGroup.userData = { collectible: c };
      scene.add(collectibleGroup);
      collectibleObjects.push(collectibleGroup);
    });

    // Player controls
    const keys = {};
    const velocity = new THREE.Vector3();
    let isJumping = false;
    let jumpVelocity = 0;

    const handleKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation
    const clock = new THREE.Clock();
    let walkCycle = 0;

    const animate = () => {
      const delta = clock.getDelta();

      // Player movement
      const speed = 12;
      const direction = new THREE.Vector3();

      if (keys['a']) direction.x -= 1;
      if (keys['d']) direction.x += 1;

      if (direction.length() > 0) {
        direction.normalize();
        velocity.x = direction.x * speed * delta;
        playerGroup.position.x += velocity.x;

        // Walking animation
        walkCycle += delta * 10;
        leftLeg.rotation.x = Math.sin(walkCycle) * 0.5;
        rightLeg.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
        leftArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
        rightArm.rotation.x = Math.sin(walkCycle) * 0.3;
      } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
      }

      // Jumping
      if (keys[' '] && !isJumping) {
        isJumping = true;
        jumpVelocity = 15;
      }

      if (isJumping) {
        jumpVelocity -= 35 * delta;
        playerGroup.position.y += jumpVelocity * delta;

        platforms.forEach(platform => {
          if (Math.abs(playerGroup.position.x - platform.x) < platform.w / 2 &&
            Math.abs(playerGroup.position.z - platform.z) < platform.d / 2) {
            if (playerGroup.position.y <= platform.y + platform.h / 2 + 0.5 && jumpVelocity < 0) {
              playerGroup.position.y = platform.y + platform.h / 2 + 0.5;
              isJumping = false;
              jumpVelocity = 0;
            }
          }
        });

        if (playerGroup.position.y <= 0) {
          playerGroup.position.y = 0;
          isJumping = false;
          jumpVelocity = 0;
        }
      }

      // Terminal interaction
      terminalObjects.forEach(terminal => {
        const distance = playerGroup.position.distanceTo(terminal.position);
        if (distance < 3) {
          terminal.scale.set(1.2, 1.2, 1.2);
          terminal.rotation.y += delta * 2;
          if (keys['e'] && !hackedTerminals.includes(terminal.userData.terminal.id)) {
            setCurrentTerminal(terminal.userData.terminal);
            setShowHacking(true);
            keys['e'] = false;
          }
        } else {
          terminal.scale.set(1, 1, 1);
          terminal.rotation.y = 0;
        }
      });

      // Collectible collection
      collectibleObjects.forEach((obj, index) => {
        obj.rotation.y += delta * 2;
        obj.position.y += Math.sin(Date.now() * 0.003 + index) * 0.01;

        if (playerGroup.position.distanceTo(obj.position) < 2) {
          const collectible = obj.userData.collectible;
          if (!collectedIntel.some(i => i.clue === collectible.clue)) {
            setCollectedIntel(prev => [...prev, collectible]);
          }
          scene.remove(obj);
          collectibleObjects.splice(index, 1);
        }
      });

      // Check level completion
      const allTerminalsHacked = levelConfig.terminals.every(t =>
        hackedTerminals.includes(t.id)
      );
      if (allTerminalsHacked && !showLevelComplete) {
        setShowLevelComplete(true);
      }

      // Camera follow with smooth interpolation
      const targetX = playerGroup.position.x + 8;
      const targetY = playerGroup.position.y + 10;
      const targetZ = playerGroup.position.z + 18;

      camera.position.x += (targetX - camera.position.x) * 0.1;
      camera.position.y += (targetY - camera.position.y) * 0.1;
      camera.position.z += (targetZ - camera.position.z) * 0.1;
      camera.lookAt(playerGroup.position);

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
  }, [currentLevel, hackedTerminals]);

  const levelConfig = getLevel(currentLevel);
  const allLevels = getAllLevelIds();
  const currentLevelIndex = allLevels.indexOf(currentLevel);

  const handleNextLevel = () => {
    if (currentLevelIndex < allLevels.length - 1) {
      setCurrentLevel(allLevels[currentLevelIndex + 1]);
      setShowLevelComplete(false);
    }
  };

  const getIconForType = (type) => {
    if (type === 'data_chip') return <HardDrive className="w-4 h-4 text-blue-400" />;
    if (type === 'evidence') return <FileText className="w-4 h-4 text-yellow-400" />;
    return <Eye className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h1 className="text-2xl font-bold text-white font-mono">
              FIELD INFILTRATION: {levelConfig.name.toUpperCase()}
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm">
            {levelConfig.description}
          </p>
          <p className="text-yellow-300 font-mono text-xs mt-2">
            Mission: Extract intel from all terminals • Level {currentLevelIndex + 1}/{allLevels.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Card className="bg-black border-blue-500/20 overflow-hidden">
              <div className="relative">
                <div ref={mountRef} className="w-full h-[600px]" />
                <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm border border-gray-600 rounded p-3 font-mono text-xs text-gray-300">
                  <p className="mb-1"><strong>A/D:</strong> Move | <strong>Space:</strong> Jump | <strong>E:</strong> Interact</p>
                  <p className="text-yellow-400">Collect intel and hack terminals to progress</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Intel Collected ({collectedIntel.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {collectedIntel.map((item, i) => (
                    <div key={i} className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        {getIconForType(item.type)}
                        <span className="text-purple-300 font-mono text-xs uppercase">{item.type}</span>
                      </div>
                      <p className="text-gray-300 font-mono text-xs">{item.clue}</p>
                    </div>
                  ))}
                  {collectedIntel.length === 0 && (
                    <p className="text-gray-500 font-mono text-xs">No intel collected yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-3">Terminals</h3>
                <div className="space-y-2">
                  {levelConfig.terminals.map((terminal, i) => (
                    <div key={terminal.id} className="flex items-center gap-2">
                      {hackedTerminals.includes(terminal.id) ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-mono text-sm flex-1 ${
                        hackedTerminals.includes(terminal.id) ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {terminal.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showHacking && currentTerminal && (
          <EnhancedHackingTerminal
            terminal={currentTerminal}
            onSuccess={(intel) => {
              setHackedTerminals(prev => [...prev, currentTerminal.id]);
              if (intel) {
                setCollectedIntel(prev => [...prev, intel]);
              }
              setShowHacking(false);
              base44.auth.me().then(user => {
                base44.auth.updateMe({
                  credits: (user.credits || 0) + 500
                });
              }).catch(() => {});
            }}
            onClose={() => setShowHacking(false)}
          />
        )}

        {showLevelComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-[#0F1729] border-green-500/50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 font-mono mb-2">
                  LEVEL COMPLETE
                </h2>
                <p className="text-gray-400 font-mono text-sm mb-6">
                  All terminals hacked. Intel extracted successfully.
                </p>
                {currentLevelIndex < allLevels.length - 1 ? (
                  <Button
                    onClick={handleNextLevel}
                    className="w-full bg-green-600 hover:bg-green-700 font-mono"
                  >
                    <ChevronRight className="w-5 h-5 mr-2" />
                    PROCEED TO NEXT LEVEL
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-yellow-400 font-mono text-sm">
                      ALL LEVELS COMPLETE - RETURN TO A.N.T. CONSOLE
                    </p>
                    <Button
                      onClick={() => window.location.href = '/Simulator'}
                      className="w-full bg-blue-600 hover:bg-blue-700 font-mono"
                    >
                      RETURN TO CONSOLE
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}