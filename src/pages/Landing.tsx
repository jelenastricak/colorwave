import { Link } from "react-router-dom";
import { TopWaveBackground } from "@/components/backgrounds/TopWaveBackground";
import { BottomWaveBackground } from "@/components/backgrounds/BottomWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import colorwaveLogo from "@/assets/colorwave-logo.png";

const Landing = () => {
  const { toast } = useToast();

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast({
      title: "Color copied!",
      description: `${hex} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="flex items-center gap-3">
            <img src={colorwaveLogo} alt="Colorwave Studio" className="h-12 w-12" />
            <span className="text-xl font-semibold text-ink">Colorwave Studio</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <TopWaveBackground>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center pt-52">
          {/* Left Column */}
          <div className="space-y-6 text-left">
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
              Turn your idea into a brand in 60 seconds.
            </h1>
            <p className="text-lg text-ink/80">
              Colorwave Studio generates a mini brand kit—palette, fonts, copy—without any design skills.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/studio">
                <Button size="lg" rounded="pill">
                  Launch Colorwave Studio
                </Button>
              </Link>
              <Link to="/gallery">
                <Button variant="outline" size="lg" rounded="pill">
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Preview Cards */}
          <div className="space-y-4">
            <BrandCard className="transform rotate-1">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">Luna Wellness</h3>
                <p className="text-sm text-ink/70">Calm, grounded, empowering</p>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#6B8E9F' }} />
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#E8D5C4' }} />
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#F4A261' }} />
                </div>
              </div>
            </BrandCard>
            <BrandCard className="transform -rotate-1">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">Pulse Analytics</h3>
                <p className="text-sm text-ink/70">Data-driven, innovative, precise</p>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#2D3E50' }} />
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#5D9CEC' }} />
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#48CFAD' }} />
                </div>
              </div>
            </BrandCard>
          </div>
        </div>
      </TopWaveBackground>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-canvas">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center mb-12">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <BrandCard className="text-center">
              <h3 className="font-semibold text-lg mb-2">Describe your project</h3>
              <p className="text-sm text-ink/70">
                Tell us what you're building, who it's for, and the vibe you're going for.
              </p>
            </BrandCard>
            <BrandCard className="text-center">
              <h3 className="font-semibold text-lg mb-2">Let AI generate your kit</h3>
              <p className="text-sm text-ink/70">
                Our AI designs a cohesive brand kit in seconds—colors, fonts, and messaging.
              </p>
            </BrandCard>
            <BrandCard className="text-center">
              <h3 className="font-semibold text-lg mb-2">Copy, customize, and export</h3>
              <p className="text-sm text-ink/70">
                Use your kit as-is or tweak it. Export everything you need to start building.
              </p>
            </BrandCard>
          </div>
        </div>
      </section>

      {/* Example Output Section */}
      <section id="example" className="py-20 px-6 bg-canvas">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center mb-12">Example output</h2>
          <BrandCard className="space-y-6">
            <div>
              <h3 className="font-semibold text-2xl mb-2">Bloom Coaching</h3>
              <p className="text-ink/70">Helping ambitious women grow their careers with confidence</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Color Palette</h4>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <div className="h-20 rounded-lg" style={{ backgroundColor: '#8B6F9F' }} />
                  <p 
                    className="text-xs font-medium cursor-pointer hover:text-ink/80 transition-colors"
                    onClick={() => handleCopyHex('#8B6F9F')}
                    title="Click to copy"
                  >
                    #8B6F9F
                  </p>
                  <p className="text-xs text-ink/60">Primary</p>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-20 rounded-lg" style={{ backgroundColor: '#E8A87C' }} />
                  <p 
                    className="text-xs font-medium cursor-pointer hover:text-ink/80 transition-colors"
                    onClick={() => handleCopyHex('#E8A87C')}
                    title="Click to copy"
                  >
                    #E8A87C
                  </p>
                  <p className="text-xs text-ink/60">Accent</p>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-20 rounded-lg" style={{ backgroundColor: '#C9ADA7' }} />
                  <p 
                    className="text-xs font-medium cursor-pointer hover:text-ink/80 transition-colors"
                    onClick={() => handleCopyHex('#C9ADA7')}
                    title="Click to copy"
                  >
                    #C9ADA7
                  </p>
                  <p className="text-xs text-ink/60">Highlight</p>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-20 rounded-lg" style={{ backgroundColor: '#2D3142' }} />
                  <p 
                    className="text-xs font-medium cursor-pointer hover:text-ink/80 transition-colors"
                    onClick={() => handleCopyHex('#2D3142')}
                    title="Click to copy"
                  >
                    #2D3142
                  </p>
                  <p className="text-xs text-ink/60">Text</p>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-20 rounded-lg" style={{ backgroundColor: '#F4F4F4' }} />
                  <p 
                    className="text-xs font-medium cursor-pointer hover:text-ink/80 transition-colors"
                    onClick={() => handleCopyHex('#F4F4F4')}
                    title="Click to copy"
                  >
                    #F4F4F4
                  </p>
                  <p className="text-xs text-ink/60">Neutral</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Typography</h4>
              <p className="text-2xl font-semibold mb-1">Headings: Inter Semibold</p>
              <p className="text-base">Body text: Inter Regular</p>
            </div>
          </BrandCard>
        </div>
      </section>

      {/* Bottom CTA */}
      <BottomWaveBackground>
        <div className="text-center space-y-6">
          <h2 className="text-3xl">Ready to see your colors?</h2>
          <Link to="/studio">
            <Button size="lg" rounded="pill">
              Open the Studio
            </Button>
          </Link>
        </div>
      </BottomWaveBackground>
    </div>
  );
};

export default Landing;
