import express from "express";
import cors from "cors";
import routes from "./route.js"
import dotenv from "dotenv";
dotenv.config();

const app = express();

const corsOrigin = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({origin:corsOrigin, credentials:false}));
app.use(express.json())

app.use('/api',routes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal error' });
});
  
export default app;