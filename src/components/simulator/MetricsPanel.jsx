import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Leaf, Scale, CheckCircle, XCircle } from "lucide-react";

export default function MetricsPanel({ successRate, environmentalImpact, ethicalScore, status }) {
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactColor = (impact) => {
    if (impact >= 50) return 'text-green-400';
    if (impact >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-400 text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${getScoreColor(successRate)}`}>
            {successRate}%
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Probability of achieving target miniaturization
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-400 text-sm font-medium flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${getImpactColor(environmentalImpact)}`}>
            {environmentalImpact > 0 ? '+' : ''}{environmentalImpact}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {environmentalImpact > 0 ? 'Positive' : 'Negative'} ecological footprint
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Ethical Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${getScoreColor(ethicalScore)}`}>
            {ethicalScore}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Moral implications assessment
          </p>
        </CardContent>
      </Card>

      {status !== 'in_progress' && (
        <Card className={`md:col-span-3 ${
          status === 'completed' 
            ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20'
            : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'
        }`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-3">
              {status === 'completed' ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-xl font-semibold text-green-400">
                    Experiment Completed Successfully!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-400" />
                  <span className="text-xl font-semibold text-red-400">
                    Experiment Failed - Adjust Parameters and Try Again
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}