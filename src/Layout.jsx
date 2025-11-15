import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Atom, Home, FlaskConical, Clock, MapPin, Package, ShoppingCart, BarChart3, Users, Menu, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import NuxelandAgent from "@/components/ai/NuxelandAgent";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "A.N.T. Console", url: createPageUrl("Simulator"), icon: FlaskConical },
  { title: "Timeline", url: createPageUrl("MissionTimeline"), icon: Clock },
  { title: "Map", url: createPageUrl("Map"), icon: MapPin },
  { title: "Resources", url: createPageUrl("Resources"), icon: Package },
  { title: "Shop", url: createPageUrl("Shop"), icon: ShoppingCart },
  { title: "Experiment Lab", url: createPageUrl("Dashboard"), icon: BarChart3 },
  { title: "Community", url: createPageUrl("Community"), icon: Users },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [agentOpen, setAgentOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <style>{`
        :root {
          --color-tech: #3B82F6;
          --color-nature: #10B981;
          --color-ethics: #6B7280;
          --glow-tech: 0 0 20px rgba(59, 130, 246, 0.5);
          --glow-nature: 0 0 20px rgba(16, 185, 129, 0.5);
          --glow-ethics: 0 0 20px rgba(107, 114, 128, 0.5);
        }
        
        .tech-glow {
          box-shadow: var(--glow-tech);
          border-color: var(--color-tech);
        }
        
        .nature-glow {
          box-shadow: var(--glow-nature);
          border-color: var(--color-nature);
        }
        
        .ethics-glow {
          box-shadow: var(--glow-ethics);
          border-color: var(--color-ethics);
        }

        .nav-link {
          position: relative;
          transition: all 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #3B82F6, #10B981);
          transition: width 0.3s ease;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>

      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#0A0E1A]/98 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Atom className="w-8 h-8 text-blue-400 relative animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nuxeland</h1>
                <p className="text-xs text-gray-400">Miniaturization Simulator</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`nav-link flex items-center gap-2 text-sm font-medium transition-colors ${
                    location.pathname === item.url
                      ? 'text-blue-400 active'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium">{user.full_name || 'Explorer'}</p>
                    <p className="text-gray-400 text-xs">Credits: {user.credits || 0}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0E1A]/98 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.url
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        {children}
      </main>

      {/* AI Agent Button */}
      <button
        onClick={() => setAgentOpen(!agentOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-pulse-glow"
      >
        <Bot className="w-7 h-7 text-white" />
      </button>

      <NuxelandAgent isOpen={agentOpen} onClose={() => setAgentOpen(false)} />

      <footer className="bg-[#050811] border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Atom className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Nuxeland</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Exploring the frontiers of miniaturization technology and its impact on our world.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Technology
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Nature
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  Ethics
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">etinuxE Initiative</h4>
              <p className="text-gray-400 text-sm">
                Led by Ni's groundbreaking research into sustainable miniaturization.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 Nuxeland Simulator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}