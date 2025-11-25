import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Copy, Upload, Link as LinkIcon } from "lucide-react";
import { BottomWaveBackground } from "@/components/backgrounds/BottomWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportBrandKitAsPDF } from "@/utils/exportBrandKit";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { exportAsCSS, exportAsTailwind } from "@/utils/exportColorFormats";
import { extractColorsFromImage, extractColorsFromFile } from "@/utils/colorExtraction";
import colorwaveLogo from "@/assets/colorwave-logo.png";

interface BrandKit {
  id?: string;
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
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const kitId = searchParams.get("id");
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [variations, setVariations] = useState<BrandKit[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Load existing kit from localStorage if ID is provided
  useEffect(() => {
    if (kitId) {
      const savedKits = JSON.parse(localStorage.getItem("brandKits") || "[]");
      const kit = savedKits.find((k: BrandKit) => k.id === kitId);
      if (kit) {
        setBrandKit(kit);
      }
    }
  }, [kitId]);

  const handleExtractFromUrl = async () => {
    if (!imageUrl) {
      toast({
        title: "URL required",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingColors(true);
    try {
      const colors = await extractColorsFromImage(imageUrl);
      setExtractedColors(colors);
      toast({
        title: "Colors extracted!",
        description: `Found ${colors.length} dominant colors`,
      });
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract colors from image. Make sure the URL is a valid image.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingColors(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingColors(true);
    try {
      const colors = await extractColorsFromFile(file);
      setExtractedColors(colors);
      toast({
        title: "Colors extracted!",
        description: `Found ${colors.length} dominant colors`,
      });
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract colors from image.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingColors(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      if (comparisonMode) {
        // Generate 3 variations
        const variationPromises = [1, 2, 3].map(async (i) => {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brand-kit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              formData,
              extractedColors: extractedColors.length > 0 ? extractedColors : undefined,
              variationSeed: i
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate brand kit');
          }

          const { brandKit: generatedKit } = await response.json();
          return generatedKit;
        });

        const generatedVariations = await Promise.all(variationPromises);
        setVariations(generatedVariations);
        
        toast({
          title: "Variations generated!",
          description: "Compare and select your favorite.",
        });
      } else {
        // Generate single kit
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brand-kit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            formData,
            extractedColors: extractedColors.length > 0 ? extractedColors : undefined
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate brand kit');
        }

        const { brandKit: generatedKit } = await response.json();
        setBrandKit(generatedKit);
        
        toast({
          title: "Brand kit generated!",
          description: "Your custom brand identity is ready.",
        });
      }
    } catch (error) {
      console.error('Error generating brand kit:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Failed to generate brand kit. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariation = (variation: BrandKit) => {
    setBrandKit(variation);
    setVariations([]);
    setComparisonMode(false);
    toast({
      title: "Variation selected!",
      description: "You can now edit and save this brand kit.",
    });
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
    setExtractedColors([]);
    setImageUrl("");
    setVariations([]);
    setComparisonMode(false);
  };

  const handleSave = () => {
    if (brandKit) {
      const savedKits = JSON.parse(localStorage.getItem("brandKits") || "[]");
      
      if (kitId) {
        // Update existing kit
        const updatedKits = savedKits.map((kit: BrandKit) =>
          kit.id === kitId ? { ...brandKit, id: kitId } : kit
        );
        localStorage.setItem("brandKits", JSON.stringify(updatedKits));
        toast({
          title: "Changes saved!",
          description: "Your brand kit has been updated.",
        });
      } else {
        // Create new kit
        const newKit = { ...brandKit, id: crypto.randomUUID() };
        savedKits.push(newKit);
        localStorage.setItem("brandKits", JSON.stringify(savedKits));
        setSearchParams({ id: newKit.id });
        toast({
          title: "Brand kit saved!",
          description: "Your brand kit has been saved to your collection.",
        });
      }
    }
  };

  const handleRegenerateSection = async (section: string) => {
    if (!brandKit) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brand-kit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          formData,
          regenerate: section,
          currentKit: brandKit
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }

      const { brandKit: updatedKit } = await response.json();
      setBrandKit(updatedKit);
      
      toast({
        title: "Section regenerated!",
        description: `New ${section} generated successfully.`,
      });
    } catch (error) {
      console.error('Error regenerating section:', error);
      toast({
        title: "Regeneration failed",
        description: 'Failed to regenerate section. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!brandKit) return;
    
    const summary = `
BRAND KIT: ${brandKit.brandName}

TAGLINES:
${brandKit.taglineOptions.map((t, i) => `${i + 1}. ${t}`).join('\n')}

POSITIONING: ${brandKit.positioning}

CORE MESSAGE: ${brandKit.coreMessage}

TONE OF VOICE: ${brandKit.toneOfVoice.join(', ')}

COLOR PALETTE:
${brandKit.colorPalette.map(c => `${c.name}: ${c.hex} - ${c.usage}`).join('\n')}

TYPOGRAPHY:
Headings: ${brandKit.typography.headingFont}
Body: ${brandKit.typography.bodyFont}
${brandKit.typography.notes}

HERO SECTION:
Headline: ${brandKit.heroSection.headline}
Subheadline: ${brandKit.heroSection.subheadline}
Primary CTA: ${brandKit.heroSection.primaryCTA}
Secondary CTA: ${brandKit.heroSection.secondaryCTA}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Brand kit summary copied to clipboard",
    });
  };

  const handleCopyHex = (hex: string, colorName: string) => {
    navigator.clipboard.writeText(hex);
    toast({
      title: "Color copied!",
      description: `${colorName} (${hex}) copied to clipboard`,
    });
  };

  const handleExportCSS = () => {
    if (!brandKit) return;
    const cssCode = exportAsCSS(brandKit.colorPalette, brandKit.brandName);
    navigator.clipboard.writeText(cssCode);
    toast({
      title: "CSS Variables copied!",
      description: "Paste into your CSS file",
    });
  };

  const handleExportTailwind = () => {
    if (!brandKit) return;
    const tailwindConfig = exportAsTailwind(brandKit.colorPalette, brandKit.brandName);
    navigator.clipboard.writeText(tailwindConfig);
    toast({
      title: "Tailwind config copied!",
      description: "Paste into your tailwind.config.js",
    });
  };

  const handleGetSuggestions = async () => {
    if (!brandKit) return;
    
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brand-kit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          getSuggestions: true,
          currentKit: brandKit,
          formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const { suggestions: newSuggestions } = await response.json();
      setSuggestions(newSuggestions);
      
      toast({
        title: "Suggestions ready!",
        description: "Review AI-powered recommendations below.",
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Failed to get suggestions",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <>
      <BottomWaveBackground>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 h-full">
        {/* Left Panel - Form */}
        <div className="space-y-6">
          {/* Logo and Title */}
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center gap-0 bg-canvas/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-ink/25">
              <img src={colorwaveLogo} alt="Colorwave Studio" className="h-14 w-14" />
              <span className="text-2xl font-semibold text-ink leading-none -translate-y-0.5">Colorwave Studio</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <div className="flex gap-2">
              <Link to="/saved">
                <Button variant="outline" size="sm" rounded="pill">
                  View saved kits
                </Button>
              </Link>
              <Link to="/gallery">
                <Button variant="outline" size="sm" rounded="pill">
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </div>

          <BrandCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold mb-2 break-words">Generate your brand kit</h1>
                <p className="text-sm sm:text-base text-ink/70">
                  Answer a few questions and let our AI create your brand identity.
                </p>
              </div>

              {/* Color Import Section */}
              <div className="border border-ink/10 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-1 text-sm">Import colors (optional)</h3>
                  <p className="text-xs text-ink/60">
                    Extract colors from an existing brand or inspiration
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Paste image URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleExtractFromUrl}
                      disabled={isExtractingColors || !imageUrl}
                      variant="outline"
                      size="sm"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-ink/10" />
                    <span className="text-xs text-ink/50">or</span>
                    <div className="h-px flex-1 bg-ink/10" />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtractingColors}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload screenshot
                  </Button>

                  {extractedColors.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {extractedColors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-12 rounded-lg border border-ink/20"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project name</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    placeholder="e.g. Luna Wellness"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    What does your project do?
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g. A meditation app for busy professionals"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Who is it for?</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value,
                      })
                    }
                    placeholder="e.g. Working professionals aged 25-40"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brandVibe">
                    What vibe are you going for?
                  </Label>
                  <Input
                    id="brandVibe"
                    value={formData.brandVibe}
                    onChange={(e) =>
                      setFormData({ ...formData, brandVibe: e.target.value })
                    }
                    placeholder="e.g. Calm, modern, trustworthy"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry or category</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    placeholder="e.g. Health & wellness"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">
                    Keywords (optional)
                  </Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) =>
                      setFormData({ ...formData, keywords: e.target.value })
                    }
                    placeholder="e.g. mindfulness, balance, energy"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  rounded="pill"
                  className="flex-1 sm:flex-none"
                  onClick={() => setComparisonMode(false)}
                >
                  {isGenerating ? "Generating..." : "Generate Kit"}
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  rounded="pill"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => setComparisonMode(true)}
                >
                  {isGenerating ? "Generating..." : "Generate 3 Variations"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  rounded="pill"
                  className="flex-1 sm:flex-none"
                >
                  Clear form
                </Button>
              </div>
            </form>
          </BrandCard>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          
          {variations.length > 0 ? (
            <>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">Compare Variations</h2>
                  <p className="text-sm text-ink/70">Click on a variation to select and edit it</p>
                </div>
                
                <div className="grid gap-4">
                  {variations.map((variation, index) => (
                    <BrandCard 
                      key={index}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                      onClick={() => handleSelectVariation(variation)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold break-words">{variation.brandName}</h3>
                            <p className="text-sm text-ink/70 break-words">{variation.taglineOptions[0]}</p>
                          </div>
                          <span className="text-xs bg-ink/10 px-2 py-1 rounded-full">Option {index + 1}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {variation.colorPalette.map((color, i) => (
                            <div
                              key={i}
                              className="flex-1 h-12 rounded-lg"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                        
                        <div className="text-xs text-ink/60">
                          <p className="line-clamp-2 break-words">{variation.positioning}</p>
                        </div>
                      </div>
                    </BrandCard>
                  ))}
                </div>
              </div>
            </>
          ) : isGenerating && !brandKit ? (
            <LoadingSkeleton />
          ) : !brandKit ? (
            <BrandCard className="h-full flex items-center justify-center p-12">
              <div className="text-center space-y-4">
                <p className="text-ink/70 break-words">
                  Your generated brand kit will appear here.
                </p>
                <p className="text-sm text-ink/50">
                  Fill out the form and hit Generate Kit to get started.
                </p>
              </div>
            </BrandCard>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSave}
                  variant="default"
                  size="sm"
                  rounded="pill"
                >
                  Save Kit
                </Button>
                <Button
                  onClick={() => exportBrandKitAsPDF(brandKit)}
                  variant="outline"
                  size="sm"
                  rounded="pill"
                >
                  Export Guidelines PDF
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  rounded="pill"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Summary
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsEditMode(!isEditMode)}
                  variant="outline"
                  size="sm"
                  rounded="pill"
                >
                  {isEditMode ? "Done Editing" : "Edit Kit"}
                </Button>
                <Button
                  onClick={handleGetSuggestions}
                  variant="outline"
                  size="sm"
                  rounded="pill"
                  disabled={isLoadingSuggestions}
                >
                  {isLoadingSuggestions ? "Loading..." : "Get AI Suggestions"}
                </Button>
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <BrandCard className="space-y-4 bg-accent/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">AI Improvement Suggestions</h3>
                      <p className="text-sm text-ink/70">Based on design trends and best practices</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSuggestions([])}
                    >
                      Dismiss
                    </Button>
                  </div>
                  <ul className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="text-primary font-medium mt-0.5">•</span>
                        <span className="flex-1 break-words">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </BrandCard>
              )}

              {/* Brand Overview */}
              <BrandCard className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {isEditMode ? (
                      <Input
                        value={brandKit.brandName}
                        onChange={(e) =>
                          setBrandKit({
                            ...brandKit,
                            brandName: e.target.value,
                          })
                        }
                        className="text-2xl sm:text-3xl font-semibold"
                      />
                    ) : (
                      <h3 className="text-2xl sm:text-3xl font-semibold break-words">
                        {brandKit.brandName}
                      </h3>
                    )}
                    <p className="text-sm text-ink/70">Brand Overview</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Tagline Options</h4>
                    <div className="space-y-2">
                      {brandKit.taglineOptions.map((tagline, index) => (
                        <div key={index}>
                          {isEditMode ? (
                            <Input
                              value={tagline}
                              onChange={(e) => {
                                const newTaglines = [...brandKit.taglineOptions];
                                newTaglines[index] = e.target.value;
                                setBrandKit({
                                  ...brandKit,
                                  taglineOptions: newTaglines,
                                });
                              }}
                            />
                          ) : (
                            <p className="text-sm break-words">{tagline}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Positioning</h4>
                    {isEditMode ? (
                      <Textarea
                        value={brandKit.positioning}
                        onChange={(e) =>
                          setBrandKit({
                            ...brandKit,
                            positioning: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm text-ink/70 break-words">
                        {brandKit.positioning}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Core Message</h4>
                    {isEditMode ? (
                      <Textarea
                        value={brandKit.coreMessage}
                        onChange={(e) =>
                          setBrandKit({
                            ...brandKit,
                            coreMessage: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm text-ink/70 break-words">
                        {brandKit.coreMessage}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleRegenerateSection("overview")}
                  variant="outline"
                  size="sm"
                  rounded="pill"
                  disabled={isGenerating}
                >
                  Regenerate Overview
                </Button>
              </BrandCard>

              {/* Color Palette */}
              <BrandCard className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-semibold">Color Palette</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleExportCSS}
                      variant="outline"
                      size="sm"
                      rounded="pill"
                    >
                      Export CSS
                    </Button>
                    <Button
                      onClick={handleExportTailwind}
                      variant="outline"
                      size="sm"
                      rounded="pill"
                    >
                      Export Tailwind
                    </Button>
                    <Button
                      onClick={() => handleRegenerateSection("colors")}
                      variant="outline"
                      size="sm"
                      rounded="pill"
                      disabled={isGenerating}
                    >
                      Regenerate Colors
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {brandKit.colorPalette.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="h-20 rounded-lg"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isEditMode ? (
                        <>
                          <Input
                            value={color.name}
                            onChange={(e) => {
                              const newPalette = [...brandKit.colorPalette];
                              newPalette[index].name = e.target.value;
                              setBrandKit({
                                ...brandKit,
                                colorPalette: newPalette,
                              });
                            }}
                            className="text-xs"
                          />
                          <Input
                            value={color.hex}
                            onChange={(e) => {
                              const newPalette = [...brandKit.colorPalette];
                              newPalette[index].hex = e.target.value;
                              setBrandKit({
                                ...brandKit,
                                colorPalette: newPalette,
                              });
                            }}
                            className="text-xs"
                          />
                          <Input
                            value={color.usage}
                            onChange={(e) => {
                              const newPalette = [...brandKit.colorPalette];
                              newPalette[index].usage = e.target.value;
                              setBrandKit({
                                ...brandKit,
                                colorPalette: newPalette,
                              });
                            }}
                            className="text-xs"
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium break-words">{color.name}</p>
                          <p 
                            className="text-xs text-ink/70 font-mono break-words cursor-pointer hover:text-ink transition-colors"
                            onClick={() => handleCopyHex(color.hex, color.name)}
                            title="Click to copy"
                          >
                            {color.hex}
                          </p>
                          <p className="text-xs text-ink/60 break-words">{color.usage}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </BrandCard>

              {/* Typography */}
              <BrandCard className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-semibold">Typography</h3>
                  <Button
                    onClick={() => handleRegenerateSection("typography")}
                    variant="outline"
                    size="sm"
                    rounded="pill"
                    disabled={isGenerating}
                  >
                    Regenerate Typography
                  </Button>
                </div>
                <div className="space-y-3">
                  {isEditMode ? (
                    <>
                      <div>
                        <Label>Heading Font</Label>
                        <Input
                          value={brandKit.typography.headingFont}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              typography: {
                                ...brandKit.typography,
                                headingFont: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Body Font</Label>
                        <Input
                          value={brandKit.typography.bodyFont}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              typography: {
                                ...brandKit.typography,
                                bodyFont: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={brandKit.typography.notes}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              typography: {
                                ...brandKit.typography,
                                notes: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-base sm:text-lg">
                        <span className="font-medium">Headings:</span>{" "}
                        <span className="break-words">{brandKit.typography.headingFont}</span>
                      </p>
                      <p className="text-base sm:text-lg">
                        <span className="font-medium">Body:</span>{" "}
                        <span className="break-words">{brandKit.typography.bodyFont}</span>
                      </p>
                      <p className="text-sm text-ink/70 break-words">
                        {brandKit.typography.notes}
                      </p>
                    </>
                  )}
                </div>
              </BrandCard>

              {/* Brand Voice */}
              <BrandCard className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-semibold">Brand Voice</h3>
                  <Button
                    onClick={() => handleRegenerateSection("voice")}
                    variant="outline"
                    size="sm"
                    rounded="pill"
                    disabled={isGenerating}
                  >
                    Regenerate Voice
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brandKit.toneOfVoice.map((tone, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-ink/5 rounded-full text-sm break-words"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              </BrandCard>

              {/* Hero Section */}
              <BrandCard className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-semibold">Hero section draft</h3>
                  <Button
                    onClick={() => handleRegenerateSection("hero")}
                    variant="outline"
                    size="sm"
                    rounded="pill"
                    disabled={isGenerating}
                  >
                    Regenerate Hero
                  </Button>
                </div>
                <div className="space-y-3">
                  {isEditMode ? (
                    <>
                      <div>
                        <Label>Headline</Label>
                        <Input
                          value={brandKit.heroSection.headline}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              heroSection: {
                                ...brandKit.heroSection,
                                headline: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Subheadline</Label>
                        <Textarea
                          value={brandKit.heroSection.subheadline}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              heroSection: {
                                ...brandKit.heroSection,
                                subheadline: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Primary CTA</Label>
                        <Input
                          value={brandKit.heroSection.primaryCTA}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              heroSection: {
                                ...brandKit.heroSection,
                                primaryCTA: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Secondary CTA</Label>
                        <Input
                          value={brandKit.heroSection.secondaryCTA}
                          onChange={(e) =>
                            setBrandKit({
                              ...brandKit,
                              heroSection: {
                                ...brandKit.heroSection,
                                secondaryCTA: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="text-base sm:text-lg font-semibold break-words">
                        {brandKit.heroSection.headline}
                      </h4>
                      <p className="text-sm text-ink/70 break-words">
                        {brandKit.heroSection.subheadline}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button rounded="pill" size="sm">
                          {brandKit.heroSection.primaryCTA}
                        </Button>
                        <Button variant="outline" rounded="pill" size="sm">
                          {brandKit.heroSection.secondaryCTA}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </BrandCard>
            </>
          )}
        </div>
      </div>
      </BottomWaveBackground>
    </>
  );
};

export default Studio;
