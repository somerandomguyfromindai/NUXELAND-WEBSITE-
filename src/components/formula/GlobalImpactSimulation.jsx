import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Newspaper, TrendingUp, AlertTriangle, Globe, Users, DollarSign } from "lucide-react";

export default function GlobalImpactSimulation({ buyer, onClose }) {
  const [timeline, setTimeline] = useState(0);
  const [impacts, setImpacts] = useState([]);

  const impactScenarios = {
    1: { // TechCorp
      headlines: [
        { time: "Week 1", text: "TechCorp Announces Revolutionary Miniaturization Tech", sentiment: "positive" },
        { time: "Month 1", text: "Consumer Electronics Market Disrupted by Micro-Devices", sentiment: "neutral" },
        { time: "Month 3", text: "Privacy Concerns Raised Over Invisible Surveillance Tech", sentiment: "negative" },
        { time: "Month 6", text: "Global Economy Shifts as Miniaturization Goes Mainstream", sentiment: "neutral" },
        { time: "Year 1", text: "Tech Inequality Widens as Poor Nations Lack Access", sentiment: "negative" }
      ],
      economics: [
        { metric: "Global Tech Market", change: "+45%", color: "text-green-400" },
        { metric: "Manufacturing Jobs", change: "-23%", color: "text-red-400" },
        { metric: "Innovation Index", change: "+67%", color: "text-green-400" },
        { metric: "Privacy Index", change: "-34%", color: "text-red-400" }
      ],
      ethical: "Technology concentration in wealthy nations creates new digital divide"
    },
    2: { // MediBio
      headlines: [
        { time: "Week 1", text: "MediBio Promises Medical Revolution with Miniaturization", sentiment: "positive" },
        { time: "Month 1", text: "First Successful Micro-Surgery Saves Patient's Life", sentiment: "positive" },
        { time: "Month 3", text: "Affordable Treatment Reaches Developing Nations", sentiment: "positive" },
        { time: "Month 6", text: "Cancer Treatment Breakthrough Using Nano-Medicine", sentiment: "positive" },
        { time: "Year 1", text: "Life Expectancy Increases by 5 Years Globally", sentiment: "positive" }
      ],
      economics: [
        { metric: "Healthcare Costs", change: "-38%", color: "text-green-400" },
        { metric: "Medical Innovation", change: "+89%", color: "text-green-400" },
        { metric: "Pharma Industry", change: "+52%", color: "text-green-400" },
        { metric: "Disease Mortality", change: "-41%", color: "text-green-400" }
      ],
      ethical: "Equitable global health access promotes human flourishing worldwide"
    },
    3: { // Global Defense
      headlines: [
        { time: "Week 1", text: "Military Acquires Classified Miniaturization Technology", sentiment: "neutral" },
        { time: "Month 1", text: "Arms Race Intensifies as Nations Pursue Micro-Weapons", sentiment: "negative" },
        { time: "Month 3", text: "Invisible Warfare: New Era of Conflict Begins", sentiment: "negative" },
        { time: "Month 6", text: "Civilian Casualties Rise from Undetectable Weapons", sentiment: "negative" },
        { time: "Year 1", text: "Global Peace Index at All-Time Low", sentiment: "negative" }
      ],
      economics: [
        { metric: "Defense Spending", change: "+156%", color: "text-yellow-400" },
        { metric: "Global Stability", change: "-67%", color: "text-red-400" },
        { metric: "Arms Trade", change: "+234%", color: "text-yellow-400" },
        { metric: "Peace Index", change: "-78%", color: "text-red-400" }
      ],
      ethical: "Weaponization of technology destabilizes world peace and endangers civilians"
    },
    4: { // EcoTech
      headlines: [
        { time: "Week 1", text: "EcoTech Unveils Green Miniaturization Initiative", sentiment: "positive" },
        { time: "Month 1", text: "Micro-Cleanup Bots Tackle Ocean Plastic Crisis", sentiment: "positive" },
        { time: "Month 3", text: "Carbon Emissions Drop 15% with Nano-Filtration", sentiment: "positive" },
        { time: "Month 6", text: "Endangered Species Saved by Micro-Conservation Tech", sentiment: "positive" },
        { time: "Year 1", text: "Climate Goals Accelerated by Decade", sentiment: "positive" }
      ],
      economics: [
        { metric: "Carbon Emissions", change: "-42%", color: "text-green-400" },
        { metric: "Green Tech Investment", change: "+134%", color: "text-green-400" },
        { metric: "Ecosystem Health", change: "+56%", color: "text-green-400" },
        { metric: "Renewable Energy", change: "+78%", color: "text-green-400" }
      ],
      ethical: "Environmental restoration benefits all life on Earth for generations"
    },
    5: { // AstroNautic
      headlines: [
        { time: "Week 1", text: "AstroNautic Corp Plans Miniaturized Space Colonies", sentiment: "positive" },
        { time: "Month 1", text: "First Micro-Habitat Successfully Deployed to Mars", sentiment: "positive" },
        { time: "Month 3", text: "Space Travel Costs Plummet with Miniaturization", sentiment: "positive" },
        { time: "Month 6", text: "Hundreds Volunteer for First Micro-Colony Mission", sentiment: "neutral" },
        { time: "Year 1", text: "Humanity Becomes Multi-Planetary Species", sentiment: "positive" }
      ],
      economics: [
        { metric: "Space Industry", change: "+289%", color: "text-green-400" },
        { metric: "Launch Costs", change: "-76%", color: "text-green-400" },
        { metric: "Off-World Population", change: "+1200%", color: "text-green-400" },
        { metric: "Scientific Discovery", change: "+167%", color: "text-green-400" }
      ],
      ethical: "Expansion to space secures humanity's long-term survival"
    },
    6: { // NanoSystems
      headlines: [
        { time: "Week 1", text: "NanoSystems Launches Mass-Market Micro-Devices", sentiment: "positive" },
        { time: "Month 1", text: "Asian Markets Boom with Affordable Miniaturization", sentiment: "positive" },
        { time: "Month 3", text: "Labor Automation Accelerates, Millions Unemployed", sentiment: "negative" },
        { time: "Month 6", text: "Economic Inequality Reaches Historic Levels", sentiment: "negative" },
        { time: "Year 1", text: "Social Unrest Spreads Amid Job Crisis", sentiment: "negative" }
      ],
      economics: [
        { metric: "Manufacturing Output", change: "+178%", color: "text-green-400" },
        { metric: "Employment Rate", change: "-34%", color: "text-red-400" },
        { metric: "Corporate Profits", change: "+245%", color: "text-green-400" },
        { metric: "Income Inequality", change: "+89%", color: "text-red-400" }
      ],
      ethical: "Mass production benefits corporations while displacing millions of workers"
    }
  };

  const scenario = impactScenarios[buyer.id];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeline(prev => {
        if (prev < scenario.headlines.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [scenario.headlines.length]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
      <Card className="bg-[#0F1729] border-cyan-500/50 max-w-5xl w-full">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 font-mono text-xl flex items-center gap-2">
              <Globe className="w-6 h-6" />
              GLOBAL IMPACT SIMULATION: {buyer.name}
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-300 text-sm font-mono">
              ⚠️ This simulation shows potential consequences if you sell the formula to {buyer.name}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-mono font-bold">NEWS TIMELINE</h3>
            </div>
            {scenario.headlines.slice(0, timeline + 1).map((headline, idx) => (
              <div
                key={idx}
                className={`border-l-4 pl-4 py-2 ${
                  headline.sentiment === 'positive' ? 'border-green-500 bg-green-900/10' :
                  headline.sentiment === 'negative' ? 'border-red-500 bg-red-900/10' :
                  'border-yellow-500 bg-yellow-900/10'
                } animate-fade-in`}
              >
                <p className="text-gray-400 text-xs font-mono mb-1">{headline.time}</p>
                <p className="text-white font-mono text-sm">{headline.text}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-black/30 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-blue-400 font-mono text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  ECONOMIC IMPACT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {scenario.economics.map((metric, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{metric.metric}</span>
                    <span className={`${metric.color} font-mono text-sm font-bold`}>
                      {metric.change}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-400 font-mono text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  ETHICAL ASSESSMENT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">{scenario.ethical}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-mono text-xs">
                    {buyer.reputation.toUpperCase()} REPUTATION
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-orange-500/50 rounded-lg p-6 text-center">
            <DollarSign className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <p className="text-white font-mono text-2xl font-bold mb-2">
              ${(buyer.offer / 1000000).toFixed(1)} Million USD
            </p>
            <p className="text-gray-400 text-sm">
              This decision cannot be undone. Choose wisely.
            </p>
          </div>

          <Button onClick={onClose} className="w-full bg-cyan-600 hover:bg-cyan-700 font-mono">
            CLOSE SIMULATION
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}