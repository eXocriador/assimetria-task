import cron from 'node-cron';
import {
  createArticle,
  countArticles,
} from '../models/articleModel';
import { generateArticle } from './aiClient';

const topics = [
  'AI-driven blogging strategies',
  'TypeScript backend best practices',
  'Infrastructure as Code for startups',
  'Scaling PostgreSQL in the cloud',
  'Modern React patterns for dashboards',
  'Event-driven architecture case studies',
];

const slugify = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

export const scheduleDailyArticleJob = (): void => {
  cron.schedule('0 1 * * *', async () => {
    try {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const article = await generateArticle(topic);
      const slug = slugify(article.title);

      await createArticle({
        title: article.title,
        slug,
        content: article.content,
        model: article.model,
      });

      console.log(
        `[ArticleScheduler] Generated article "${article.title}" with slug "${slug}"`
      );
    } catch (error) {
      console.error('[ArticleScheduler] Failed to auto-generate article:', error);
    }
  });
};

export const ensureSeedArticles = async (minCount: number): Promise<void> => {
  let currentCount = await countArticles();
  while (currentCount < minCount) {
    try {
      const article = await generateArticle();
      const slug = slugify(article.title);

      await createArticle({
        title: article.title,
        slug,
        content: article.content,
        model: article.model,
      });

      currentCount += 1;
      console.log(
        `[ArticleScheduler] Seeded article "${article.title}" (${currentCount}/${minCount})`
      );
    } catch (error) {
      console.error('[ArticleScheduler] Failed to seed article:', error);
      break;
    }
  }
};
