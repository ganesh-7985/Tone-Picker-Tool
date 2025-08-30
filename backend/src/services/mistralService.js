import { Mistral } from '@mistralai/mistralai';
import { cache } from './cacheService.js';

let cachedClient = null;
function getClient() {
    if (cachedClient) return cachedClient;
    const apiKey = (process.env.MISTRAL_API_KEY || '').trim();
    if (!apiKey || apiKey.toLowerCase().includes('your_key')) {
        throw new Error('MISTRAL_API_KEY is missing or invalid. Set it in backend/.env');
    }
    cachedClient = new Mistral({ apiKey });
    return cachedClient;
}

function buildPrompt(text, axes) {
    const { formality, verbosity } = axes;
    const styleBits = [];
    
    if (formality === 'formal') {
        styleBits.push('formal, professional, business-appropriate');
    } else if (formality === 'neutral') {
        styleBits.push('neutral tone, balanced formality');
    } else {
        styleBits.push('casual, conversational, friendly');
    }
    

    if (verbosity === 'concise') {
        styleBits.push('concise, succinct, to-the-point');
    } else if (verbosity === 'balanced') {
        styleBits.push('balanced length, moderate detail');
    } else {
        styleBits.push('elaborate, detailed, comprehensive');
    }

    const guidelines = [
        `- Preserve the original meaning and intent.`,
        `- Do not add new facts or information.`,
        `- Keep the same language (do not translate).`,
        `- Maintain simple formatting (no markdown tables or complex structures).`,
        `- Adjust the tone naturally without making it sound forced.`
    ].join('\n');

    return `Rewrite the following text in the requested tone and style.
    
Tone Requirements:
- ${styleBits.join(', ')}

Guidelines:
${guidelines}

Original Text:
"""
${text}
"""

Rewritten Text:`;
}

export async function rewriteTone(text, axes) {
    const normalizedAxes = {
        formality: axes.formality || 'neutral',
        verbosity: axes.verbosity || 'balanced'
    };
    
    const key = JSON.stringify({ text, axes: normalizedAxes });
    const cached = cache.get(key);
    if (cached) return cached;

    const prompt = buildPrompt(text, normalizedAxes);
    const client = getClient();
    
    try {
        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a professional text rewriting assistant. You excel at adjusting the tone and style of text while preserving its core meaning. Always provide natural-sounding rewrites that match the requested tone.' 
                },
                { 
                    role: 'user', 
                    content: prompt 
                }
            ],
            temperature: 0.4,
            maxTokens: 1000
        });
        
        const output = response?.choices?.[0]?.message?.content?.trim();
        if (!output) throw new Error('Empty response from Mistral');

        cache.set(key, output);
        return output;
    } catch (error) {
        console.error('Mistral API error:', error);
        throw new Error('Failed to rewrite text. Please try again.');
    }
}