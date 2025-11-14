import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, DollarSign, Ship, Radio } from "lucide-react";

export default function FinalChoice({ gameState }) {
  const [choice, setChoice] = useState(null);

  if (choice) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#0F1729] border-red-500/50">
          <CardHeader>
            <CardTitle className="text-white font-mono text-center text-2xl">
              {choice === 'phase2' && 'PHASE 2 EXECUTED'}
              {choice === 'ark' && 'ARK PROTOCOL INITIATED'}
              {choice === 'leak' && 'DATA TRANSMITTED'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/50 rounded p-4 font-mono text-sm text-gray-300">
              {choice === 'phase2' && (
                <>
                  <p className="mb-2">Technology sold to highest bidder...</p>
                  <p className="mb-2">Military applications confirmed...</p>
                  <p className="text-green-400">Profit margins: 847% increase</p>
                  <p className="text-red-400 mt-4">Ethical cost: Immeasurable</p>
                </>
              )}
              {choice === 'ark' && (
                <>
                  <p className="mb-2">Global miniaturization sequence initiated...</p>
                  <p className="mb-2">Population relocation: 2.1 billion subjects...</p>
                  <p className="text-blue-400">Survival probability: 34%</p>
                  <p className="text-yellow-400 mt-4">Humanity transformed forever</p>
                </>
              )}
              {choice === 'leak' && (
                <>
                  <p className="mb-2">Data transmitted to Nuxeland News Network...</p>
                  <p className="mb-2">etinuxE secrets exposed...</p>
                  <p className="text-purple-400">Public awareness: Rising</p>
                  <p className="text-green-400 mt-4">Ni's vision: Preserved</p>
                </>
              )}
            </div>

            <div className="text-center">
              <p className="text-gray-400 font-mono text-sm mb-4">
                Your choice has been logged. Connection terminated.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-gray-600 text-gray-400 font-mono"
              >
                Restart Simulation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Warning */}
        <Card className="bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-12 h-12 text-red-400 flex-shrink-0 animate-pulse" />
              <div>
                <h2 className="text-red-400 font-mono font-bold text-2xl mb-2">
                  SYSTEM ALERT: UNAUTHORIZED ACCESS DETECTED
                </h2>
                <p className="text-white font-mono text-sm mb-3">
                  You have accessed classified etinuxE operational data.
                </p>
                <p className="text-gray-300 font-mono text-sm">
                  Your terminal session will be terminated. However, your clearance level permits
                  one final directive before system lockdown.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <h3 className="text-white font-mono text-xl mb-2">CHOOSE FINAL PROTOCOL:</h3>
          <p className="text-gray-400 font-mono text-sm">
            Your choice will determine the fate of the etinuxE project
          </p>
        </div>

        {/* Choices */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Phase 2 - Profit */}
          <Card 
            className="bg-[#0F1729] border-blue-500/30 hover:border-blue-500 cursor-pointer transition-all group"
            onClick={() => setChoice('phase2')}
          >
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-blue-400 font-mono font-bold text-lg mb-3 text-center">
                PHASE 2
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Commercialize technology. Maximum profit extraction.
              </p>
              <div className="bg-blue-900/20 rounded p-2">
                <p className="text-blue-300 font-mono text-xs text-center">
                  Motive: PROFIT
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ark - Survival */}
          <Card 
            className="bg-[#0F1729] border-green-500/30 hover:border-green-500 cursor-pointer transition-all group"
            onClick={() => setChoice('ark')}
          >
            <CardContent className="p-6">
              <Ship className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-green-400 font-mono font-bold text-lg mb-3 text-center">
                ARK PROTOCOL
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Initiate mass miniaturization. Humanity's survival.
              </p>
              <div className="bg-green-900/20 rounded p-2">
                <p className="text-green-300 font-mono text-xs text-center">
                  Motive: SURVIVAL
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Leak - Radical Vision */}
          <Card 
            className="bg-[#0F1729] border-purple-500/30 hover:border-purple-500 cursor-pointer transition-all group"
            onClick={() => setChoice('leak')}
          >
            <CardContent className="p-6">
              <Radio className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-purple-400 font-mono font-bold text-lg mb-3 text-center">
                TRANSMIT LEAK
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Expose everything. Honor Ni's original vision.
              </p>
              <div className="bg-purple-900/20 rounded p-2">
                <p className="text-purple-300 font-mono text-xs text-center">
                  Motive: TRUTH
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}