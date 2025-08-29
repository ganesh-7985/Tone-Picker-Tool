import { Mistral } from '@mistralai/mistralai';
import { cache } from './cacheService';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

function buildPrompt(text, axes) {
    const { formality, verbosity } = axes;
    const styleBits=[];
    styleBits.push(formality=='formal'?'formal,professional':'casual, conversational');
    styleBits.push(verbosity === 'concise' ? 'concise, succinct' : 'elaborate, detailed');

    const guidelines = [
        `- Preserve original meaning.`,
        `- Avoid adding facts.`,
        `- Do not translate; keep the same language.`,
        `- Keep formatting simple (no markdown tables).`
    ].join('\n');

    return `Rewrite the text in the requested tone.
    Tone: 
    -${styleBits.join(', ')}

    Rules:
    ${guidelines}

    Text:
    """${text}"""

    `;
}

export async function rewriteTone(text,axes){
    const key  = JSON.stringify({text,axes});
    const cached = cache.get(key);
    if(cached) return cached;

    const prompt = buildPrompt(text,axes);
    const response = await client.chat.complete({
        model:"mistral-small-latest",
        messages:[
            { role: 'system', content: 'You are a helpful rewriting assistant focused on tone.' },
            { role: 'user', content: prompt }
        ],
        temperature:0.4,
        maxTokens:800
    })
    const output = response?.choices?.[0]?.message?.content?.trim();
    if(!output) throw new Error('Empty response from Mistral')

    cache.set(key,output);
    return output;

}