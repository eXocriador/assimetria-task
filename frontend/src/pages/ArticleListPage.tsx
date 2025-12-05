import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles } from '../api/client';
import type { Article } from '../api/client';

export const ArticleListPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const data = await fetchArticles();
        if (!ignore) {
          setArticles(data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Failed to load articles');
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
  }, []);

  if (loading) {
    return <div className="status-card">Loading articles...</div>;
  }

  if (error) {
    return <div className="status-card error">{error}</div>;
  }

  if (articles.length === 0) {
    return <div className="status-card">No articles yet.</div>;
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <Link
          className="article-card"
          to={`/articles/${article.id}`}
          key={article.id}
        >
          <div className="article-card__header">
            <h2>{article.title}</h2>
            <time dateTime={article.created_at}>
              {new Date(article.created_at).toLocaleDateString()}
            </time>
          </div>
          {article.model && (
            <span className="badge">AI: {article.model}</span>
          )}
          <p className="article-card__slug">/{article.slug}</p>
        </Link>
      ))}
    </div>
  );
};
