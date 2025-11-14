import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Activity, Heart, Brain, Zap, AlertTriangle } from "lucide-react";

export default function TestingLab() {
  const [selectedPotion, setSelectedPotion] = useState(null);
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

  const resetSubject = () => {
    setTestSubject({
      health: 100,
      energy: 100,
      mental: 100,
      status: 'healthy'
    });
    setTestResults([]);
    setSelectedPotion(null);
  };

  const applyPotion = () => {
    if (!selectedPotion) return;
    
    setIsTesting(true);
    setTimeout(() => {
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

      const effect = effects[selectedPotion.name] || { health: 0, energy: 0, mental: 0 };
      
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
        potion: selectedPotion.name,
        time: new Date().toLocaleTimeString(),
        effects: effect,
        outcome: status,
        color: selectedPotion.color
      };

      setTestResults([result, ...testResults]);
      setIsTesting(false);
    }, 1500);
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

  return (
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
              onClick={applyPotion}
              disabled={!selectedPotion || isTesting || testSubject.status === 'deceased'}
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
                  Apply Potion
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

      {/* Potion Selection & Results */}
      <div className="space-y-6">
        {/* Available Potions */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Select Potion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {potions.map(potion => (
              <button
                key={potion.id}
                onClick={() => setSelectedPotion(potion)}
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

        {/* Test Results Log */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Test Results Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-black/30 rounded border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: result.color }}
                  />
                  <span className="text-white text-xs font-bold">{result.potion}</span>
                  <span className="text-gray-500 text-xs ml-auto">{result.time}</span>
                </div>
                <div className="text-xs space-y-1">
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
                  <div className="mt-1 pt-1 border-t border-white/10">
                    <span className={`text-xs font-bold ${getStatusColor(result.outcome)}`}>
                      Status: {result.outcome.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {testResults.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No tests conducted yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}