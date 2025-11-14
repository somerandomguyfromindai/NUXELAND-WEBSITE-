import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Folder, Radio, AlertTriangle } from "lucide-react";
import AgentMonitor from "../components/game/AgentMonitor";
import FileBrowser from "../components/game/FileBrowser";
import CommsPanel from "../components/game/CommsPanel";
import FinalChoice from "../components/game/FinalChoice";

export default function Simulator() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [showFinalChoice, setShowFinalChoice] = useState(false);
  const [gameState, setGameState] = useState({
    completedMissions: [],
    unlockedChannels: [],
    decryptedFiles: []
  });

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  useEffect(() => {
    // Check if all missions completed
    const allCompleted = missions.every(m => m.status === 'completed');
    if (allCompleted && missions.length >= 3) {
      setTimeout(() => setShowFinalChoice(true), 2000);
    }
  }, [missions]);

  if (showFinalChoice) {
    return <FinalChoice gameState={gameState} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="mb-6 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-mono text-sm">SYSTEM ACTIVE</span>
            <span className="text-gray-500 font-mono text-xs ml-auto">
              etinuxE Corp // Internal Terminal v2.4.1
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-mono">
            &gt; MINIATURIZATION COMMAND CENTER
          </h1>
          <p className="text-gray-400 font-mono text-sm mt-1">
            Unauthorized access detected. Session logged.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-300 text-sm font-mono">
            CLASSIFIED: This terminal contains sensitive etinuxE operational data
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
                Agent Monitor
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="flex-1 data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400"
              >
                <Folder className="w-4 h-4 mr-2" />
                File Browser
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
              <AgentMonitor gameState={gameState} setGameState={setGameState} />
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