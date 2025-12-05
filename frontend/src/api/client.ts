import axios from 'axios';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  model: string | null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await api.get<Article[]>('/api/articles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch articles', error);
    throw error;
  }
};

export const fetchArticle = async (id: number): Promise<Article> => {
  try {
    const response = await api.get<Article>(`/api/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch article ${id}`, error);
    throw error;
  }
};
