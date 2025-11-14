import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

export default function GameControls() {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-blue-400" />
          Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Move</span>
            <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">W A S D</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Look</span>
            <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">Mouse</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Jump</span>
            <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">Space</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Sprint</span>
            <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">Shift</span>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-gray-300">
            <span className="text-blue-400 font-semibold">Tip:</span> Collect blue orbs to shrink and explore the micro-world!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}