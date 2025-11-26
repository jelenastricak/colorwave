import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const FormDataSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required").max(100, "Project name too long"),
  description: z.string().trim().max(500, "Description too long").optional(),
  targetAudience: z.string().trim().max(200, "Target audience too long").optional(),
  brandVibe: z.string().trim().max(200, "Brand vibe too long").optional(),
  industry: z.string().trim().max(100, "Industry too long").optional(),
  keywords: z.string().trim().max(200, "Keywords too long").optional(),
});

const ExtractedColorsSchema = z.array(z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format")).max(10, "Too many colors");
const VariationSeedSchema = z.number().min(0).max(10).optional();
const RegenerateSectionSchema = z.enum(['overview', 'colors', 'typography', 'voice', 'hero']).optional();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { formData, regenerateSection, currentKit, extractedColors, variationSeed, getSuggestions } = requestBody;
    
    // Validate inputs
    try {
      if (formData) {
        FormDataSchema.parse(formData);
      }
      if (extractedColors) {
        ExtractedColorsSchema.parse(extractedColors);
      }
      if (variationSeed !== undefined) {
        VariationSeedSchema.parse(variationSeed);
      }
      if (regenerateSection) {
        RegenerateSectionSchema.parse(regenerateSection);
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('Input validation failed:', validationError.errors);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input', 
            details: validationError.errors[0]?.message || 'Validation failed'
          }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      throw validationError;
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating brand kit for:', formData);

    let systemPrompt = '';
    let userPrompt = '';

    // Handle AI suggestions request
    if (getSuggestions && currentKit) {
      systemPrompt = `You are a professional brand designer and strategist with expertise in current design trends and industry best practices.
Analyze the provided brand kit and provide 5-7 specific, actionable improvement suggestions.

Your response must be a valid JSON object with this exact structure:
{
  "suggestions": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2",
    "specific actionable suggestion 3",
    "specific actionable suggestion 4",
    "specific actionable suggestion 5"
  ]
}

Focus on:
- Color accessibility and contrast ratios
- Typography hierarchy and readability
- Brand consistency and cohesiveness
- Current design trends (2025)
- Industry-specific best practices
- Potential improvements in positioning or messaging
- Opportunities to strengthen brand differentiation

Be specific and actionable. Don't just say "improve colors" - explain exactly what to change and why.`;

      userPrompt = `Analyze this brand kit and provide improvement suggestions:

Brand Name: ${currentKit.brandName}
Taglines: ${currentKit.taglineOptions.join(', ')}
Positioning: ${currentKit.positioning}
Core Message: ${currentKit.coreMessage}
Tone of Voice: ${currentKit.toneOfVoice.join(', ')}
Color Palette: ${currentKit.colorPalette.map((c: any) => `${c.name} (${c.hex}): ${c.usage}`).join(', ')}
Typography: Heading - ${currentKit.typography.headingFont}, Body - ${currentKit.typography.bodyFont}
Industry: ${formData?.industry || 'General'}
Target Audience: ${formData?.targetAudience || 'General'}

Provide specific, actionable suggestions for improvement.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limit exceeded');
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          console.error('Payment required');
          return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error('AI gateway error');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const result = JSON.parse(jsonStr);

      return new Response(JSON.stringify({ suggestions: result.suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (regenerateSection && currentKit) {
      // Regenerate specific section
      switch (regenerateSection) {
        case 'overview':
          systemPrompt = `You are a professional brand designer. Regenerate only the brand overview section.
Your response must be a valid JSON object with this exact structure:
{
  "brandName": "string",
  "taglineOptions": ["string", "string", "string"],
  "positioning": "string (2-3 sentences)",
  "coreMessage": "string (2-3 sentences)"
}`;
          userPrompt = `Regenerate the brand overview for:
Project Name: ${formData.projectName || currentKit.brandName}
Description: ${formData.description || 'No description'}
Target Audience: ${formData.targetAudience || 'General'}
Brand Vibe: ${formData.brandVibe || 'Professional'}

Current brand name: ${currentKit.brandName}
Keep it fresh and different from the current version.`;
          break;
        
        case 'colors':
          systemPrompt = `You are a professional brand designer. Regenerate only the color palette.
Your response must be a valid JSON object with this exact structure:
{
  "colorPalette": [
    { "name": "Primary", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Accent 1", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Accent 2", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Neutral 1", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Neutral 2", "hex": "#HEXCODE", "usage": "description" }
  ]
}`;
          userPrompt = `Create a new color palette for ${currentKit.brandName}.
Brand Vibe: ${formData.brandVibe || 'Professional'}
Industry: ${formData.industry || 'General'}

Make it different from the current palette. Use actual hex codes.`;
          break;
        
        case 'typography':
          systemPrompt = `You are a professional brand designer. Regenerate only the typography section.
Your response must be a valid JSON object with this exact structure:
{
  "typography": {
    "headingFont": "Font name and weight",
    "bodyFont": "Font name and weight",
    "notes": "Usage guidelines (1-2 sentences)"
  }
}`;
          userPrompt = `Create new typography recommendations for ${currentKit.brandName}.
Brand Vibe: ${formData.brandVibe || 'Professional'}
Industry: ${formData.industry || 'General'}

Suggest real, accessible fonts. Make it different from the current selection.`;
          break;
        
        case 'voice':
          systemPrompt = `You are a professional brand strategist. Regenerate only the tone of voice.
Your response must be a valid JSON object with this exact structure:
{
  "toneOfVoice": ["adjective1", "adjective2", "adjective3"]
}`;
          userPrompt = `Create new tone of voice adjectives for ${currentKit.brandName}.
Brand Vibe: ${formData.brandVibe || 'Professional'}
Target Audience: ${formData.targetAudience || 'General'}

Provide 3 distinct adjectives that describe the brand voice. Make them different from the current ones.`;
          break;
        
        case 'hero':
          systemPrompt = `You are a professional copywriter. Regenerate only the hero section copy.
Your response must be a valid JSON object with this exact structure:
{
  "heroSection": {
    "headline": "string",
    "subheadline": "string",
    "primaryCTA": "string",
    "secondaryCTA": "string"
  }
}`;
          userPrompt = `Create new hero section copy for ${currentKit.brandName}.
Tagline: ${currentKit.taglineOptions[0]}
Core Message: ${currentKit.coreMessage}
Target Audience: ${formData.targetAudience || 'General'}

Make it compelling and different from the current version.`;
          break;
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limit exceeded');
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          console.error('Payment required');
          return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error('AI gateway error');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const updatedSection = JSON.parse(jsonStr);

      // Merge only the specific fields that should be updated for this section
      let brandKit = { ...currentKit };
      
      switch (regenerateSection) {
        case 'overview':
          if (updatedSection.brandName) brandKit.brandName = updatedSection.brandName;
          if (updatedSection.taglineOptions) brandKit.taglineOptions = updatedSection.taglineOptions;
          if (updatedSection.positioning) brandKit.positioning = updatedSection.positioning;
          if (updatedSection.coreMessage) brandKit.coreMessage = updatedSection.coreMessage;
          break;
        case 'colors':
          if (updatedSection.colorPalette) brandKit.colorPalette = updatedSection.colorPalette;
          break;
        case 'typography':
          if (updatedSection.typography) brandKit.typography = updatedSection.typography;
          break;
        case 'voice':
          if (updatedSection.toneOfVoice) brandKit.toneOfVoice = updatedSection.toneOfVoice;
          break;
        case 'hero':
          if (updatedSection.heroSection) brandKit.heroSection = updatedSection.heroSection;
          break;
      }

      return new Response(JSON.stringify({ brandKit }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate full brand kit (original logic)
    let colorConstraint = '';
    if (extractedColors && extractedColors.length > 0) {
      colorConstraint = `\n\nIMPORTANT: Use these extracted colors as the foundation for the color palette: ${extractedColors.join(', ')}. You must incorporate these colors into the palette, adjusting their usage and adding complementary colors if needed.`;
    }

    systemPrompt = `You are a professional brand designer and strategist. Generate a comprehensive brand kit based on the user's input.

Your response must be a valid JSON object with this exact structure:
{
  "brandName": "string",
  "taglineOptions": ["string", "string", "string"],
  "positioning": "string (2-3 sentences)",
  "coreMessage": "string (2-3 sentences)",
  "toneOfVoice": ["adjective1", "adjective2", "adjective3"],
  "colorPalette": [
    { "name": "Primary", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Accent 1", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Accent 2", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Neutral 1", "hex": "#HEXCODE", "usage": "description" },
    { "name": "Neutral 2", "hex": "#HEXCODE", "usage": "description" }
  ],
  "typography": {
    "headingFont": "Font name and weight",
    "bodyFont": "Font name and weight",
    "notes": "Usage guidelines"
  },
  "heroSection": {
    "headline": "string",
    "subheadline": "string",
    "primaryCTA": "string",
    "secondaryCTA": "string"
  }
}

Generate colors that match the brand vibe. Be creative and thoughtful. Use actual hex codes.${colorConstraint}`;

    userPrompt = `Create a brand kit for:
Project Name: ${formData.projectName || 'Unnamed Project'}
Description: ${formData.description || 'No description provided'}
Target Audience: ${formData.targetAudience || 'General audience'}
Brand Vibe: ${formData.brandVibe || 'Professional'}
Industry: ${formData.industry || 'General'}
Keywords: ${formData.keywords || 'None'}

Generate a complete, cohesive brand identity.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8 + (variationSeed ? variationSeed * 0.05 : 0),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    console.log('AI response received');
    
    let brandKit;
    try {
      const content = data.choices[0].message.content;
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      brandKit = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse brand kit data');
    }

    console.log('Brand kit generated successfully');

    return new Response(JSON.stringify({ brandKit }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-brand-kit function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate brand kit';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
