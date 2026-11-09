const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'blog.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      is_published BOOLEAN DEFAULT 0,
      published_at TEXT DEFAULT NULL
    )
  `);
});

function getArticles(onlyPublished, callback) {
  let sql = 'SELECT * FROM articles';
  if (onlyPublished) {
    sql += ' WHERE is_published = 1';
  }
  sql += ' ORDER BY published_at DESC, id DESC';
  db.all(sql, [], callback);
}

function getArticleById(id, callback) {
  db.get('SELECT * FROM articles WHERE id = ?', [id], callback);
}

function createArticle(title, content, callback) {
  const sql = 'INSERT INTO articles (title, content, is_published, published_at) VALUES (?, ?, 0, NULL)';
  db.run(sql, [title, content], function (err) {
    if (err) return callback(err);
    getArticleById(this.lastID, callback);
  });
}


function publishArticle(id, callback) {
  const sql = `
    UPDATE articles 
    SET is_published = 1, published_at = datetime('now', 'localtime')
    WHERE id = ?
  `;
  db.run(sql, [id], function (err) {
    if (err) return callback(err);
    getArticleById(id, callback);
  });
}

function deleteArticle(id, callback) {
  db.run('DELETE FROM articles WHERE id = ?', [id], function (err) {
    callback(err, this.changes);
  });
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  publishArticle,
  deleteArticle
};