import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle, Lock, Clock, Info } from "lucide-react";

export default function NuxelandMap() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  const locations = [
    { 
      id: 'kitchen', 
      name: 'Field Lab 3: The Kitchen', 
      x: 30, 
      y: 40, 
      mission: missions.find(m => m.mission_number === 1),
      description: 'A vast counter-top environment with everyday objects at massive scale'
    },
    { 
      id: 'lab_corridor', 
      name: 'etinuxE Main Laboratory', 
      x: 50, 
      y: 30, 
      mission: missions.find(m => m.mission_number === 2),
      description: 'High-security research facility - restricted access'
    },
    { 
      id: 'underground', 
      name: 'Underground Facility', 
      x: 70, 
      y: 55, 
      mission: missions.find(m => m.mission_number === 3),
      description: 'Classified subterranean complex - maximum security'
    },
    { 
      id: 'hq', 
      name: 'A.N.T. Console HQ', 
      x: 15, 
      y: 20, 
      mission: null,
      description: 'Your command center - mission control and briefing room'
    },
    { 
      id: 'forest', 
      name: 'Miniature Forest Biome', 
      x: 85, 
      y: 75, 
      mission: null,
      description: 'Experimental ecosystem - future operations area'
    }
  ];

  const getLocationStatus = (mission) => {
    if (!mission) return 'unknown';
    return mission.status;
  };

  const getLocationColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-yellow-500 animate-pulse';
      case 'locked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white font-mono mb-6 flex items-center gap-3">
          <MapPin className="w-6 h-6 text-blue-400" />
          NUXELAND OPERATIONAL MAP
        </h2>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-0">
                <div 
                  className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                  }}
                >
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 text-green-400 font-mono text-xs opacity-50">
                    LAT: 42.3601° N | LONG: 71.0589° W
                  </div>
                  <div className="absolute bottom-4 right-4 text-blue-400 font-mono text-xs opacity-50">
                    SCALE: 1:0.0001 (MINIATURIZED)
                  </div>

                  {/* Location markers */}
                  {locations.map(location => {
                    const status = getLocationStatus(location.mission);
                    return (
                      <button
                        key={location.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${location.x}%`, top: `${location.y}%` }}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className={`w-4 h-4 rounded-full ${getLocationColor(status)} shadow-lg group-hover:scale-150 transition-transform`}></div>
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/90 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <p className="text-white text-xs font-mono">{location.name}</p>
                        </div>
                        {/* Connection lines for missions */}
                        {location.mission && location.mission.mission_number > 1 && (
                          <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '200px', height: '200px', transform: 'translate(-50%, -50%)' }}>
                            <line 
                              x1="100" 
                              y1="100" 
                              x2="150" 
                              y2="80" 
                              stroke="rgba(59, 130, 246, 0.3)" 
                              strokeWidth="2"
                              strokeDasharray="4"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  LOCATION INFO
                </h3>
                
                {selectedLocation ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-mono text-sm font-bold mb-1">
                        {selectedLocation.name}
                      </h4>
                      <p className="text-gray-400 text-xs">{selectedLocation.description}</p>
                    </div>

                    {selectedLocation.mission && (
                      <div className="pt-3 border-t border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-xs font-mono">MISSION STATUS:</span>
                          <span className={`flex items-center gap-1 text-xs font-mono font-bold ${
                            selectedLocation.mission.status === 'completed' ? 'text-green-400' :
                            selectedLocation.mission.status === 'active' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {selectedLocation.mission.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                            {selectedLocation.mission.status === 'active' && <Clock className="w-3 h-3" />}
                            {selectedLocation.mission.status === 'locked' && <Lock className="w-3 h-3" />}
                            {selectedLocation.mission.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white text-sm font-mono mb-2">
                          Mission {selectedLocation.mission.mission_number}: {selectedLocation.mission.title}
                        </p>
                        <p className="text-gray-400 text-xs">{selectedLocation.mission.briefing}</p>
                      </div>
                    )}

                    {!selectedLocation.mission && (
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-gray-500 text-xs italic">No active mission at this location</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Select a location on the map</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#0F1729] border-gray-700 mt-4">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-3 text-xs">LEGEND</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400 text-xs">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-400 text-xs">Active Mission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400 text-xs">Locked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-gray-400 text-xs">No Mission</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}