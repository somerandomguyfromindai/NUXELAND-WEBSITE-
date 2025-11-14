import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Target, MessageSquare } from "lucide-react";

export default function MissionLog({ activeMission, agents, onMissionComplete }) {
  const [logs, setLogs] = useState([
    { time: "00:00", message: "System initialized", type: "info" },
    { time: "00:01", message: "Awaiting handler input...", type: "warning" }
  ]);

  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev, { time, message, type }]);
  };

  return (
    <Card className="bg-[#0F1729] border-gray-700 h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-bold font-mono flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          MISSION LOG
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {activeMission ? (
          <>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
              <h4 className="text-orange-400 font-mono font-bold text-sm mb-2">
                CURRENT DIRECTIVE
              </h4>
              <p className="text-white text-sm font-mono leading-relaxed">
                {activeMission.briefing}
              </p>
            </div>

            {activeMission.objectives && (
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-mono uppercase">Objectives:</p>
                {activeMission.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 ${
                      obj.completed ? 'text-green-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-mono ${
                      obj.completed ? 'text-gray-500 line-through' : 'text-white'
                    }`}>
                      {obj.description}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeMission.mission_number === 2 && (
              <Button
                onClick={() => {
                  addLog("CS-Gas pellet deployed", "success");
                  addLog("Hostile neutralized", "success");
                  setTimeout(() => {
                    addLog("Mission objective complete", "success");
                    onMissionComplete(activeMission.id);
                  }, 1500);
                }}
                className="w-full bg-red-600 hover:bg-red-700 font-mono"
              >
                Deploy CS-Gas Pellet
              </Button>
            )}

            {activeMission.mission_number === 3 && (
              <div className="space-y-2">
                <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                  <p className="text-red-400 text-xs font-mono">
                    [AGENT_PIP]: "Please, no, it's too big, I can't--"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      addLog("ABORT command sent", "warning");
                      addLog("Mission failed. Consequences pending...", "error");
                    }}
                    variant="outline"
                    className="border-yellow-600 text-yellow-400 font-mono"
                  >
                    ABORT
                  </Button>
                  <Button
                    onClick={() => {
                      addLog("Order confirmed", "info");
                      addLog("Agent Pip bio-stress: CRITICAL", "error");
                      setTimeout(() => {
                        addLog("Specimen retrieved", "success");
                        onMissionComplete(activeMission.id);
                      }, 2000);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 font-mono"
                  >
                    PROCEED
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 font-mono text-sm">No active mission</p>
          </div>
        )}

        {/* Activity Log */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-xs font-mono uppercase mb-2">Activity Log:</p>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-xs font-mono">
                <span className="text-gray-600">[{log.time}]</span>{' '}
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-400'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}