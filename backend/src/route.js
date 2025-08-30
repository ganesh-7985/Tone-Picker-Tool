import { Router } from "express";
import { rewriteTone } from "./services/mistralService.js";

const router = Router();

router.post('/tone', async (req, res) => {
    const { text, axes } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Invalid or missing "text" field' });
    }
    
    const validFormality = ['formal', 'neutral', 'casual'];
    const validVerbosity = ['concise', 'balanced', 'elaborate'];
    
    if (!axes) {
        return res.status(400).json({ error: 'Missing tone axes' });
    }

    const formality = axes.formality || 'neutral';
    const verbosity = axes.verbosity || 'balanced';
    
    if (!validFormality.includes(formality)) {
        return res.status(400).json({ 
            error: `Invalid formality. Must be one of: ${validFormality.join(', ')}` 
        });
    }
    
    if (!validVerbosity.includes(verbosity)) {
        return res.status(400).json({ 
            error: `Invalid verbosity. Must be one of: ${validVerbosity.join(', ')}` 
        });
    }

    try {
        const rewritten = await rewriteTone(text, { formality, verbosity });
        return res.json({ text: rewritten });
    } catch (e) {
        console.error('Tone rewrite error:', e);
        return res.status(502).json({ 
            error: e.message || 'Tone service failed' 
        });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', matrix: '3x3' });
});

export default router;