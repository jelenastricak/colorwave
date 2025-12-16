import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TopWaveBackground } from "@/components/backgrounds/TopWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";

interface GalleryKit {
  id: string;
  brand_name: string;
  tagline_options: string[];
  color_palette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  positioning: string;
  featured: boolean;
  views_count: number;
  created_at: string;
}

const Gallery = () => {
  const { toast } = useToast();
  const [kits, setKits] = useState<GalleryKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    loadGalleryKits();
  }, [filter]);

  const loadGalleryKits = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('brand_kits')
        .select('id, brand_name, tagline_options, color_palette, positioning, featured, views_count, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filter === 'featured') {
        query = query.eq('featured', true);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error loading gallery:', error);
        toast({
          title: "Failed to load gallery",
          description: "Please try again later",
          variant: "destructive",
        });
        return;
      }

      setKits((data || []) as GalleryKit[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKitClick = async (kit: GalleryKit) => {
    try {
      // Increment view count
      await supabase
        .from('brand_kits')
        .update({ views_count: kit.views_count + 1 })
        .eq('id', kit.id);

      // Navigate to studio with this kit as reference
      window.open(`/studio?inspiration=${kit.id}`, '_blank');
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  return (
    <PageTransition>
      <Header />
      <TopWaveBackground>
        <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2 break-words">Brand Kit Gallery</h1>
              <p className="text-ink/70">Discover inspiring brand identities created by our community</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm" rounded="pill">
                <Link to="/">← Home</Link>
              </Button>
              <Button asChild size="sm" rounded="pill">
                <Link to="/studio">Create Your Own</Link>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              rounded="pill"
              onClick={() => setFilter('all')}
            >
              All Kits
            </Button>
            <Button
              variant={filter === 'featured' ? 'default' : 'outline'}
              size="sm"
              rounded="pill"
              onClick={() => setFilter('featured')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Featured
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <BrandCard key={i} className="space-y-4 animate-pulse">
                <div className="h-6 bg-ink/10 rounded w-3/4" />
                <div className="h-4 bg-ink/10 rounded w-full" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex-1 h-12 bg-ink/10 rounded-lg" />
                  ))}
                </div>
              </BrandCard>
            ))}
          </div>
        ) : kits.length === 0 ? (
          <BrandCard className="text-center py-12">
            <p className="text-ink/70">No brand kits in the gallery yet.</p>
            <p className="text-sm text-ink/50 mt-2">Be the first to share your creation!</p>
          </BrandCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kits.map((kit) => (
              <BrandCard
                key={kit.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] space-y-4"
                onClick={() => handleKitClick(kit)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold break-words">{kit.brand_name}</h3>
                    {kit.featured && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  {kit.views_count > 0 && (
                    <span className="text-xs text-ink/50 whitespace-nowrap">
                      {kit.views_count} {kit.views_count === 1 ? 'view' : 'views'}
                    </span>
                  )}
                </div>

                <p className="text-sm text-ink/70 break-words line-clamp-2">
                  {kit.tagline_options[0]}
                </p>

                <div className="flex gap-2">
                  {kit.color_palette.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-12 rounded-lg border border-ink/10"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name}: ${color.hex}`}
                    />
                  ))}
                </div>

                <p className="text-xs text-ink/60 break-words line-clamp-2">
                  {kit.positioning}
                </p>
              </BrandCard>
            ))}
          </div>
        )}
      </div>
      </TopWaveBackground>
    </PageTransition>
  );
};

export default Gallery;
