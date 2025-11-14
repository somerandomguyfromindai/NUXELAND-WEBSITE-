import React, { useRef } from "react";

export default function MissionMap({ agents, activeMission, onAgentClick, onMapClick }) {
  const canvasRef = useRef(null);

  const handleClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onMapClick(x, y);
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-[400px] bg-[#050811] rounded-lg border-2 border-gray-700 overflow-hidden cursor-crosshair"
      onClick={handleClick}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Location markers */}
      <div className="absolute top-4 left-4 bg-blue-900/50 border border-blue-500/50 px-3 py-1 rounded">
        <p className="text-blue-300 text-xs font-mono">WATER SOURCE</p>
      </div>

      <div className="absolute bottom-4 right-4 bg-red-900/50 border border-red-500/50 px-3 py-1 rounded">
        <p className="text-red-300 text-xs font-mono">HOSTILE ZONE</p>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-900/50 border border-green-500/50 px-3 py-1 rounded">
        <p className="text-green-300 text-xs font-mono">SPECIMEN</p>
      </div>

      {/* Agents */}
      {agents.map(agent => (
        <div
          key={agent.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{
            left: `${agent.position_x || 50}%`,
            top: `${agent.position_y || 50}%`
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAgentClick(agent);
          }}
        >
          {/* Agent dot */}
          <div className={`w-4 h-4 rounded-full border-2 ${
            agent.status === 'active' ? 'bg-green-400 border-green-600 animate-pulse' :
            agent.status === 'distressed' ? 'bg-yellow-400 border-yellow-600' :
            agent.status === 'critical' ? 'bg-red-400 border-red-600 animate-ping' :
            'bg-gray-400 border-gray-600'
          }`}></div>
          
          {/* Label */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/90 border border-gray-600 px-2 py-1 rounded">
              <p className="text-white text-xs font-mono">{agent.codename}</p>
            </div>
          </div>

          {/* Pulse ring */}
          <div className="absolute inset-0 w-4 h-4 rounded-full border-2 border-blue-400 animate-ping opacity-50"></div>
        </div>
      ))}

      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-px bg-blue-400 animate-scan"></div>
      </div>
    </div>
  );
}