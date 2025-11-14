import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FlaskConical, TrendingUp, Leaf, Scale, Beaker } from "lucide-react";
import ExperimentLab from "../components/lab/ExperimentLab";

export default function Dashboard() {
  const { data: experiments } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => base44.entities.Experiment.list(),
    initialData: [],
  });

  const { data: elements } = useQuery({
    queryKey: ['elements'],
    queryFn: () => base44.entities.Element.list(),
    initialData: [],
  });

  const categoryData = [
    { name: 'Technology', value: experiments.filter(e => e.category === 'technology').length, color: '#3B82F6' },
    { name: 'Nature', value: experiments.filter(e => e.category === 'nature').length, color: '#10B981' },
    { name: 'Ethics', value: experiments.filter(e => e.category === 'ethics').length, color: '#6B7280' }
  ];

  const statusData = [
    { name: 'Completed', value: experiments.filter(e => e.status === 'completed').length },
    { name: 'Failed', value: experiments.filter(e => e.status === 'failed').length },
    { name: 'In Progress', value: experiments.filter(e => e.status === 'in_progress').length }
  ];

  const avgMetrics = {
    successRate: experiments.length > 0 
      ? Math.round(experiments.reduce((sum, e) => sum + (e.success_rate || 0), 0) / experiments.length)
      : 0,
    envImpact: experiments.length > 0
      ? Math.round(experiments.reduce((sum, e) => sum + (e.environmental_impact || 0), 0) / experiments.length)
      : 0,
    ethicalScore: experiments.length > 0
      ? Math.round(experiments.reduce((sum, e) => sum + (e.ethical_score || 0), 0) / experiments.length)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Visualize your experimental data and conduct research
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="lab" className="data-[state=active]:bg-purple-500/20">
              <Beaker className="w-4 h-4 mr-2" />
              Experiment Lab
            </TabsTrigger>
            <TabsTrigger value="elements" className="data-[state=active]:bg-green-500/20">
              <FlaskConical className="w-4 h-4 mr-2" />
              Elements Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-sm font-medium flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Total Experiments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{experiments.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Avg Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{avgMetrics.successRate}%</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Avg Env Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">
                    {avgMetrics.envImpact > 0 ? '+' : ''}{avgMetrics.envImpact}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-400 text-sm font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Avg Ethical Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{avgMetrics.ethicalScore}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Experiments by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F2E',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Experiment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F2E',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Experiments Table */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Success</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiments.slice(0, 5).map((exp) => (
                        <tr key={exp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white">{exp.title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              exp.category === 'technology' ? 'bg-blue-500/20 text-blue-400' :
                              exp.category === 'nature' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">{exp.success_rate}%</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              exp.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              exp.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {exp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab">
            <ExperimentLab />
          </TabsContent>

          <TabsContent value="elements">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Periodic Elements Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Properties</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elements.map(element => (
                        <tr key={element.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <span 
                              className="inline-block w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: element.color }}
                            >
                              {element.symbol}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{element.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              element.category === 'base' ? 'bg-blue-500/20 text-blue-400' :
                              element.category === 'compound' ? 'bg-purple-500/20 text-purple-400' :
                              element.category === 'rare' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {element.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {element.properties?.map((prop, i) => (
                                <span key={i} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                  {prop}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div 
                              className="w-8 h-8 rounded border border-white/20"
                              style={{ backgroundColor: element.color }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {elements.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No elements available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}