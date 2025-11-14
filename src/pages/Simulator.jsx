import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Folder, Radio, AlertTriangle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Mission3DView from "../components/game/Mission3DView";
import FileBrowser from "../components/game/FileBrowser";
import CommsPanel from "../components/game/CommsPanel";
import FinalChoice from "../components/game/FinalChoice";
import MatrixEscape from "../components/game/MatrixEscape";

export default function Simulator() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [showFinalChoice, setShowFinalChoice] = useState(false);
  const [showMatrixEscape, setShowMatrixEscape] = useState(false);
  const [gameState, setGameState] = useState({
    completedMissions: [],
    unlockedChannels: ['#general'],
    decryptedFiles: [],
    currentMission: null
  });

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  useEffect(() => {
    const activeMission = missions.find(m => m.status === 'active');
    if (activeMission) {
      setGameState(prev => ({ ...prev, currentMission: activeMission }));
    }
  }, [missions]);

  useEffect(() => {
    const allCompleted = missions.filter(m => m.status === 'completed').length >= 3;
    if (allCompleted && missions.length >= 3) {
      setTimeout(() => setShowFinalChoice(true), 2000);
    }
  }, [missions]);

  if (showMatrixEscape) {
    return <MatrixEscape />;
  }

  if (showFinalChoice) {
    return <FinalChoice 
      gameState={gameState} 
      onChoice={() => setShowMatrixEscape(true)} 
    />;
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="mb-6 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-mono text-sm">UNAUTHORIZED ACCESS</span>
            <span className="text-gray-500 font-mono text-xs ml-auto">
              etinuxE Corp // A.N.T. Console v2.4.1
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-mono">
            &gt; THE A.N.T. CONSOLE
          </h1>
          <p className="text-gray-400 font-mono text-sm mt-1">
            Agent Navigation & Telemetry // Session Logged
          </p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-300 text-sm font-mono">
            CLASSIFIED SYSTEM // Complete missions sequentially to progress
          </p>
        </div>

        {/* Main Interface */}
        <Card className="bg-[#0F1729] border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-[#1A1F2E] border-b border-gray-700 rounded-none">
              <TabsTrigger 
                value="monitor" 
                className="flex-1 data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-400"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Agent Monitor (3D)
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="flex-1 data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400"
              >
                <Folder className="w-4 h-4 mr-2" />
                File Explorer
              </TabsTrigger>
              <TabsTrigger 
                value="comms"
                className="flex-1 data-[state=active]:bg-green-900/30 data-[state=active]:text-green-400"
              >
                <Radio className="w-4 h-4 mr-2" />
                Internal Comms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitor" className="p-0">
              <Mission3DView gameState={gameState} setGameState={setGameState} />
            </TabsContent>

            <TabsContent value="files" className="p-0">
              <FileBrowser gameState={gameState} setGameState={setGameState} />
            </TabsContent>

            <TabsContent value="comms" className="p-0">
              <CommsPanel gameState={gameState} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}