import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, AlertCircle } from "lucide-react";

export default function PowerCoreHackingPuzzle({ onComplete, onClose }) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [attempts, setAttempts] = useState(3);
  const [message, setMessage] = useState("");
  const [correctCode] = useState(() => {
    const codes = ["7392", "5148", "9263", "4187"];
    return codes[Math.floor(Math.random() * codes.length)];
  });

  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      if (value && index < 3) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const enteredCode = code.join("");
    
    if (enteredCode.length !== 4) {
      setMessage("Enter all 4 digits!");
      return;
    }

    if (enteredCode === correctCode) {
      setMessage("ACCESS GRANTED!");
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else {
      setAttempts(prev => prev - 1);
      if (attempts - 1 <= 0) {
        setMessage("LOCKOUT! System resetting...");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(`INCORRECT! ${attempts - 1} attempts remaining`);
        setCode(["", "", "", ""]);
        document.getElementById("code-0")?.focus();
      }
    }
  };

  const hints = [
    "Hint: Sum of digits equals 21",
    "Hint: First digit is odd",
    "Hint: No repeated digits"
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border-2 border-green-500/50">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono flex items-center gap-2">
            <Lock className="w-6 h-6" />
            POWER CORE ACCESS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-300 font-mono text-sm mb-4">
              Enter 4-digit security code
            </p>
            
            <div className="flex gap-3 justify-center mb-4">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-16 h-16 text-center text-3xl font-mono bg-black border-2 border-green-500/50 text-green-400 focus:border-green-400"
                />
              ))}
            </div>

            {message && (
              <div className={`p-3 rounded mb-4 ${
                message.includes("GRANTED") 
                  ? "bg-green-900/30 border border-green-500/50 text-green-400" 
                  : "bg-red-900/30 border border-red-500/50 text-red-400"
              }`}>
                <p className="font-mono text-sm font-bold">{message}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-yellow-400 font-mono text-xs mb-2">SYSTEM HINTS:</p>
              {hints.map((hint, index) => (
                <p key={index} className="text-gray-400 font-mono text-xs">
                  {hint}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-sm">
                Attempts: {attempts}/3
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 font-mono"
            >
              <Unlock className="w-4 h-4 mr-2" />
              UNLOCK
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-900/20 font-mono"
            >
              ABORT
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}