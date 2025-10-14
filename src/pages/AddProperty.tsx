import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AddProperty = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyType, setPropertyType] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const propertyData = {
      owner_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      property_type: propertyType,
      price: parseFloat(formData.get("price") as string),
      location: formData.get("location") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      size: parseFloat(formData.get("size") as string),
      bedrooms: formData.get("bedrooms") ? parseInt(formData.get("bedrooms") as string) : null,
      bathrooms: formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : null,
      contact_name: formData.get("contact_name") as string,
      contact_phone: formData.get("contact_phone") as string,
      contact_email: formData.get("contact_email") as string,
      images: (formData.get("images") as string).split(",").map(url => url.trim()).filter(Boolean),
    };

    const { error } = await supabase.from("properties").insert(propertyData);

    setIsLoading(false);

    if (error) {
      toast.error("Failed to add property. Please try again.");
      console.error(error);
    } else {
      toast.success("Property added successfully!");
      navigate("/dashboard");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Add New Property
            </CardTitle>
            <CardDescription>Fill in the details to list your property</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Beautiful 3BHK Apartment"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select value={propertyType} onValueChange={setPropertyType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (INR) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="5000000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="size">Size (sq ft) *</Label>
                  <Input
                    id="size"
                    name="size"
                    type="number"
                    placeholder="1200"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="3"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="2"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Ahmedabad"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Gujarat"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Address/Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="SG Highway, Near Nirma University"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="images">Image URLs (comma separated)</Label>
                  <Textarea
                    id="images"
                    name="images"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    rows={2}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter image URLs separated by commas
                  </p>
                </div>

                <div className="md:col-span-2 pt-4 border-t">
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                </div>

                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="contact@example.com"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Adding Property..." : "Add Property"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProperty;
