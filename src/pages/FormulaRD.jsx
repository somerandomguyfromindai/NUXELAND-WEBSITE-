import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Zap, Lock, CheckCircle, AlertTriangle, Atom } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function FormulaRD() {
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [researchInProgress, setResearchInProgress] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const researchProjects = [
    {
      id: 1,
      name: "Enhanced Miniaturization",
      description: "Improve the formula's efficiency, reducing energy consumption by 40%",
      category: "Efficiency",
      unlocked: true,
      resourcesRequired: { 'Iron Scrap': 5, 'Copper Wire': 3, 'Data Chip': 2 },
      timeRequired: 5000,
      benefits: "Unlock Micro-Scale Technology",
      progress: user?.research_progress?.[1] || 0
    },
    {
      id: 2,
      name: "Stabilization Protocol",
      description: "Develop stabilizers to maintain miniaturized state indefinitely",
      category: "Safety",
      unlocked: true,
      resourcesRequired: { 'Quantum Core': 2, 'Energy Cell': 4, 'Circuit Board': 3 },
      timeRequired: 7000,
      benefits: "Permanent miniaturization without decay",
      progress: user?.research_progress?.[2] || 0
    },
    {
      id: 3,
      name: "Quantum Entanglement Link",
      description: "Enable communication between macro and micro scales",
      category: "Communication",
      unlocked: (user?.research_progress?.[1] || 0) >= 100,
      resourcesRequired: { 'Quantum Core': 5, 'Data Chip': 6, 'Energy Cell': 3 },
      timeRequired: 10000,
      benefits: "Two-way data transmission across scales",
      progress: user?.research_progress?.[3] || 0
    },
    {
      id: 4,
      name: "Bio-Compatible Formula",
      description: "Adapt formula for safe biological miniaturization",
      category: "Medical",
      unlocked: (user?.research_progress?.[2] || 0) >= 100,
      resourcesRequired: { 'Plastic Chip': 8, 'Circuit Board': 5, 'Data Chip': 4 },
      timeRequired: 12000,
      benefits: "Enable medical applications",
      progress: user?.research_progress?.[4] || 0
    },
    {
      id: 5,
      name: "Reverse Engineering",
      description: "Develop a controlled method to reverse miniaturization",
      category: "Reversal",
      unlocked: (user?.research_progress?.[3] || 0) >= 100,
      resourcesRequired: { 'Quantum Core': 10, 'Energy Cell': 8, 'Data Chip': 6 },
      timeRequired: 15000,
      benefits: "Safe return to normal scale",
      progress: user?.research_progress?.[5] || 0
    },
    {
      id: 6,
      name: "Nano-Scale Breakthrough",
      description: "Push beyond micro to achieve true nanotechnology",
      category: "Advanced",
      unlocked: (user?.research_progress?.[1] || 0) >= 100 && (user?.research_progress?.[4] || 0) >= 100,
      resourcesRequired: { 'Quantum Core': 15, 'Energy Cell': 12, 'Circuit Board': 10 },
      timeRequired: 20000,
      benefits: "Unlock atomic-level manipulation",
      progress: user?.research_progress?.[6] || 0
    }
  ];

  const startResearch = async (project) => {
    const inventory = user?.resource_inventory || {};
    const canResearch = Object.entries(project.resourcesRequired).every(
      ([resource, required]) => (inventory[resource] || 0) >= required
    );

    if (!canResearch) {
      alert("Insufficient resources!");
      return;
    }

    setResearchInProgress(project);
    
    // Deduct resources
    const newInventory = { ...inventory };
    Object.entries(project.resourcesRequired).forEach(([resource, amount]) => {
      newInventory[resource] = (newInventory[resource] || 0) - amount;
    });

    await base44.auth.updateMe({ resource_inventory: newInventory });
    queryClient.invalidateQueries({ queryKey: ['current-user'] });

    // Simulate research progress
    const interval = setInterval(async () => {
      const currentProgress = user?.research_progress?.[project.id] || 0;
      const newProgress = Math.min(currentProgress + 10, 100);
      
      await base44.auth.updateMe({ 
        research_progress: { ...(user?.research_progress || {}), [project.id]: newProgress }
      });
      
      queryClient.invalidateQueries({ queryKey: ['current-user'] });

      if (newProgress >= 100) {
        clearInterval(interval);
        setResearchInProgress(null);
        alert(`Research complete: ${project.name}!`);
      }
    }, project.timeRequired / 10);
  };

  const categoryColors = {
    "Efficiency": "bg-blue-500/20 text-blue-400 border-blue-500",
    "Safety": "bg-green-500/20 text-green-400 border-green-500",
    "Communication": "bg-purple-500/20 text-purple-400 border-purple-500",
    "Medical": "bg-pink-500/20 text-pink-400 border-pink-500",
    "Reversal": "bg-yellow-500/20 text-yellow-400 border-yellow-500",
    "Advanced": "bg-red-500/20 text-red-400 border-red-500"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1a1f3a] to-[#0A0E1A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold text-white font-mono">FORMULA R&D</h1>
              <p className="text-gray-400 font-mono text-sm">Research & Development Laboratory</p>
            </div>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-500/50 rounded-lg p-4 flex items-start gap-3">
            <Atom className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-cyan-300 text-sm font-mono">
              <p className="font-bold mb-1">RESEARCH STATUS</p>
              <p>Advance the miniaturization formula through scientific research. Each breakthrough unlocks new capabilities.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {researchProjects.map((project) => {
            const inventory = user?.resource_inventory || {};
            const canResearch = project.unlocked && Object.entries(project.resourcesRequired).every(
              ([resource, required]) => (inventory[resource] || 0) >= required
            );
            const isComplete = project.progress >= 100;
            const isInProgress = researchInProgress?.id === project.id;

            return (
              <Card key={project.id} className={`bg-[#0F1729] transition-all ${
                !project.unlocked ? 'border-gray-700 opacity-50' :
                isComplete ? 'border-green-500/50' :
                isInProgress ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' :
                'border-gray-700 hover:border-cyan-500/50'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Badge className={`${categoryColors[project.category]} mb-2`}>
                        {project.category}
                      </Badge>
                      <CardTitle className="text-white font-mono text-lg">{project.name}</CardTitle>
                    </div>
                    {!project.unlocked && <Lock className="w-5 h-5 text-gray-600" />}
                    {isComplete && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {isInProgress && <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm">{project.description}</p>

                  {project.unlocked && (
                    <>
                      <div className="space-y-2">
                        <p className="text-gray-500 text-xs font-mono font-bold">RESOURCES REQUIRED:</p>
                        <div className="space-y-1">
                          {Object.entries(project.resourcesRequired).map(([resource, required]) => {
                            const available = inventory[resource] || 0;
                            const hasEnough = available >= required;
                            return (
                              <div key={resource} className={`flex justify-between text-xs ${
                                hasEnough ? 'text-green-400' : 'text-red-400'
                              }`}>
                                <span>{resource}</span>
                                <span className="font-mono">{available}/{required}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span className="font-mono">PROGRESS</span>
                          <span className="font-mono">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
                        <p className="text-blue-400 text-xs font-mono font-bold mb-1">BENEFITS:</p>
                        <p className="text-blue-300 text-xs">{project.benefits}</p>
                      </div>

                      {!isComplete && (
                        <Button
                          onClick={() => startResearch(project)}
                          disabled={!canResearch || isInProgress}
                          className={`w-full font-mono ${
                            canResearch && !isInProgress
                              ? 'bg-cyan-600 hover:bg-cyan-700'
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {isInProgress ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-pulse" />
                              RESEARCHING...
                            </>
                          ) : canResearch ? (
                            <>
                              <FlaskConical className="w-4 h-4 mr-2" />
                              START RESEARCH
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              INSUFFICIENT RESOURCES
                            </>
                          )}
                        </Button>
                      )}

                      {isComplete && (
                        <div className="bg-green-900/20 border border-green-500/50 rounded p-3 text-center">
                          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                          <p className="text-green-400 text-xs font-mono font-bold">COMPLETE</p>
                        </div>
                      )}
                    </>
                  )}

                  {!project.unlocked && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded p-3 text-center">
                      <Lock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs font-mono">LOCKED</p>
                      <p className="text-gray-600 text-xs mt-1">Complete prerequisites to unlock</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="bg-[#0F1729] border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-purple-400 font-mono text-lg">RESEARCH TREE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="font-mono text-xs text-purple-400 font-bold">UNLOCKING PROGRESSION:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Enhanced Miniaturization → Quantum Entanglement Link</li>
                  <li>• Stabilization Protocol → Bio-Compatible Formula</li>
                  <li>• Quantum Entanglement + Bio-Compatible → Reverse Engineering</li>
                  <li>• Enhanced + Bio-Compatible → Nano-Scale Breakthrough</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1729] border-cyan-500/50">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono text-lg">CURRENT INVENTORY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(user?.resource_inventory || {}).length > 0 ? (
                  Object.entries(user.resource_inventory).map(([resource, amount]) => (
                    <div key={resource} className="flex justify-between text-sm">
                      <span className="text-gray-400">{resource}</span>
                      <span className="text-cyan-400 font-mono font-bold">{amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center">No resources collected yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}