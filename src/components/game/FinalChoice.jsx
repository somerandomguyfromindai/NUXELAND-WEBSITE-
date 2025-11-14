import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Ship, Radio } from "lucide-react";

export default function FinalChoice({ gameState, onChoice }) {
  const [choice, setChoice] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const handleChoice = (choiceType) => {
    setChoice(choiceType);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onChoice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (choice) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#0F1729] border-green-500/50 animate-pulse">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-center text-2xl">
              PROTOCOL EXECUTING...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/50 rounded p-4 font-mono text-sm text-green-400">
              {choice === 'phase2' && (
                <>
                  <p className="mb-2">▓▓▓ Initiating Phase 2...</p>
                  <p className="mb-2">▓▓▓ Contacting buyers...</p>
                  <p className="mb-2">▓▓▓ Technology transfer: IN PROGRESS</p>
                  <p className="text-yellow-400 mt-4">The cycle continues...</p>
                </>
              )}
              {choice === 'ark' && (
                <>
                  <p className="mb-2">▓▓▓ ARK PROTOCOL ACTIVE...</p>
                  <p className="mb-2">▓▓▓ Global deployment sequence...</p>
                  <p className="mb-2">▓▓▓ Humanity's last hope...</p>
                  <p className="text-blue-400 mt-4">The great exodus begins...</p>
                </>
              )}
              {choice === 'leak' && (
                <>
                  <p className="mb-2">▓▓▓ Transmitting to Nuxeland News...</p>
                  <p className="mb-2">▓▓▓ Encryption bypassed...</p>
                  <p className="mb-2">▓▓▓ Truth is spreading...</p>
                  <p className="text-purple-400 mt-4">The people will know...</p>
                </>
              )}
            </div>

            <div className="text-center">
              <p className="text-green-400 font-mono text-6xl font-bold mb-2">
                {countdown}
              </p>
              <p className="text-gray-400 font-mono text-sm">
                System breach in progress...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <Card className="bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-12 h-12 text-red-400 flex-shrink-0 animate-pulse" />
              <div>
                <h2 className="text-red-400 font-mono font-bold text-2xl mb-2">
                  ⚠️ SYSTEM ALERT: UNAUTHORIZED ACCESS DETECTED ⚠️
                </h2>
                <p className="text-white font-mono text-sm mb-3">
                  You have infiltrated classified etinuxE systems and extracted sensitive data.
                </p>
                <p className="text-gray-300 font-mono text-sm mb-2">
                  Your clearance level grants ONE FINAL DIRECTIVE before security lockdown.
                </p>
                <p className="text-yellow-400 font-mono text-sm font-bold">
                  Choose wisely. This decision cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <h3 className="text-white font-mono text-xl mb-2 animate-pulse">
            SELECT FINAL PROTOCOL:
          </h3>
          <p className="text-gray-400 font-mono text-sm">
            The fate of etinuxE and humanity rests in your hands
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className="bg-[#0F1729] border-blue-500/30 hover:border-blue-500 hover:scale-105 cursor-pointer transition-all group"
            onClick={() => handleChoice('phase2')}
          >
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-blue-400 font-mono font-bold text-lg mb-3 text-center">
                EXECUTE PHASE 2
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Weaponize and commercialize. Maximum profit extraction. Military contracts.
              </p>
              <div className="bg-blue-900/20 rounded p-2">
                <p className="text-blue-300 font-mono text-xs text-center">
                  Motive: PROFIT
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#0F1729] border-green-500/30 hover:border-green-500 hover:scale-105 cursor-pointer transition-all group"
            onClick={() => handleChoice('ark')}
          >
            <CardContent className="p-6">
              <Ship className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-green-400 font-mono font-bold text-lg mb-3 text-center">
                INITIATE ARK
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Begin mass miniaturization. Save humanity from extinction. 34% survival rate.
              </p>
              <div className="bg-green-900/20 rounded p-2">
                <p className="text-green-300 font-mono text-xs text-center">
                  Motive: SURVIVAL
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#0F1729] border-purple-500/30 hover:border-purple-500 hover:scale-105 cursor-pointer transition-all group"
            onClick={() => handleChoice('leak')}
          >
            <CardContent className="p-6">
              <Radio className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-purple-400 font-mono font-bold text-lg mb-3 text-center">
                TRANSMIT LEAK
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Expose everything to Nuxeland News. Honor Ni's vision. Let the world decide.
              </p>
              <div className="bg-purple-900/20 rounded p-2">
                <p className="text-purple-300 font-mono text-xs text-center">
                  Motive: TRUTH
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-red-400 font-mono text-xs animate-pulse">
            WARNING: Choice is permanent. Session will terminate in 60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}