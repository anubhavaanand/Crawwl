import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './lib/logger.js';

import { v1Router } from './routes/v1.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'crawwl-api' });
});

// V1 Routes
app.use('/v1', v1Router);

app.listen(port, () => {
  logger.info(`Crawwl API listening at http://localhost:${port}`);
});
