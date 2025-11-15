import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Globe, AlertCircle, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SellFormula() {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [showNuxelandMap, setShowNuxelandMap] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const buyers = [
    {
      id: 1,
      name: "TechCorp Industries",
      location: "Silicon Valley, USA",
      coordinates: { x: 15, y: 35 },
      offer: 15000000,
      interest: "Mass Production Technology",
      reputation: "Trusted",
      description: "Leading tech conglomerate seeking miniaturization patents for consumer electronics."
    },
    {
      id: 2,
      name: "MediBio Solutions",
      location: "Geneva, Switzerland",
      coordinates: { x: 50, y: 30 },
      offer: 22000000,
      interest: "Medical Applications",
      reputation: "Highly Ethical",
      description: "Pharmaceutical company focused on revolutionary medical treatments using miniaturization."
    },
    {
      id: 3,
      name: "Global Defense Systems",
      location: "Washington D.C., USA",
      coordinates: { x: 20, y: 38 },
      offer: 45000000,
      interest: "Military Applications",
      reputation: "Controversial",
      description: "Military contractor interested in weaponization and tactical deployment systems."
    },
    {
      id: 4,
      name: "EcoTech Innovations",
      location: "Tokyo, Japan",
      coordinates: { x: 85, y: 35 },
      offer: 18000000,
      interest: "Environmental Solutions",
      reputation: "Sustainable",
      description: "Green technology firm exploring miniaturization for ecological preservation."
    },
    {
      id: 5,
      name: "AstroNautic Corp",
      location: "Cape Canaveral, USA",
      coordinates: { x: 22, y: 42 },
      offer: 35000000,
      interest: "Space Exploration",
      reputation: "Visionary",
      description: "Space agency seeking miniaturization for deep space colonization missions."
    },
    {
      id: 6,
      name: "NanoSystems Ltd",
      location: "Shanghai, China",
      coordinates: { x: 78, y: 38 },
      offer: 28000000,
      interest: "Consumer Technology",
      reputation: "Competitive",
      description: "Electronics manufacturer planning mass-market miniaturization devices."
    },
  ];

  const handleBuyerClick = (buyer) => {
    setSelectedBuyer(buyer);
    setShowNuxelandMap(false);
  };

  const handleNuxelandClick = () => {
    setShowNuxelandMap(true);
    setSelectedBuyer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1a1f3a] to-[#0A0E1A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-10 h-10 text-green-400" />
            <div>
              <h1 className="text-4xl font-bold text-white font-mono">SELL THE FORMULA</h1>
              <p className="text-gray-400 font-mono text-sm">Global Buyers Network</p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-yellow-300 text-sm font-mono">
              <p className="font-bold mb-1">ETHICAL WARNING</p>
              <p>Selling the miniaturization formula will have global consequences. Choose your buyer carefully.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-[#0F1729] border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  WORLD MAP - BUYERS NETWORK
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-lg overflow-hidden border-2 border-gray-700"
                  style={{ 
                    height: '500px',
                    backgroundImage: `
                      radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)
                    `
                  }}
                >
                  {/* World continents outline */}
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <path
                      d="M 100 200 Q 150 180, 200 200 L 250 180 Q 300 190, 350 210 L 400 200"
                      stroke="rgba(34, 197, 94, 0.5)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M 500 250 Q 550 230, 600 250 L 650 240"
                      stroke="rgba(34, 197, 94, 0.5)"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>

                  {/* Grid overlay */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }} />

                  {/* Green dots for buyers */}
                  {buyers.map((buyer) => (
                    <button
                      key={buyer.id}
                      onClick={() => handleBuyerClick(buyer)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${buyer.coordinates.x}%`, top: `${buyer.coordinates.y}%` }}
                    >
                      <div className={`w-4 h-4 rounded-full bg-green-500 shadow-lg ring-4 ${
                        selectedBuyer?.id === buyer.id ? 'ring-green-400 scale-150' : 'ring-green-900'
                      } group-hover:scale-150 transition-all duration-300`}>
                        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50"></div>
                      </div>
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/95 px-2 py-1 rounded border border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs font-mono text-green-400 z-50">
                        {buyer.name}
                      </div>
                    </button>
                  ))}

                  {/* Red dot for Nuxeland */}
                  <button
                    onClick={handleNuxelandClick}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: '50%', top: '20%' }}
                  >
                    <div className={`w-5 h-5 rounded-full bg-red-500 shadow-lg ring-4 ${
                      showNuxelandMap ? 'ring-red-400 scale-150' : 'ring-red-900'
                    } group-hover:scale-150 transition-all duration-300`}>
                      <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50"></div>
                    </div>
                    <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-black/95 px-2 py-1 rounded border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs font-mono text-red-400 z-50">
                      NUXELAND
                    </div>
                  </button>

                  <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-2 rounded border border-gray-600 font-mono text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-400">Buyers ({buyers.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-red-400">Nuxeland (Origin)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {selectedBuyer && (
              <Card className="bg-[#0F1729] border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono text-lg">BUYER DETAILS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-white font-mono font-bold text-xl mb-3">{selectedBuyer.name}</h3>
                    
                    {/* Location - Prominent */}
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-xs font-mono font-bold">LOCATION</span>
                      </div>
                      <p className="text-white font-mono text-sm">{selectedBuyer.location}</p>
                    </div>

                    {/* What They Want - Prominent */}
                    <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-xs font-mono font-bold">WHAT THEY WANT</span>
                      </div>
                      <p className="text-white font-mono text-sm">{selectedBuyer.interest}</p>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Offer:</span>
                      <span className="text-green-400 font-mono font-bold">
                        ${(selectedBuyer.offer / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Reputation:</span>
                      <Badge className={`text-xs ${
                        selectedBuyer.reputation === 'Controversial' ? 'bg-red-500/20 text-red-400' :
                        selectedBuyer.reputation === 'Trusted' || selectedBuyer.reputation === 'Highly Ethical' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{selectedBuyer.reputation}</Badge>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm">{selectedBuyer.description}</p>

                  <Button className="w-full bg-green-600 hover:bg-green-700 font-mono">
                    <DollarSign className="w-4 h-4 mr-2" />
                    NEGOTIATE DEAL
                  </Button>
                </CardContent>
              </Card>
            )}

            {showNuxelandMap && (
              <Card className="bg-[#0F1729] border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-400 font-mono text-lg">NUXELAND MAP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden"
                    style={{ 
                      height: '300px',
                      backgroundImage: `
                        radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 60%)
                      `
                    }}
                  >
                    {/* Nuxeland border */}
                    <svg className="absolute inset-0 w-full h-full">
                      <path
                        d="M 50 80 
                           Q 70 75, 90 85 
                           L 120 80 
                           Q 150 85, 170 100 
                           L 180 120 
                           Q 185 145, 180 170 
                           L 170 190 
                           Q 155 205, 135 200 
                           L 100 205 
                           Q 70 200, 55 180 
                           L 50 150 
                           Q 48 120, 50 100 
                           L 50 80 Z"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.7)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-red-400 mx-auto mb-2" />
                        <p className="text-white font-mono font-bold">NUXELAND</p>
                        <p className="text-gray-400 text-xs font-mono">Miniaturized Nation</p>
                        <p className="text-red-400 text-xs font-mono mt-2">Origin of Technology</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded p-3">
                    <p className="text-red-300 text-xs font-mono">
                      This is where it all began. The etinuxE Initiative headquarters and Dr. Ni's laboratory.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedBuyer && !showNuxelandMap && (
              <Card className="bg-[#0F1729] border-gray-700">
                <CardContent className="p-8 text-center">
                  <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-mono text-sm">
                    Select a buyer from the map or view Nuxeland
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}