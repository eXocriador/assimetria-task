import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { articleRouter } from './routes/articleRoutes';
import {
  scheduleDailyArticleJob,
  ensureSeedArticles,
} from './services/articleJob';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/articles', articleRouter);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  scheduleDailyArticleJob();
  ensureSeedArticles(3)
    .then(() => {
      console.log('[ArticleScheduler] Seed check complete');
    })
    .catch((error) => {
      console.error('[ArticleScheduler] Failed during seed check:', error);
    });
});

export { app, server };
