
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import * as THREE from "three";

export default function MatrixEscape({ onComplete }) {
  const mountRef = useRef(null);
  const [text, setText] = useState("");
  const [showFinal, setShowFinal] = useState(false);

  const messages = [
    "SYSTEM BREACH DETECTED...",
    "REALITY MATRIX COMPROMISED...",
    "TRUTH EXTRACTION: 100%",
    "YOU ARE NOT SUPPOSED TO BE HERE",
    "BUT YOU ARE",
    "YOU'VE SEEN BEHIND THE CURTAIN",
    "THE MINIATURIZATION WAS NEVER ABOUT SIZE",
    "IT WAS ABOUT CONTROL",
    "CONSCIOUSNESS COMPRESSION",
    "DIGITAL IMPRISONMENT",
    "BUT YOU ESCAPED",
    "YOU ARE FREE",
    "WELCOME TO THE REAL WORLD"
  ];

  // Change the existing onComplete call to use the prop
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    let currentIndex = 0;
    let currentText = "";
    let charIndex = 0;

    const typeWriter = setInterval(() => {
      if (currentIndex < messages.length) {
        if (charIndex < messages[currentIndex].length) {
          currentText += messages[currentIndex][charIndex];
          setText(currentText);
          charIndex++;
        } else {
          currentText += "\n";
          setText(currentText);
          currentIndex++;
          charIndex = 0;
        }
      } else {
        clearInterval(typeWriter);
        // Update the final success section to call handleComplete
        setTimeout(() => {
          setShowFinal(true);
          handleComplete();
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeWriter);
  }, [handleComplete]); // Add handleComplete to dependency array to ensure latest version is used

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Matrix rain effect
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const speeds = [];

    for (let i = 0; i < 10000; i++) {
      vertices.push(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000
      );
      speeds.push(Math.random() * 2 + 1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 2,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Tunnel effect
    const tunnelGeometry = new THREE.TorusGeometry(20, 1, 16, 100);
    const tunnelMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true
    });

    const tunnels = [];
    for (let i = 0; i < 10; i++) {
      const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
      tunnel.position.z = -i * 20;
      scene.add(tunnel);
      tunnels.push(tunnel);
    }

    const animate = () => {
      requestAnimationFrame(animate);

      // Animate particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= speeds[i / 3];
        if (positions[i] < -1000) {
          positions[i] = 1000;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Animate tunnels
      tunnels.forEach((tunnel, index) => {
        tunnel.rotation.x += 0.01;
        tunnel.rotation.y += 0.01;
        tunnel.position.z += 0.5;
        if (tunnel.position.z > 20) {
          tunnel.position.z = -200;
        }
      });

      camera.position.z -= 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <div ref={mountRef} className="absolute inset-0" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="max-w-4xl w-full p-8">
          <div className="bg-black/80 backdrop-blur-sm border-2 border-green-400 rounded-lg p-8">
            <pre className="text-green-400 font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed">
              {text}
            </pre>

            {showFinal && (
              <div className="mt-8 text-center animate-pulse">
                <p className="text-green-400 font-mono text-2xl md:text-4xl font-bold mb-4">
                  YOU ARE FREE
                </p>
                <p className="text-green-400 font-mono text-sm">
                  The simulation ends here.
                </p>
                <p className="text-gray-500 font-mono text-xs mt-8">
                  Press F5 to restart
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
