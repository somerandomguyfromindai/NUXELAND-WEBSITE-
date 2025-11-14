import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Save, Sparkles } from "lucide-react";
import SimulationVisualizer from "../components/simulator/SimulationVisualizer";
import MetricsPanel from "../components/simulator/MetricsPanel";
import ControlPanel from "../components/simulator/ControlPanel";

export default function Simulator() {
  const [experimentData, setExperimentData] = useState({
    title: "",
    description: "",
    category: "technology",
    miniaturization_level: 50,
    success_rate: 0,
    environmental_impact: 0,
    ethical_score: 0,
    status: "in_progress"
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState([]);
  const queryClient = useQueryClient();

  const saveExperimentMutation = useMutation({
    mutationFn: (data) => base44.entities.Experiment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const runSimulation = () => {
    setIsSimulating(true);
    const dataPoints = [];
    
    // Simulate experiment over time
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString();
      
      // Calculate metrics based on miniaturization level and category
      const miniLevel = experimentData.miniaturization_level;
      const categoryMultiplier = {
        technology: { success: 0.9, env: -0.3, ethics: 0.5 },
        nature: { success: 0.7, env: 0.8, ethics: 0.9 },
        ethics: { success: 0.6, env: 0.5, ethics: 0.95 }
      }[experimentData.category];

      const newDataPoint = {
        timestamp,
        success: Math.min(100, Math.max(0, 
          (miniLevel * categoryMultiplier.success + Math.random() * 20 - 10)
        )),
        environmental: Math.min(100, Math.max(-100,
          ((100 - miniLevel) * categoryMultiplier.env + Math.random() * 30 - 15)
        )),
        ethical: Math.min(100, Math.max(-100,
          (miniLevel * categoryMultiplier.ethics * 0.8 + Math.random() * 20 - 10)
        ))
      };

      dataPoints.push(newDataPoint);
      setSimulationData([...dataPoints]);

      if (dataPoints.length >= 20) {
        clearInterval(interval);
        setIsSimulating(false);
        
        // Calculate final metrics
        const avgSuccess = dataPoints.reduce((sum, p) => sum + p.success, 0) / dataPoints.length;
        const avgEnv = dataPoints.reduce((sum, p) => sum + p.environmental, 0) / dataPoints.length;
        const avgEthics = dataPoints.reduce((sum, p) => sum + p.ethical, 0) / dataPoints.length;

        setExperimentData(prev => ({
          ...prev,
          success_rate: Math.round(avgSuccess),
          environmental_impact: Math.round(avgEnv),
          ethical_score: Math.round(avgEthics),
          data_points: dataPoints.map(d => ({
            timestamp: d.timestamp,
            value: d.success,
            metric: 'success'
          })),
          status: avgSuccess > 60 ? 'completed' : 'failed'
        }));
      }
    }, 200);
  };

  const resetSimulation = () => {
    setSimulationData([]);
    setExperimentData(prev => ({
      ...prev,
      success_rate: 0,
      environmental_impact: 0,
      ethical_score: 0,
      status: 'in_progress'
    }));
  };

  const saveExperiment = async () => {
    if (!experimentData.title) {
      alert('Please enter an experiment title');
      return;
    }
    await saveExperimentMutation.mutateAsync(experimentData);
    alert('Experiment saved successfully!');
    resetSimulation();
    setExperimentData({
      title: "",
      description: "",
      category: "technology",
      miniaturization_level: 50,
      success_rate: 0,
      environmental_impact: 0,
      ethical_score: 0,
      status: "in_progress"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Miniaturization Simulator
          </h1>
          <p className="text-xl text-gray-400">
            Design and run experiments to explore miniaturization technology
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Experiment Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    value={experimentData.title}
                    onChange={(e) => setExperimentData({ ...experimentData, title: e.target.value })}
                    placeholder="Name your experiment"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={experimentData.description}
                    onChange={(e) => setExperimentData({ ...experimentData, description: e.target.value })}
                    placeholder="Describe your experiment goals"
                    className="bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <Select
                    value={experimentData.category}
                    onValueChange={(value) => setExperimentData({ ...experimentData, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-white/10">
                      <SelectItem value="technology">🔵 Technology</SelectItem>
                      <SelectItem value="nature">🟢 Nature</SelectItem>
                      <SelectItem value="ethics">⚪ Ethics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">
                    Miniaturization Level: {experimentData.miniaturization_level}%
                  </Label>
                  <Slider
                    value={[experimentData.miniaturization_level]}
                    onValueChange={([value]) => setExperimentData({ ...experimentData, miniaturization_level: value })}
                    max={100}
                    step={1}
                    className="py-4"
                    disabled={isSimulating}
                  />
                  <p className="text-xs text-gray-500">
                    Higher levels = more aggressive miniaturization
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={runSimulation}
                    disabled={isSimulating || !experimentData.title}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isSimulating ? 'Running...' : 'Run'}
                  </Button>
                  <Button
                    onClick={resetSimulation}
                    disabled={isSimulating}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {experimentData.status !== 'in_progress' && (
                  <Button
                    onClick={saveExperiment}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Experiment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualization & Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <SimulationVisualizer 
              data={simulationData}
              isSimulating={isSimulating}
              category={experimentData.category}
            />
            
            <MetricsPanel 
              successRate={experimentData.success_rate}
              environmentalImpact={experimentData.environmental_impact}
              ethicalScore={experimentData.ethical_score}
              status={experimentData.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}