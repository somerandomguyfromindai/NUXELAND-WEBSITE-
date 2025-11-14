import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Atom, Microscope, Leaf, Scale, ChevronRight, Sparkles } from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#0F1729] to-[#1A0F2E]">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
              transform: `translateY(${scrollY * 0.3}px)`
            }}
          />
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <Atom className="w-24 h-24 text-blue-400 relative animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">Nuxeland</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Explore the cutting edge of miniaturization technology
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Join Ni's revolutionary etinuxE initiative and discover how miniaturization can transform our relationship with technology, nature, and ethics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl("Simulator")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-lg px-8 py-6">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Simulating
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Timeline")}>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6">
                View Timeline
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0E1A] to-[#0F1729]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Three Pillars of Innovation
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Technology */}
            <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Microscope className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Technology</h3>
                <p className="text-gray-400 leading-relaxed">
                  Advanced miniaturization techniques that push the boundaries of what's possible. Explore nano-scale engineering and quantum optimization.
                </p>
              </div>
            </div>

            {/* Nature */}
            <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Leaf className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Nature</h3>
                <p className="text-gray-400 leading-relaxed">
                  Understand environmental impacts and sustainability. Balance progress with ecological preservation and discover bio-integrated solutions.
                </p>
              </div>
            </div>

            {/* Ethics */}
            <div className="group relative bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 rounded-2xl p-8 hover:border-gray-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gray-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gray-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Scale className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Ethics</h3>
                <p className="text-gray-400 leading-relaxed">
                  Navigate the moral implications of miniaturization. Consider societal impact, accessibility, and responsible innovation practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About etinuxE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              The etinuxE Initiative
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              Led by the visionary researcher <span className="text-blue-400 font-semibold">Ni</span>, the etinuxE initiative represents humanity's most ambitious attempt to master miniaturization technology.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Through careful experimentation and ethical consideration, we're building a future where technology serves humanity while preserving our natural world. Join our community of explorers and help shape the future of miniaturization.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Run your first experiment and contribute to the future of miniaturization
          </p>
          <Link to={createPageUrl("Simulator")}>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-xl px-12 py-7">
              <Atom className="w-6 h-6 mr-3" />
              Launch Simulator
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}