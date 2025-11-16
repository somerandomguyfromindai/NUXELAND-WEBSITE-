
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Atom, Zap, Sparkles, ArrowRight, Lock } from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;

    // Initialize stars
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 150; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.1, // Changed from 0.2
          speedY: (Math.random() - 0.5) * 0.1, // Changed from 0.2
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.015 + 0.008, // Changed from 0.01 + 0.005
          phase: Math.random() * Math.PI * 2,
          direction: Math.random() > 0.5 ? 1 : -1, // Added
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Update star position based on scroll - side to side motion
        const scrollFactor = scrollY * 0.1; // Changed from 0.15
        const offsetX = Math.sin(scrollY * 0.0003 + star.phase) * 40 * star.direction; // Changed from 0.0005, 30, and added star.direction
        // Removed: const offsetY = Math.cos(scrollY * 0.0005 + star.phase) * 30;

        star.phase += star.twinkleSpeed;
        const twinkle = Math.sin(star.phase) * 0.5 + 0.5; // Changed from 0.3 + 0.7

        // Draw star
        ctx.beginPath();
        ctx.arc(
          star.x + offsetX,
          star.y - scrollFactor, // Changed from star.y - scrollFactor + offsetY
          star.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(147, 197, 253, ${star.opacity * twinkle})`;
        ctx.fill();

        // Draw glow
        const gradient = ctx.createRadialGradient(
          star.x + offsetX,
          star.y - scrollFactor, // Changed from star.y - scrollFactor + offsetY
          0,
          star.x + offsetX,
          star.y - scrollFactor, // Changed from star.y - scrollFactor + offsetY
          star.size * 3
        );
        gradient.addColorStop(0, `rgba(147, 197, 253, ${star.opacity * twinkle * 0.6})`); // Changed from 0.5
        gradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          star.x + offsetX,
          star.y - scrollFactor, // Changed from star.y - scrollFactor + offsetY
          star.size * 3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-[#0A0E1A] relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%233B82F6\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />

        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E1A]/50 to-[#0A0E1A]"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateY(${-scrollY * (0.1 + Math.random() * 0.2)}px) translateX(${Math.sin(scrollY * 0.01 + i) * 20}px)`,
                opacity: 0.3 + Math.random() * 0.4,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div 
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          style={{
            transform: `translateY(${scrollY * 0.15}px)`,
            opacity: Math.max(0, 1 - scrollY / 600)
          }}
        >
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <Atom className="w-24 h-24 text-blue-400 relative animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent"
            style={{
              transform: `scale(${1 + scrollY * 0.0002})`,
            }}
          >
            Welcome to <span className="text-blue-400">Nuxe</span><span className="text-green-400">land</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Explore the cutting edge of miniaturization technology
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
            Join Ni's revolutionary etinuxE initiative and discover how miniaturization can
            transform our relationship with technology, nature, and ethics.
          </p>

          <Link to={createPageUrl("Simulator")}>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
              <Zap className="w-6 h-6 mr-2" />
              Start Simulating
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid - Three Pillars */}
      <section 
        className="py-20 px-4 relative z-10"
        style={{
          transform: `translateY(${-scrollY * 0.05}px)`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center text-white mb-16"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 200) / 200)), // Changed from 300
              transform: `translateY(${Math.max(0, 50 - (scrollY - 200) * 0.2)}px)` // Changed from 300
            }}
          >
            Three Pillars of <span className="text-blue-400">Innovation</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Atom,
                title: "Technology",
                color: "blue",
                delay: 0, // No change
                description: "Pushing the boundaries of what's possible through cutting-edge miniaturization research."
              },
              {
                icon: Sparkles,
                title: "Nature",
                color: "green",
                delay: 80, // Changed from 100
                description: "Harmonizing technology with the natural world through sustainable innovation."
              },
              {
                icon: Lock,
                title: "Ethics",
                color: "gray",
                delay: 160, // Changed from 200
                description: "Navigating the moral implications of miniaturization for humanity's future."
              }
            ].map((pillar, index) => (
              <Card 
                key={pillar.title}
                className={`bg-gradient-to-br from-${pillar.color}-900/30 to-${pillar.color}-800/20 border-${pillar.color}-500/50 hover:border-${pillar.color}-500 transition-all hover:scale-105`}
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 250 - pillar.delay) / 200)), // Changed from 400
                  transform: `translateY(${Math.max(0, 80 - (scrollY - 250 - pillar.delay) * 0.3)}px)` // Changed from 400
                }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                    <pillar.icon className={`w-8 h-8 text-${pillar.color}-400`} />
                  </div>
                  <h3 className={`text-2xl font-bold text-${pillar.color}-400 mb-4`}>{pillar.title}</h3>
                  <p className="text-gray-300">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The etinuxE Initiative */}
      <section 
        className="py-20 px-4 bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] relative z-10"
        style={{
          opacity: Math.min(1, Math.max(0, (scrollY - 800) / 300)),
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            style={{
              transform: `translateY(${Math.max(0, 60 - (scrollY - 900) * 0.2)}px)`
            }}
          >
            The etinuxE Initiative
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Dr. Ni's groundbreaking research opens doors to a world where size is no longer a limitation.
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Through advanced experiments and field operations, we're exploring how miniaturization
            can solve global challenges while raising profound questions about our future.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Research Labs", description: "Access cutting-edge facilities to conduct miniaturization experiments and unlock new possibilities." },
              { title: "Field Operations", description: "Deploy agents on critical missions to test miniaturization technology in real-world scenarios." }
            ].map((item, index) => (
              <Card 
                key={item.title}
                className="bg-white/5 border-white/10"
                style={{
                  transform: `translateX(${Math.sin((scrollY + index * 100) * 0.003) * 10}px) translateY(${Math.cos((scrollY + index * 100) * 0.002) * 10}px)`
                }}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section 
        className="py-20 px-4 relative z-10"
        style={{
          opacity: Math.min(1, Math.max(0, (scrollY - 1400) / 300)),
          transform: `scale(${Math.min(1, 0.9 + (scrollY - 1400) * 0.0003)})`
        }}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/50">
            <CardContent className="p-8 text-center">
              <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Mission 4: Coming in 1 Month</h3>
              <p className="text-gray-300 mb-6">
                The next chapter in your miniaturization journey awaits. Prepare for the most challenging mission yet.
              </p>
              <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-6 py-3">
                <p className="text-yellow-300 font-mono text-sm">
                  Expected Release: <span className="font-bold">December 2025</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
