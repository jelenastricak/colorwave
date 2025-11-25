import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SideWaveBackground } from "@/components/backgrounds/SideWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

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
  const [kitToDelete, setKitToDelete] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!kitToDelete) return;

    const { error } = await supabase
      .from("brand_kits")
      .delete()
      .eq("id", kitToDelete);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete brand kit. Please try again.",
        variant: "destructive",
      });
    } else {
      setSavedKits(savedKits.filter((kit) => kit.id !== kitToDelete));
      toast({
        title: "Success",
        description: "Brand kit deleted successfully.",
      });
    }
    setKitToDelete(null);
  };

  return (
    <SideWaveBackground>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="outline" size="sm" rounded="pill">
                ← Back to home
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" size="sm" rounded="pill">
                Profile
              </Button>
            </Link>
          </div>
          
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
                  <div className="flex gap-2">
                    <Link to={`/studio?id=${kit.id}`}>
                      <Button size="sm" variant="outline" rounded="pill">
                        View & Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      rounded="pill"
                      onClick={() => setKitToDelete(kit.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </BrandCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!kitToDelete} onOpenChange={() => setKitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Kit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brand kit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SideWaveBackground>
  );
};

export default Saved;
