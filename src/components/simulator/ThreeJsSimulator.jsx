import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeJsSimulator({ gameStarted, onStatsUpdate }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const playerRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!gameStarted || !mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 20, 100);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground (giant surface to simulate micro scale)
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1f2e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grid to show scale
    const gridHelper = new THREE.GridHelper(200, 50, 0x3b82f6, 0x1a1f2e);
    scene.add(gridHelper);

    // Player (sphere that represents the miniaturized object)
    const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const playerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.2
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.5, 0);
    player.castShadow = true;
    scene.add(player);
    playerRef.current = player;

    // Collectible orbs (blue - shrink you)
    const orbs = [];
    for (let i = 0; i < 15; i++) {
      const orbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const orbMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x60a5fa,
        emissive: 0x60a5fa,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        Math.random() * 80 - 40,
        0.3,
        Math.random() * 80 - 40
      );
      orb.userData.type = 'collect';
      scene.add(orb);
      orbs.push(orb);
    }

    // Obstacles (red - avoid these)
    const obstacles = [];
    for (let i = 0; i < 10; i++) {
      const size = Math.random() * 2 + 1;
      const obstacleGeometry = new THREE.BoxGeometry(size, size * 2, size);
      const obstacleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.3
      });
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(
        Math.random() * 60 - 30,
        size,
        Math.random() * 60 - 30
      );
      obstacle.castShadow = true;
      obstacle.userData.type = 'obstacle';
      scene.add(obstacle);
      obstacles.push(obstacle);
    }

    // Goal (green - reach this)
    const goalGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    const goalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7
    });
    const goal = new THREE.Mesh(goalGeometry, goalMaterial);
    goal.position.set(50, 0.25, 50);
    goal.userData.type = 'goal';
    scene.add(goal);

    // Add particles for atmosphere
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Game state
    let velocity = new THREE.Vector3();
    let itemsCollected = 0;
    let miniaturizationLevel = 100;
    let score = 0;
    let gameTime = 0;

    // Controls
    const keys = {};
    const handleKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse controls for camera
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      const delta = clock.getDelta();
      gameTime += delta;

      // Player movement
      const speed = keys['shift'] ? 15 : 8;
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
      }

      // Jumping
      if (keys[' '] && player.position.y <= 0.5) {
        velocity.y = 8;
      }
      
      // Gravity
      velocity.y -= 25 * delta;
      player.position.y += velocity.y * delta;
      if (player.position.y < 0.5) {
        player.position.y = 0.5;
        velocity.y = 0;
      }

      // Camera follow player with mouse influence
      camera.position.x = player.position.x + mouseX * 5;
      camera.position.y = player.position.y + 5 + mouseY * 3;
      camera.position.z = player.position.z + 10 - mouseY * 5;
      camera.lookAt(player.position);

      // Animate orbs
      orbs.forEach((orb, index) => {
        orb.position.y = 0.3 + Math.sin(gameTime * 2 + index) * 0.2;
        orb.rotation.y += delta * 2;

        // Check collision with player
        if (orb.visible && player.position.distanceTo(orb.position) < 1) {
          orb.visible = false;
          itemsCollected++;
          miniaturizationLevel = Math.max(10, miniaturizationLevel - 6);
          score += 100;
          
          // Shrink player
          const scale = miniaturizationLevel / 100;
          player.scale.set(scale, scale, scale);
          
          setMessage(`Shrinking! Size: ${miniaturizationLevel}%`);
          setTimeout(() => setMessage(""), 2000);
        }
      });

      // Animate obstacles
      obstacles.forEach((obstacle, index) => {
        obstacle.rotation.y += delta * 0.5;
        obstacle.position.y = Math.abs(Math.sin(gameTime + index) * 0.5) + 1;
      });

      // Animate goal
      goal.rotation.y += delta;
      goal.position.y = 0.25 + Math.sin(gameTime * 2) * 0.1;

      // Check goal
      if (player.position.distanceTo(goal.position) < 3) {
        setMessage("🎉 YOU WIN! Goal Reached!");
        score += 1000;
      }

      // Animate particles
      particles.rotation.y += delta * 0.1;

      // Update stats
      onStatsUpdate({
        itemsCollected,
        miniaturizationLevel,
        score,
        time: Math.floor(gameTime)
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [gameStarted, onStatsUpdate]);

  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        className="w-full h-[600px] rounded-lg overflow-hidden"
      />
      {message && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg text-xl font-bold backdrop-blur-sm border border-blue-500/50">
          {message}
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
        <p>Use W/A/S/D to move, Mouse to look, Space to jump</p>
      </div>
    </div>
  );
}