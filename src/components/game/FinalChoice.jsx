import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, DollarSign, Ship, Radio, Lock, Key, Timer, CheckCircle, XCircle } from "lucide-react";

export default function FinalChoice({ gameState, onChoice }) {
  const [stage, setStage] = useState('initial');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [sequenceProgress, setSequenceProgress] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [codeInput, setCodeInput] = useState(['', '', '', '']);
  const [wireSelected, setWireSelected] = useState(null);
  const [challengesFailed, setChallengesFailed] = useState(0);

  const correctSequence = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'UP', 'LEFT'];
  const correctCode = ['7', '4', '2', '9'];
  const correctWire = 'red';

  React.useEffect(() => {
    if (stage === 'initial') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  const handleChoiceSelect = (choiceType) => {
    setSelectedChoice(choiceType);
    setStage('challenge');
  };

  const handleKeyPress = (e) => {
    if (stage !== 'challenge' || !selectedChoice) return;
    
    const key = e.key.toUpperCase();
    if (['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'].includes(e.key)) {
      e.preventDefault();
      const direction = key.replace('ARROW', '');
      const newProgress = [...sequenceProgress, direction];
      setSequenceProgress(newProgress);

      if (newProgress.length === correctSequence.length) {
        const isCorrect = newProgress.every((v, i) => v === correctSequence[i]);
        if (isCorrect) {
          setStage('wire_puzzle');
        } else {
          setChallengesFailed(prev => prev + 1);
          setSequenceProgress([]);
        }
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stage, sequenceProgress, selectedChoice]);

  const handleCodeChange = (index, value) => {
    if (!value || value.length > 1) return;
    const newCode = [...codeInput];
    newCode[index] = value;
    setCodeInput(newCode);

    if (index < 3 && value) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }

    if (index === 3 && newCode.every(v => v)) {
      const isCorrect = newCode.every((v, i) => v === correctCode[i]);
      if (isCorrect) {
        setStage('password');
      } else {
        setChallengesFailed(prev => prev + 1);
        setCodeInput(['', '', '', '']);
        document.getElementById('code-0')?.focus();
      }
    }
  };

  const handleWireSelection = (wire) => {
    setWireSelected(wire);
    if (wire === correctWire) {
      setStage('final_code');
    } else {
      setChallengesFailed(prev => prev + 1);
      setWireSelected(null);
    }
  };

  const handlePasswordSubmit = () => {
    const password = (passwordAttempt || '').trim().toUpperCase();
    if (password === 'NUXELAND') {
      setStage('executing');
      setTimeout(() => {
        onChoice();
      }, 5000);
    } else {
      setChallengesFailed(prev => prev + 1);
      setPasswordAttempt('');
    }
  };

  const getChallengeForChoice = () => {
    switch(selectedChoice) {
      case 'phase2':
        return {
          title: 'MILITARY-GRADE ENCRYPTION',
          description: 'Enter the 6-digit directional sequence to authorize Phase 2 deployment',
          color: 'blue'
        };
      case 'ark':
        return {
          title: 'ARK PROTOCOL AUTHENTICATION',
          description: 'Enter the 6-digit directional sequence to initiate mass miniaturization',
          color: 'green'
        };
      case 'leak':
        return {
          title: 'NEURAL BYPASS SEQUENCE',
          description: 'Enter the 6-digit directional sequence to breach communications array',
          color: 'purple'
        };
      default:
        return null;
    }
  };

  if (stage === 'executing') {
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
              {selectedChoice === 'phase2' && (
                <>
                  <p className="mb-2">▓▓▓ Initiating Phase 2...</p>
                  <p className="mb-2">▓▓▓ Contacting buyers...</p>
                  <p className="mb-2">▓▓▓ Military contracts: ACTIVE</p>
                  <p className="mb-2">▓▓▓ Weaponization protocols: ENGAGED</p>
                  <p className="text-yellow-400 mt-4">Corporate profit maximized. The cycle continues...</p>
                </>
              )}
              {selectedChoice === 'ark' && (
                <>
                  <p className="mb-2">▓▓▓ ARK PROTOCOL ACTIVE...</p>
                  <p className="mb-2">▓▓▓ Global deployment sequence...</p>
                  <p className="mb-2">▓▓▓ Estimated survival: 34%</p>
                  <p className="mb-2">▓▓▓ Miniaturization chambers online...</p>
                  <p className="text-blue-400 mt-4">Humanity's last hope. The great exodus begins...</p>
                </>
              )}
              {selectedChoice === 'leak' && (
                <>
                  <p className="mb-2">▓▓▓ Transmitting to Nuxeland News...</p>
                  <p className="mb-2">▓▓▓ Encryption bypassed...</p>
                  <p className="mb-2">▓▓▓ Dr. Ni's research: PUBLIC</p>
                  <p className="mb-2">▓▓▓ Corporate crimes: EXPOSED</p>
                  <p className="text-purple-400 mt-4">Truth revealed. The people will decide...</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i}
                  className="h-2 bg-green-500 rounded animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-400 font-mono text-sm">
                System breach complete. Shutting down...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'challenge') {
    const challenge = getChallengeForChoice();
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <Card className={`max-w-2xl w-full bg-[#0F1729] border-${challenge.color}-500/50`}>
          <CardHeader>
            <CardTitle className={`text-${challenge.color}-400 font-mono text-center text-2xl`}>
              {challenge.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-black/50 rounded p-4">
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                {challenge.description}
              </p>
              <p className="text-yellow-400 font-mono text-xs text-center">
                Use ARROW KEYS to input the sequence
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {correctSequence.map((_, i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded border-2 flex items-center justify-center font-mono font-bold ${
                    sequenceProgress[i] 
                      ? `bg-${challenge.color}-500/20 border-${challenge.color}-500 text-${challenge.color}-400`
                      : 'bg-gray-800 border-gray-600 text-gray-600'
                  }`}
                >
                  {sequenceProgress[i] ? sequenceProgress[i][0] : '?'}
                </div>
              ))}
            </div>

            {challengesFailed > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <p className="text-red-400 font-mono text-sm text-center">
                  ⚠️ Failed Attempts: {challengesFailed} - Security lockdown imminent
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <div></div>
              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-mono">
                ↑
              </div>
              <div></div>
              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-mono">
                ←
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-mono">
                ↓
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-mono">
                →
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'wire_puzzle') {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#0F1729] border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 font-mono text-center text-2xl">
              CORE AUTHORIZATION - WIRE BYPASS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-black/50 rounded p-4">
              <p className="text-gray-300 font-mono text-sm text-center mb-2">
                Cut the correct wire to bypass security protocols
              </p>
              <p className="text-yellow-400 font-mono text-xs text-center">
                Hint: Dr. Ni's favorite color was associated with urgency
              </p>
            </div>

            <div className="space-y-3">
              {['red', 'blue', 'green', 'yellow'].map(wire => (
                <Button
                  key={wire}
                  onClick={() => handleWireSelection(wire)}
                  disabled={wireSelected !== null}
                  className={`w-full h-16 font-mono text-lg ${
                    wireSelected === wire
                      ? wire === correctWire
                        ? 'bg-green-600'
                        : 'bg-red-600'
                      : ''
                  }`}
                  style={{ 
                    backgroundColor: wireSelected === null ? 
                      (wire === 'red' ? '#dc2626' : 
                       wire === 'blue' ? '#2563eb' : 
                       wire === 'green' ? '#16a34a' : '#ca8a04') : undefined
                  }}
                >
                  {wireSelected === wire ? (
                    wire === correctWire ? (
                      <><CheckCircle className="w-5 h-5 mr-2" /> WIRE CUT - SUCCESS</>
                    ) : (
                      <><XCircle className="w-5 h-5 mr-2" /> WRONG WIRE</>
                    )
                  ) : (
                    `CUT ${wire.toUpperCase()} WIRE`
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'final_code') {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#0F1729] border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-yellow-400 font-mono text-center text-2xl">
              FINAL AUTHORIZATION - NUMERIC CODE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-black/50 rounded p-4">
              <p className="text-gray-300 font-mono text-sm text-center mb-2">
                Enter Dr. Ni's 4-digit security code
              </p>
              <p className="text-yellow-400 font-mono text-xs text-center">
                Hint: Year of first successful miniaturization minus 2018
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {codeInput.map((digit, i) => (
                <Input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  className="w-16 h-16 text-center text-2xl font-mono bg-black border-yellow-500/50 text-yellow-400"
                />
              ))}
            </div>

            {challengesFailed > 2 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <p className="text-red-400 font-mono text-sm text-center">
                  ⚠️ CRITICAL: Too many failed attempts. System will lock in 30 seconds.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'password') {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#0F1729] border-green-500/50">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-center text-2xl">
              MASTER PASSWORD REQUIRED
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-black/50 rounded p-4">
              <p className="text-gray-300 font-mono text-sm text-center mb-2">
                Enter the master override password
              </p>
              <p className="text-yellow-400 font-mono text-xs text-center">
                Hint: The name that started it all... you've seen it throughout your missions
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                value={passwordAttempt}
                onChange={(e) => setPasswordAttempt(e.target.value || '')}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="ENTER PASSWORD"
                className="w-full h-12 text-center text-lg font-mono bg-black border-green-500/50 text-green-400 placeholder:text-gray-600"
              />
              <Button
                onClick={handlePasswordSubmit}
                className="w-full h-12 bg-green-600 hover:bg-green-700 font-mono text-lg"
              >
                <Key className="w-5 h-5 mr-2" />
                SUBMIT PASSWORD
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
        <Card className="bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-12 h-12 text-red-400 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <h2 className="text-red-400 font-mono font-bold text-2xl mb-2">
                  ⚠️ CRITICAL SYSTEM BREACH DETECTED ⚠️
                </h2>
                <p className="text-white font-mono text-sm mb-3">
                  You have infiltrated Level-5 classified etinuxE systems. All security layers compromised.
                </p>
                <p className="text-gray-300 font-mono text-sm mb-2">
                  Your access grants ONE FINAL DIRECTIVE. This choice will shape the future of humanity.
                </p>
                <p className="text-yellow-400 font-mono text-sm font-bold">
                  Multiple security challenges must be completed. Failure is not an option.
                </p>
              </div>
              <div className="text-right">
                <div className="bg-black/50 rounded p-2 mb-2">
                  <Timer className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  <p className="text-red-400 font-mono text-2xl font-bold">{timeRemaining}</p>
                  <p className="text-gray-400 font-mono text-xs">SECONDS</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <h3 className="text-white font-mono text-xl mb-2 animate-pulse">
            SELECT FINAL PROTOCOL:
          </h3>
          <p className="text-gray-400 font-mono text-sm">
            Each choice requires bypassing multiple security layers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className="bg-[#0F1729] border-blue-500/30 hover:border-blue-500 hover:scale-105 cursor-pointer transition-all group"
            onClick={() => handleChoiceSelect('phase2')}
          >
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-blue-400 font-mono font-bold text-lg mb-3 text-center">
                EXECUTE PHASE 2
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Weaponize miniaturization. $4.7B military contracts. Global deployment.
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/20 rounded p-2">
                  <p className="text-blue-300 font-mono text-xs text-center">
                    Motive: PROFIT
                  </p>
                </div>
                <div className="flex justify-center gap-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#0F1729] border-green-500/30 hover:border-green-500 hover:scale-105 cursor-pointer transition-all group"
            onClick={() => handleChoiceSelect('ark')}
          >
            <CardContent className="p-6">
              <Ship className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-green-400 font-mono font-bold text-lg mb-3 text-center">
                INITIATE ARK PROTOCOL
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Mass miniaturization chambers. 2 billion humans saved. 34% survival rate.
              </p>
              <div className="space-y-2">
                <div className="bg-green-900/20 rounded p-2">
                  <p className="text-green-300 font-mono text-xs text-center">
                    Motive: SURVIVAL
                  </p>
                </div>
                <div className="flex justify-center gap-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#0F1729] border-purple-500/30 hover:border-purple-500 hover:scale-105 cursor-pointer transition-all group"
            onClick={() => handleChoiceSelect('leak')}
          >
            <CardContent className="p-6">
              <Radio className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-purple-400 font-mono font-bold text-lg mb-3 text-center">
                TRANSMIT LEAK
              </h4>
              <p className="text-gray-300 font-mono text-sm text-center mb-4">
                Expose all data to Nuxeland News. Honor Dr. Ni's vision. Let humanity decide.
              </p>
              <div className="space-y-2">
                <div className="bg-purple-900/20 rounded p-2">
                  <p className="text-purple-300 font-mono text-xs text-center">
                    Motive: TRUTH
                  </p>
                </div>
                <div className="flex justify-center gap-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-red-400 font-mono text-xs animate-pulse">
            WARNING: Each protocol requires 4 security layers. Choice is permanent.
          </p>
        </div>
      </div>
    </div>
  );
}