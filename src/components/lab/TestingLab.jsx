import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Activity, Heart, Brain, Zap, AlertTriangle, Atom, Users, Sparkles } from "lucide-react";

export default function TestingLab() {
  const [selectedPotion, setSelectedPotion] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [testSubject, setTestSubject] = useState({
    health: 100,
    energy: 100,
    mental: 100,
    status: 'healthy'
  });
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const { data: potions } = useQuery({
    queryKey: ['potions'],
    queryFn: () => base44.entities.Potion.list(),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const researchTechs = [
    {
      id: 1,
      name: "Enhanced Miniaturization",
      unlocked: (user?.research_progress?.[1] || 0) >= 100,
      icon: Atom,
      color: "#3b82f6"
    },
    {
      id: 2,
      name: "Stabilization Protocol",
      unlocked: (user?.research_progress?.[2] || 0) >= 100,
      icon: Activity,
      color: "#10b981"
    },
    {
      id: 3,
      name: "Quantum Entanglement Link",
      unlocked: (user?.research_progress?.[3] || 0) >= 100,
      icon: Zap,
      color: "#8b5cf6"
    },
    {
      id: 4,
      name: "Bio-Compatible Formula",
      unlocked: (user?.research_progress?.[4] || 0) >= 100,
      icon: Heart,
      color: "#ec4899"
    },
    {
      id: 5,
      name: "Reverse Engineering",
      unlocked: (user?.research_progress?.[5] || 0) >= 100,
      icon: FlaskConical,
      color: "#f59e0b"
    },
    {
      id: 6,
      name: "Nano-Scale Breakthrough",
      unlocked: (user?.research_progress?.[6] || 0) >= 100,
      icon: Sparkles,
      color: "#ef4444"
    }
  ];

  const resetSubject = () => {
    setTestSubject({
      health: 100,
      energy: 100,
      mental: 100,
      status: 'healthy'
    });
    setTestResults([]);
    setSelectedPotion(null);
    setSelectedTech(null);
  };

  const getDetailedSummary = (type, name, effects) => {
    if (type === 'potion') {
      const potionSummaries = {
        'Water': {
          physical: "Subject shows mild hydration improvement. Cellular function normalized. Skin elasticity increased by 8%.",
          mental: "No significant cognitive changes detected. Baseline mental clarity maintained.",
          lifestyle: "Subject reports feeling refreshed. Daily water intake patterns may improve long-term health.",
          social: "Standard hydration levels promote better social interaction and communication.",
          longTerm: "Consistent application supports kidney function and metabolic health."
        },
        'Hydroxide': {
          physical: "Caustic effects on tissue. Subject experiencing mild chemical burns. Cellular damage detected at application site.",
          mental: "Stress response activated. Anxiety levels elevated by 15%. Pain signals affecting concentration.",
          lifestyle: "Subject reports discomfort affecting daily activities. Mobility reduced by 12%.",
          social: "Irritability increased. Social interactions may be negatively impacted by pain responses.",
          longTerm: "Repeated exposure could lead to permanent tissue scarring and chronic pain."
        },
        'Methylene': {
          physical: "Subject displays increased metabolic rate. Muscle efficiency improved by 22%. Minor tremors observed.",
          mental: "Significant cognitive enhancement. Problem-solving speed increased by 35%. Heightened focus and alertness.",
          lifestyle: "Subject reports feeling 'wired' and energetic. Sleep patterns may be disrupted. Productivity surge noted.",
          social: "Increased talkativeness and social engagement. May appear hyperactive to peers.",
          longTerm: "Sustained use could lead to dependency. Risk of adrenal fatigue if overused."
        },
        'Cyan Essence': {
          physical: "Slight energy depletion noted. Muscle tone unaffected. Minor fatigue in extremities.",
          mental: "Profound mental clarity achieved. Creative thinking enhanced by 48%. Subject enters meditative state easily.",
          lifestyle: "Subject describes 'seeing things differently'. Philosophical thinking increased. May seek quiet reflection.",
          social: "Reduced desire for social interaction. Prefers solitary contemplation. Empathy and understanding deepened.",
          longTerm: "May promote long-term mental well-being. Risk of social withdrawal if used excessively."
        },
        'Amino Base': {
          physical: "Cellular regeneration accelerated by 18%. Wound healing rate improved. Immune response strengthened.",
          mental: "Mental clarity mildly improved. Stress hormone levels reduced. Mood stabilization observed.",
          lifestyle: "Subject reports feeling 'balanced' and healthy. Recovery from physical exertion faster.",
          social: "Positive mood promotes better social bonds. Patience and understanding increased.",
          longTerm: "Excellent for longevity and health maintenance. Minimal side effects detected."
        },
        'Calcium Nitride': {
          physical: "Bone density increased by 12%. Structural integrity of skeleton enhanced. Energy reserves depleted faster.",
          mental: "No significant changes to cognitive function. Baseline mental state maintained.",
          lifestyle: "Subject feels physically stronger but tires more easily. May require increased caloric intake.",
          social: "Confidence in physical abilities increased. May engage in more physically demanding activities.",
          longTerm: "Beneficial for skeletal health. Long-term use may cause metabolic imbalance."
        },
        'Iron Oxide': {
          physical: "Oxidative stress detected. Free radical damage observed in cells. Iron absorption inhibited.",
          mental: "Cognitive fog reported. Decision-making slowed by 22%. Short-term memory affected.",
          lifestyle: "Subject reports feeling lethargic and unmotivated. Daily routines become challenging.",
          social: "Social withdrawal tendencies. Communication skills temporarily impaired.",
          longTerm: "Chronic exposure risks anemia and neurological damage. Not recommended for repeated use."
        },
        'Magnesium Carbon': {
          physical: "Severe cellular damage. Necrosis detected in test tissue. Health declining rapidly.",
          mental: "Severe mental distress. Panic response triggered. Cognitive function severely impaired.",
          lifestyle: "Subject unable to perform basic tasks. Quality of life drastically reduced.",
          social: "Complete social withdrawal. Unable to communicate effectively. Requires immediate intervention.",
          longTerm: "Potentially lethal. Emergency medical attention required. No long-term viability."
        }
      };
      return potionSummaries[name] || {
        physical: "Effects unknown. Further testing required.",
        mental: "Mental state monitoring inconclusive.",
        lifestyle: "Lifestyle impact data insufficient.",
        social: "Social behavior changes not documented.",
        longTerm: "Long-term effects require additional research."
      };
    } else {
      const techSummaries = {
        'Enhanced Miniaturization': {
          physical: "Subject successfully miniaturized to 40% original size. Cellular structure intact. Mass-energy efficiency increased by 42%.",
          mental: "Cognitive function preserved at micro-scale. Subject reports surreal perspective shift. Spatial awareness recalibrated.",
          lifestyle: "Daily activities transformed. Subject can explore previously inaccessible spaces. New world perspective achieved.",
          social: "Communication with macro-scale individuals requires quantum link. Subject feels isolated yet empowered.",
          longTerm: "Permanent miniaturization possible. Subject may choose micro-scale living indefinitely."
        },
        'Stabilization Protocol': {
          physical: "Miniaturized state stabilized indefinitely. No energy decay detected. Subject remains healthy at micro-scale.",
          mental: "Mental stability enhanced. Subject reports feeling 'locked in' to current state. Confidence increased.",
          lifestyle: "Freedom from size fluctuation. Subject can plan long-term micro-scale activities without risk.",
          social: "Stability allows for building micro-communities. Social structures possible at small scale.",
          longTerm: "Enables permanent micro-civilization. Subject can live entire life at reduced scale safely."
        },
        'Quantum Entanglement Link': {
          physical: "Physical form unaffected. Quantum particles entangled with macro-scale transmitters.",
          mental: "Subject experiences simultaneous awareness across scales. Describes 'existing in two places'. Neural pathways expanded.",
          lifestyle: "Can communicate instantly across size barriers. Work and relationships no longer limited by scale.",
          social: "Revolutionary social implications. Micro-macro societies now possible. Subject reports feeling connected to both worlds.",
          longTerm: "Bridges gap between scales permanently. Subject becomes ambassador between size realms."
        },
        'Bio-Compatible Formula': {
          physical: "Biological systems respond positively to miniaturization. Organs function optimally at micro-scale. Health improved by 28%.",
          mental: "Brain function enhanced at reduced scale. Neural efficiency increased. Memory and learning improved.",
          lifestyle: "Subject thrives in miniaturized state. Reports feeling healthier than at normal scale.",
          social: "Can interact safely with other miniaturized beings. Micro-medicine applications revolutionary.",
          longTerm: "Opens medical treatments previously impossible. Subject can be miniaturized for surgery then restored safely."
        },
        'Reverse Engineering': {
          physical: "Subject returned to original scale successfully. No cellular damage. Complete restoration achieved.",
          mental: "Subject retains memories of micro-scale experience. Cognitive function enhanced from dual-scale perspective.",
          lifestyle: "Subject can freely transition between scales. Ultimate freedom of size achieved.",
          social: "Can experience both micro and macro societies at will. Unique position in society.",
          longTerm: "Subject becomes scale-fluid. Can choose ideal size for any situation. Revolutionary life flexibility."
        },
        'Nano-Scale Breakthrough': {
          physical: "Subject reduced to nano-scale (1/1000th micro). Atomic-level manipulation possible. Cellular awareness achieved.",
          mental: "Subject experiences reality at quantum level. Reports seeing 'the building blocks of existence'. Profound enlightenment.",
          lifestyle: "Life transformed completely. Subject can interact with individual atoms. God-like perspective attained.",
          social: "Communication with macro/micro scales requires advanced quantum link. Subject exists in unique realm.",
          longTerm: "Subject becomes architect of matter itself. Can manipulate reality at fundamental level."
        }
      };
      return techSummaries[name] || {
        physical: "Technology effects under observation.",
        mental: "Mental impact being studied.",
        lifestyle: "Lifestyle changes being documented.",
        social: "Social implications under analysis.",
        longTerm: "Long-term viability being assessed."
      };
    }
  };

  const applyTest = () => {
    if (!selectedPotion && !selectedTech) return;
    
    setIsTesting(true);
    setTimeout(() => {
      let effect = { health: 0, energy: 0, mental: 0 };
      let name = '';
      let color = '#ffffff';
      let type = '';

      if (selectedPotion) {
        type = 'potion';
        name = selectedPotion.name;
        color = selectedPotion.color;
        const effects = {
          'Water': { health: 5, energy: 10, mental: 0 },
          'Hydroxide': { health: -10, energy: 0, mental: -5 },
          'Methylene': { health: 0, energy: 30, mental: 10 },
          'Cyan Essence': { health: 0, energy: -5, mental: 40 },
          'Amino Base': { health: 15, energy: 5, mental: 5 },
          'Calcium Nitride': { health: 25, energy: -10, mental: 0 },
          'Iron Oxide': { health: -5, energy: -15, mental: -10 },
          'Magnesium Carbon': { health: -20, energy: 20, mental: -20 }
        };
        effect = effects[name] || effect;
      } else if (selectedTech) {
        type = 'tech';
        name = selectedTech.name;
        color = selectedTech.color;
        const techEffects = {
          'Enhanced Miniaturization': { health: 10, energy: -15, mental: 25 },
          'Stabilization Protocol': { health: 20, energy: 0, mental: 15 },
          'Quantum Entanglement Link': { health: 5, energy: -10, mental: 35 },
          'Bio-Compatible Formula': { health: 30, energy: 10, mental: 10 },
          'Reverse Engineering': { health: 15, energy: 20, mental: 5 },
          'Nano-Scale Breakthrough': { health: -10, energy: -20, mental: 50 }
        };
        effect = techEffects[name] || effect;
      }
      
      const newHealth = Math.max(0, Math.min(100, testSubject.health + effect.health));
      const newEnergy = Math.max(0, Math.min(100, testSubject.energy + effect.energy));
      const newMental = Math.max(0, Math.min(100, testSubject.mental + effect.mental));
      
      let status = 'healthy';
      if (newHealth < 30 || newEnergy < 30 || newMental < 30) status = 'distressed';
      if (newHealth < 10 || newEnergy < 10 || newMental < 10) status = 'critical';
      if (newHealth === 0) status = 'deceased';

      setTestSubject({
        health: newHealth,
        energy: newEnergy,
        mental: newMental,
        status
      });

      const result = {
        name,
        type,
        time: new Date().toLocaleTimeString(),
        effects: effect,
        outcome: status,
        color,
        detailedSummary: getDetailedSummary(type, name, effect)
      };

      setTestResults([result, ...testResults]);
      setIsTesting(false);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'text-green-400';
      case 'distressed': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'deceased': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const getBarColor = (value) => {
    if (value > 60) return 'bg-green-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const unlockedTechs = researchTechs.filter(tech => tech.unlocked);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Test Subject Display */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Test Subject Alpha-01
              </span>
              <Badge className={`${getStatusColor(testSubject.status)} text-lg`}>
                {testSubject.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject Visualization */}
            <div className="relative bg-black/30 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
              <div className="relative">
                {/* Simple test subject representation */}
                <div className="w-32 h-40 relative">
                  {/* Head */}
                  <div 
                    className="w-20 h-20 rounded-full mx-auto border-4 transition-all"
                    style={{ 
                      borderColor: testSubject.status === 'deceased' ? '#9ca3af' :
                                   testSubject.mental > 60 ? '#10b981' :
                                   testSubject.mental > 30 ? '#f59e0b' : '#ef4444',
                      backgroundColor: testSubject.status === 'deceased' ? '#1f2937' : '#1e3a8a'
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Brain className={`w-8 h-8 ${testSubject.status === 'deceased' ? 'text-gray-600' : 'text-blue-300'}`} />
                    </div>
                  </div>
                  {/* Body */}
                  <div 
                    className="w-16 h-20 mx-auto mt-2 rounded-lg border-4 transition-all"
                    style={{ 
                      borderColor: testSubject.status === 'deceased' ? '#9ca3af' :
                                   testSubject.health > 60 ? '#10b981' :
                                   testSubject.health > 30 ? '#f59e0b' : '#ef4444',
                      backgroundColor: testSubject.status === 'deceased' ? '#1f2937' : '#1e40af'
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Heart className={`w-6 h-6 ${testSubject.status === 'deceased' ? 'text-gray-600' : 'text-red-400'} ${testSubject.status !== 'deceased' ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Status effects */}
                {testSubject.status !== 'healthy' && testSubject.status !== 'deceased' && (
                  <div className="absolute -top-4 -right-4">
                    <AlertTriangle className={`w-12 h-12 ${testSubject.status === 'critical' ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`} />
                  </div>
                )}
              </div>
            </div>

            {/* Vital Stats */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Health
                  </span>
                  <span className="text-sm text-white font-bold">{testSubject.health}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getBarColor(testSubject.health)}`}
                    style={{ width: `${testSubject.health}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Energy
                  </span>
                  <span className="text-sm text-white font-bold">{testSubject.energy}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getBarColor(testSubject.energy)}`}
                    style={{ width: `${testSubject.energy}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Mental State
                  </span>
                  <span className="text-sm text-white font-bold">{testSubject.mental}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getBarColor(testSubject.mental)}`}
                    style={{ width: `${testSubject.mental}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={applyTest}
                disabled={(!selectedPotion && !selectedTech) || isTesting || testSubject.status === 'deceased'}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              >
                {isTesting ? (
                  <>
                    <FlaskConical className="w-4 h-4 mr-2 animate-bounce" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Apply {selectedTech ? 'Technology' : 'Potion'}
                  </>
                )}
              </Button>
              <Button
                onClick={resetSubject}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Reset Subject
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selection Panel */}
        <div className="space-y-6">
          {/* R&D Technologies */}
          {unlockedTechs.length > 0 && (
            <Card className="bg-white/5 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
                  <Atom className="w-4 h-4" />
                  R&D Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
                {unlockedTechs.map(tech => (
                  <button
                    key={tech.id}
                    onClick={() => { setSelectedTech(tech); setSelectedPotion(null); }}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTech?.id === tech.id
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: tech.color + '20' }}
                      >
                        <tech.icon className="w-4 h-4" style={{ color: tech.color }} />
                      </div>
                      <span className="text-white font-bold text-sm">{tech.name}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Available Potions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Available Potions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
              {potions.map(potion => (
                <button
                  key={potion.id}
                  onClick={() => { setSelectedPotion(potion); setSelectedTech(null); }}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPotion?.id === potion.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: potion.color }}
                    />
                    <span className="text-white font-bold text-sm">{potion.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{potion.effect}</p>
                </button>
              ))}
              {potions.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No potions available. Create some in the Experiment Lab!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Test Results */}
      {testResults.length > 0 && (
        <Card className="bg-white/5 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detailed Test Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {testResults.map((result, index) => (
              <Card key={index} className="bg-black/30 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: result.color }}
                      />
                      <span className="text-white font-bold">{result.name}</span>
                      <Badge className="bg-gray-700 text-gray-300">
                        {result.type === 'tech' ? 'R&D Tech' : 'Potion'}
                      </Badge>
                    </div>
                    <span className="text-gray-500 text-xs">{result.time}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Health:</span>
                      <span className={result.effects.health >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {result.effects.health >= 0 ? '+' : ''}{result.effects.health}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Energy:</span>
                      <span className={result.effects.energy >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {result.effects.energy >= 0 ? '+' : ''}{result.effects.energy}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Mental:</span>
                      <span className={result.effects.mental >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {result.effects.mental >= 0 ? '+' : ''}{result.effects.mental}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 space-y-3">
                    <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                      <p className="text-blue-400 text-xs font-bold mb-1">PHYSICAL WELL-BEING</p>
                      <p className="text-gray-300 text-xs">{result.detailedSummary.physical}</p>
                    </div>

                    <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                      <p className="text-purple-400 text-xs font-bold mb-1">MENTAL & COGNITIVE</p>
                      <p className="text-gray-300 text-xs">{result.detailedSummary.mental}</p>
                    </div>

                    <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                      <p className="text-green-400 text-xs font-bold mb-1">LIFESTYLE CHANGES</p>
                      <p className="text-gray-300 text-xs">{result.detailedSummary.lifestyle}</p>
                    </div>

                    <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/30">
                      <p className="text-yellow-400 text-xs font-bold mb-1">SOCIAL BEHAVIOR</p>
                      <p className="text-gray-300 text-xs">{result.detailedSummary.social}</p>
                    </div>

                    <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                      <p className="text-red-400 text-xs font-bold mb-1">LONG-TERM PROGNOSIS</p>
                      <p className="text-gray-300 text-xs">{result.detailedSummary.longTerm}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    <span className={`text-sm font-bold ${getStatusColor(result.outcome)}`}>
                      FINAL STATUS: {result.outcome.toUpperCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}