import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Package, Zap, Medal, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Leaderboards() {
  const speedrunLeaders = [
    { rank: 1, name: "Agent_Velocity", time: "4:23.15", missions: 3 },
    { rank: 2, name: "QuickSilver", time: "4:45.82", missions: 3 },
    { rank: 3, name: "TimeWarp", time: "5:01.33", missions: 3 },
    { rank: 4, name: "RushMaster", time: "5:12.91", missions: 3 },
    { rank: 5, name: "SpeedDemon", time: "5:34.20", missions: 3 },
  ];

  const materialLeaders = [
    { rank: 1, name: "ResourceKing", materials: 342, type: "Quantum Core" },
    { rank: 2, name: "Collector_X", materials: 298, type: "Energy Cell" },
    { rank: 3, name: "Hoarder", materials: 276, type: "Data Chip" },
    { rank: 4, name: "GatherPro", materials: 251, type: "Circuit Board" },
    { rank: 5, name: "MaterialMaster", materials: 233, type: "Iron Scrap" },
  ];

  const completionLeaders = [
    { rank: 1, name: "PerfectAgent", completion: 100, missions: 3, achievements: 15 },
    { rank: 2, name: "EliteOps", completion: 100, missions: 3, achievements: 14 },
    { rank: 3, name: "TopPerformer", completion: 98, missions: 3, achievements: 13 },
    { rank: 4, name: "MissionPro", completion: 95, missions: 3, achievements: 12 },
    { rank: 5, name: "SkillMaster", completion: 92, missions: 3, achievements: 11 },
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-gray-500";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6" />;
    if (rank === 2) return <Medal className="w-6 h-6" />;
    if (rank === 3) return <Medal className="w-6 h-6" />;
    return <div className="w-6 h-6 flex items-center justify-center font-bold">{rank}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1a1f3a] to-[#0A0E1A] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-mono flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            LEADERBOARDS
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Compete with other agents for glory and recognition
          </p>
        </div>

        <Tabs defaultValue="speedrun" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 grid grid-cols-3 gap-2">
            <TabsTrigger 
              value="speedrun"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Clock className="w-4 h-4 mr-2" />
              Speedrun
            </TabsTrigger>
            <TabsTrigger 
              value="materials"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <Package className="w-4 h-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger 
              value="completion"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Zap className="w-4 h-4 mr-2" />
              Completion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speedrun">
            <Card className="bg-[#0F1729] border-cyan-500/50">
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  FASTEST MISSION COMPLETION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {speedrunLeaders.map((leader) => (
                    <div
                      key={leader.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg bg-black/30 border ${
                        leader.rank <= 3 ? 'border-cyan-500/50' : 'border-gray-700'
                      }`}
                    >
                      <div className={`${getRankColor(leader.rank)}`}>
                        {getRankIcon(leader.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-mono font-bold">{leader.name}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          {leader.missions} missions completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-mono font-bold text-lg">
                          {leader.time}
                        </p>
                        <p className="text-gray-500 text-xs font-mono">Total Time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card className="bg-[#0F1729] border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  MOST MATERIALS COLLECTED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {materialLeaders.map((leader) => (
                    <div
                      key={leader.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg bg-black/30 border ${
                        leader.rank <= 3 ? 'border-green-500/50' : 'border-gray-700'
                      }`}
                    >
                      <div className={`${getRankColor(leader.rank)}`}>
                        {getRankIcon(leader.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-mono font-bold">{leader.name}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          Specialty: {leader.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-mono font-bold text-lg">
                          {leader.materials}
                        </p>
                        <p className="text-gray-500 text-xs font-mono">Total Items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion">
            <Card className="bg-[#0F1729] border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-400 font-mono flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  MISSION COMPLETION RATE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completionLeaders.map((leader) => (
                    <div
                      key={leader.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg bg-black/30 border ${
                        leader.rank <= 3 ? 'border-purple-500/50' : 'border-gray-700'
                      }`}
                    >
                      <div className={`${getRankColor(leader.rank)}`}>
                        {getRankIcon(leader.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-mono font-bold">{leader.name}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          {leader.achievements} achievements
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-mono font-bold text-lg">
                          {leader.completion}%
                        </p>
                        <p className="text-gray-500 text-xs font-mono">Success Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Trophy className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="text-blue-400 font-mono font-bold text-lg mb-2">
                  How to Rank Up
                </h3>
                <ul className="text-gray-300 text-sm space-y-1 font-mono">
                  <li>• Complete missions quickly to improve your speedrun time</li>
                  <li>• Collect resources during missions to boost your material count</li>
                  <li>• Achieve 100% completion on all objectives for maximum points</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}