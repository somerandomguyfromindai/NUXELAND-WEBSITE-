import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, Zap, Cpu, Shield, Eye } from "lucide-react";

export default function GamepassMenu() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: shopItems } = useQuery({
    queryKey: ['shop-items'],
    queryFn: () => base44.entities.ShopItem.list(),
    initialData: [],
  });

  const getItemIcon = (type) => {
    switch(type) {
      case 'character_skin': return <User className="w-4 h-4" />;
      case 'ability': return <Zap className="w-4 h-4" />;
      case 'tool': return <Cpu className="w-4 h-4" />;
      case 'intel': return <Eye className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-[#0F1729] border-gray-700">
      <CardHeader>
        <CardTitle className="text-white font-mono text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          ACTIVE GAMEPASSES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
        {shopItems.map(item => {
          const isActive = user?.purchased_items?.includes(item.id);
          
          return (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-2 rounded border ${
                isActive 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-gray-800/20 border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={`p-1 rounded ${
                  item.item_type === 'character_skin' ? 'bg-purple-500/20 text-purple-400' :
                  item.item_type === 'ability' ? 'bg-blue-500/20 text-blue-400' :
                  item.item_type === 'tool' ? 'bg-green-500/20 text-green-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {getItemIcon(item.item_type)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-mono text-xs">{item.name}</p>
                  <p className="text-gray-500 font-mono text-[10px]">{item.in_game_effect}</p>
                </div>
              </div>
              <Badge 
                className={isActive 
                  ? 'bg-green-500/20 text-green-400 flex items-center gap-1' 
                  : 'bg-red-500/20 text-red-400 flex items-center gap-1'
                }
              >
                {isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {isActive ? 'ACTIVE' : 'LOCKED'}
              </Badge>
            </div>
          );
        })}
        {shopItems.length === 0 && (
          <p className="text-gray-500 font-mono text-xs text-center py-4">
            No gamepasses available
          </p>
        )}
      </CardContent>
    </Card>
  );
}