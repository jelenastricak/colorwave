import { useState } from "react";
import { Link } from "react-router-dom";
import { BottomWaveBackground } from "@/components/backgrounds/BottomWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BrandKit {
  brandName: string;
  taglineOptions: string[];
  positioning: string;
  coreMessage: string;
  toneOfVoice: string[];
  colorPalette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  typography: {
    headingFont: string;
    bodyFont: string;
    notes: string;
  };
  heroSection: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
}

const Studio = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    targetAudience: "",
    brandVibe: "",
    industry: "",
    keywords: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate AI generation for now
    setTimeout(() => {
      const mockKit: BrandKit = {
        brandName: formData.projectName || "Your Brand",
        taglineOptions: [
          "Building the future, together",
          "Innovation meets simplicity",
          "Where ideas come to life",
        ],
        positioning: "A forward-thinking company that empowers businesses with cutting-edge solutions. We believe in making complex technology accessible and human-centered.",
        coreMessage: "We help ambitious teams transform their ideas into reality through thoughtful design and innovative technology.",
        toneOfVoice: ["Professional", "Approachable", "Innovative"],
        colorPalette: [
          { name: "Primary", hex: "#4A5568", usage: "Main brand color, headers" },
          { name: "Accent 1", hex: "#667EEA", usage: "CTAs, interactive elements" },
          { name: "Accent 2", hex: "#48BB78", usage: "Success states, highlights" },
          { name: "Neutral 1", hex: "#2D3748", usage: "Body text" },
          { name: "Neutral 2", hex: "#E2E8F0", usage: "Backgrounds, borders" },
        ],
        typography: {
          headingFont: "Inter Semibold",
          bodyFont: "Inter Regular",
          notes: "Use Inter for a clean, modern look. Headings should be bold and impactful, while body text remains readable.",
        },
        heroSection: {
          headline: "Transform Your Ideas Into Reality",
          subheadline: "We provide the tools and expertise you need to build something remarkable.",
          primaryCTA: "Get Started",
          secondaryCTA: "Learn More",
        },
      };

      setBrandKit(mockKit);
      setIsGenerating(false);
    }, 2000);
  };

  const handleClear = () => {
    setFormData({
      projectName: "",
      description: "",
      targetAudience: "",
      brandVibe: "",
      industry: "",
      keywords: "",
    });
  };

  const handleSave = () => {
    if (brandKit) {
      const saved = JSON.parse(localStorage.getItem("savedKits") || "[]");
      saved.push({ ...brandKit, id: Date.now() });
      localStorage.setItem("savedKits", JSON.stringify(saved));
      alert("Brand kit saved!");
    }
  };

  const handleCopy = () => {
    if (brandKit) {
      const text = `
Brand: ${brandKit.brandName}
Tagline: ${brandKit.taglineOptions[0]}

Color Palette:
${brandKit.colorPalette.map((c) => `${c.name}: ${c.hex} (${c.usage})`).join("\n")}

Typography:
Heading: ${brandKit.typography.headingFont}
Body: ${brandKit.typography.bodyFont}
      `.trim();

      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <BottomWaveBackground>
      <div className="min-h-screen">
        <div className="grid lg:grid-cols-[40%_60%] min-h-screen">
          {/* Form Panel */}
          <div className="p-8 space-y-6 overflow-y-auto">
            <Link to="/">
              <Button variant="outline" size="sm" rounded="pill" className="mb-4">
                ← Back to home
              </Button>
            </Link>
            
            <div className="space-y-2">
              <h1 className="text-3xl">Colorwave Studio</h1>
              <p className="text-ink/70">You can tweak everything later—this is your starting point.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <BrandCard className="space-y-4">
                <h2 className="text-xl">Describe your project</h2>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project name</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="My Awesome Project"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What are you building?</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="SaaS tool for HR managers..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target audience</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Small business owners, freelancers..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandVibe">Brand vibe</Label>
                  <Input
                    id="brandVibe"
                    value={formData.brandVibe}
                    onChange={(e) => setFormData({ ...formData, brandVibe: e.target.value })}
                    placeholder="playful, premium, minimal, bold..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="tech, coaching, ecommerce..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Optional keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="growth, innovation, community..."
                  />
                </div>
              </BrandCard>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" rounded="pill" disabled={isGenerating}>
                  {isGenerating ? "Designing your colors and voice..." : "Generate brand kit"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear form
                </Button>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div className="overflow-y-auto">
            {brandKit ? (
              <div className="space-y-6 p-8">
                  <div className="flex justify-between items-center">
                    <h2>Your brand kit</h2>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setBrandKit(null)}>
                        Regenerate
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSave}>
                        Save kit
                      </Button>
                      <Button size="sm" onClick={handleCopy}>
                        Copy to clipboard
                      </Button>
                    </div>
                  </div>

                  {/* Brand Overview */}
                  <BrandCard>
                    <h3 className="text-2xl font-semibold mb-2">{brandKit.brandName}</h3>
                    <p className="text-lg text-ink/80 mb-4">{brandKit.taglineOptions[0]}</p>
                    <ul className="space-y-2 text-sm">
                      <li>• {brandKit.positioning}</li>
                      <li>• {brandKit.coreMessage}</li>
                    </ul>
                  </BrandCard>

                  {/* Color Palette */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Color palette</h3>
                    <div className="grid grid-cols-5 gap-4">
                      {brandKit.colorPalette.map((color) => (
                        <div key={color.hex} className="space-y-2">
                          <div
                            className="h-24 rounded-lg"
                            style={{ backgroundColor: color.hex }}
                          />
                          <p className="text-sm font-medium">{color.hex}</p>
                          <p className="text-xs text-ink/60">{color.name}</p>
                          <p className="text-xs text-ink/50">{color.usage}</p>
                        </div>
                      ))}
                    </div>
                  </BrandCard>

                  {/* Typography */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Typography</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-semibold">{brandKit.typography.headingFont}</p>
                        <p className="text-sm text-ink/60">For headlines and emphasis</p>
                      </div>
                      <div>
                        <p className="text-base">{brandKit.typography.bodyFont}</p>
                        <p className="text-sm text-ink/60">For body text and UI</p>
                      </div>
                      <p className="text-sm text-ink/70">{brandKit.typography.notes}</p>
                    </div>
                  </BrandCard>

                  {/* Brand Voice */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Brand voice</h3>
                    <div className="flex gap-2 mb-4">
                      {brandKit.toneOfVoice.map((tone) => (
                        <span
                          key={tone}
                          className="px-3 py-1 rounded-full border border-ink/25 text-sm"
                        >
                          {tone}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-ink/70">
                      Think of this as your creative briefing partner. Keep your tone {brandKit.toneOfVoice.join(", ").toLowerCase()} in all communications.
                    </p>
                  </BrandCard>

                  {/* Hero Section Draft */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Hero section draft</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-semibold mb-2">{brandKit.heroSection.headline}</p>
                        <p className="text-ink/70">{brandKit.heroSection.subheadline}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button rounded="pill">{brandKit.heroSection.primaryCTA}</Button>
                        <Button variant="ghost" rounded="pill">
                          {brandKit.heroSection.secondaryCTA}
                        </Button>
                      </div>
                    </div>
                  </BrandCard>
                </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center space-y-4 max-w-md" style={{ marginLeft: '-6cm' }}>
                  <h3 className="text-2xl font-semibold">Ready when you are</h3>
                  <p className="text-ink/70">
                    Fill out the form and hit generate to see your brand kit come to life.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BottomWaveBackground>
  );
};

export default Studio;
