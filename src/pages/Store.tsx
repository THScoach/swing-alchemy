import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";

export default function Store() {
  const featuredProducts = [
    {
      id: 1,
      name: "Pocket Radar",
      price: 299,
      rating: 4.8,
      image: "/placeholder.svg",
      description: "Essential for tracking exit velocity",
      category: "Technology",
      ricksPick: true,
    },
    {
      id: 2,
      name: "Blast Motion Sensor",
      price: 149,
      rating: 4.6,
      image: "/placeholder.svg",
      description: "Real-time bat speed data",
      category: "Technology",
      ricksPick: true,
    },
    {
      id: 3,
      name: "Stack Sports Supplements",
      price: 49,
      rating: 4.9,
      image: "/placeholder.svg",
      description: "Nutrition for performance",
      category: "Stack Sports",
      ricksPick: false,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Rick's Recommended Training Equipment</h1>
          <p className="text-xl text-muted-foreground">
            Affiliate links to products I use and recommend
          </p>
        </div>

        {/* Featured Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Badge variant="outline" className="mb-2">{product.category}</Badge>
                      {product.ricksPick && (
                        <Badge className="bg-primary">Rick's Pick</Badge>
                      )}
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">${product.price}</div>
                  <div className="flex gap-2">
                    <Button className="flex-1" size="lg">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Buy on Amazon
                    </Button>
                    <Button variant="ghost" size="lg">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">More Products Coming Soon</h3>
            <p className="text-muted-foreground">
              We're curating the best training equipment and supplements for baseball players.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
