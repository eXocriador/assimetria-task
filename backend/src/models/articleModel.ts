import { pool } from './db';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: Date;
  model: string | null;
}

type ArticleRow = Omit<Article, 'created_at'> & {
  created_at: Date | string;
};

const mapArticleRow = (row: ArticleRow): Article => ({
  ...row,
  created_at: row.created_at instanceof Date
    ? row.created_at
    : new Date(row.created_at),
});

export const getAllArticles = async (): Promise<Article[]> => {
  const { rows } = await pool.query<ArticleRow>(
    `SELECT id, title, slug, content, created_at, model
     FROM articles
     ORDER BY created_at DESC`
  );
  return rows.map(mapArticleRow);
};

export const getArticleById = async (id: number): Promise<Article | null> => {
  const { rows } = await pool.query<ArticleRow>(
    `SELECT id, title, slug, content, created_at, model
     FROM articles
     WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapArticleRow(rows[0]);
};

type CreateArticleInput = {
  title: string;
  slug: string;
  content: string;
  model?: string | null;
};

export const createArticle = async (
  input: CreateArticleInput
): Promise<Article> => {
  const { rows } = await pool.query<ArticleRow>(
    `INSERT INTO articles (title, slug, content, model)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, slug, content, created_at, model`,
    [input.title, input.slug, input.content, input.model ?? null]
  );

  return mapArticleRow(rows[0]);
};

export const countArticles = async (): Promise<number> => {
  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM articles'
  );
  return Number(rows[0]?.count ?? '0');
};
