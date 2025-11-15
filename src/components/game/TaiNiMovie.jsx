import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TaiNiMovie() {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenes = [
    {
      duration: 8000,
      background: "from-blue-900 via-indigo-900 to-purple-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Floating particles background */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}

          <div className="relative text-center space-y-6 animate-fade-in-scale">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-40 animate-pulse-slow"></div>
              <div className="relative w-64 h-64 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-600 to-pink-500 p-2 animate-rotate-slow">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  <svg className="w-48 h-48 animate-gentle-float" viewBox="0 0 100 100">
                    <circle cx="50" cy="35" r="18" fill="#d4a574" />
                    <path d="M32 25 Q50 15 68 25 L68 30 Q50 20 32 30 Z" fill="#2d2d2d" />
                    <rect x="35" y="50" width="30" height="35" fill="#ffffff" />
                    <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="44" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <circle cx="56" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <line x1="48" y1="32" x2="52" y2="32" stroke="#333" strokeWidth="1" />
                    <rect x="30" y="60" width="8" height="15" fill="#4ade80" opacity="0.7" className="animate-pulse" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-wider animate-shimmer">
              DR. TAI NI
            </h1>
            <div className="space-y-3">
              <p className="text-3xl text-blue-200 font-light animate-fade-in" style={{ animationDelay: "1s" }}>
                World-Class Researcher & Innovator
              </p>
              <p className="text-2xl text-gray-300 animate-fade-in" style={{ animationDelay: "2s" }}>
                Nuxeland, 2024
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 12000,
      background: "from-green-900 via-emerald-900 to-teal-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-8 opacity-10">
            {[...Array(80)].map((_, i) => (
              <div key={i} className="border border-green-400 animate-grid-pulse" style={{ animationDelay: `${i * 0.05}s` }}></div>
            ))}
          </div>

          <div className="relative z-10 max-w-5xl text-center space-y-12 px-8">
            <div className="relative inline-block mb-8 animate-fade-in-scale">
              <svg className="w-80 h-80 mx-auto" viewBox="0 0 200 200">
                <defs>
                  <radialGradient id="labGlow">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect x="40" y="100" width="120" height="80" fill="#1e3a8a" opacity="0.4" className="animate-pulse-slow" />
                <rect x="70" y="60" width="60" height="40" fill="#3b82f6" opacity="0.6" className="animate-pulse" />
                
                <g className="animate-shrink-dramatic" style={{ transformOrigin: "100px 140px" }}>
                  <ellipse cx="100" cy="140" rx="25" ry="15" fill="#808080" />
                  <circle cx="95" cy="135" r="3" fill="#1a1a1a" />
                  <circle cx="105" cy="135" r="3" fill="#1a1a1a" />
                  <path d="M85 140 Q80 135 75 140" stroke="#808080" strokeWidth="2" fill="none" />
                  <path d="M115 140 Q120 135 125 140" stroke="#808080" strokeWidth="2" fill="none" />
                  <circle cx="93" cy="145" r="1" fill="#1a1a1a" />
                </g>
                
                {[...Array(30)].map((_, i) => (
                  <circle
                    key={i}
                    cx={70 + Math.random() * 60}
                    cy={110 + Math.random() * 60}
                    r={1 + Math.random() * 3}
                    fill="url(#labGlow)"
                    className="animate-particle-burst"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}

                <circle cx="100" cy="140" r="50" fill="url(#labGlow)" opacity="0.3" className="animate-pulse-expand" />
              </svg>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold text-white animate-slide-up" style={{ animationDelay: "0.5s" }}>
              THE BREAKTHROUGH
            </h2>
            <p className="text-3xl text-green-300 leading-relaxed animate-fade-in" style={{ animationDelay: "1.5s" }}>
              Miniature sciences reached new heights. Dr. Ni successfully shrunk living organisms—
            </p>
            <p className="text-5xl text-green-400 font-bold animate-glow-pulse" style={{ animationDelay: "2.5s" }}>
              ALMOST INVISIBLY SMALL
            </p>
            <div className="flex items-center justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: "3s" }}>
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-green-400 animate-ping"></div>
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400"></div>
              </div>
              <p className="text-2xl text-gray-300">All lab rats: Successfully miniaturized</p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 14000,
      background: "from-red-900 via-orange-900 to-yellow-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-full bg-gradient-to-b from-transparent via-red-500/20 to-transparent animate-lightning"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>

          <div className="max-w-6xl grid md:grid-cols-2 gap-16 px-8 relative z-10">
            <div className="space-y-6 animate-slide-in-left">
              <div className="relative">
                <div className="absolute -inset-6 bg-blue-500 blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-2 border-blue-500 rounded-3xl p-10 backdrop-blur-sm">
                  <svg className="w-40 h-40 mx-auto mb-6 animate-gentle-float" viewBox="0 0 100 100">
                    <circle cx="50" cy="35" r="18" fill="#d4a574" />
                    <path d="M32 25 Q50 15 68 25 L68 30 Q50 20 32 30 Z" fill="#2d2d2d" />
                    <rect x="35" y="50" width="30" height="35" fill="#ffffff" />
                    <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="44" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <circle cx="56" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                    <line x1="48" y1="32" x2="52" y2="32" stroke="#333" strokeWidth="1" />
                  </svg>
                  <h3 className="text-4xl font-bold text-blue-300 mb-6">DR. TAI NI</h3>
                  <div className="bg-blue-500/30 rounded-xl p-6 mb-6 animate-pulse">
                    <p className="text-2xl text-blue-100 font-semibold">"This is PROOF!"</p>
                  </div>
                  <p className="text-gray-300 text-xl">Requires closer inspection...</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-slide-in-right">
              <div className="relative">
                <div className="absolute -inset-6 bg-red-500 blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-br from-red-900/50 to-red-950/50 border-2 border-red-500 rounded-3xl p-10 backdrop-blur-sm">
                  <svg className="w-40 h-40 mx-auto mb-6 animate-gentle-float" style={{ animationDelay: "0.5s" }} viewBox="0 0 100 100">
                    <circle cx="50" cy="35" r="18" fill="#c9a57b" />
                    <path d="M32 25 Q50 18 68 25 L68 30 Q50 23 32 30 Z" fill="#3d2817" />
                    <rect x="35" y="50" width="30" height="35" fill="#1a1a1a" />
                    <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                    <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                    <path d="M42 40 Q50 38 58 40" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
                  </svg>
                  <h3 className="text-4xl font-bold text-red-300 mb-6">FHU (Brother)</h3>
                  <div className="bg-red-500/30 rounded-xl p-6 mb-6 animate-pulse" style={{ animationDelay: "0.3s" }}>
                    <p className="text-2xl text-red-100 font-semibold">"This is a FAILURE!"</p>
                  </div>
                  <p className="text-gray-300 text-xl">Dismissed the discovery...</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-32 h-96 opacity-70 animate-lightning-bolt" viewBox="0 0 100 400">
              <defs>
                <linearGradient id="boltGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M50 0 L30 200 L60 200 L40 400" fill="url(#boltGradient)" stroke="#f59e0b" strokeWidth="3" />
            </svg>
          </div>
        </div>
      )
    },
    {
      duration: 16000,
      background: "from-gray-900 via-red-950 to-black",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-around opacity-20">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="bg-red-500 animate-crowd-wave"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  width: '60px',
                  height: `${120 + Math.random() * 100}px`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl text-center space-y-12 px-8">
            <div className="mb-12 animate-shake-intense">
              <div className="flex justify-center gap-12 mb-12 flex-wrap">
                {[
                  { text: "STOP\nNI!", rotation: -12, color: "red-600" },
                  { text: "UNETHICAL", rotation: 8, color: "red-700" },
                  { text: "DANGER!", rotation: -15, color: "red-800" },
                  { text: "NO PROOF!", rotation: 10, color: "orange-700" }
                ].map((sign, i) => (
                  <div
                    key={i}
                    className="relative animate-protest-sign"
                    style={{
                      transform: `rotate(${sign.rotation}deg)`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    <div className={`absolute inset-0 bg-${sign.color} blur-xl opacity-50`}></div>
                    <div className={`relative w-40 h-28 bg-${sign.color} border-4 border-${sign.color}/70 flex items-center justify-center rounded-xl shadow-2xl`}>
                      <p className="text-white font-bold text-lg whitespace-pre-line">{sign.text}</p>
                    </div>
                    <div className={`w-3 h-32 bg-amber-800 mx-auto mt-2`}></div>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-7xl md:text-8xl font-bold text-red-400 animate-glitch-text">
              PUBLIC OUTRAGE
            </h2>

            <div className="space-y-6 text-3xl text-gray-300">
              {[
                '"Where are the results?"',
                '"Show us proof we can see!"',
                '"This is dangerous pseudoscience!"',
                '"He\'s lying to us all!"'
              ].map((quote, i) => (
                <p
                  key={i}
                  className="animate-type-in text-gray-200 font-light"
                  style={{ animationDelay: `${2 + i * 0.8}s` }}
                >
                  {quote}
                </p>
              ))}
            </div>

            <div className="mt-16 bg-gradient-to-r from-red-950/80 to-red-900/80 border-4 border-red-500 rounded-2xl p-10 animate-pulse-dramatic backdrop-blur-sm">
              <p className="text-4xl text-red-200 font-bold leading-tight">
                Most were NOT willing to look closer...
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 14000,
      background: "from-black via-gray-950 to-gray-900",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-gray-700 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${80 + Math.random() * 150}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.4
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl space-y-16 px-8">
            <div className="text-center space-y-8">
              <div className="relative h-80 mb-12 overflow-hidden">
                <svg
                  className="w-48 h-48 mx-auto animate-sink-down"
                  viewBox="0 0 100 100"
                  style={{ animationDuration: "6s" }}
                >
                  <circle cx="50" cy="35" r="18" fill="#d4a574" opacity="0.9" />
                  <path d="M32 25 Q50 15 68 25 L68 30 Q50 20 32 30 Z" fill="#2d2d2d" />
                  <rect x="35" y="50" width="30" height="35" fill="#ffffff" opacity="0.8" />
                  <circle cx="44" cy="32" r="2" fill="#1a1a1a" />
                  <circle cx="56" cy="32" r="2" fill="#1a1a1a" />
                  <circle cx="44" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                  <circle cx="56" cy="32" r="4" fill="none" stroke="#333" strokeWidth="1" />
                  <line x1="48" y1="32" x2="52" y2="32" stroke="#333" strokeWidth="1" />
                  <rect x="25" y="70" width="15" height="12" fill="#8b4513" />
                </svg>
                
                <div className="absolute bottom-0 left-0 right-0 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gradient-to-b from-gray-800 to-gray-900 border-t-2 border-gray-600 animate-fade-in"
                      style={{
                        animationDelay: `${i * 0.5}s`,
                        opacity: 1 - i * 0.15
                      }}
                    />
                  ))}
                </div>
              </div>

              <h2 className="text-6xl md:text-7xl font-bold text-gray-300 animate-slide-up">
                FORCED UNDERGROUND
              </h2>
              
              <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-gray-700 rounded-2xl p-10 space-y-6 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "2s" }}>
                <p className="text-3xl text-gray-400">
                  Public pressure became unbearable...
                </p>
                <p className="text-2xl text-gray-500">
                  Dr. Ni vanished from the surface world
                </p>
              </div>

              <div className="relative inline-block animate-gentle-float" style={{ animationDelay: "3s" }}>
                <div className="absolute inset-0 bg-yellow-600 blur-2xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-yellow-900/50 to-yellow-950/50 border-3 border-yellow-600 rounded-2xl p-8">
                  <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100">
                    <rect x="20" y="15" width="60" height="70" fill="#f9fafb" stroke="#6b7280" strokeWidth="2" />
                    {[30, 40, 50, 60, 70].map((y, i) => (
                      <line key={i} x1="30" y1={y} x2={70 - i * 3} y2={y} stroke="#374151" strokeWidth="1.5" />
                    ))}
                  </svg>
                  <p className="text-2xl text-yellow-300 font-semibold">
                    His notes remain...
                  </p>
                  <p className="text-lg text-yellow-500 mt-2">The only remnants of his findings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 18000,
      background: "from-indigo-950 via-purple-950 to-blue-950",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-10">
              {[...Array(120)].map((_, i) => (
                <div
                  key={i}
                  className="border border-purple-500 animate-grid-pulse"
                  style={{ animationDelay: `${i * 0.02}s` }}
                />
              ))}
            </div>
          </div>

          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}

          <div className="relative z-10 max-w-6xl space-y-16 px-8">
            <div className="text-center space-y-8">
              <div className="relative inline-block mb-12 animate-fade-in-scale">
                <div className="absolute inset-0 bg-purple-600 blur-[120px] opacity-50 animate-pulse-slow"></div>
                <div className="relative">
                  <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-shimmer-intense tracking-wider">
                    etinuxE
                  </h1>
                  <p className="text-base text-gray-400 tracking-[0.8em] mt-4 uppercase">Initiative</p>
                </div>
              </div>

              <p className="text-4xl text-purple-300 font-light animate-fade-in" style={{ animationDelay: "1s" }}>
                Deep beneath Nuxeland...
              </p>
            </div>

            <div className="relative h-64 bg-gradient-to-b from-indigo-950/60 to-purple-950/60 border-2 border-purple-500/40 rounded-3xl overflow-hidden backdrop-blur-sm animate-fade-in" style={{ animationDelay: "2s" }}>
              <div className="absolute inset-0 flex items-center justify-around p-12">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-gentle-float"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  >
                    <svg className="w-20 h-20" viewBox="0 0 100 100">
                      <circle cx="50" cy="35" r="15" fill="#a78bfa" />
                      <rect x="35" y="48" width="30" height="30" fill="#6366f1" />
                    </svg>
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full animate-particle-burst"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "3s" }}>
              {[
                { emoji: "🧬", title: "Survival?", desc: "Strategy for humanity's continuation", color: "blue" },
                { emoji: "💰", title: "Profit?", desc: "Commercialization of the technology", color: "green" },
                { emoji: "🌟", title: "Vision?", desc: "Radical future for humanity", color: "purple" }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-${item.color}-950/60 border-2 border-${item.color}-500/60 rounded-2xl p-8 text-center backdrop-blur-sm animate-scale-in hover:scale-105 transition-transform`}
                  style={{ animationDelay: `${3.5 + i * 0.3}s` }}
                >
                  <div className="text-6xl mb-4">{item.emoji}</div>
                  <h3 className={`text-2xl font-bold text-${item.color}-300 mb-3`}>{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-3 border-purple-500 rounded-3xl p-12 text-center backdrop-blur-sm animate-fade-in" style={{ animationDelay: "5s" }}>
              <p className="text-4xl text-purple-200 font-light leading-relaxed mb-4">
                The remnants of Ni's experiments continue their work...
              </p>
              <p className="text-2xl text-gray-400">
                Their true motives remain <span className="text-purple-400 font-bold animate-pulse">uncertain</span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      duration: 12000,
      background: "from-black via-blue-950 to-purple-950",
      content: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20 animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 8}s`
              }}
            />
          ))}

          <div className="relative z-10 max-w-5xl text-center space-y-16 px-8">
            <h2 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-shimmer-intense">
              THE LEGACY CONTINUES
            </h2>
            
            <div className="relative inline-block my-16 animate-fade-in-scale" style={{ animationDelay: "1s" }}>
              <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-40 animate-pulse-slow"></div>
              <svg className="w-80 h-80 mx-auto relative" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="helix1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {[0, 1].map((strand) => (
                  <path
                    key={strand}
                    d="M40 100 Q60 80 80 100 T120 100 T160 100"
                    stroke="url(#helix1)"
                    strokeWidth="4"
                    fill="none"
                    className="animate-pulse-slow"
                    style={{
                      transform: strand === 1 ? 'scaleY(-1) translateY(-200px)' : 'none',
                      animationDelay: strand === 1 ? "0.5s" : "0s"
                    }}
                  />
                ))}
                
                {[40, 60, 80, 100, 120, 140, 160].map((x, i) => (
                  <line
                    key={i}
                    x1={x}
                    y1="85"
                    x2={x}
                    y2="115"
                    stroke="#a78bfa"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-pulse-slow"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                
                {[40, 30, 20].map((r, i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={r}
                    fill={`rgb(${99 + i * 40}, ${102 + i * 20}, ${241 - i * 40})`}
                    opacity={0.3 - i * 0.1}
                    className="animate-pulse-expand"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </svg>
            </div>

            <div className="space-y-8 text-3xl text-gray-300">
              {[
                "Dr. Tai Ni's vision lives on...",
                "Through etinuxE",
                "In the depths of Nuxeland"
              ].map((text, i) => (
                <p
                  key={i}
                  className="animate-fade-in"
                  style={{ animationDelay: `${3 + i * 0.8}s` }}
                  dangerouslySetInnerHTML={{
                    __html: text
                      .replace("etinuxE", '<span class="text-purple-400 font-bold">etinuxE</span>')
                      .replace("Nuxeland", '<span class="text-blue-400 font-bold">Nuxeland</span>')
                  }}
                />
              ))}
            </div>

            <div className="mt-20 text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-bold animate-glow-pulse" style={{ animationDelay: "5s" }}>
              The work continues...
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) {
      // Movie finished, redirect to home
      setTimeout(() => {
        navigate(createPageUrl("Home"));
      }, 2000);
      return;
    }

    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1);
      } else {
        setIsPlaying(false);
      }
    }, scenes[currentScene].duration);

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying, scenes.length, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float-random {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -30px); }
          50% { transform: translate(-15px, -60px); }
          75% { transform: translate(-25px, -30px); }
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes shrink-dramatic {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(0.05); opacity: 0; }
        }
        @keyframes particle-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc((var(--x, 0) - 50) * 2px), calc((var(--y, 0) - 50) * 2px)) scale(0); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes pulse-expand {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200%; }
          100% { background-position: 200%; }
        }
        @keyframes shimmer-intense {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 30px rgba(167, 139, 250, 0.5)); }
          50% { filter: brightness(1.5) drop-shadow(0 0 60px rgba(167, 139, 250, 0.9)); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(167, 139, 250, 0.8), 0 0 40px rgba(167, 139, 250, 0.5); }
          50% { text-shadow: 0 0 40px rgba(167, 139, 250, 1), 0 0 80px rgba(167, 139, 250, 0.8); }
        }
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          91%, 95% { opacity: 0.8; }
        }
        @keyframes lightning-bolt {
          0%, 90%, 100% { opacity: 0; transform: scale(1); }
          91% { opacity: 1; transform: scale(1.2); }
          95% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes crowd-wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.4); }
        }
        @keyframes shake-intense {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-8px) rotate(-3deg); }
          40% { transform: translateX(8px) rotate(3deg); }
          60% { transform: translateX(-6px) rotate(-2deg); }
          80% { transform: translateX(6px) rotate(2deg); }
        }
        @keyframes protest-sign {
          0%, 100% { transform: rotate(var(--rotation, 0deg)) translateY(0); }
          50% { transform: rotate(var(--rotation, 0deg)) translateY(-15px); }
        }
        @keyframes glitch-text {
          0%, 100% { transform: translate(0); text-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
          20% { transform: translate(-3px, 3px); text-shadow: -3px 0 rgba(239, 68, 68, 0.8); }
          40% { transform: translate(-3px, -3px); text-shadow: 3px 0 rgba(239, 68, 68, 0.8); }
          60% { transform: translate(3px, 3px); text-shadow: -3px 0 rgba(239, 68, 68, 0.8); }
          80% { transform: translate(3px, -3px); text-shadow: 3px 0 rgba(239, 68, 68, 0.8); }
        }
        @keyframes type-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dramatic {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(239, 68, 68, 0.5); }
          50% { transform: scale(1.02); box-shadow: 0 0 60px rgba(239, 68, 68, 0.8); }
        }
        @keyframes rain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes sink-down {
          0% { transform: translateY(-100px); opacity: 1; }
          100% { transform: translateY(400px); opacity: 0.2; }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in-scale { animation: fade-in-scale 1.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1.2s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 1.2s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1.2s ease-out forwards; }
        .animate-float-random { animation: float-random 8s ease-in-out infinite; }
        .animate-gentle-float { animation: gentle-float 4s ease-in-out infinite; }
        .animate-shrink-dramatic { animation: shrink-dramatic 4s ease-in-out forwards; }
        .animate-particle-burst { animation: particle-burst 3s ease-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-expand { animation: pulse-expand 2s ease-in-out infinite; }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        .animate-shimmer-intense { animation: shimmer-intense 2s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-lightning { animation: lightning 4s ease-in-out infinite; }
        .animate-lightning-bolt { animation: lightning-bolt 3s ease-in-out infinite; }
        .animate-crowd-wave { animation: crowd-wave 1.5s ease-in-out infinite; }
        .animate-shake-intense { animation: shake-intense 1s ease-in-out infinite; }
        .animate-protest-sign { animation: protest-sign 2s ease-in-out infinite; }
        .animate-glitch-text { animation: glitch-text 1s ease-in-out infinite; }
        .animate-type-in { animation: type-in 0.8s ease-out forwards; opacity: 0; }
        .animate-pulse-dramatic { animation: pulse-dramatic 2s ease-in-out infinite; }
        .animate-rain { animation: rain linear infinite; }
        .animate-sink-down { animation: sink-down 6s ease-in forwards; }
        .animate-grid-pulse { animation: grid-pulse 2s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 1s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; opacity: 0; }
      `}</style>

      <div className={`w-full h-full bg-gradient-to-br ${scenes[currentScene].background} transition-all duration-2000`}>
        {scenes[currentScene].content}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000"
          style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
        />
      </div>

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
        {scenes.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentScene ? 'bg-white w-12' :
              index < currentScene ? 'bg-gray-500 w-2' : 'bg-gray-700 w-2'
            }`}
          />
        ))}
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center animate-fade-in-scale">
            <p className="text-4xl text-white font-mono mb-4">Returning to Nuxeland...</p>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}