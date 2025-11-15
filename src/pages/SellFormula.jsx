import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Globe, AlertCircle, Target, X, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SellFormula() {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [showNuxelandMap, setShowNuxelandMap] = useState(false);
  const [negotiationStage, setNegotiationStage] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [negotiationResult, setNegotiationResult] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const buyers = [
    {
      id: 1,
      name: "TechCorp Industries",
      location: "Silicon Valley, USA",
      coordinates: { x: 18, y: 40 },
      offer: 15000000,
      interest: "Mass Production Technology",
      reputation: "Trusted",
      description: "Leading tech conglomerate seeking miniaturization patents for consumer electronics.",
      terms: [
        "Exclusive rights to consumer electronics applications",
        "5-year non-compete clause",
        "Quarterly royalty payments of 3% on revenue",
        "Your continued consultation for 2 years"
      ],
      acceptanceChance: 0.8
    },
    {
      id: 2,
      name: "MediBio Solutions",
      location: "Geneva, Switzerland",
      coordinates: { x: 51, y: 32 },
      offer: 22000000,
      interest: "Medical Applications",
      reputation: "Highly Ethical",
      description: "Pharmaceutical company focused on revolutionary medical treatments using miniaturization.",
      terms: [
        "Rights limited to medical and pharmaceutical use only",
        "Guarantee of affordable pricing for developing nations",
        "Joint research partnership for 3 years",
        "Ethical oversight committee approval required"
      ],
      acceptanceChance: 0.75
    },
    {
      id: 3,
      name: "Global Defense Systems",
      location: "Washington D.C., USA",
      coordinates: { x: 23, y: 41 },
      offer: 45000000,
      interest: "Military Applications",
      reputation: "Controversial",
      description: "Military contractor interested in weaponization and tactical deployment systems.",
      terms: [
        "Full military and defense applications rights",
        "Top secret classification - lifetime NDA",
        "No disclosure of buyer identity",
        "Immediate transfer of all research data"
      ],
      acceptanceChance: 0.9
    },
    {
      id: 4,
      name: "EcoTech Innovations",
      location: "Tokyo, Japan",
      coordinates: { x: 82, y: 38 },
      offer: 18000000,
      interest: "Environmental Solutions",
      reputation: "Sustainable",
      description: "Green technology firm exploring miniaturization for ecological preservation.",
      terms: [
        "Environmental applications only",
        "Open-source derivative technologies",
        "Revenue sharing: 60% buyer, 40% you",
        "Joint climate impact assessment"
      ],
      acceptanceChance: 0.7
    },
    {
      id: 5,
      name: "AstroNautic Corp",
      location: "Cape Canaveral, USA",
      coordinates: { x: 24, y: 44 },
      offer: 35000000,
      interest: "Space Exploration",
      reputation: "Visionary",
      description: "Space agency seeking miniaturization for deep space colonization missions.",
      terms: [
        "Exclusive space exploration and colonization rights",
        "Recognition as co-inventor on all patents",
        "Option for future mission participation",
        "10% equity in space ventures division"
      ],
      acceptanceChance: 0.65
    },
    {
      id: 6,
      name: "NanoSystems Ltd",
      location: "Shanghai, China",
      coordinates: { x: 75, y: 40 },
      offer: 28000000,
      interest: "Consumer Technology",
      reputation: "Competitive",
      description: "Electronics manufacturer planning mass-market miniaturization devices.",
      terms: [
        "Mass production rights for consumer goods",
        "2-year exclusivity period in Asia-Pacific",
        "Minimum production quota: 1M units/year",
        "Performance bonuses up to additional $10M"
      ],
      acceptanceChance: 0.85
    },
  ];

  const handleBuyerClick = (buyer) => {
    setSelectedBuyer(buyer);
    setShowNuxelandMap(false);
    setNegotiationStage(null);
    setNegotiationResult(null);
  };

  const handleNuxelandClick = () => {
    setShowNuxelandMap(true);
    setSelectedBuyer(null);
    setNegotiationStage(null);
  };

  const startNegotiation = () => {
    setCurrentOffer(selectedBuyer);
    setNegotiationStage('terms');
  };

  const handleAccept = () => {
    setNegotiationStage('decision');
    setTimeout(() => {
      const accepted = Math.random() < currentOffer.acceptanceChance;
      setNegotiationResult(accepted ? 'accepted' : 'rejected');
    }, 2000);
  };

  const handleReject = () => {
    setNegotiationStage(null);
    setNegotiationResult(null);
    setCurrentOffer(null);
  };

  const closeNegotiation = () => {
    setNegotiationStage(null);
    setNegotiationResult(null);
    setCurrentOffer(null);
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
                  className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border-2 border-gray-700"
                  style={{ height: '500px' }}
                >
                  {/* Detailed World Map SVG */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2000 857" preserveAspectRatio="xMidYMid meet">
                    <rect width="2000" height="857" fill="#0f172a" />
                    
                    {/* World map paths with detailed outlines */}
                    <g fill="#1e293b" stroke="#475569" strokeWidth="1.5">
                      {/* North America */}
                      <path d="M 169.8 66.1 L 168.5 64.8 L 166.7 64.3 L 163.3 64.9 L 160.9 68.2 L 158.2 68.5 L 155.7 70.4 L 152.8 71.2 L 150.5 70.9 L 147.2 72.3 L 144.7 75.2 L 142.1 76.5 L 138.9 75.8 L 136.3 76.8 L 133.5 78.9 L 131.2 82.1 L 129.5 86.3 L 128.7 89.8 L 129.1 93.4 L 130.8 96.5 L 133.2 98.9 L 136.1 100.7 L 139.5 101.8 L 143.2 102.1 L 147.1 101.6 L 150.8 100.3 L 154.3 98.4 L 157.5 96.1 L 160.4 93.5 L 163 90.7 L 165.3 87.8 L 167.4 84.8 L 169.1 81.7 L 170.5 78.5 L 171.5 75.3 L 172.1 72 L 172.3 68.7 Z M 220 145 L 218 147 L 215 148 L 212 147.5 L 209.5 145.8 L 207.8 143.2 L 206.9 140.1 L 206.8 136.8 L 207.5 133.6 L 209 130.7 L 211.2 128.3 L 213.8 126.5 L 216.7 125.3 L 219.8 124.8 L 222.9 125 L 225.8 125.9 L 228.5 127.5 L 230.8 129.6 L 232.7 132.2 L 234.1 135.1 L 235 138.3 L 235.3 141.5 L 235 144.8 L 234.1 147.9 L 232.6 150.8 L 230.6 153.3 L 228.2 155.4 L 225.5 156.9 L 222.5 157.8 L 219.4 158 L 216.3 157.5 L 213.3 156.3 L 210.6 154.5 L 208.3 152.2 L 206.5 149.5 L 205.3 146.5 L 204.8 143.3 L 205 140.1 L 205.9 137 Z"/>
                      
                      {/* South America */}
                      <path d="M 270 320 L 268 325 L 265.5 330 L 263 334.5 L 261 339 L 259.5 343.5 L 258.5 348 L 258 352.5 L 258 357 L 258.5 361.5 L 259.5 366 L 261 370 L 263 374 L 265.5 377.5 L 268.5 380.5 L 272 383 L 275.5 385 L 279.5 386.5 L 283.5 387.5 L 287.5 388 L 291.5 387.5 L 295.5 386.5 L 299 385 L 302.5 383 L 305.5 380.5 L 308 377.5 L 310 374 L 311.5 370 L 312.5 366 L 313 361.5 L 313 357 L 312.5 352.5 L 311.5 348 L 310 343.5 L 308 339 L 305.5 334.5 L 302.5 330 L 299 325.5 L 295 321.5 L 290.5 318 L 285.5 315 L 280 312.5 L 274.5 310.5 Z"/>
                      
                      {/* Europe */}
                      <path d="M 485 85 L 488 83 L 491.5 82 L 495 81.5 L 498.5 82 L 502 83 L 505 84.5 L 507.5 86.5 L 509.5 89 L 511 92 L 512 95 L 512.5 98.5 L 512.5 102 L 512 105.5 L 511 108.5 L 509.5 111.5 L 507.5 114 L 505 116 L 502 117.5 L 498.5 118.5 L 495 119 L 491.5 119 L 488 118.5 L 484.5 117.5 L 481.5 116 L 478.5 114 L 476 111.5 L 474 108.5 L 472.5 105.5 L 471.5 102 L 471 98.5 L 471 95 L 471.5 91.5 L 472.5 88.5 L 474 85.5 Z"/>
                      
                      {/* Africa */}
                      <path d="M 485 195 L 488 193 L 491.5 192 L 495 191.5 L 498.5 192 L 502 193 L 505.5 194.5 L 509 196.5 L 512 199 L 514.5 202 L 516.5 205.5 L 518 209 L 519 213 L 519.5 217 L 519.5 221 L 519 225 L 518 229 L 516.5 233 L 514.5 236.5 L 512 240 L 509 243 L 505.5 245.5 L 502 247.5 L 498 249 L 494 250 L 490 250.5 L 486 250.5 L 482 250 L 478 249 L 474.5 247.5 L 471 245.5 L 468 243 L 465.5 240 L 463.5 236.5 L 462 233 L 461 229 L 460 225 L 459.5 221 L 459.5 217 L 460 213 L 461 209 L 462.5 205.5 L 464.5 202 L 467 199 L 470 196.5 L 473.5 194.5 L 477 193 L 481 192 Z"/>
                      
                      {/* Asia */}
                      <path d="M 850 95 L 855 93 L 860 92 L 865 91.5 L 870 92 L 875 93 L 880 94.5 L 885 96.5 L 889.5 99 L 893.5 102 L 897 105.5 L 900 109 L 902.5 113 L 904.5 117 L 906 121.5 L 907 126 L 907.5 130.5 L 907.5 135 L 907 139.5 L 906 144 L 904.5 148 L 902.5 152 L 900 155.5 L 897 159 L 893.5 162 L 889.5 164.5 L 885 166.5 L 880 168 L 875 169 L 870 169.5 L 865 169.5 L 860 169 L 855 168 L 850 166.5 L 845.5 164.5 L 841.5 162 L 838 159 L 835 155.5 L 832.5 152 L 830.5 148 L 829 144 L 828 139.5 L 827.5 135 L 827.5 130.5 L 828 126 L 829 121.5 L 830.5 117 L 832.5 113 L 835 109 L 838 105.5 L 841.5 102 L 845.5 99 Z"/>
                      
                      {/* Australia */}
                      <path d="M 930 345 L 935 343 L 940 342 L 945 341.5 L 950 342 L 955 343 L 959.5 344.5 L 963.5 346.5 L 967 349 L 970 352 L 972.5 355.5 L 974.5 359 L 976 363 L 977 367 L 977.5 371 L 977.5 375 L 977 379 L 976 383 L 974.5 386.5 L 972.5 390 L 970 393 L 967 395.5 L 963.5 397.5 L 959.5 399 L 955 400 L 950 400.5 L 945 400.5 L 940 400 L 935 399 L 930.5 397.5 L 926.5 395.5 L 923 393 L 920 390 L 917.5 386.5 L 915.5 383 L 914 379 L 913 375 L 912.5 371 L 912.5 367 L 913 363 L 914 359 L 915.5 355.5 L 917.5 352 L 920 349 L 923 346.5 L 926.5 344.5 Z"/>
                    </g>
                  </svg>

                  {/* Green dots for buyers */}
                  {buyers.map((buyer) => (
                    <button
                      key={buyer.id}
                      onClick={() => handleBuyerClick(buyer)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
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
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
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

                  <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-2 rounded border border-gray-600 font-mono text-xs z-10">
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
            {selectedBuyer && !negotiationStage && (
              <Card className="bg-[#0F1729] border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono text-lg">BUYER DETAILS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-white font-mono font-bold text-xl mb-3">{selectedBuyer.name}</h3>
                    
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-xs font-mono font-bold">LOCATION</span>
                      </div>
                      <p className="text-white font-mono text-sm">{selectedBuyer.location}</p>
                    </div>

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

                  <Button onClick={startNegotiation} className="w-full bg-green-600 hover:bg-green-700 font-mono">
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
                    style={{ height: '300px' }}
                  >
                    <svg className="absolute inset-0 w-full h-full">
                      <path
                        d="M 50 80 Q 70 75, 90 85 L 120 80 Q 150 85, 170 100 L 180 120 Q 185 145, 180 170 L 170 190 Q 155 205, 135 200 L 100 205 Q 70 200, 55 180 L 50 150 Q 48 120, 50 100 L 50 80 Z"
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

        {/* Negotiation Modal */}
        {negotiationStage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <Card className="bg-[#0F1729] border-cyan-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-400 font-mono text-xl">NEGOTIATION IN PROGRESS</CardTitle>
                  <Button onClick={closeNegotiation} variant="ghost" size="icon" className="text-gray-400">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {negotiationStage === 'terms' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-lg p-4">
                      <h3 className="text-white font-mono font-bold text-lg mb-2">{currentOffer.name}</h3>
                      <p className="text-gray-400 text-sm">Presenting their terms for the formula acquisition:</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-green-400 font-mono font-bold text-sm">FINANCIAL OFFER:</h4>
                      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                        <p className="text-white font-mono text-2xl font-bold">
                          ${(currentOffer.offer / 1000000).toFixed(1)} Million USD
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-yellow-400 font-mono font-bold text-sm">CONTRACT TERMS:</h4>
                      <div className="bg-black/30 rounded-lg p-4 space-y-3">
                        {currentOffer.terms.map((term, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-400 text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{term}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                      <p className="text-orange-300 text-xs font-mono">
                        ⚠️ REMINDER: Once you accept, the buyer will review and make their final decision. They may still reject the deal.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700 font-mono" size="lg">
                        <XCircle className="w-5 h-5 mr-2" />
                        REJECT DEAL
                      </Button>
                      <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700 font-mono" size="lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        ACCEPT TERMS
                      </Button>
                    </div>
                  </div>
                )}

                {negotiationStage === 'decision' && !negotiationResult && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-white font-mono text-xl mb-2">BUYER REVIEWING TERMS...</h3>
                    <p className="text-gray-400 text-sm">The buyer is considering your acceptance</p>
                  </div>
                )}

                {negotiationResult === 'accepted' && (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-green-400 font-mono text-2xl font-bold mb-2">DEAL ACCEPTED!</h3>
                      <p className="text-white text-lg mb-4">{currentOffer.name} has agreed to proceed</p>
                      <p className="text-gray-400 text-sm">Transfer of ${(currentOffer.offer / 1000000).toFixed(1)}M will be processed</p>
                    </div>
                    <Button onClick={closeNegotiation} className="bg-cyan-600 hover:bg-cyan-700 font-mono">
                      CLOSE
                    </Button>
                  </div>
                )}

                {negotiationResult === 'rejected' && (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                      <XCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-red-400 font-mono text-2xl font-bold mb-2">DEAL REJECTED</h3>
                      <p className="text-white text-lg mb-4">{currentOffer.name} has declined to proceed</p>
                      <p className="text-gray-400 text-sm">You may negotiate with other buyers</p>
                    </div>
                    <Button onClick={closeNegotiation} className="bg-gray-600 hover:bg-gray-700 font-mono">
                      CLOSE
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}