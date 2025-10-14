import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import Chatbot from "@/components/Chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const { data: myProperties } = useQuery({
    queryKey: ["my-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: likedProperties } = useQuery({
    queryKey: ["liked-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("liked_properties")
        .select("property_id, properties(*)")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map((item: any) => item.properties);
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your properties and favorites</p>
        </div>

        <Tabs defaultValue="my-properties" className="space-y-6">
          <TabsList className="bg-card shadow-soft p-1">
            <TabsTrigger value="my-properties" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              My Properties
            </TabsTrigger>
            <TabsTrigger value="liked" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Liked Properties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Listed Properties</h2>
              <Button asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/add-property">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            </div>

            {myProperties && myProperties.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg shadow-soft">
                <p className="text-muted-foreground mb-4">You haven't listed any properties yet</p>
                <Button asChild className="bg-gradient-primary hover:opacity-90">
                  <Link to="/add-property">
                    <Plus className="mr-2 h-4 w-4" />
                    List Your First Property
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Favorite Properties</h2>

            {likedProperties && likedProperties.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg shadow-soft">
                <p className="text-muted-foreground mb-4">You haven't liked any properties yet</p>
                <Button asChild className="bg-gradient-primary hover:opacity-90">
                  <Link to="/properties">Browse Properties</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Chatbot />
    </div>
  );
};

export default Dashboard;
