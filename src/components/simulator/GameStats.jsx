import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target, Minimize2 } from "lucide-react";

export default function GameStats({ stats }) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-lg">Game Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Collected</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.itemsCollected}</p>
        </div>

        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Minimize2 className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Size</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.miniaturizationLevel}%</p>
        </div>

        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Score</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.score}</p>
        </div>

        <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-sm">Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.time}s</p>
        </div>
      </CardContent>
    </Card>
  );
}