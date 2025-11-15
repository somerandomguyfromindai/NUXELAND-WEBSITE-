import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Crown, Lock } from "lucide-react";

export default function Groups() {
  const groups = [
    {
      id: 1,
      name: "Research Division",
      description: "Discuss latest miniaturization research and experiments",
      members: 156,
      category: "Science",
      icon: "🔬"
    },
    {
      id: 2,
      name: "Field Operatives",
      description: "Share mission strategies and field experiences",
      members: 203,
      category: "Operations",
      icon: "🎯"
    },
    {
      id: 3,
      name: "Ethics Committee",
      description: "Debate the moral implications of miniaturization technology",
      members: 89,
      category: "Philosophy",
      icon: "⚖️"
    },
    {
      id: 4,
      name: "Tech Support",
      description: "Help each other with technical challenges",
      members: 312,
      category: "Support",
      icon: "💻"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1a1f3a] to-[#0A0E1A] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-mono flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-400" />
            COMMUNITY GROUPS
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Connect with other agents and researchers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="bg-[#0F1729] border-purple-500/30 hover:border-purple-500/60 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{group.icon}</div>
                    <div>
                      <CardTitle className="text-white font-mono text-lg">
                        {group.name}
                      </CardTitle>
                      <p className="text-gray-400 text-xs font-mono">{group.category}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{group.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                    <Users className="w-4 h-4" />
                    {group.members} members
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700 font-mono" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-400 font-mono font-bold text-lg mb-2">
                  Create Your Own Group
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Start your own community group and invite others to collaborate on projects, share insights, or just chat.
                </p>
                <Button className="bg-yellow-600 hover:bg-yellow-700 font-mono">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Plus(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}