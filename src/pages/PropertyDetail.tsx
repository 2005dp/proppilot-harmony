import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Bed, Bath, Maximize, Phone, Mail, ArrowLeft, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIfLiked(session.user.id);
      }
    });
  }, []);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const checkIfLiked = async (userId: string) => {
    const { data } = await supabase
      .from("liked_properties")
      .select("id")
      .eq("user_id", userId)
      .eq("property_id", id)
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
        .eq("property_id", id);
      setIsLiked(false);
      toast.success("Removed from favorites");
    } else {
      await supabase
        .from("liked_properties")
        .insert({ user_id: user.id, property_id: id });
      setIsLiked(true);
      toast.success("Added to favorites");
    }
  };

  const handleEnquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("enquiries").insert({
      property_id: id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to send enquiry. Please try again.");
    } else {
      toast.success("Enquiry sent successfully!");
      e.currentTarget.reset();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Property not found</p>
          <Button asChild>
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = property.images?.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden shadow-medium">
              <div className="relative h-96">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  {property.property_type}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLike}
                  className={`absolute top-4 right-4 bg-white/90 hover:bg-white ${
                    isLiked ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Property Details */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-secondary" />
                  <span>{property.location}, {property.city}, {property.state}</span>
                </div>

                <div className="text-4xl font-bold text-primary mb-6">
                  {formatPrice(property.price)}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                  {property.bedrooms && (
                    <div className="text-center">
                      <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <Maximize className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-semibold">{property.size} sq ft</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {property.description || "No description available."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-soft sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contact Owner</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary p-2 rounded-full">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{property.contact_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary p-2 rounded-full">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{property.contact_email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Send Enquiry</h4>
                  <form onSubmit={handleEnquiry} className="space-y-3">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" required />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={3}
                        placeholder="I'm interested in this property..."
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Enquiry"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default PropertyDetail;
