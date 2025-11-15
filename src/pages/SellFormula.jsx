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
  const [termDecisions, setTermDecisions] = useState({});
  const [buyerTermDecisions, setBuyerTermDecisions] = useState({});

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
        { id: 1, text: "Exclusive rights to consumer electronics applications", buyerImportance: "high" },
        { id: 2, text: "5-year non-compete clause", buyerImportance: "high" },
        { id: 3, text: "Quarterly royalty payments of 3% on revenue", buyerImportance: "medium" },
        { id: 4, text: "Your continued consultation for 2 years", buyerImportance: "low" }
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
        { id: 1, text: "Rights limited to medical and pharmaceutical use only", buyerImportance: "high" },
        { id: 2, text: "Guarantee of affordable pricing for developing nations", buyerImportance: "high" },
        { id: 3, text: "Joint research partnership for 3 years", buyerImportance: "medium" },
        { id: 4, text: "Ethical oversight committee approval required", buyerImportance: "medium" }
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
        { id: 1, text: "Full military and defense applications rights", buyerImportance: "high" },
        { id: 2, text: "Top secret classification - lifetime NDA", buyerImportance: "high" },
        { id: 3, text: "No disclosure of buyer identity", buyerImportance: "high" },
        { id: 4, text: "Immediate transfer of all research data", buyerImportance: "medium" }
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
        { id: 1, text: "Environmental applications only", buyerImportance: "high" },
        { id: 2, text: "Open-source derivative technologies", buyerImportance: "medium" },
        { id: 3, text: "Revenue sharing: 60% buyer, 40% you", buyerImportance: "high" },
        { id: 4, text: "Joint climate impact assessment", buyerImportance: "low" }
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
        { id: 1, text: "Exclusive space exploration and colonization rights", buyerImportance: "high" },
        { id: 2, text: "Recognition as co-inventor on all patents", buyerImportance: "medium" },
        { id: 3, text: "Option for future mission participation", buyerImportance: "low" },
        { id: 4, text: "10% equity in space ventures division", buyerImportance: "medium" }
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
        { id: 1, text: "Mass production rights for consumer goods", buyerImportance: "high" },
        { id: 2, text: "2-year exclusivity period in Asia-Pacific", buyerImportance: "high" },
        { id: 3, text: "Minimum production quota: 1M units/year", buyerImportance: "medium" },
        { id: 4, text: "Performance bonuses up to additional $10M", buyerImportance: "low" }
      ],
      acceptanceChance: 0.85
    },
  ];

  const handleBuyerClick = (buyer) => {
    setSelectedBuyer(buyer);
    setShowNuxelandMap(false);
    setNegotiationStage(null);
    setNegotiationResult(null);
    setTermDecisions({});
    setBuyerTermDecisions({});
  };

  const handleNuxelandClick = () => {
    setShowNuxelandMap(true);
    setSelectedBuyer(null);
    setNegotiationStage(null);
  };

  const startNegotiation = () => {
    setCurrentOffer(selectedBuyer);
    setNegotiationStage('terms');
    setTermDecisions({});
    setBuyerTermDecisions({});
  };

  const handleTermDecision = (termId, accepted) => {
    setTermDecisions(prev => ({ ...prev, [termId]: accepted }));
  };

  const allTermsDecided = () => {
    if (!currentOffer) return false;
    return currentOffer.terms.every(term => termDecisions[term.id] !== undefined);
  };

  const handleSubmitTerms = () => {
    setNegotiationStage('buyer_review');
    
    setTimeout(() => {
      const newBuyerDecisions = {};
      let dealAcceptable = true;

      currentOffer.terms.forEach(term => {
        const sellerAccepted = termDecisions[term.id];
        
        if (term.buyerImportance === 'high') {
          newBuyerDecisions[term.id] = sellerAccepted ? true : Math.random() < 0.2;
          if (!sellerAccepted) dealAcceptable = false;
        } else if (term.buyerImportance === 'medium') {
          newBuyerDecisions[term.id] = Math.random() < 0.7;
        } else {
          newBuyerDecisions[term.id] = Math.random() < 0.4;
        }
      });

      setBuyerTermDecisions(newBuyerDecisions);
      setNegotiationStage('results');

      const acceptedTerms = currentOffer.terms.filter(term => 
        termDecisions[term.id] && newBuyerDecisions[term.id]
      );
      
      const dealSuccess = dealAcceptable && acceptedTerms.length >= 2;
      setNegotiationResult(dealSuccess ? 'accepted' : 'rejected');
    }, 2500);
  };

  const handleReject = () => {
    setNegotiationStage(null);
    setNegotiationResult(null);
    setCurrentOffer(null);
    setTermDecisions({});
    setBuyerTermDecisions({});
  };

  const closeNegotiation = () => {
    setNegotiationStage(null);
    setNegotiationResult(null);
    setCurrentOffer(null);
    setTermDecisions({});
    setBuyerTermDecisions({});
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
                  className="relative rounded-lg overflow-hidden border-2 border-gray-700"
                  style={{ 
                    height: '500px',
                    backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69172463a52f7c40f0887fab/0ee190ebd_image.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#000000'
                  }}
                >
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
                    style={{ left: '48%', top: '12%' }}
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
            <Card className="bg-[#0F1729] border-cyan-500/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                      <p className="text-gray-400 text-sm mb-2">Review each term and decide whether to accept or reject:</p>
                      <p className="text-yellow-400 text-xs font-mono">⚠️ Buyer will also review your decisions before finalizing</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-green-400 font-mono font-bold text-sm">FINANCIAL OFFER:</h4>
                      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                        <p className="text-white font-mono text-2xl font-bold">
                          ${(currentOffer.offer / 1000000).toFixed(1)} Million USD
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-yellow-400 font-mono font-bold text-sm">CONTRACT TERMS - YOUR DECISIONS:</h4>
                      {currentOffer.terms.map((term) => (
                        <div key={term.id} className="bg-black/30 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-cyan-400 text-xs font-bold">{term.id}</span>
                            </div>
                            <p className="text-gray-300 text-sm flex-1">{term.text}</p>
                          </div>
                          <div className="flex gap-3 ml-9">
                            <Button
                              onClick={() => handleTermDecision(term.id, true)}
                              className={`flex-1 font-mono text-xs ${
                                termDecisions[term.id] === true
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                              size="sm"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {termDecisions[term.id] === true ? 'ACCEPTED' : 'ACCEPT'}
                            </Button>
                            <Button
                              onClick={() => handleTermDecision(term.id, false)}
                              className={`flex-1 font-mono text-xs ${
                                termDecisions[term.id] === false
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                              size="sm"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {termDecisions[term.id] === false ? 'REJECTED' : 'REJECT'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button onClick={handleReject} className="flex-1 bg-gray-600 hover:bg-gray-700 font-mono" size="lg">
                        CANCEL
                      </Button>
                      <Button 
                        onClick={handleSubmitTerms} 
                        disabled={!allTermsDecided()}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
                        size="lg"
                      >
                        SUBMIT TO BUYER
                      </Button>
                    </div>
                  </div>
                )}

                {negotiationStage === 'buyer_review' && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-white font-mono text-xl mb-2">BUYER REVIEWING YOUR TERMS...</h3>
                    <p className="text-gray-400 text-sm">They are considering each term individually</p>
                  </div>
                )}

                {negotiationStage === 'results' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-lg p-4">
                      <h3 className="text-white font-mono font-bold text-lg mb-2">NEGOTIATION RESULTS</h3>
                      <p className="text-gray-400 text-sm">Comparing your decisions with buyer's decisions:</p>
                    </div>

                    <div className="space-y-3">
                      {currentOffer.terms.map((term) => {
                        const yourDecision = termDecisions[term.id];
                        const buyerDecision = buyerTermDecisions[term.id];
                        const mutualAccept = yourDecision && buyerDecision;
                        const conflict = yourDecision !== buyerDecision;

                        return (
                          <div 
                            key={term.id} 
                            className={`border rounded-lg p-4 ${
                              mutualAccept ? 'bg-green-900/20 border-green-500/50' :
                              conflict ? 'bg-red-900/20 border-red-500/50' :
                              'bg-gray-900/20 border-gray-700'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-cyan-400 text-xs font-bold">{term.id}</span>
                              </div>
                              <p className="text-gray-300 text-sm flex-1">{term.text}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 ml-9">
                              <div className={`text-center p-2 rounded ${
                                yourDecision ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                <p className="text-xs font-mono font-bold">YOU</p>
                                <p className="text-xs">{yourDecision ? 'ACCEPTED' : 'REJECTED'}</p>
                              </div>
                              <div className={`text-center p-2 rounded ${
                                buyerDecision ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                <p className="text-xs font-mono font-bold">BUYER</p>
                                <p className="text-xs">{buyerDecision ? 'ACCEPTED' : 'REJECTED'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {negotiationResult === 'accepted' ? (
                      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-green-400 font-mono text-2xl font-bold mb-2">DEAL ACCEPTED!</h3>
                        <p className="text-white text-lg mb-2">{currentOffer.name} has agreed to proceed</p>
                        <p className="text-gray-400 text-sm">
                          Transfer of ${(currentOffer.offer / 1000000).toFixed(1)}M will be processed
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-red-400 font-mono text-2xl font-bold mb-2">DEAL REJECTED</h3>
                        <p className="text-white text-lg mb-2">Too many conflicting terms</p>
                        <p className="text-gray-400 text-sm">
                          You may negotiate with other buyers
                        </p>
                      </div>
                    )}

                    <Button onClick={closeNegotiation} className="w-full bg-cyan-600 hover:bg-cyan-700 font-mono">
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