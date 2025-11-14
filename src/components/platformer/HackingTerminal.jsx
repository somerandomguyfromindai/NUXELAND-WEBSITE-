import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, X, AlertTriangle, CheckCircle } from "lucide-react";

export default function HackingTerminal({ terminal, foundClues, onSuccess, onClose }) {
  const [inputSequence, setInputSequence] = useState([]);
  const [status, setStatus] = useState('waiting');
  const [attempts, setAttempts] = useState(3);

  const requiredSequence = terminal.clue.split('-');
  const hasClue = foundClues.includes(terminal.clue);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'waiting') return;

      const key = e.key;
      let direction = null;

      if (key === 'ArrowUp') direction = 'UP';
      else if (key === 'ArrowDown') direction = 'DOWN';
      else if (key === 'ArrowLeft') direction = 'LEFT';
      else if (key === 'ArrowRight') direction = 'RIGHT';

      if (direction) {
        const newSequence = [...inputSequence, direction];
        setInputSequence(newSequence);

        if (newSequence.length === requiredSequence.length) {
          const isCorrect = newSequence.every((val, idx) => val === requiredSequence[idx]);
          if (isCorrect) {
            setStatus('success');
            setTimeout(onSuccess, 1500);
          } else {
            setStatus('failed');
            setAttempts(prev => prev - 1);
            setTimeout(() => {
              if (attempts <= 1) {
                onClose();
              } else {
                setInputSequence([]);
                setStatus('waiting');
              }
            }, 1500);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputSequence, status, attempts, requiredSequence]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-[#0A0E1A] border-2 border-green-500/50">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-400 font-mono flex items-center gap-2">
              <Terminal className="w-6 h-6" />
              TERMINAL ACCESS
            </CardTitle>
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
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-black/50 rounded p-4 font-mono text-sm">
              <p className="text-green-400 mb-2">&gt; SECURITY LOCK DETECTED</p>
              <p className="text-gray-400 mb-2">&gt; Enter directional key sequence to bypass</p>
              <p className="text-yellow-400">&gt; Use Arrow Keys (UP, DOWN, LEFT, RIGHT)</p>
            </div>

            {hasClue && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                <p className="text-yellow-300 font-mono text-sm mb-1">
                  📝 CLUE FOUND:
                </p>
                <p className="text-yellow-400 font-mono font-bold">
                  {terminal.clue}
                </p>
              </div>
            )}

            {!hasClue && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-red-300 font-mono text-sm">
                  Clue not found! You must find the key sequence hidden in the level.
                </p>
              </div>
            )}

            <div className="bg-black/50 rounded p-4">
              <p className="text-gray-400 font-mono text-sm mb-2">Current Input:</p>
              <div className="flex gap-2 flex-wrap">
                {inputSequence.map((key, i) => (
                  <div key={i} className="bg-blue-900/30 border border-blue-500/50 px-3 py-1 rounded font-mono text-blue-400">
                    {key}
                  </div>
                ))}
                {inputSequence.length === 0 && (
                  <span className="text-gray-600 font-mono">Press arrow keys...</span>
                )}
              </div>
            </div>

            {status === 'success' && (
              <div className="bg-green-900/20 border border-green-500/30 rounded p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400 font-mono font-bold">
                  ACCESS GRANTED! +500 Credits
                </p>
              </div>
            )}

            {status === 'failed' && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <p className="text-red-400 font-mono font-bold">
                  ACCESS DENIED! {attempts - 1} attempts remaining
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-gray-400">Attempts: {attempts}/3</span>
              <span className="text-gray-400">Length: {inputSequence.length}/{requiredSequence.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}