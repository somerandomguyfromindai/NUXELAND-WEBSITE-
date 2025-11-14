import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Heart, Droplet, Thermometer, AlertCircle, Target, Play } from "lucide-react";
import MissionMap from "./MissionMap";
import MissionLog from "./MissionLog";

export default function AgentMonitor({ gameState, setGameState }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
    initialData: [],
  });

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  useEffect(() => {
    const active = missions.find(m => m.status === 'active');
    if (active) {
      setActiveMission(active);
    } else {
      const next = missions.find(m => m.status === 'locked');
      if (next && next.mission_number === 1) {
        // Auto-start first mission
        updateMissionMutation.mutate({ 
          id: next.id, 
          data: { status: 'active' } 
        });
      }
    }
  }, [missions]);

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Agent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  return (
    <div className="grid lg:grid-cols-3 gap-4 p-6">
      {/* Map View */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-mono font-bold">
                {activeMission?.location || "NO ACTIVE MISSION"}
              </h3>
              <p className="text-gray-500 text-sm font-mono">
                Mission #{activeMission?.mission_number || "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-mono">LIVE</span>
            </div>
          </div>
          
          <MissionMap 
            agents={agents}
            activeMission={activeMission}
            onAgentClick={setSelectedAgent}
            onMapClick={(x, y) => {
              if (selectedAgent) {
                updateAgentMutation.mutate({
                  id: selectedAgent.id,
                  data: { position_x: x, position_y: y }
                });
              }
            }}
          />
        </div>

        {/* Agent Vitals */}
        <div className="grid md:grid-cols-2 gap-4">
          {agents.map(agent => (
            <Card 
              key={agent.id}
              className={`bg-[#0F1729] border-2 cursor-pointer transition-all ${
                selectedAgent?.id === agent.id 
                  ? 'border-blue-500' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-bold font-mono">
                      AGENT_{agent.codename.toUpperCase()}
                    </h4>
                    <span className={`text-xs font-mono ${
                      agent.status === 'active' ? 'text-green-400' :
                      agent.status === 'distressed' ? 'text-yellow-400' :
                      agent.status === 'critical' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-400 font-mono">HR</span>
                    </div>
                    <span className="text-white font-mono">
                      {agent.vitals?.heart_rate || 0} BPM
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 font-mono">H2O</span>
                    </div>
                    <span className="text-white font-mono">
                      {agent.vitals?.hydration || 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-400 font-mono">TEMP</span>
                    </div>
                    <span className="text-white font-mono">
                      {agent.vitals?.temperature || 0}°C
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-mono">BIO-STRESS</span>
                      <span className={`text-sm font-bold font-mono ${
                        agent.bio_stress > 70 ? 'text-red-400' :
                        agent.bio_stress > 40 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {agent.bio_stress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          agent.bio_stress > 70 ? 'bg-red-500' :
                          agent.bio_stress > 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${agent.bio_stress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Log Panel */}
      <div>
        <MissionLog 
          activeMission={activeMission}
          agents={agents}
          onMissionComplete={(missionId) => {
            updateMissionMutation.mutate({
              id: missionId,
              data: { status: 'completed' }
            });
            
            setGameState(prev => ({
              ...prev,
              completedMissions: [...prev.completedMissions, missionId]
            }));

            // Unlock next mission
            const nextMission = missions.find(m => 
              m.status === 'locked' && 
              m.mission_number === activeMission.mission_number + 1
            );
            if (nextMission) {
              setTimeout(() => {
                updateMissionMutation.mutate({
                  id: nextMission.id,
                  data: { status: 'active' }
                });
              }, 1000);
            }
          }}
        />
      </div>
    </div>
  );
}