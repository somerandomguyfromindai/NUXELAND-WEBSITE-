import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Sparkles, Trash2, Beaker, Info } from "lucide-react";

export default function ExperimentLab() {
  const [selectedElements, setSelectedElements] = useState([]);
  const [result, setResult] = useState(null);
  const [isExperimenting, setIsExperimenting] = useState(false);
  const queryClient = useQueryClient();

  const { data: elements } = useQuery({
    queryKey: ['elements'],
    queryFn: () => base44.entities.Element.list(),
    initialData: [],
  });

  const { data: potions } = useQuery({
    queryKey: ['potions'],
    queryFn: () => base44.entities.Potion.list(),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const createPotionMutation = useMutation({
    mutationFn: (potionData) => base44.entities.Potion.create(potionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potions'] });
    },
  });

  const knownCombinations = {
    'H2O': { 
      name: 'Water', 
      effect: 'Hydration boost', 
      color: '#3b82f6',
      detailedEffect: 'Provides rapid cellular hydration. Increases tissue moisture by 45%. Effects last 2-3 hours. Safe for consumption.'
    },
    'HO': { 
      name: 'Hydroxide', 
      effect: 'Cleansing agent', 
      color: '#10b981',
      detailedEffect: 'Powerful cleansing compound. pH level 11.5. Removes toxins at molecular level. Use with caution - caustic properties.'
    },
    'CH2': { 
      name: 'Methylene', 
      effect: 'Energy booster', 
      color: '#f59e0b',
      detailedEffect: 'Stimulates ATP production in mitochondria. Energy increase of 65% for 4 hours. May cause mild jitters. No crash effect.'
    },
    'NCO': { 
      name: 'Cyan Essence', 
      effect: 'Mind clarity', 
      color: '#06b6d4',
      detailedEffect: 'Enhances neural connectivity. Cognitive function boost +40%. Memory recall improved by 30%. Focus sustained for 6 hours.'
    },
    'NHC': { 
      name: 'Amino Base', 
      effect: 'Growth accelerator', 
      color: '#8b5cf6',
      detailedEffect: 'Accelerates cell division by 300%. Muscle tissue growth +25% over 2 weeks. Bone density increased. Requires protein supplementation.'
    },
    'CaN': { 
      name: 'Calcium Nitride', 
      effect: 'Bone strengthener', 
      color: '#ef4444',
      detailedEffect: 'Increases bone density by 55%. Calcium absorption rate tripled. Fracture resistance +80%. Permanent effects after 30 days.'
    },
    'FeO': { 
      name: 'Iron Oxide', 
      effect: 'Rust protection', 
      color: '#dc2626',
      detailedEffect: 'Creates protective oxidative layer. Metal corrosion prevented for 12 months. Industrial applications. Non-toxic to humans.'
    },
    'MgC': { 
      name: 'Magnesium Carbon', 
      effect: 'Fire starter', 
      color: '#f97316',
      detailedEffect: 'Combustible compound. Ignition temperature: 250°C. Burns at 2800°C for 15 seconds. Emergency thermal source. Handle with extreme care.'
    },
  };

  const addElement = (element) => {
    if (selectedElements.length < 3) {
      setSelectedElements([...selectedElements, element]);
      setResult(null);
    }
  };

  const removeElement = (index) => {
    setSelectedElements(selectedElements.filter((_, i) => i !== index));
    setResult(null);
  };

  const clearAll = () => {
    setSelectedElements([]);
    setResult(null);
  };

  const combineElements = () => {
    if (selectedElements.length < 2) return;
    
    setIsExperimenting(true);
    setTimeout(() => {
      const symbols = selectedElements.map(e => e.symbol).sort().join('');
      const combination = knownCombinations[symbols];
      
      if (combination) {
        const existingPotion = potions.find(p => 
          p.elements.sort().join('') === selectedElements.map(e => e.symbol).sort().join('')
        );
        
        if (!existingPotion) {
          createPotionMutation.mutate({
            name: combination.name,
            elements: selectedElements.map(e => e.symbol),
            effect: combination.effect,
            color: combination.color,
            discovered_by: user?.email || 'Unknown'
          });
        }
        
        setResult({
          success: true,
          potion: combination,
          newDiscovery: !existingPotion
        });
      } else {
        setResult({
          success: false,
          message: 'Unstable combination - no potion created'
        });
      }
      setIsExperimenting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Available Combinations Guide */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Available Potion Formulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(knownCombinations).map(([formula, data]) => (
              <div key={formula} className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.color }} />
                  <span className="text-white font-mono text-sm font-bold">{data.name}</span>
                </div>
                <p className="text-gray-500 text-xs font-mono mb-1">Formula: {formula}</p>
                <p className="text-gray-400 text-xs">{data.effect}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lab Workspace */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Experiment Lab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Elements */}
            <div className="bg-black/30 rounded-lg p-4 min-h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-mono">Selected Elements ({selectedElements.length}/3)</p>
                {selectedElements.length > 0 && (
                  <Button onClick={clearAll} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedElements.map((element, index) => (
                  <Badge
                    key={index}
                    className="text-lg px-4 py-2 cursor-pointer"
                    style={{ backgroundColor: element.color }}
                    onClick={() => removeElement(index)}
                  >
                    {element.symbol}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Combine Button */}
            <Button
              onClick={combineElements}
              disabled={selectedElements.length < 2 || isExperimenting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            >
              {isExperimenting ? (
                <>
                  <Beaker className="w-4 h-4 mr-2 animate-bounce" />
                  Combining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Combine Elements
                </>
              )}
            </Button>

            {/* Result Display */}
            {result && (
              <div className={`p-4 rounded-lg border-2 ${
                result.success 
                  ? 'bg-green-900/20 border-green-500/50' 
                  : 'bg-red-900/20 border-red-500/50'
              }`}>
                {result.success ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: result.potion.color }}
                      />
                      <h4 className="text-white font-bold text-lg">{result.potion.name}</h4>
                      {result.newDiscovery && (
                        <Badge className="bg-yellow-500/20 text-yellow-400">NEW!</Badge>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{result.potion.effect}</p>
                    <div className="bg-black/30 rounded p-3 mt-3">
                      <p className="text-cyan-400 text-xs font-mono font-bold mb-1">DETAILED ANALYSIS:</p>
                      <p className="text-gray-400 text-xs">{result.potion.detailedEffect}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-red-300 text-sm">{result.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Elements Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Available Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {elements.map(element => (
                <button
                  key={element.id}
                  onClick={() => addElement(element)}
                  disabled={selectedElements.length >= 3}
                  className="aspect-square rounded-lg border-2 border-white/20 hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center p-2"
                  style={{ backgroundColor: `${element.color}20` }}
                >
                  <span className="text-2xl font-bold text-white">{element.symbol}</span>
                  <span className="text-xs text-gray-300 mt-1">{element.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discovered Potions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Discovered Potions ({potions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {potions.map(potion => (
              <div
                key={potion.id}
                className="p-4 rounded-lg border border-white/20 bg-white/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: potion.color }}
                  />
                  <h4 className="text-white font-bold">{potion.name}</h4>
                </div>
                <div className="flex gap-1 mb-2">
                  {potion.elements.map((symbol, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {symbol}
                    </Badge>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">{potion.effect}</p>
                <p className="text-gray-600 text-xs mt-2">
                  Discovered by: {potion.discovered_by}
                </p>
              </div>
            ))}
          </div>
          {potions.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No potions discovered yet. Start experimenting!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}