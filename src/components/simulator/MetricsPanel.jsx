import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricsPanel({ successRate, environmentalImpact, ethicalScore, status }) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Legacy Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">This component is no longer used in the 3D game mode.</p>
      </CardContent>
    </Card>
  );
}