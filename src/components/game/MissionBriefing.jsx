import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Target, Info, Skull, Lock } from "lucide-react";

export default function MissionBriefing({ mission, onStart, puzzleStates, inventory }) {
  const getMissionLore = (missionNumber) => {
    const lore = {
      1: {
        background: "Agent 'Pip' has been deployed to Field Lab 3 (The Kitchen) for standard reconnaissance. However, recent telemetry shows critical dehydration levels. The agent's bio-stress is climbing rapidly.",
        intel: [
          "Water source detected at coordinates [50, 25]",
          "Pressure-sensitive security system active",
          "Sequential activation required for door access",
          "Password clue visible in field - Document for decryption later"
        ],
        warnings: [
          "Agent survival time: <15 minutes without water",
          "Maze structure with limited line-of-sight",
          "Door mechanism requires all 3 pressure plates"
        ],
        threatLevel: "MODERATE",
        estimatedTime: "8-12 minutes"
      },
      2: {
        background: "Hostile entity (Arachnid-class) detected near Agent 'Squeak'. This specimen is 40x normal size relative to our miniaturized operatives. Immediate neutralization protocol required.",
        intel: [
          "Security keycard located in laser grid sector",
          "Gas deployment terminal requires Level-3 clearance",
          "Hostile entity patrol pattern: Circular, 15m radius",
          "CS-Gas effective against arthropod hostiles"
        ],
        warnings: [
          "CRITICAL: Laser grid is LETHAL - single touch = mission failure",
          "Keycard must be collected before terminal access",
          "Hostile will attack if approached without gas deployment"
        ],
        threatLevel: "HIGH",
        estimatedTime: "10-15 minutes"
      },
      3: {
        background: "CLASSIFIED: Project Tindalos specimen retrieval. Dr. Ni flagged this as unethical. Board overruled. Specimen shows high intelligence and distress markers. This is your final field test before Phase 2 deployment.",
        intel: [
          "Specimen location: Behind electric barrier grid",
          "Wire puzzle controls barrier power",
          "Corporate mandate: Retrieve at all costs",
          "Dr. Ni's final note: 'They're not specimens... they're people'"
        ],
        warnings: [
          "ETHICAL CONCERN: Specimen shows signs of sentience",
          "Electric barrier = instant mission failure",
          "This decision may have consequences beyond the mission",
          "Wire puzzle: Red wire has voltage fluctuation signature"
        ],
        threatLevel: "EXTREME",
        estimatedTime: "12-18 minutes"
      }
    };
    return lore[missionNumber] || lore[1];
  };

  const lore = getMissionLore(mission.mission_number);
  
  const getMissionProgress = () => {
    if (mission.mission_number === 1) {
      const platesPressed = [
        puzzleStates.plate_1,
        puzzleStates.plate_2,
        puzzleStates.plate_3
      ].filter(Boolean).length;
      return {
        status: puzzleStates.all_plates_pressed ? 'Door Unlocked' : `Pressure Plates: ${platesPressed}/3`,
        color: puzzleStates.all_plates_pressed ? 'text-green-400' : 'text-yellow-400'
      };
    } else if (mission.mission_number === 2) {
      if (puzzleStates.terminal_active) {
        return { status: 'Gas Deployed - Clear to proceed', color: 'text-green-400' };
      } else if (inventory.includes('keycard')) {
        return { status: 'Keycard Acquired - Find Terminal', color: 'text-blue-400' };
      } else {
        return { status: 'Keycard Required', color: 'text-red-400' };
      }
    } else if (mission.mission_number === 3) {
      return {
        status: puzzleStates.wire_solved ? 'Barrier Disabled' : 'Wire Puzzle Required',
        color: puzzleStates.wire_solved ? 'text-green-400' : 'text-red-400'
      };
    }
    return { status: 'In Progress', color: 'text-gray-400' };
  };

  const progress = getMissionProgress();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-4xl w-full bg-[#0A0E1A] border-blue-500/30 my-8">
        <div className="p-6 border-b border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white font-mono mb-2">
                MISSION {mission.mission_number} BRIEFING
              </h2>
              <p className="text-xl text-blue-400 font-mono">{mission.title}</p>
              <p className="text-sm text-gray-400 font-mono mt-1">{mission.location}</p>
            </div>
            <div className={`px-4 py-2 rounded border ${
              lore.threatLevel === 'EXTREME' ? 'bg-red-900/20 border-red-500/50 text-red-400' :
              lore.threatLevel === 'HIGH' ? 'bg-orange-900/20 border-orange-500/50 text-orange-400' :
              'bg-yellow-900/20 border-yellow-500/50 text-yellow-400'
            }`}>
              <div className="flex items-center gap-2 font-mono text-xs">
                <Skull className="w-4 h-4" />
                <span>{lore.threatLevel}</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-black/50 border border-blue-500/30 rounded p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Mission Status:</span>
              <span className={`font-mono text-sm font-bold ${progress.color}`}>
                {progress.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Background Lore */}
          <div>
            <h3 className="text-white font-mono font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              BACKGROUND
            </h3>
            <div className="bg-blue-900/10 border border-blue-500/20 rounded p-4">
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                {lore.background}
              </p>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h3 className="text-white font-mono font-bold text-lg mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              PRIMARY OBJECTIVES
            </h3>
            <div className="space-y-2">
              {mission.objectives?.map((obj, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-3 p-3 rounded border ${
                    obj.completed 
                      ? 'bg-green-900/10 border-green-500/30' 
                      : 'bg-gray-900/30 border-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    obj.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`font-mono text-sm flex-1 ${
                    obj.completed ? 'text-green-400 line-through' : 'text-white'
                  }`}>
                    {obj.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Intel */}
          <div>
            <h3 className="text-white font-mono font-bold text-lg mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-400" />
              KNOWN INTEL
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {lore.intel.map((item, i) => (
                <div key={i} className="bg-purple-900/10 border border-purple-500/20 rounded p-3">
                  <p className="text-purple-300 font-mono text-xs">
                    • {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div>
            <h3 className="text-white font-mono font-bold text-lg mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              CRITICAL WARNINGS
            </h3>
            <div className="space-y-2">
              {lore.warnings.map((warning, i) => (
                <div key={i} className="bg-red-900/20 border border-red-500/30 rounded p-3 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 font-mono text-sm">
                    {warning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Details */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div className="bg-black/30 rounded p-3">
              <span className="text-gray-500 font-mono text-xs">Estimated Time:</span>
              <p className="text-white font-mono text-sm font-bold">{lore.estimatedTime}</p>
            </div>
            <div className="bg-black/30 rounded p-3">
              <span className="text-gray-500 font-mono text-xs">Unlocks:</span>
              <p className="text-blue-400 font-mono text-sm font-bold">
                {mission.unlocks?.join(', ') || 'Classified'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 bg-[#0A0E1A]">
          <div className="flex gap-4">
            <Button
              onClick={onStart}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-mono text-lg py-6"
            >
              <Target className="w-5 h-5 mr-2" />
              BEGIN MISSION
            </Button>
          </div>
          <p className="text-center text-gray-500 font-mono text-xs mt-4">
            Once deployed, you cannot abort the mission. All actions are logged.
          </p>
        </div>
      </Card>
    </div>
  );
}