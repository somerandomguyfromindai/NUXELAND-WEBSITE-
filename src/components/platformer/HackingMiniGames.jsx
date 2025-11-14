import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, XCircle, Zap } from "lucide-react";

// Memory Pattern Mini-Game
export function MemoryPatternGame({ onSuccess, onFail }) {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showPattern, setShowPattern] = useState(true);
  const [attempts, setAttempts] = useState(3);

  useEffect(() => {
    const newPattern = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4));
    setPattern(newPattern);
    setTimeout(() => setShowPattern(false), 3000);
  }, []);

  const handleClick = (num) => {
    const newUserPattern = [...userPattern, num];
    setUserPattern(newUserPattern);

    if (newUserPattern.length === pattern.length) {
      if (JSON.stringify(newUserPattern) === JSON.stringify(pattern)) {
        onSuccess();
      } else {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);
        if (newAttempts === 0) {
          onFail();
        } else {
          setUserPattern([]);
        }
      }
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

  return (
    <div className="space-y-4">
      <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 text-center">
        <p className="text-purple-300 font-mono text-sm mb-2">
          {showPattern ? 'MEMORIZE THE PATTERN' : 'REPEAT THE PATTERN'}
        </p>
        <p className="text-gray-400 font-mono text-xs">Attempts: {attempts}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => !showPattern && handleClick(num)}
            disabled={showPattern}
            className={`h-24 rounded-lg ${colors[num]} ${
              showPattern && pattern.includes(num) ? 'animate-pulse' : ''
            } ${showPattern ? 'opacity-50' : 'hover:opacity-80'} transition-all`}
          >
            {userPattern.includes(num) && (
              <CheckCircle className="w-8 h-8 mx-auto text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Code Breaking Mini-Game
export function CodeBreakingGame({ onSuccess, onFail }) {
  const [code] = useState(() => {
    const codes = ['NUXE', 'TINY', 'LEAK', 'NANO', 'ATOM'];
    return codes[Math.floor(Math.random() * codes.length)];
  });
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(5);
  const [feedback, setFeedback] = useState([]);

  const handleSubmit = () => {
    if (guess.toUpperCase() === code) {
      onSuccess();
      return;
    }

    const newFeedback = guess.toUpperCase().split('').map((char, i) => {
      if (char === code[i]) return 'correct';
      if (code.includes(char)) return 'present';
      return 'wrong';
    });

    setFeedback([...feedback, { guess: guess.toUpperCase(), feedback: newFeedback }]);
    setGuess('');
    
    const newAttempts = attempts - 1;
    setAttempts(newAttempts);
    if (newAttempts === 0) onFail();
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 text-center">
        <p className="text-blue-300 font-mono text-sm mb-1">CRACK THE 4-LETTER CODE</p>
        <p className="text-gray-400 font-mono text-xs">Attempts: {attempts}</p>
      </div>

      <div className="space-y-2">
        {feedback.map((entry, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {entry.guess.split('').map((char, j) => (
              <div
                key={j}
                className={`w-12 h-12 flex items-center justify-center font-mono font-bold text-white rounded ${
                  entry.feedback[j] === 'correct' ? 'bg-green-600' :
                  entry.feedback[j] === 'present' ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={guess}
          onChange={(e) => setGuess(e.target.value.slice(0, 4))}
          maxLength={4}
          placeholder="4 letters"
          className="bg-[#0F1729] border-gray-600 text-white font-mono uppercase"
        />
        <Button onClick={handleSubmit} disabled={guess.length !== 4}>
          SUBMIT
        </Button>
      </div>
    </div>
  );
}

// Wire Puzzle Mini-Game
export function WirePuzzleGame({ onSuccess, onFail }) {
  const [wires] = useState(() => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const correctWire = colors[Math.floor(Math.random() * colors.length)];
    return { colors, correct: correctWire };
  });
  const [attempts, setAttempts] = useState(2);

  const handleCut = (color) => {
    if (color === wires.correct) {
      onSuccess();
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      if (newAttempts === 0) onFail();
    }
  };

  const wireColors = {
    red: 'bg-red-600 hover:bg-red-500',
    blue: 'bg-blue-600 hover:bg-blue-500',
    green: 'bg-green-600 hover:bg-green-500',
    yellow: 'bg-yellow-600 hover:bg-yellow-500'
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-900/20 border border-red-500/30 rounded p-3 text-center">
        <p className="text-red-300 font-mono text-sm mb-1">CUT THE CORRECT WIRE</p>
        <p className="text-gray-400 font-mono text-xs">Attempts: {attempts}</p>
        <p className="text-yellow-300 font-mono text-xs mt-2">
          Hint: Look for the wire with voltage fluctuation
        </p>
      </div>

      <div className="space-y-3">
        {wires.colors.map((color) => (
          <button
            key={color}
            onClick={() => handleCut(color)}
            className={`w-full h-16 rounded-lg ${wireColors[color]} transition-all flex items-center justify-between px-4 ${
              color === wires.correct ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white font-mono font-bold uppercase">{color} WIRE</span>
            </div>
            <span className="text-white font-mono text-xs">
              {color === wires.correct ? '⚡ 4.7V' : '⚡ 5.0V'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Sequence Matching Mini-Game
export function SequenceMatchGame({ onSuccess, onFail }) {
  const [sequence] = useState(() => 
    Array.from({ length: 6 }, () => Math.floor(Math.random() * 9))
  );
  const [userSeq, setUserSeq] = useState('');
  const [attempts, setAttempts] = useState(3);

  const handleSubmit = () => {
    if (userSeq === sequence.join('')) {
      onSuccess();
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      if (newAttempts === 0) {
        onFail();
      } else {
        setUserSeq('');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-900/20 border border-green-500/30 rounded p-3 text-center">
        <p className="text-green-300 font-mono text-sm mb-1">ENTER THE SEQUENCE</p>
        <p className="text-gray-400 font-mono text-xs">Attempts: {attempts}</p>
      </div>

      <div className="bg-black/50 rounded p-4 text-center">
        <p className="text-green-400 font-mono text-2xl tracking-widest">
          {sequence.join(' - ')}
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={userSeq}
          onChange={(e) => setUserSeq(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          placeholder="Enter 6 digits"
          className="bg-[#0F1729] border-gray-600 text-white font-mono text-center text-xl"
        />
        <Button onClick={handleSubmit} disabled={userSeq.length !== 6}>
          SUBMIT
        </Button>
      </div>
    </div>
  );
}