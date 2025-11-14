import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, Lightbulb } from "lucide-react";

export default function GameAIAssistant({ mission, puzzleStates, inventory, playerPosition, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your mission assistant. Ask me about objectives, hints, or what to do next!' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getContextPrompt = () => {
    const context = {
      mission_number: mission?.mission_number,
      mission_title: mission?.title,
      mission_briefing: mission?.briefing,
      objectives: mission?.objectives,
      puzzle_states: puzzleStates,
      inventory_items: inventory.map(i => i.name),
      player_position: playerPosition
    };

    return `You are an AI assistant helping a player in "The A.N.T. Console" game. 

Current Mission Context:
${JSON.stringify(context, null, 2)}

MISSION-SPECIFIC GUIDANCE:
${mission?.mission_number === 1 ? `
Mission 1 is set in a kitchen. Key steps:
1. Navigate to the SINK RIM and climb it (hold JUMP/SPACE while touching it)
2. Activate the button on top of the sink rim (press USE/E)
3. This creates a fork bridge - climb down and cross it
4. Step onto the PRESSURE PLATE on the napkin
5. Go to the KNIFE and press USE/E to activate the lever
6. The water droplet will drop to the ground - walk to it to complete the mission

Common issues:
- Use double jump (press JUMP twice) to reach higher platforms
- Hold JUMP while touching objects to climb them
- Make sure all three puzzles are complete before water droplet is accessible
` : mission?.mission_number === 2 ? `
Mission 2 is a lab infiltration. Key steps:
1. Navigate through the lab avoiding laser barriers
2. Collect the Security Key resource
3. Reach the central terminal
4. Climb up to the glowing cyan DATA CORE above the terminal
5. Get close to the data core to extract it and complete the mission

Common issues:
- Avoid the red laser barriers
- Use crates for cover
- Double jump to reach higher platforms
` : ''}

Provide helpful, concise hints based on the player's current progress. If they're stuck, guide them to the next objective. Keep responses short and actionable.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${getContextPrompt()}

User question: ${userMessage}

Provide a helpful, concise response (2-3 sentences max).`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickHint = async () => {
    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${getContextPrompt()}

Based on the current mission state, provide ONE specific actionable hint about what the player should do next. Keep it very short (1-2 sentences).`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Unable to generate hint.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-[#0F1729] border-cyan-500/30 max-h-[80vh] flex flex-col">
        <CardHeader className="border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Mission AI Assistant
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {mission && (
            <p className="text-xs text-gray-400 mt-2">
              Mission {mission.mission_number}: {mission.title}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-cyan-500/20'
                }`}
              >
                {msg.role === 'assistant' && (
                  <Bot className="w-4 h-4 text-cyan-400 mb-1" />
                )}
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 border border-cyan-500/20">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t border-cyan-500/20 space-y-2">
          <Button
            onClick={getQuickHint}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Quick Hint
          </Button>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about objectives, hints, or controls..."
              disabled={isLoading}
              className="bg-gray-800 border-cyan-500/20 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}