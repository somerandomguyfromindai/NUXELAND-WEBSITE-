
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, Lock, User, Cpu, Shield, Eye } from "lucide-react";

export default function Shop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: shopItems } = useQuery({
    queryKey: ['shop-items'],
    queryFn: () => base44.entities.ShopItem.list(),
    initialData: [],
  });

  const purchaseItemMutation = useMutation({
    mutationFn: (itemId) => {
      const item = shopItems.find(i => i.id === itemId);
      if (!user || user.credits < item.price) {
        throw new Error('Insufficient credits');
      }
      return base44.auth.updateMe({
        credits: user.credits - item.price,
        purchased_items: [...(user.purchased_items || []), itemId],
        unlocked_abilities: [...(user.unlocked_abilities || []), item.in_game_effect]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  const addCredits = (amount) => {
    if (!user) return;
    base44.auth.updateMe({
      credits: (user.credits || 0) + amount
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    });
  };

  const getItemIcon = (type) => {
    switch(type) {
      case 'character_skin': return <User className="w-8 h-8" />;
      case 'ability': return <Zap className="w-8 h-8" />;
      case 'tool': return <Cpu className="w-8 h-8" />;
      case 'intel': return <Eye className="w-8 h-8" />;
      default: return <Shield className="w-8 h-8" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-mono">Loading Shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
                <ShoppingCart className="w-10 h-10 text-blue-400" />
                etinuxE Black Market
              </h1>
              <p className="text-xl text-gray-400">
                Purchase exclusive items and abilities for field operations
              </p>
            </div>
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-4">
                <p className="text-gray-400 text-sm mb-1">Your Credits</p>
                <p className="text-3xl font-bold text-blue-400">{user?.credits || 0}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buy Credits - UPDATED PRICING */}
        <Card className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Purchase Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => addCredits(50)}
                className="bg-blue-600 hover:bg-blue-700 flex flex-col h-auto py-3"
              >
                <span className="text-lg font-bold">50 Credits</span>
                <span className="text-xs opacity-75">$0.99</span>
              </Button>
              <Button
                onClick={() => addCredits(250)}
                className="bg-blue-600 hover:bg-blue-700 flex flex-col h-auto py-3"
              >
                <span className="text-lg font-bold">250 Credits</span>
                <span className="text-xs opacity-75">$2.99</span>
              </Button>
              <Button
                onClick={() => addCredits(600)}
                className="bg-purple-600 hover:bg-purple-700 flex flex-col h-auto py-3"
              >
                <span className="text-lg font-bold">600 Credits</span>
                <span className="text-xs opacity-75">$4.99</span>
              </Button>
              <Button
                onClick={() => addCredits(1500)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 flex flex-col h-auto py-3"
              >
                <span className="text-lg font-bold">1500 Credits</span>
                <span className="text-xs opacity-75">$9.99</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shop Items */}
        <div className="grid md:grid-cols-3 gap-6">
          {shopItems.map(item => {
            const isPurchased = user?.purchased_items?.includes(item.id);
            const canAfford = (user?.credits || 0) >= item.price;
            
            return (
              <Card 
                key={item.id}
                className={`bg-[#0F1729] border-2 cursor-pointer transition-all ${
                  isPurchased 
                    ? 'border-green-500/50 opacity-60'
                    : canAfford
                    ? 'border-blue-500/30 hover:border-blue-500'
                    : 'border-red-500/30'
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      item.item_type === 'character_skin' ? 'bg-purple-500/20 text-purple-400' :
                      item.item_type === 'ability' ? 'bg-blue-500/20 text-blue-400' :
                      item.item_type === 'tool' ? 'bg-green-500/20 text-green-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {getItemIcon(item.item_type)}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                    
                    {item.is_exclusive && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 mb-2">
                        EXCLUSIVE
                      </Badge>
                    )}

                    <div className="bg-white/5 rounded p-2 mb-3">
                      <p className="text-gray-300 text-xs font-mono">
                        Effect: {item.in_game_effect}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-400">
                      {item.price} ¢
                    </span>
                    {isPurchased ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        OWNED
                      </Badge>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          purchaseItemMutation.mutate(item.id);
                        }}
                        disabled={!canAfford}
                        className={canAfford 
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-red-600 opacity-50 cursor-not-allowed"
                        }
                      >
                        {canAfford ? 'Purchase' : <Lock className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
