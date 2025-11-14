import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, Lock, Clock } from "lucide-react";

export default function MissionTimeline() {
  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  const sortedMissions = [...missions].sort((a, b) => a.mission_number - b.mission_number);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'active': return <Clock className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'locked': return <Lock className="w-6 h-6 text-gray-600" />;
      default: return <Circle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'border-green-500/50 bg-green-900/10';
      case 'active': return 'border-yellow-500/50 bg-yellow-900/10';
      case 'locked': return 'border-gray-700/50 bg-gray-900/10';
      default: return 'border-gray-700/50 bg-gray-900/10';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white font-mono mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-400" />
          MISSION TIMELINE
        </h2>
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          
          <div className="space-y-6">
            {sortedMissions.map((mission, index) => (
              <div key={mission.id} className="relative pl-16">
                {/* Timeline dot */}
                <div className="absolute left-3 top-6 -translate-x-1/2">
                  {getStatusIcon(mission.status)}
                </div>
                
                <Card className={`${getStatusColor(mission.status)} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-mono font-bold text-lg">
                          Mission {mission.mission_number}: {mission.title}
                        </h3>
                        <p className="text-gray-400 text-sm font-mono">{mission.location}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                        mission.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        mission.status === 'active' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {mission.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{mission.briefing}</p>
                    
                    {mission.objectives && mission.objectives.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-gray-400 text-xs font-mono font-bold mb-2">OBJECTIVES:</p>
                        {mission.objectives.map((obj, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {obj.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-600" />
                            )}
                            <span className={obj.completed ? 'text-green-400' : 'text-gray-500'}>
                              {obj.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {mission.unlocks && mission.unlocks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-blue-400 text-xs font-mono">
                          UNLOCKS: {mission.unlocks.join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}