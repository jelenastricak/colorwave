import jsPDF from 'jspdf';

interface BrandKit {
  brandName: string;
  taglineOptions: string[];
  positioning: string;
  coreMessage: string;
  toneOfVoice: string[] | { adjectives: string[] };
  colorPalette: Array<{ name: string; hex: string; usage: string }>;
  typography: { headingFont: string; bodyFont: string; notes?: string };
  heroSection: { 
    headline: string; 
    subheadline: string; 
    ctas?: string[];
    primaryCTA?: string;
    secondaryCTA?: string;
  };
}

export const exportBrandKitAsPDF = (brandKit: BrandKit) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = 20;

  // Helper to get tone of voice array
  const getToneOfVoice = () => {
    if (Array.isArray(brandKit.toneOfVoice)) {
      return brandKit.toneOfVoice;
    }
    return brandKit.toneOfVoice.adjectives;
  };

  // Helper to get CTAs
  const getCTAs = () => {
    if (brandKit.heroSection.ctas) {
      return brandKit.heroSection.ctas;
    }
    const ctas = [];
    if (brandKit.heroSection.primaryCTA) ctas.push(brandKit.heroSection.primaryCTA);
    if (brandKit.heroSection.secondaryCTA) ctas.push(brandKit.heroSection.secondaryCTA);
    return ctas;
  };

  // Helper to add text with wrapping
  const addText = (text: string, fontSize: number, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = pdf.splitTextToSize(text, contentWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += (lines.length * fontSize * 0.4) + 5;
  };

  // Helper to check page break
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  pdf.setFillColor(243, 236, 215); // #F3ECD7
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(28, 36, 51); // #1C2433
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(brandKit.brandName, margin, 25);
  yPosition = 50;

  // Taglines
  addText('TAGLINE OPTIONS', 12, true);
  brandKit.taglineOptions.forEach((tagline, index) => {
    checkPageBreak(15);
    addText(`${index + 1}. ${tagline}`, 10);
  });
  yPosition += 5;

  // Positioning
  checkPageBreak(30);
  addText('BRAND POSITIONING', 12, true);
  addText(brandKit.positioning, 10);
  yPosition += 5;

  // Core Message
  checkPageBreak(30);
  addText('CORE MESSAGE', 12, true);
  addText(brandKit.coreMessage, 10);
  yPosition += 5;

  // Tone of Voice
  checkPageBreak(30);
  addText('TONE OF VOICE', 12, true);
  addText(getToneOfVoice().join(', '), 10);
  yPosition += 5;

  // Color Palette
  checkPageBreak(80);
  addText('COLOR PALETTE', 12, true);
  brandKit.colorPalette.forEach((color) => {
    checkPageBreak(25);
    
    // Draw color swatch
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    const rgb = hexToRgb(color.hex);
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(margin, yPosition - 5, 15, 15, 'F');
    
    // Color info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(color.name, margin + 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(color.hex, margin + 20, yPosition + 5);
    const usageLines = pdf.splitTextToSize(color.usage, contentWidth - 25);
    pdf.text(usageLines, margin + 20, yPosition + 10);
    
    yPosition += Math.max(20, usageLines.length * 4 + 15);
  });
  yPosition += 5;

  // Typography
  checkPageBreak(40);
  addText('TYPOGRAPHY', 12, true);
  addText(`Heading Font: ${brandKit.typography.headingFont}`, 10);
  addText(`Body Font: ${brandKit.typography.bodyFont}`, 10);
  if (brandKit.typography.notes) {
    addText(brandKit.typography.notes, 10);
  }
  yPosition += 5;

  // Hero Section
  checkPageBreak(60);
  addText('HERO SECTION', 12, true);
  addText('Headline:', 10, true);
  addText(brandKit.heroSection.headline, 10);
  addText('Subheadline:', 10, true);
  addText(brandKit.heroSection.subheadline, 10);
  addText('Call-to-Actions:', 10, true);
  getCTAs().forEach((cta) => {
    addText(`• ${cta}`, 10);
  });

  // Save PDF
  pdf.save(`${brandKit.brandName.replace(/\s+/g, '-')}-brand-kit.pdf`);
};
