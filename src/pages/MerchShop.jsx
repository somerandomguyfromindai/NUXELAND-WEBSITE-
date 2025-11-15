import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Sparkles, Shirt, Coffee, Package, Award, Grid } from "lucide-react";

export default function MerchShop() {
  const [cart, setCart] = useState([]);

  const merchItems = [
    {
      id: 1,
      name: "Nuxeland T-Shirt",
      category: "Apparel",
      price: 29.99,
      description: "Premium cotton tee with Nuxeland logo and miniaturization atom design",
      sizes: ["S", "M", "L", "XL", "XXL"],
      icon: Shirt,
    },
    {
      id: 2,
      name: "A.N.T. Console Hoodie",
      category: "Apparel",
      price: 49.99,
      description: "Cozy hoodie featuring the iconic A.N.T. Console interface graphics",
      sizes: ["S", "M", "L", "XL", "XXL"],
      icon: Shirt,
    },
    {
      id: 7,
      name: "Phase 2 Tactical Cap",
      category: "Apparel",
      price: 22.99,
      description: "Adjustable cap with embroidered Phase 2 insignia",
      sizes: ["One Size"],
      icon: Shirt,
    },
    {
      id: 3,
      name: "etinuxE Initiative Mug",
      category: "Drinkware",
      price: 14.99,
      description: "Ceramic mug with Dr. Ni's famous quote: 'Size is merely perspective'",
      sizes: ["One Size"],
      icon: Coffee,
    },
    {
      id: 8,
      name: "etinuxE Water Bottle",
      category: "Drinkware",
      price: 18.99,
      description: "Stainless steel insulated bottle with etinuxE Initiative branding",
      sizes: ["32oz"],
      icon: Coffee,
    },
    {
      id: 4,
      name: "Mission Patch Set",
      category: "Collectibles",
      price: 24.99,
      description: "Complete set of 3 embroidered mission patches from the Field Labs",
      sizes: ["One Size"],
      icon: Award,
    },
    {
      id: 5,
      name: "Miniaturization Blueprint Poster",
      category: "Decor",
      price: 19.99,
      description: "24x36 high-quality poster of the original miniaturization chamber blueprints",
      sizes: ["24x36"],
      icon: Package,
    },
    {
      id: 6,
      name: "Nuxeland Field Journal",
      category: "Stationery",
      price: 16.99,
      description: "Hardcover journal with mission logs template and tactical grid pages",
      sizes: ["One Size"],
      icon: Package,
    },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const categoryColors = {
    "Apparel": "bg-blue-500/20 text-blue-400",
    "Drinkware": "bg-green-500/20 text-green-400",
    "Collectibles": "bg-purple-500/20 text-purple-400",
    "Decor": "bg-yellow-500/20 text-yellow-400",
    "Stationery": "bg-pink-500/20 text-pink-400",
  };

  const categories = ["All", "Apparel", "Drinkware", "Collectibles", "Decor", "Stationery"];

  const getItemsByCategory = (category) => {
    if (category === "All") return merchItems;
    return merchItems.filter(item => item.category === category);
  };

  const renderItems = (items) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="bg-[#0F1729] border-gray-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
          <CardHeader>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <Badge className={categoryColors[item.category]}>
                {item.category}
              </Badge>
            </div>
            <CardTitle className="text-white font-mono text-lg">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">{item.description}</p>
            
            <div className="space-y-2">
              <p className="text-gray-500 text-xs font-mono">Available Sizes:</p>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((size) => (
                  <span key={size} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded font-mono">
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
              <span className="text-2xl font-bold text-cyan-400 font-mono">
                ${item.price}
              </span>
              <Button
                onClick={() => addToCart(item)}
                className="bg-cyan-600 hover:bg-cyan-700 font-mono"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1a1f3a] to-[#0A0E1A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold text-white font-mono">MERCH SHOP</h1>
              <p className="text-gray-400 font-mono text-sm">Official Nuxeland Merchandise</p>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-mono">{cart.length} items in cart</span>
              </div>
              <Button className="bg-cyan-600 hover:bg-cyan-700 font-mono">
                Checkout - ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="All" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 grid grid-cols-3 md:grid-cols-6 gap-2">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                {category === "All" && <Grid className="w-4 h-4 mr-1" />}
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white font-mono">
                  {category === "All" ? "All Products" : category}
                </h2>
                <p className="text-gray-400 text-sm">
                  {getItemsByCategory(category).length} item{getItemsByCategory(category).length !== 1 ? 's' : ''} available
                </p>
              </div>
              {renderItems(getItemsByCategory(category))}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-white font-mono font-bold text-xl mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Shipping Information
          </h3>
          <div className="text-gray-400 text-sm space-y-1">
            <p>• Free shipping on orders over $50</p>
            <p>• Worldwide delivery available</p>
            <p>• Orders ship within 3-5 business days</p>
            <p>• 30-day return policy on all merchandise</p>
          </div>
        </div>
      </div>
    </div>
  );
}