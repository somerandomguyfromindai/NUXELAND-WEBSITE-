import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Zap, Info } from "lucide-react";
import ThreeJsSimulator from "../components/simulator/ThreeJsSimulator";
import GameControls from "../components/simulator/GameControls";
import GameStats from "../components/simulator/GameStats";

export default function Simulator() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState({
    itemsCollected: 0,
    miniaturizationLevel: 100,
    score: 0,
    time: 0
  });

  const handleGameStart = () => {
    setGameStarted(true);
    setGameStats({
      itemsCollected: 0,
      miniaturizationLevel: 100,
      score: 0,
      time: 0
    });
  };

  const handleGameReset = () => {
    setGameStarted(false);
    setGameStats({
      itemsCollected: 0,
      miniaturizationLevel: 100,
      score: 0,
      time: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
            <Zap className="w-10 h-10 text-blue-400" />
            3D Miniaturization Game
          </h1>
          <p className="text-xl text-gray-400">
            Navigate through a microscopic world and experience miniaturization
          </p>
        </div>

        {!gameStarted ? (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-400" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-blue-400 font-semibold mb-3 text-lg">🎮 Controls</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <span className="text-white font-medium">W/A/S/D</span> - Move around</li>
                      <li>• <span className="text-white font-medium">Mouse</span> - Look around</li>
                      <li>• <span className="text-white font-medium">Space</span> - Jump</li>
                      <li>• <span className="text-white font-medium">Shift</span> - Run faster</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-green-400 font-semibold mb-3 text-lg">🎯 Objectives</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Collect <span className="text-blue-400">blue orbs</span> to shrink</li>
                      <li>• Avoid <span className="text-red-400">red obstacles</span></li>
                      <li>• Reach the <span className="text-green-400">goal</span></li>
                      <li>• Explore the nano-world</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-purple-400 font-semibold mb-3 text-lg">🌟 Game Features</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                    <div>
                      <p className="text-white font-medium mb-1">Dynamic Scaling</p>
                      <p className="text-sm">Experience size changes in real-time</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">3D Environment</p>
                      <p className="text-sm">Immersive microscopic landscapes</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Physics</p>
                      <p className="text-sm">Realistic movement and collisions</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGameStart}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xl py-7"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Game Canvas */}
            <div className="lg:col-span-3">
              <Card className="bg-black border-blue-500/20 overflow-hidden">
                <CardContent className="p-0">
                  <ThreeJsSimulator 
                    gameStarted={gameStarted}
                    onStatsUpdate={setGameStats}
                  />
                </CardContent>
              </Card>
              
              <div className="mt-4">
                <Button
                  onClick={handleGameReset}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Game
                </Button>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <GameStats stats={gameStats} />
              <GameControls />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}