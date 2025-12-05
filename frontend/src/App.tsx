import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ArticleListPage } from './pages/ArticleListPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app__header">
          <Link to="/" className="app__title">
            AI Auto Blog
          </Link>
        </header>
        <main className="app__main">
          <Routes>
            <Route path="/" element={<ArticleListPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
