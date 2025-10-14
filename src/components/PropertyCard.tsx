import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    city: string;
    size: number;
    bedrooms?: number;
    bathrooms?: number;
    images: string[];
    property_type: string;
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIfLiked(session.user.id);
      }
    });
  }, []);

  const checkIfLiked = async (userId: string) => {
    const { data } = await supabase
      .from("liked_properties")
      .select("id")
      .eq("user_id", userId)
      .eq("property_id", property.id)
      .maybeSingle();
    
    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like properties");
      return;
    }

    if (isLiked) {
      await supabase
        .from("liked_properties")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", property.id);
      setIsLiked(false);
      toast.success("Removed from favorites");
    } else {
      await supabase
        .from("liked_properties")
        .insert({ user_id: user.id, property_id: property.id });
      setIsLiked(true);
      toast.success("Added to favorites");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-strong transition-all duration-300 bg-gradient-card border-border">
      <Link to={`/property/${property.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            {property.property_type}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/property/${property.id}`}>
          <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-muted-foreground mb-3 text-sm">
          <MapPin className="h-4 w-4 mr-1 text-secondary" />
          <span className="line-clamp-1">{property.city}, {property.location}</span>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{property.size} sq ft</span>
          </div>
        </div>

        <div className="text-2xl font-bold text-primary mb-3">
          {formatPrice(property.price)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity">
          <Link to={`/property/${property.id}`}>View Details</Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleLike}
          className={`transition-colors ${isLiked ? 'text-red-500 border-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
