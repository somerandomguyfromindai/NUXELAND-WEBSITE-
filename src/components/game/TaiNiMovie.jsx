import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function TaiNiMovie({ onClose }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenes = [
    {
      duration: 8000,
      title: "DR. TAI NI",
      subtitle: "Nuxeland's Visionary",
      background: "from-blue-900 via-indigo-900 to-purple-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1 animate-float">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    {/* Head */}
                    <circle cx="50" cy="35" r="18" fill="#d4a574" />
                    {/* Hair */}
                    <path d="M32 25 Q50 15 68 25 L68 30 Q50 20 32 30 Z" fill="#2d2d2d" />
                    {/* Lab coat */}
                    <rect x="35" y="50" width="30" height="35" fill="#ffffff" />
                    {/* Eyes */}
                    <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                    {/* Glasses */}
                    <circle cx="44" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <circle cx="56" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <line x1="48" y1="32" x2="52" y2="32" stroke="#333" strokeWidth="1" />
                    {/* Lab equipment in hand */}
                    <rect x="30" y="60" width="8" height="15" fill="#4ade80" opacity="0.7" className="animate-pulse" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white tracking-wider">DR. TAI NI</h1>
            <p className="text-2xl text-blue-300 font-light">World-Class Researcher & Innovator</p>
            <p className="text-xl text-gray-400">Nuxeland, 2024</p>
          </div>
        </div>
      )
    },
    {
      duration: 10000,
      title: "The Breakthrough",
      background: "from-green-900 via-emerald-900 to-teal-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-10">
            {[...Array(48)].map((_, i) => (
              <div key={i} className="border border-green-400"></div>
            ))}
          </div>
          <div className="relative z-10 max-w-4xl text-center space-y-8 px-8 animate-fade-in-up">
            <div className="relative inline-block mb-8">
              <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200">
                {/* Lab equipment */}
                <rect x="40" y="100" width="120" height="80" fill="#1e3a8a" opacity="0.3" />
                <rect x="70" y="60" width="60" height="40" fill="#3b82f6" opacity="0.5" />
                
                {/* Lab rat - normal size */}
                <g className="animate-shrink" style={{ transformOrigin: "100px 140px" }}>
                  <ellipse cx="100" cy="140" rx="25" ry="15" fill="#808080" />
                  <circle cx="95" cy="135" r="3" fill="#1a1a1a" />
                  <circle cx="105" cy="135" r="3" fill="#1a1a1a" />
                  <path d="M85 140 Q80 135 75 140" stroke="#808080" strokeWidth="2" fill="none" />
                  <path d="M115 140 Q120 135 125 140" stroke="#808080" strokeWidth="2" fill="none" />
                </g>
                
                {/* Shrinking particles */}
                {[...Array(20)].map((_, i) => (
                  <circle
                    key={i}
                    cx={80 + Math.random() * 40}
                    cy={120 + Math.random() * 40}
                    r={1 + Math.random() * 2}
                    fill="#10b981"
                    className="animate-particle"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white">THE BREAKTHROUGH</h2>
            <p className="text-2xl text-green-300 leading-relaxed">
              Miniature sciences reached new heights. Dr. Ni successfully shrunk living organisms—
            </p>
            <p className="text-3xl text-green-400 font-bold animate-pulse">
              ALMOST INVISIBLY SMALL
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
              <p className="text-xl text-gray-300">All lab rats: Successfully miniaturized</p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 12000,
      title: "The Conflict",
      background: "from-red-900 via-orange-900 to-yellow-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="max-w-5xl grid md:grid-cols-2 gap-12 px-8">
            {/* Dr. Ni's side */}
            <div className="space-y-6 animate-slide-in-left">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-blue-900/30 border-2 border-blue-500 rounded-2xl p-8">
                  <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100">
                    <circle cx="50" cy="35" r="18" fill="#d4a574" />
                    <path d="M32 25 Q50 15 68 25 L68 30 Q50 20 32 30 Z" fill="#2d2d2d" />
                    <rect x="35" y="50" width="30" height="35" fill="#ffffff" />
                    <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="44" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <circle cx="56" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <line x1="48" y1="32" x2="52" y2="32" stroke="#333" strokeWidth="1" />
                  </svg>
                  <h3 className="text-3xl font-bold text-blue-300 mb-4">DR. TAI NI</h3>
                  <div className="bg-blue-500/20 rounded-lg p-4 mb-4">
                    <p className="text-xl text-blue-200 font-semibold">"This is PROOF!"</p>
                  </div>
                  <p className="text-gray-300 text-lg">Requires closer inspection...</p>
                </div>
              </div>
            </div>

            {/* Brother Fhu's side */}
            <div className="space-y-6 animate-slide-in-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-red-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-red-900/30 border-2 border-red-500 rounded-2xl p-8">
                  <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100">
                    <circle cx="50" cy="35" r="18" fill="#c9a57b" />
                    <path d="M32 25 Q50 18 68 25 L68 30 Q50 23 32 30 Z" fill="#3d2817" />
                    <rect x="35" y="50" width="30" height="35" fill="#1a1a1a" />
                    <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                    <path d="M42 40 Q50 38 58 40" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
                  </svg>
                  <h3 className="text-3xl font-bold text-red-300 mb-4">FHU (Brother)</h3>
                  <div className="bg-red-500/20 rounded-lg p-4 mb-4">
                    <p className="text-xl text-red-200 font-semibold">"This is a FAILURE!"</p>
                  </div>
                  <p className="text-gray-300 text-lg">Dismissed the discovery...</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lightning bolt separator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-24 h-64 opacity-60 animate-pulse" viewBox="0 0 100 300">
              <path d="M50 0 L30 150 L60 150 L40 300" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )
    },
    {
      duration: 14000,
      title: "Public Outrage",
      background: "from-gray-900 via-red-950 to-black",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Angry crowd silhouettes */}
          <div className="absolute inset-0 flex items-end justify-around opacity-20">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-32 bg-red-500 animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  height: `${100 + Math.random() * 80}px`
                }}
              ></div>
            ))}
          </div>

          <div className="relative z-10 max-w-4xl text-center space-y-8 px-8 animate-fade-in-up">
            <div className="mb-8">
              {/* Protest signs */}
              <div className="flex justify-center gap-8 mb-8 animate-shake">
                <div className="w-32 h-20 bg-red-600 rotate-[-10deg] flex items-center justify-center rounded-lg">
                  <p className="text-white font-bold text-xs">STOP<br/>NI!</p>
                </div>
                <div className="w-32 h-20 bg-red-700 rotate-[5deg] flex items-center justify-center rounded-lg">
                  <p className="text-white font-bold text-xs">UNETHICAL</p>
                </div>
                <div className="w-32 h-20 bg-red-800 rotate-[-8deg] flex items-center justify-center rounded-lg">
                  <p className="text-white font-bold text-xs">DANGER!</p>
                </div>
              </div>
            </div>

            <h2 className="text-6xl font-bold text-red-400 animate-pulse">PUBLIC OUTRAGE</h2>
            <div className="space-y-4 text-2xl text-gray-300">
              <p className="animate-fade-in" style={{ animationDelay: "1s" }}>
                "Where are the results?"
              </p>
              <p className="animate-fade-in" style={{ animationDelay: "2s" }}>
                "Show us proof we can see!"
              </p>
              <p className="animate-fade-in" style={{ animationDelay: "3s" }}>
                "This is dangerous pseudoscience!"
              </p>
            </div>

            <div className="mt-12 bg-red-950/50 border-2 border-red-500 rounded-xl p-8 animate-pulse">
              <p className="text-3xl text-red-300 font-bold">
                Most were NOT willing to look closer...
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 12000,
      title: "Going Underground",
      background: "from-black via-gray-950 to-gray-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Descending effect */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-gray-700 animate-descend"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${50 + Math.random() * 100}px`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.3
                }}
              ></div>
            ))}
          </div>

          <div className="relative z-10 max-w-4xl space-y-12 px-8">
            <div className="text-center space-y-6 animate-fade-in-up">
              {/* Dr. Ni descending */}
              <div className="relative h-64 mb-8">
                <svg className="w-40 h-40 mx-auto animate-descend-slow" viewBox="0 0 100 100">
                  <circle cx="50" cy="35" r="18" fill="#d4a574" />
                  <path d="M32 25 Q50 15 68 25 L68 30 Q50 20 32 30 Z" fill="#2d2d2d" />
                  <rect x="35" y="50" width="30" height="35" fill="#ffffff" opacity="0.7" />
                  <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                  <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                  <circle cx="44" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                  <circle cx="56" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                  <line x1="48" y1="32" x2="52" y2="32" stroke="#333" strokeWidth="1" />
                  
                  {/* Briefcase with notes */}
                  <rect x="25" y="70" width="15" height="12" fill="#8b4513" />
                  <rect x="26" y="71" width="13" height="10" fill="#a0522d" />
                </svg>
                
                {/* Underground layers */}
                <div className="absolute bottom-0 left-0 right-0 space-y-1">
                  <div className="h-8 bg-gray-800 border-t-2 border-gray-600"></div>
                  <div className="h-8 bg-gray-900 border-t-2 border-gray-700"></div>
                  <div className="h-8 bg-black border-t-2 border-gray-800"></div>
                </div>
              </div>

              <h2 className="text-5xl font-bold text-gray-300">FORCED UNDERGROUND</h2>
              
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-8 space-y-4">
                <p className="text-2xl text-gray-400">
                  Public pressure became unbearable...
                </p>
                <p className="text-xl text-gray-500">
                  Dr. Ni vanished from the surface world
                </p>
              </div>

              {/* Notes remaining */}
              <div className="relative inline-block animate-float">
                <div className="absolute inset-0 bg-yellow-600 blur-xl opacity-20"></div>
                <div className="relative bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-6">
                  <svg className="w-24 h-24 mx-auto mb-3" viewBox="0 0 100 100">
                    <rect x="20" y="15" width="60" height="70" fill="#f9fafb" stroke="#6b7280" strokeWidth="2" />
                    <line x1="30" y1="30" x2="70" y2="30" stroke="#374151" strokeWidth="1.5" />
                    <line x1="30" y1="40" x2="70" y2="40" stroke="#374151" strokeWidth="1.5" />
                    <line x1="30" y1="50" x2="65" y2="50" stroke="#374151" strokeWidth="1.5" />
                    <line x1="30" y1="60" x2="70" y2="60" stroke="#374151" strokeWidth="1.5" />
                    <line x1="30" y1="70" x2="55" y2="70" stroke="#374151" strokeWidth="1.5" />
                  </svg>
                  <p className="text-xl text-yellow-300 font-semibold">
                    His notes remain...
                  </p>
                  <p className="text-sm text-yellow-500">The only remnants of his findings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 16000,
      title: "etinuxE",
      background: "from-indigo-950 via-purple-950 to-blue-950",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Underground facility grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-8">
              {[...Array(80)].map((_, i) => (
                <div key={i} className="border border-purple-500"></div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-5xl space-y-10 px-8 animate-fade-in-up">
            <div className="text-center space-y-6">
              {/* etinuxE Logo */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-purple-600 blur-3xl opacity-40 animate-pulse"></div>
                <div className="relative">
                  <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-glow">
                    etinuxE
                  </h1>
                  <p className="text-sm text-gray-500 tracking-[0.5em] mt-2">INITIATIVE</p>
                </div>
              </div>

              <p className="text-3xl text-purple-300 font-light">
                Deep beneath Nuxeland...
              </p>
            </div>

            {/* Lab illustration */}
            <div className="relative h-48 bg-gradient-to-b from-indigo-950/50 to-purple-950/50 border-2 border-purple-500/30 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-around p-8">
                {/* Scientists/researchers */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                    <svg className="w-16 h-16" viewBox="0 0 100 100">
                      <circle cx="50" cy="35" r="15" fill="#a78bfa" />
                      <rect x="35" y="48" width="30" height="30" fill="#6366f1" />
                    </svg>
                  </div>
                ))}
              </div>
              
              {/* Glowing particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full animate-particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-950/50 border border-blue-500/50 rounded-xl p-6 text-center animate-fade-in" style={{ animationDelay: "1s" }}>
                <div className="text-4xl mb-3">🧬</div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">Survival?</h3>
                <p className="text-gray-400 text-sm">Strategy for humanity's continuation</p>
              </div>

              <div className="bg-green-950/50 border border-green-500/50 rounded-xl p-6 text-center animate-fade-in" style={{ animationDelay: "1.5s" }}>
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-xl font-bold text-green-300 mb-2">Profit?</h3>
                <p className="text-gray-400 text-sm">Commercialization of the technology</p>
              </div>

              <div className="bg-purple-950/50 border border-purple-500/50 rounded-xl p-6 text-center animate-fade-in" style={{ animationDelay: "2s" }}>
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">Vision?</h3>
                <p className="text-gray-400 text-sm">Radical future for humanity</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-500 rounded-2xl p-8 text-center">
              <p className="text-3xl text-purple-200 font-light leading-relaxed">
                The remnants of Ni's experiments continue their work...
              </p>
              <p className="text-xl text-gray-400 mt-4">
                Their true motives remain <span className="text-purple-400 font-bold">uncertain</span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 10000,
      title: "The Legacy",
      background: "from-black via-blue-950 to-purple-950",
      content: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative z-10 max-w-4xl text-center space-y-12 px-8 animate-fade-in-up">
            <div className="space-y-6">
              <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                THE LEGACY CONTINUES
              </h2>
              
              <div className="relative inline-block my-12">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse"></div>
                <svg className="w-64 h-64 mx-auto relative" viewBox="0 0 200 200">
                  {/* DNA helix */}
                  <path
                    d="M40 100 Q60 80 80 100 T120 100 T160 100"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M40 100 Q60 120 80 100 T120 100 T160 100"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  
                  {/* Connecting lines */}
                  {[40, 60, 80, 100, 120, 140, 160].map((x, i) => (
                    <line
                      key={i}
                      x1={x}
                      y1="90"
                      x2={x}
                      y2="110"
                      stroke="#a78bfa"
                      strokeWidth="1"
                      opacity="0.5"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                  
                  {/* Center glow */}
                  <circle cx="100" cy="100" r="30" fill="#6366f1" opacity="0.2" className="animate-pulse" />
                  <circle cx="100" cy="100" r="20" fill="#8b5cf6" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
                  <circle cx="100" cy="100" r="10" fill="#a78bfa" opacity="0.5" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
                </svg>
              </div>

              <div className="space-y-4 text-2xl text-gray-300">
                <p className="animate-fade-in" style={{ animationDelay: "1s" }}>
                  Dr. Tai Ni's vision lives on...
                </p>
                <p className="animate-fade-in" style={{ animationDelay: "2s" }}>
                  Through <span className="text-purple-400 font-bold">etinuxE</span>
                </p>
                <p className="animate-fade-in" style={{ animationDelay: "3s" }}>
                  In the depths of <span className="text-blue-400 font-bold">Nuxeland</span>
                </p>
              </div>

              <div className="mt-12 text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-bold animate-pulse">
                The work continues...
              </div>
            </div>
          </div>

          {/* Floating particles throughout */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1);
      } else {
        setIsPlaying(false);
      }
    }, scenes[currentScene].duration);

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying, scenes.length]);

  const handleSkip = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shrink {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.1);
            opacity: 0.3;
          }
        }

        @keyframes particle {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--tw-translate-x) + 50px), calc(var(--tw-translate-y) - 50px));
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }

        @keyframes descend {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes descend-slow {
          0% {
            transform: translateY(-200px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px);
            opacity: 0.3;
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 20px rgba(147, 51, 234, 0.5));
          }
          50% {
            filter: brightness(1.3) drop-shadow(0 0 40px rgba(147, 51, 234, 0.8));
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shrink {
          animation: shrink 3s ease-in-out forwards;
        }

        .animate-particle {
          animation: particle 2s ease-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }

        .animate-descend {
          animation: descend 3s linear infinite;
        }

        .animate-descend-slow {
          animation: descend-slow 8s ease-in-out forwards;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Movie content */}
      <div className={`w-full h-full bg-gradient-to-br ${scenes[currentScene].background} transition-all duration-1000`}>
        {scenes[currentScene].content}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-900">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
          style={{
            width: `${((currentScene + 1) / scenes.length) * 100}%`
          }}
        ></div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <Button
          onClick={handleSkip}
          variant="outline"
          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
        >
          {currentScene < scenes.length - 1 ? 'Skip Scene' : 'Finish'}
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Scene indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {scenes.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentScene
                ? 'bg-white w-8'
                : index < currentScene
                ? 'bg-gray-500'
                : 'bg-gray-700'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}