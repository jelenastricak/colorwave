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

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const exportBrandKitAsPDF = (brandKit: BrandKit) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Helper to get tone of voice array
  const getToneOfVoice = () => {
    if (Array.isArray(brandKit.toneOfVoice)) {
      return brandKit.toneOfVoice;
    }
    return brandKit.toneOfVoice.adjectives || [];
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

  let yPosition = 0;
  
  // COVER PAGE
  pdf.setFillColor(243, 236, 215);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(28, 36, 51);
  const brandLines = pdf.splitTextToSize(brandKit.brandName, contentWidth);
  yPosition = 80;
  brandLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 14;
  });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Brand Guidelines', pageWidth / 2, yPosition + 15, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'italic');
  pdf.text(brandKit.taglineOptions[0] || '', pageWidth / 2, yPosition + 30, { align: 'center' });
  
  // TABLE OF CONTENTS
  pdf.addPage();
  yPosition = 40;
  
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', margin, yPosition);
  yPosition += 20;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const tocItems = [
    '1. Brand Overview',
    '2. Color Palette',
    '3. Typography Guidelines', 
    '4. Tone of Voice',
    '5. Messaging Framework',
    '6. Usage Guidelines',
    '7. Dos and Don\'ts'
  ];
  
  tocItems.forEach(item => {
    pdf.text(item, margin + 10, yPosition);
    yPosition += 10;
  });
  
  // PAGE 1: BRAND OVERVIEW
  pdf.addPage();
  yPosition = 30;
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. Brand Overview', margin, yPosition);
  yPosition += 20;
  
  // Brand Name
  pdf.setFontSize(18);
  pdf.text(brandKit.brandName, margin, yPosition);
  yPosition += 15;
  
  // Positioning
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Positioning Statement', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const posLines = pdf.splitTextToSize(brandKit.positioning, contentWidth);
  posLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 12;
  
  // Core Message
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Core Message', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const coreLines = pdf.splitTextToSize(brandKit.coreMessage, contentWidth);
  coreLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 12;
  
  // Tagline Options
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tagline Options', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  brandKit.taglineOptions.forEach((tagline, i) => {
    pdf.text(`${i + 1}. "${tagline}"`, margin + 5, yPosition);
    yPosition += 7;
  });
  
  // PAGE 2: COLOR PALETTE
  pdf.addPage();
  yPosition = 30;
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. Color Palette', margin, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Our brand colors create visual consistency and reinforce brand recognition.', margin, yPosition);
  yPosition += 18;
  
  brandKit.colorPalette.forEach((color) => {
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 30;
    }
    
    const rgb = hexToRgb(color.hex);
    
    // Color swatch with border
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, 35, 25, 'FD');
    
    // Color info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(color.name, margin + 40, yPosition + 6);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(color.hex.toUpperCase(), margin + 40, yPosition + 13);
    pdf.text(`RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`, margin + 40, yPosition + 19);
    
    yPosition += 30;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Usage:', margin, yPosition);
    yPosition += 5;
    
    pdf.setFont('helvetica', 'normal');
    const usageLines = pdf.splitTextToSize(color.usage, contentWidth);
    usageLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 12;
  });
  
  // PAGE 3: TYPOGRAPHY
  pdf.addPage();
  yPosition = 30;
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. Typography Guidelines', margin, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Typography creates hierarchy and improves readability across all brand materials.', margin, yPosition);
  yPosition += 18;
  
  // Heading Font
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Primary Typeface (Headings)', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(brandKit.typography.headingFont, margin, yPosition);
  yPosition += 6;
  pdf.setFont('helvetica', 'italic');
  pdf.text('Use for: Headlines, titles, and emphasis', margin, yPosition);
  yPosition += 18;
  
  // Body Font
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Secondary Typeface (Body)', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(brandKit.typography.bodyFont, margin, yPosition);
  yPosition += 6;
  pdf.setFont('helvetica', 'italic');
  pdf.text('Use for: Body text, descriptions, and captions', margin, yPosition);
  yPosition += 18;
  
  if (brandKit.typography.notes) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes:', margin, yPosition);
    yPosition += 7;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const noteLines = pdf.splitTextToSize(brandKit.typography.notes, contentWidth);
    noteLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 15;
  }
  
  // Hierarchy Example
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Type Hierarchy Example:', margin, yPosition);
  yPosition += 10;
  
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, yPosition, contentWidth, 50, 'F');
  yPosition += 8;
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('H1: Main Headline', margin + 5, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(14);
  pdf.text('H2: Section Heading', margin + 5, yPosition);
  yPosition += 9;
  
  pdf.setFontSize(11);
  pdf.text('H3: Subsection Heading', margin + 5, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Body: Regular text for content and descriptions.', margin + 5, yPosition);
  
  // PAGE 4: TONE OF VOICE
  pdf.addPage();
  yPosition = 30;
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('4. Tone of Voice', margin, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Our brand voice is consistent, authentic, and reflects our core values.', margin, yPosition);
  yPosition += 18;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Voice Characteristics:', margin, yPosition);
  yPosition += 10;
  
  getToneOfVoice().forEach(tone => {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`• ${tone}`, margin + 5, yPosition);
    yPosition += 8;
  });
  
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Communication Principles:', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const principles = [
    '✓ Be authentic and genuine in all communications',
    '✓ Speak directly to audience needs and aspirations',
    '✓ Use clear, accessible language',
    '✓ Maintain consistency across all touchpoints',
    '✓ Balance professionalism with personality'
  ];
  
  principles.forEach(principle => {
    pdf.text(principle, margin + 5, yPosition);
    yPosition += 6;
  });
  
  // PAGE 5: MESSAGING FRAMEWORK
  pdf.addPage();
  yPosition = 30;
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('5. Messaging Framework', margin, yPosition);
  yPosition += 20;
  
  // Hero Section
  pdf.setFontSize(13);
  pdf.text('Hero Section Template', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Headline:', margin, yPosition);
  yPosition += 6;
  
  pdf.setFont('helvetica', 'normal');
  const headLines = pdf.splitTextToSize(brandKit.heroSection.headline, contentWidth - 5);
  headLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 5;
  
  pdf.setFont('helvetica', 'italic');
  pdf.text('Subheadline:', margin, yPosition);
  yPosition += 6;
  
  pdf.setFont('helvetica', 'normal');
  const subLines = pdf.splitTextToSize(brandKit.heroSection.subheadline, contentWidth - 5);
  subLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 10;
  
  const ctas = getCTAs();
  if (ctas.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Call-to-Actions:', margin, yPosition);
    yPosition += 6;
    
    pdf.setFont('helvetica', 'normal');
    ctas.forEach(cta => {
      pdf.text(`• "${cta}"`, margin + 5, yPosition);
      yPosition += 6;
    });
  }
  
  // PAGE 6: DOS AND DON'TS
  pdf.addPage();
  yPosition = 30;
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('6. Dos and Don\'ts', margin, yPosition);
  yPosition += 20;
  
  // COLORS
  pdf.setFontSize(16);
  pdf.text('Colors', margin, yPosition);
  yPosition += 12;
  
  const colWidth = contentWidth / 2 - 3;
  
  // DO box
  pdf.setFillColor(220, 255, 220);
  pdf.rect(margin, yPosition, colWidth, 45, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 120, 0);
  pdf.text('✓ DO', margin + 5, yPosition + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('• Use specified brand colors', margin + 5, yPosition + 15);
  pdf.text('• Maintain proper contrast', margin + 5, yPosition + 21);
  pdf.text('• Follow usage guidelines', margin + 5, yPosition + 27);
  pdf.text('• Test accessibility', margin + 5, yPosition + 33);
  
  // DON'T box
  pdf.setFillColor(255, 220, 220);
  pdf.rect(margin + colWidth + 6, yPosition, colWidth, 45, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(150, 0, 0);
  pdf.text('✗ DON\'T', margin + colWidth + 11, yPosition + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('• Alter brand colors', margin + colWidth + 11, yPosition + 15);
  pdf.text('• Use unapproved colors', margin + colWidth + 11, yPosition + 21);
  pdf.text('• Ignore contrast ratios', margin + colWidth + 11, yPosition + 27);
  pdf.text('• Change color meanings', margin + colWidth + 11, yPosition + 33);
  
  yPosition += 55;
  
  // TYPOGRAPHY
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Typography', margin, yPosition);
  yPosition += 12;
  
  // DO box
  pdf.setFillColor(220, 255, 220);
  pdf.rect(margin, yPosition, colWidth, 45, 'F');
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 120, 0);
  pdf.text('✓ DO', margin + 5, yPosition + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('• Use approved typefaces', margin + 5, yPosition + 15);
  pdf.text('• Maintain hierarchy', margin + 5, yPosition + 21);
  pdf.text('• Ensure readability', margin + 5, yPosition + 27);
  pdf.text('• Keep sizes consistent', margin + 5, yPosition + 33);
  
  // DON'T box
  pdf.setFillColor(255, 220, 220);
  pdf.rect(margin + colWidth + 6, yPosition, colWidth, 45, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(150, 0, 0);
  pdf.text('✗ DON\'T', margin + colWidth + 11, yPosition + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('• Substitute fonts', margin + colWidth + 11, yPosition + 15);
  pdf.text('• Distort or stretch text', margin + colWidth + 11, yPosition + 21);
  pdf.text('• Use too many styles', margin + colWidth + 11, yPosition + 27);
  pdf.text('• Ignore spacing', margin + colWidth + 11, yPosition + 33);
  
  yPosition += 55;
  
  // VOICE & TONE
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Voice & Tone', margin, yPosition);
  yPosition += 12;
  
  // DO box
  pdf.setFillColor(220, 255, 220);
  pdf.rect(margin, yPosition, colWidth, 45, 'F');
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 120, 0);
  pdf.text('✓ DO', margin + 5, yPosition + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('• Stay true to brand voice', margin + 5, yPosition + 15);
  pdf.text('• Be consistent', margin + 5, yPosition + 21);
  pdf.text('• Speak to your audience', margin + 5, yPosition + 27);
  pdf.text('• Show authenticity', margin + 5, yPosition + 33);
  
  // DON'T box
  pdf.setFillColor(255, 220, 220);
  pdf.rect(margin + colWidth + 6, yPosition, colWidth, 45, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(150, 0, 0);
  pdf.text('✗ DON\'T', margin + colWidth + 11, yPosition + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('• Use inconsistent tone', margin + colWidth + 11, yPosition + 15);
  pdf.text('• Ignore brand values', margin + colWidth + 11, yPosition + 21);
  pdf.text('• Copy competitors', margin + colWidth + 11, yPosition + 27);
  pdf.text('• Be inauthentic', margin + colWidth + 11, yPosition + 33);
  
  // Save PDF
  pdf.save(`${brandKit.brandName.replace(/\s+/g, '-')}-Brand-Guidelines.pdf`);
};
