const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 1500;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/articles', (req, res) => {
  const onlyPublished = req.query.published === 'true';

  db.getArticles(onlyPublished, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
    res.json(rows);
  });
});

app.post('/api/articles', (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();

  db.createArticle(title, content, (err, article) => {
    if (err) return res.status(500).json({ error: 'Ошибка при создании статьи' });
    res.status(201).json(article);
  });
});

app.put('/api/articles/:id', (req, res) => {
  const id = Number(req.params.id);

  db.getArticleById(id, (err, article) => {
    if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
    if (!article) return res.status(404).json({ error: 'Статья не найдена' });

    if (!article.title || !article.title.trim()) {
      return res.status(400).json({ error: 'Нельзя опубликовать статью без заголовка (title)' });
    }

    db.publishArticle(id, (err, updated) => {
      if (err) return res.status(500).json({ error: 'Ошибка при публикации' });
      res.json(updated);
    });
  });
});

app.delete('/api/articles/:id', (req, res) => {
  const id = Number(req.params.id);

  db.deleteArticle(id, (err, changes) => {
    if (err) return res.status(500).json({ error: 'Ошибка при удалении' });
    if (changes === 0) return res.status(404).json({ error: 'Статья не найдена' });
    res.json({ message: 'Статья удалена' });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});