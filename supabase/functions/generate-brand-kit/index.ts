import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating brand kit for:', formData);

    const systemPrompt = `You are a professional brand designer and strategist. Generate a comprehensive brand kit based on the user's input.

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

Generate colors that match the brand vibe. Be creative and thoughtful. Use actual hex codes.`;

    const userPrompt = `Create a brand kit for:
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
        temperature: 0.8,
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
