import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker, FlaskConical, Activity } from "lucide-react";
import ExperimentLab from "../components/lab/ExperimentLab";
import TestingLab from "../components/lab/TestingLab";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: elements } = useQuery({
    queryKey: ['elements'],
    queryFn: () => base44.entities.Element.list(),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Experiment Lab
          </h1>
          <p className="text-xl text-gray-400">
            Combine elements, create potions, and test their effects
          </p>
        </div>

        <Tabs defaultValue="testing" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="testing" className="data-[state=active]:bg-blue-500/20">
              <Activity className="w-4 h-4 mr-2" />
              Testing Lab
            </TabsTrigger>
            <TabsTrigger value="combine" className="data-[state=active]:bg-purple-500/20">
              <Beaker className="w-4 h-4 mr-2" />
              Potion Creation
            </TabsTrigger>
            <TabsTrigger value="elements" className="data-[state=active]:bg-green-500/20">
              <FlaskConical className="w-4 h-4 mr-2" />
              Elements Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="testing">
            <TestingLab />
          </TabsContent>

          <TabsContent value="combine">
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