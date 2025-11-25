import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SideWaveBackground } from "@/components/backgrounds/SideWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface SavedKit {
  id: string;
  brand_name: string;
  tagline_options: string[];
  color_palette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  created_at: string;
}

const Saved = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [savedKits, setSavedKits] = useState<SavedKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const loadSavedKits = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from("brand_kits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading brand kits:", error);
      } else {
        setSavedKits((data as any) || []);
      }
      setIsLoading(false);
    };

    loadSavedKits();
  }, [user]);

  return (
    <SideWaveBackground>
      <div className="space-y-8">
        <div className="space-y-4">
          <Link to="/">
            <Button variant="outline" size="sm" rounded="pill">
              ← Back to home
            </Button>
          </Link>
          
          <h1 className="text-3xl">Your saved brand kits</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-ink/70">Loading your brand kits...</p>
            </div>
          ) : savedKits.length === 0 ? (
            <BrandCard className="text-center py-12 space-y-4">
              <p className="text-ink/70">No saved kits yet</p>
              <Link to="/studio">
                <Button rounded="pill">Create your first kit</Button>
              </Link>
            </BrandCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedKits.map((kit) => (
                <BrandCard key={kit.id} className="space-y-4">
                  <h3 className="text-xl font-semibold">{kit.brand_name}</h3>
                  <p className="text-ink/70">{kit.tagline_options[0]}</p>
                  <div className="flex gap-2">
                    {kit.color_palette.slice(0, 5).map((color) => (
                      <div
                        key={color.hex}
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                  <Link to="/studio">
                    <Button size="sm" variant="outline" rounded="pill">
                      View details
                    </Button>
                  </Link>
                </BrandCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </SideWaveBackground>
  );
};

export default Saved;
