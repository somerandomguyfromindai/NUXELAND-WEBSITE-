import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Archive, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Timeline() {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => base44.entities.Experiment.list('-created_date'),
    initialData: [],
  });

  const categoryColors = {
    technology: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', icon: '🔵' },
    nature: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', icon: '🟢' },
    ethics: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400', icon: '⚪' }
  };

  const statusIcons = {
    completed: <CheckCircle className="w-5 h-5 text-green-400" />,
    failed: <XCircle className="w-5 h-5 text-red-400" />,
    in_progress: <Clock className="w-5 h-5 text-yellow-400" />,
    archived: <Archive className="w-5 h-5 text-gray-400" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Experiment Timeline
          </h1>
          <p className="text-xl text-gray-400">
            Track the evolution of miniaturization research
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-gray-500"></div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative pl-20">
                  <div className="absolute left-6 w-5 h-5 rounded-full bg-white/10 animate-pulse"></div>
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : experiments.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No experiments yet. Start your first simulation!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {experiments.map((experiment, index) => {
                const colors = categoryColors[experiment.category];
                return (
                  <div key={experiment.id} className="relative pl-20">
                    {/* Timeline Node */}
                    <div className={`absolute left-6 w-5 h-5 rounded-full ${colors.bg} border-2 ${colors.border} z-10`}></div>
                    
                    {/* Experiment Card */}
                    <Card className={`${colors.bg} border ${colors.border} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-white text-xl mb-2">
                              {experiment.title}
                            </CardTitle>
                            <p className="text-sm text-gray-400">
                              {format(new Date(experiment.created_date), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {statusIcons[experiment.status]}
                            <Badge className={`${colors.bg} ${colors.text} border-0`}>
                              {colors.icon} {experiment.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 mb-4">{experiment.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Miniaturization</p>
                            <p className="text-lg font-semibold text-white">
                              {experiment.miniaturization_level}%
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                            <p className="text-lg font-semibold text-blue-400">
                              {experiment.success_rate}%
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Env. Impact</p>
                            <p className="text-lg font-semibold text-green-400">
                              {experiment.environmental_impact > 0 ? '+' : ''}{experiment.environmental_impact}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Ethics</p>
                            <p className="text-lg font-semibold text-gray-400">
                              {experiment.ethical_score}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}