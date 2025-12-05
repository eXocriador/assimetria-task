import { Router } from 'express';
import {
  getAllArticles,
  getArticleById,
} from '../models/articleModel';

const articleRouter = Router();

articleRouter.get('/', async (_req, res, next) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

articleRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid article id' });
      return;
    }

    const article = await getArticleById(id);
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
});

export { articleRouter };
