const form = document.getElementById('article-form');
const articlesList = document.getElementById('articles-list');
const publishedFilter = document.getElementById('published-filter');
const errorBox = document.getElementById('error-box');

function showError(message) {
  if (!message) {
    errorBox.hidden = true;
    errorBox.textContent = '';
    return;
  }
  errorBox.textContent = message;
  errorBox.hidden = false;
}

async function loadArticles() {
  const query = publishedFilter.checked ? '?published=true' : '';
  const response = await fetch(`/api/articles${query}`);
  const articles = await response.json();

  if (articles.length === 0) {
    articlesList.innerHTML = '<div class="card">Статей пока нет</div>';
    return;
  }

  articlesList.innerHTML = articles.map(item => `
    <div class="card">
      <div class="article-header">
        <span class="article-title">${item.title || '(Без заголовка)'}</span>
        <span class="badge ${item.is_published ? 'published' : ''}">
          ${item.is_published ? 'Опубликовано' : 'Черновик'}
        </span>
      </div>
      <div class="article-content">${item.content || ''}</div>
      <div class="article-footer">
        <span>${item.published_at ? 'Дата публикации: ' + item.published_at : 'Не опубликовано'}</span>
        <div class="actions">
          ${!item.is_published ? `<button onclick="publishArticle(${item.id})">Опубликовать</button>` : ''}
          <button class="danger" onclick="deleteArticle(${item.id})">Удалить</button>
        </div>
      </div>
    </div>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });

  form.reset();
  loadArticles();
});

async function publishArticle(id) {
  showError('');
  const response = await fetch(`/api/articles/${id}`, { method: 'PUT' });
  const data = await response.json();

  if (!response.ok) {
    showError(`Ошибка ${response.status}: ${data.error}`);
    return;
  }
  loadArticles();
}

async function deleteArticle(id) {
  showError('');
  await fetch(`/api/articles/${id}`, { method: 'DELETE' });
  loadArticles();
}

publishedFilter.addEventListener('change', loadArticles);

loadArticles();