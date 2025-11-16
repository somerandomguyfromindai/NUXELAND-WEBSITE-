
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Atom, Zap, Sparkles, ArrowRight, Lock } from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
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

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <Atom className="w-24 h-24 text-blue-400 relative animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
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
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            Three Pillars of <span className="text-blue-400">Innovation</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Technology */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/50 hover:border-blue-500 transition-all hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                  <Atom className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Technology</h3>
                <p className="text-gray-300">
                  Pushing the boundaries of what's possible through cutting-edge miniaturization research.
                </p>
              </CardContent>
            </Card>

            {/* Nature */}
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/50 hover:border-green-500 transition-all hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">Nature</h3>
                <p className="text-gray-300">
                  Harmonizing technology with the natural world through sustainable innovation.
                </p>
              </CardContent>
            </Card>

            {/* Ethics */}
            <Card className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-500/50 hover:border-gray-500 transition-all hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-4">Ethics</h3>
                <p className="text-gray-300">
                  Navigating the moral implications of miniaturization for humanity's future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The etinuxE Initiative */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0A0E1A] to-[#0F1729]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
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
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">Research Labs</h3>
                <p className="text-gray-300 text-sm">
                  Access cutting-edge facilities to conduct miniaturization experiments and unlock new possibilities.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">Field Operations</h3>
                <p className="text-gray-300 text-sm">
                  Deploy agents on critical missions to test miniaturization technology in real-world scenarios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 px-4">
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
