import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Terminal, AlertTriangle } from "lucide-react";
import { MemoryPatternGame, CodeBreakingGame, WirePuzzleGame, SequenceMatchGame } from "./HackingMiniGames";

export default function EnhancedHackingTerminal({ terminal, onSuccess, onClose }) {
  const [status, setStatus] = useState('active');
  const [message, setMessage] = useState('');

  const miniGames = {
    memory: MemoryPatternGame,
    code: CodeBreakingGame,
    wire: WirePuzzleGame,
    sequence: SequenceMatchGame
  };

  const MiniGameComponent = miniGames[terminal.gameType];

  const handleSuccess = () => {
    setStatus('success');
    setMessage('ACCESS GRANTED - CLASSIFIED DATA EXTRACTED');
    setTimeout(() => {
      onSuccess(terminal.intel);
    }, 2000);
  };

  const handleFail = () => {
    setStatus('failed');
    setMessage('SECURITY LOCKDOWN - TERMINAL LOCKED');
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0F1729] border-yellow-500/50 animate-pulse">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-yellow-400" />
              <div>
                <CardTitle className="text-yellow-400 font-mono">
                  TERMINAL: {terminal.id.toUpperCase()}
                </CardTitle>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Security Level: {terminal.securityLevel || 'HIGH'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {status === 'active' && (
            <>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-mono text-sm">
                      {terminal.description || 'Bypassing security protocols...'}
                    </p>
                    <p className="text-gray-400 font-mono text-xs mt-1">
                      Intel Available: {terminal.intel?.type || 'CLASSIFIED'}
                    </p>
                  </div>
                </div>
              </div>

              <MiniGameComponent onSuccess={handleSuccess} onFail={handleFail} />
            </>
          )}

          {status === 'success' && (
            <div className="bg-green-900/20 border border-green-500/50 rounded p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Terminal className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-green-400 font-mono text-lg font-bold mb-2">
                {message}
              </p>
              <p className="text-gray-400 font-mono text-xs">
                +500 CREDITS | Intel Downloaded
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-900/20 border border-red-500/50 rounded p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 font-mono text-lg font-bold mb-2">
                {message}
              </p>
              <p className="text-gray-400 font-mono text-xs">
                Try again later
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}