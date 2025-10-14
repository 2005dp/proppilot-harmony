import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Building2, User, LogOut, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            <Building2 className="h-6 w-6 text-primary" />
            PropPilot
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hover:bg-muted transition-colors">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button variant="ghost" asChild className="hover:bg-muted transition-colors">
              <Link to="/properties" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Properties
              </Link>
            </Button>

            <Button variant="ghost" asChild className="hover:bg-muted transition-colors">
              <Link to="/contact" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact
              </Link>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" asChild className="hover:bg-muted transition-colors">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
