
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
    { id: 'capital', name: 'Nuxeland City', x: 50, y: 50, mission: null, region: 'capital' },
    { id: 'kitchen', name: 'Field Lab 3: Kitchen District', x: 35, y: 40, mission: missions.find(m => m.mission_number === 1), region: 'west' },
    { id: 'lab', name: 'etinuxE Research Complex', x: 60, y: 35, mission: missions.find(m => m.mission_number === 2), region: 'north' },
    { id: 'underground', name: 'Deep Facility Sector', x: 70, y: 60, mission: missions.find(m => m.mission_number === 3), region: 'east' },
    { id: 'forest', name: 'Bio-Reserve Zone', x: 25, y: 70, mission: null, region: 'south' },
    { id: 'mountain', name: 'Mount Tindalos', x: 80, y: 25, mission: null, region: 'north' },
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white font-mono mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-400" />
            NUXELAND TERRITORY MAP
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            Miniaturized nation-state // Scale: 1:100,000
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-0">
                <div 
                  className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden border-4 border-blue-500/30"
                  style={{ 
                    height: '600px',
                    backgroundImage: `
                      radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 60%),
                      radial-gradient(circle at 25% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 80% 25%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)
                    `
                  }}
                >
                  {/* Inner border decoration */}
                  <div className="absolute inset-2 border-2 border-cyan-500/20 rounded pointer-events-none"></div>
                  <div className="absolute inset-4 border border-cyan-500/10 rounded pointer-events-none"></div>

                  {/* Topographic lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    <defs>
                      <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 10 30 Q 20 25, 30 30 T 50 30" stroke="cyan" fill="none" strokeWidth="0.5"/>
                        <path d="M 5 45 Q 15 40, 25 45 T 45 45" stroke="cyan" fill="none" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#topo)" />
                  </svg>

                  {/* Regions */}
                  <div className="absolute inset-4 border-2 border-blue-500/20 rounded">
                    <div className="absolute top-2 left-2 text-blue-400 font-mono text-xs uppercase opacity-40">
                      North Sector
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded border border-green-500/30">
                    <p className="text-green-400 font-mono text-xs">
                      COORD: {selectedLocation ? `${selectedLocation.x},${selectedLocation.y}` : 'SELECT TARGET'}
                    </p>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-2 rounded border border-blue-500/30">
                    <p className="text-blue-400 font-mono text-[10px]">
                      MINIATURIZATION: ACTIVE
                    </p>
                    <p className="text-gray-400 font-mono text-[10px]">
                      Real Scale: ~5.2 km²
                    </p>
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
                        <div className={`w-5 h-5 rounded-full ${getLocationColor(status)} shadow-lg ring-4 ring-black/50 group-hover:scale-150 transition-all duration-300`}>
                          <div className="absolute inset-0 rounded-full animate-ping opacity-30"></div>
                        </div>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/95 px-3 py-1.5 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                          <p className="text-white text-xs font-mono font-bold">{location.name}</p>
                          <p className="text-gray-400 text-[10px] font-mono">{location.region} region</p>
                        </div>
                      </button>
                    );
                  })}

                  {/* Connection lines between mission locations */}
                  <svg className="absolute inset-0 pointer-events-none">
                    {missions.filter(m => m.mission_number > 1).map((mission, idx) => {
                      const from = locations.find(l => l.mission?.mission_number === mission.mission_number - 1);
                      const to = locations.find(l => l.mission?.mission_number === mission.mission_number);
                      if (from && to) {
                        return (
                          <line
                            key={mission.id}
                            x1={`${from.x}%`}
                            y1={`${from.y}%`}
                            x2={`${to.x}%`}
                            y2={`${to.y}%`}
                            stroke="rgba(59, 130, 246, 0.3)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        );
                      }
                      return null;
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  LOCATION INTEL
                </h3>
                
                {selectedLocation ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-mono text-sm font-bold mb-1">
                        {selectedLocation.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500">REGION:</span>
                        <span className="text-xs font-mono text-blue-400 uppercase">{selectedLocation.region}</span>
                      </div>
                    </div>

                    {selectedLocation.mission && (
                      <div className="pt-3 border-t border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-xs font-mono">STATUS:</span>
                          <span className={`flex items-center gap-1 text-xs font-mono font-bold ${
                            selectedLocation.mission.status === 'completed' ? 'text-green-400' :
                            selectedLocation.mission.status === 'active' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {selectedLocation.mission.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                            {selectedLocation.mission.status === 'active' && <Clock className="w-3 h-3 animate-pulse" />}
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
                        <p className="text-gray-500 text-xs italic">Civilian territory - No military operations</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Select a location marker</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-white font-mono font-bold mb-3 text-xs">LEGEND</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-black/50"></div>
                    <span className="text-gray-400 text-xs">Mission Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-black/50"></div>
                    <span className="text-gray-400 text-xs">Active Operation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-black/50"></div>
                    <span className="text-gray-400 text-xs">Restricted Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500 ring-2 ring-black/50"></div>
                    <span className="text-gray-400 text-xs">Civilian Zone</span>
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
