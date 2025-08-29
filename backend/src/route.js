import { Router } from "express";
import { rewriteTone } from "./services/mistralService";

const router = Router();

router.post('/tone', async (req, res) => {
    const { text, axes } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Invalid or missing "text" field' });
    }
    if (
        !axes ||
        !['formal', 'casual'].includes(axes.formality) ||
        !['concise', 'elaborate'].includes(axes.verbosity)
    ) {
        return res.status(400).json({ error: 'Invalid tone axes' });
    }

    try {
        const rewritten = await rewriteTone(text, axes);
        return res.json({ text: rewritten });
    } catch (e) {
        console.error('Tone error:', e);
        return res.status(502).json({ error: 'Tone service failed' });
    }

});

export default router;