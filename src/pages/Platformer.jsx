
import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import HackingTerminal from "../components/platformer/HackingTerminal";

export default function Platformer() {
  const mountRef = useRef(null);
  const [showHacking, setShowHacking] = useState(false);
  const [currentTerminal, setCurrentTerminal] = useState(null);
  const [foundClues, setFoundClues] = useState([]);
  const [hackedTerminals, setHackedTerminals] = useState([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a8c3a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create realistic humanoid player
    const playerGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.6;
    head.castShadow = true;
    playerGroup.add(head);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.65, 1.5, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.65, 1.5, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c5aa0 });
    
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

    // Platforms with varying heights
    const platforms = [];
    const platformData = [
      { x: 5, y: 0, z: 0, w: 10, h: 0.5, d: 5 },
      { x: 15, y: 2, z: 0, w: 5, h: 0.5, d: 5 },
      { x: 25, y: 4, z: 0, w: 8, h: 0.5, d: 5 },
      { x: 35, y: 6, z: -5, w: 6, h: 0.5, d: 6 },
      { x: 45, y: 3, z: -10, w: 7, h: 0.5, d: 7 },
      { x: 55, y: 8, z: -5, w: 10, h: 0.5, d: 5 },
    ];

    platformData.forEach(p => {
      const platformGeometry = new THREE.BoxGeometry(p.w, p.h, p.d);
      const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(p.x, p.y, p.z);
      platform.castShadow = true;
      platform.receiveShadow = true;
      scene.add(platform);
      platforms.push({ mesh: platform, ...p });
    });

    // Hidden computer terminals
    const terminals = [
      { x: 15, y: 3, z: 0, clue: "KEY: UP-UP-DOWN", id: "terminal1" },
      { x: 35, y: 7, z: -5, clue: "KEY: LEFT-RIGHT-LEFT", id: "terminal2" },
      { x: 55, y: 9, z: -5, clue: "KEY: DOWN-LEFT-UP", id: "terminal3" }
    ];

    const terminalObjects = [];
    terminals.forEach(t => {
      const terminalGroup = new THREE.Group();
      
      const screenGeometry = new THREE.BoxGeometry(1, 0.8, 0.1);
      const screenMaterial = new THREE.MeshStandardMaterial({ 
        color: hackedTerminals.includes(t.id) ? 0x10b981 : 0x1a1a1a,
        emissive: hackedTerminals.includes(t.id) ? 0x10b981 : 0x00ff00,
        emissiveIntensity: 0.5
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.y = 0.5;
      terminalGroup.add(screen);

      const baseGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.8);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      terminalGroup.add(base);

      terminalGroup.position.set(t.x, t.y, t.z);
      terminalGroup.userData = { terminal: t };
      scene.add(terminalGroup);
      terminalObjects.push(terminalGroup);
    });

    // Hidden clue markers
    const cluePositions = [
      { x: 8, y: 1, z: 2, clue: "UP-UP-DOWN" },
      { x: 28, y: 5, z: -2, clue: "LEFT-RIGHT-LEFT" },
      { x: 48, y: 4, z: -12, clue: "DOWN-LEFT-UP" }
    ];

    cluePositions.forEach(c => {
      const clueGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const clueMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.8
      });
      const clueSphere = new THREE.Mesh(clueGeometry, clueMaterial);
      clueSphere.position.set(c.x, c.y, c.z);
      clueSphere.userData = { clue: c.clue };
      scene.add(clueSphere);
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
      const speed = 10;
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
        jumpVelocity = 12;
      }

      if (isJumping) {
        jumpVelocity -= 30 * delta;
        playerGroup.position.y += jumpVelocity * delta;

        // Check platform collisions
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

      // Check terminal proximity
      terminalObjects.forEach(terminal => {
        const distance = playerGroup.position.distanceTo(terminal.position);
        if (distance < 3) {
          terminal.scale.set(1.2, 1.2, 1.2);
          if (keys['e']) {
            setCurrentTerminal(terminal.userData.terminal);
            setShowHacking(true);
            keys['e'] = false;
          }
        } else {
          terminal.scale.set(1, 1, 1);
        }
      });

      // Check clue collection
      scene.children.forEach(child => {
        if (child.userData.clue && playerGroup.position.distanceTo(child.position) < 2) {
          if (!foundClues.includes(child.userData.clue)) {
            setFoundClues(prev => [...prev, child.userData.clue]);
          }
          scene.remove(child);
        }
      });

      // Camera follow
      camera.position.x = playerGroup.position.x + 5;
      camera.position.y = playerGroup.position.y + 8;
      camera.position.z = playerGroup.position.z + 15;
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
  }, [hackedTerminals]);

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            FIELD INFILTRATION MODE
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Navigate the terrain, collect clues, hack terminals
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Card className="bg-black border-blue-500/20 overflow-hidden">
              <div className="relative">
                <div ref={mountRef} className="w-full h-[600px]" />
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded p-2 font-mono text-xs text-gray-300">
                  A/D: Move | Space: Jump | E: Interact with Terminal
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-3 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-green-400" />
                  Clues Found
                </h3>
                <div className="space-y-2">
                  {foundClues.map((clue, i) => (
                    <div key={i} className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2">
                      <p className="text-yellow-300 font-mono text-xs">{clue}</p>
                    </div>
                  ))}
                  {foundClues.length === 0 && (
                    <p className="text-gray-500 font-mono text-xs">No clues collected yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-3">Terminals</h3>
                <div className="space-y-2">
                  {['terminal1', 'terminal2', 'terminal3'].map((id, i) => (
                    <div key={id} className="flex items-center gap-2">
                      {hackedTerminals.includes(id) ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-mono text-sm ${
                        hackedTerminals.includes(id) ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        Terminal {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showHacking && currentTerminal && (
          <HackingTerminal
            terminal={currentTerminal}
            foundClues={foundClues}
            onSuccess={() => {
              setHackedTerminals(prev => [...prev, currentTerminal.id]);
              setShowHacking(false);
              // Award credits
              base44.auth.me().then(user => {
                base44.auth.updateMe({
                  credits: (user.credits || 0) + 500
                });
              });
            }}
            onClose={() => setShowHacking(false)}
          />
        )}
      </div>
    </div>
  );
}
