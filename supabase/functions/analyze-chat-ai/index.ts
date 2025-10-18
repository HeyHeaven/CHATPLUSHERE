import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, totalMessages, totalUsers, topWords, topEmojis } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Sample messages for sentiment analysis (take up to 100 random messages)
    const sampleSize = Math.min(messages.length, 100);
    const sampledMessages = [];
    const step = Math.max(1, Math.floor(messages.length / sampleSize));
    
    for (let i = 0; i < messages.length; i += step) {
      if (sampledMessages.length >= sampleSize) break;
      sampledMessages.push(messages[i]);
    }

    const messageTexts = sampledMessages.map((m: any) => `${m.user}: ${m.message}`).join('\n');

    // Prepare context for AI
    const analysisContext = `
Total Messages: ${totalMessages}
Total Users: ${totalUsers}
Top Words: ${topWords.map((w: any) => w[0]).slice(0, 10).join(', ')}
Top Emojis: ${topEmojis.map((e: any) => e[0]).slice(0, 5).join(', ')}

Sample Messages:
${messageTexts}
`;

    console.log('Calling Lovable AI for sentiment and insights analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert business analyst specializing in customer conversation analysis. Analyze WhatsApp chat data to extract sentiment and actionable business insights. Return ONLY valid JSON, no markdown formatting.`
          },
          {
            role: 'user',
            content: `Analyze this WhatsApp customer conversation data and provide:

1. Overall sentiment distribution (as percentages that sum to 100)
2. 5-7 key business insights with priority levels and actionable recommendations

Context:
${analysisContext}

Return ONLY this exact JSON structure:
{
  "sentiment": {
    "positive": <number 0-100>,
    "neutral": <number 0-100>,
    "negative": <number 0-100>
  },
  "insights": [
    {
      "type": "sentiment" | "engagement" | "satisfaction" | "topic" | "response_time" | "opportunity",
      "title": "Brief insight title",
      "description": "Detailed explanation (2-3 sentences)",
      "priority": "low" | "medium" | "high" | "critical",
      "recommendations": ["action 1", "action 2", "action 3"]
    }
  ]
}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log('Raw AI response:', content);
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();
    
    const analysis = JSON.parse(jsonStr);
    
    // Validate sentiment percentages sum to 100
    const total = analysis.sentiment.positive + analysis.sentiment.neutral + analysis.sentiment.negative;
    if (Math.abs(total - 100) > 1) {
      const factor = 100 / total;
      analysis.sentiment.positive = Math.round(analysis.sentiment.positive * factor * 100) / 100;
      analysis.sentiment.neutral = Math.round(analysis.sentiment.neutral * factor * 100) / 100;
      analysis.sentiment.negative = Math.round((100 - analysis.sentiment.positive - analysis.sentiment.neutral) * 100) / 100;
    }

    console.log('Analysis complete:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-chat-ai:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});