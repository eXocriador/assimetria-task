import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchArticle } from '../api/client';
import type { Article } from '../api/client';

export const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Article id is required');
      setLoading(false);
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const data = await fetchArticle(Number(id));
        if (!ignore) {
          setArticle(data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Failed to load article');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <div className="status-card">Loading article...</div>;
  }

  if (error || !article) {
    return (
      <div className="status-card error">
        {error || 'Article not found'}
        <div className="status-card__actions">
          <Link to="/">Back to articles</Link>
        </div>
      </div>
    );
  }

  const paragraphs = article.content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article className="article-detail">
      <div className="article-detail__meta">
        <span>
          Published{' '}
          <time dateTime={article.created_at}>
            {new Date(article.created_at).toLocaleString()}
          </time>
        </span>
        {article.model && <span className="badge">AI: {article.model}</span>}
      </div>
      <h1>{article.title}</h1>
      <div className="article-detail__body">
        {paragraphs.map((paragraph, index) => (
          <p key={`${article.id}-${index}`}>{paragraph}</p>
        ))}
      </div>
      <Link to="/" className="back-link">
        ← Back to all articles
      </Link>
    </article>
  );
};
