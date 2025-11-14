import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";

export default function SimulationVisualizer({ data, isSimulating, category }) {
  const categoryColor = {
    technology: '#3B82F6',
    nature: '#10B981',
    ethics: '#6B7280'
  }[category];

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: categoryColor }} />
          Real-Time Simulation
          {isSimulating && (
            <span className="ml-auto text-sm font-normal text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Simulating...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={() => ''}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                name="Success Rate"
              />
              <Line 
                type="monotone" 
                dataKey="environmental" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name="Environmental Impact"
              />
              <Line 
                type="monotone" 
                dataKey="ethical" 
                stroke="#6B7280" 
                strokeWidth={2}
                dot={false}
                name="Ethical Score"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Activity className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Configure your experiment and click Run to begin</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}