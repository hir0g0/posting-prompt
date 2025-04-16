document.addEventListener('DOMContentLoaded', () => {
    fetch('/prompts.json')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('articlesGrid');
  
        data.forEach(article => {
          const card = document.createElement('div');
          card.className = 'article-card';
  
          card.innerHTML = `
            <div class="article-content">
              <div class="article-meta">
                <span class="article-date">${article.date}</span> • 
                ${article.category}
              </div>
              <div class="article-with-image">
                <h2 class="article-title">
                  <a href="/article">${article.title}</a>
                </h2>
                <img src="${article.image}" alt="${article.category}" class="article-image">
              </div>
            </div>
          `;
  
          container.appendChild(card);
        });
    })
    .catch(err => {
    console.error('Failed to fetch articles:', err);
    });
});
  