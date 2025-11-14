import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Wrench, Database, Zap, Beaker, Box, CheckCircle, AlertCircle } from "lucide-react";

export default function ResourcesPanel() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list(),
    initialData: [],
  });

  const { data: recipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.CraftingRecipe.list(),
    initialData: [],
  });

  const craftMutation = useMutation({
    mutationFn: async (recipe) => {
      const inventory = user.resource_inventory || {};
      const newInventory = { ...inventory };
      
      recipe.requirements.forEach(req => {
        newInventory[req.resource_name] = (newInventory[req.resource_name] || 0) - req.amount;
      });

      const craftedItems = user.crafted_items || [];
      
      return base44.auth.updateMe({
        resource_inventory: newInventory,
        crafted_items: [...craftedItems, { name: recipe.name, crafted_at: new Date().toISOString() }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setSelectedRecipe(null);
    },
  });

  const getResourceIcon = (type) => {
    switch(type) {
      case 'material': return <Box className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'chemical': return <Beaker className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'uncommon': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'legendary': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const canCraft = (recipe) => {
    const inventory = user?.resource_inventory || {};
    return recipe.requirements.every(req => 
      (inventory[req.resource_name] || 0) >= req.amount
    );
  };

  const inventory = user?.resource_inventory || {};
  const craftedItems = user?.crafted_items || [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white font-mono mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            NUXELAND RESOURCE MANAGEMENT
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            Gather, store, and utilize resources for survival
          </p>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="bg-[#1A1F2E] border-b border-gray-700">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-900/30">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="crafting" className="data-[state=active]:bg-green-900/30">
              <Wrench className="w-4 h-4 mr-2" />
              Crafting
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-purple-900/30">
              <Database className="w-4 h-4 mr-2" />
              Resource Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(resource => {
                const amount = inventory[resource.name] || 0;
                return (
                  <Card key={resource.id} className={`bg-[#0F1729] border ${getRarityColor(resource.rarity)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.type)}
                          <h3 className="text-white font-mono font-bold text-sm">{resource.name}</h3>
                        </div>
                        <Badge className="font-mono text-xs">{amount}</Badge>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{resource.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{resource.type}</Badge>
                        <Badge className={`text-[10px] ${getRarityColor(resource.rarity)}`}>
                          {resource.rarity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {resources.length === 0 && (
              <Card className="bg-[#0F1729] border-gray-700">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 font-mono">No resources available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="crafting" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid md:grid-cols-2 gap-4">
                  {recipes.map(recipe => {
                    const craftable = canCraft(recipe);
                    return (
                      <Card 
                        key={recipe.id} 
                        className={`bg-[#0F1729] border-2 cursor-pointer transition-all ${
                          selectedRecipe?.id === recipe.id 
                            ? 'border-blue-500' 
                            : craftable 
                            ? 'border-green-500/30 hover:border-green-500' 
                            : 'border-red-500/30'
                        }`}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="w-4 h-4 text-blue-400" />
                            <h3 className="text-white font-mono font-bold text-sm">{recipe.name}</h3>
                          </div>
                          <p className="text-gray-400 text-xs mb-3">{recipe.description}</p>
                          <div className="space-y-1 mb-3">
                            <p className="text-gray-500 text-[10px] font-mono uppercase">Requirements:</p>
                            {recipe.requirements.map((req, i) => {
                              const has = inventory[req.resource_name] || 0;
                              const enough = has >= req.amount;
                              return (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className={enough ? 'text-green-400' : 'text-red-400'}>
                                    {req.resource_name}
                                  </span>
                                  <span className={`font-mono ${enough ? 'text-green-400' : 'text-red-400'}`}>
                                    {has}/{req.amount}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <Badge variant="outline" className="text-[10px]">{recipe.category}</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <Card className="bg-[#0F1729] border-gray-700 sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-white font-mono text-sm">Crafting Station</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecipe ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-mono font-bold mb-2">{selectedRecipe.name}</h4>
                          <p className="text-gray-400 text-xs mb-3">{selectedRecipe.description}</p>
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2 mb-3">
                            <p className="text-blue-400 text-xs font-mono">
                              Effect: {selectedRecipe.result_effect}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-gray-500 text-xs font-mono uppercase">Materials Needed:</p>
                          {selectedRecipe.requirements.map((req, i) => {
                            const has = inventory[req.resource_name] || 0;
                            const enough = has >= req.amount;
                            return (
                              <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-800/20">
                                <span className="text-white text-xs">{req.resource_name}</span>
                                <span className={`font-mono text-xs ${enough ? 'text-green-400' : 'text-red-400'}`}>
                                  {has}/{req.amount}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          onClick={() => craftMutation.mutate(selectedRecipe)}
                          disabled={!canCraft(selectedRecipe)}
                          className="w-full"
                        >
                          {canCraft(selectedRecipe) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Craft Item
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Insufficient Resources
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Select a recipe to craft</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map(resource => (
                <Card key={resource.id} className={`bg-[#0F1729] border ${getRarityColor(resource.rarity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded bg-gray-800">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-mono font-bold mb-1">{resource.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px]">{resource.type}</Badge>
                          <Badge className={`text-[10px] ${getRarityColor(resource.rarity)}`}>
                            {resource.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mb-3">{resource.description}</p>
                    <div className="bg-gray-800/20 rounded p-2">
                      <p className="text-gray-500 text-[10px] font-mono">
                        COLLECTED: {inventory[resource.name] || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {craftedItems.length > 0 && (
          <Card className="bg-[#0F1729] border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white font-mono text-sm">Crafted Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-2">
                {craftedItems.map((item, i) => (
                  <div key={i} className="bg-green-900/20 border border-green-500/30 rounded p-2">
                    <p className="text-green-400 text-xs font-mono">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}