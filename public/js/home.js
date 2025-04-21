document.addEventListener('DOMContentLoaded', () => {
  fetch('/prompts.json')
    .then(response => response.json())
    .then(data => {
      const latestContainer = document.getElementById('latestPromptsGrid');
      const popularContainer = document.getElementById('popularPromptsGrid');

      // 人気の1件（likes数が多い順にソート）
      const popularPrompts = [...data]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 1);

      popularPrompts.forEach(article => {
        const card = createPickupCard(article);
        popularContainer.appendChild(card);
      });

      // 最新の3件（作成日時が新しい順にソート）
      const latestPrompts = [...data]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      latestPrompts.forEach(article => {
        const card = createPromptCard(article);
        latestContainer.appendChild(card);
      });

    })
    .catch(err => {
      console.error('Failed to fetch articles:', err);
    });

  // ピックアップカード生成関数
  function createPickupCard(article) {
    const link = document.createElement('a');
    // update route to include the prompt id
    link.href = `/prompts/${article.id}`;
    link.className = 'pickup-card-link';

    // 日付をフォーマット
    const dateObj = new Date(article.created_at);
    const formattedDate = `${dateObj.getMonth() + 1}月 ${dateObj.getDate()}日`;
    
    link.innerHTML = `
      <div class="pickup-card">
        <img src="${article.image}" alt="${article.category}" class="pickup-image">
        <div class="pickup-meta">
          <span class="pickup-date">${formattedDate}</span> 
          <span class="pickup-category">${article.category}</span>
        </div>
        <h2 class="pickup-title">${article.title}</h2>
      </div>
    `;
    
    return link;
  }
  
  // カード生成関数
  function createPromptCard(article) {
    const card = document.createElement('div');
    card.className = 'prompt-card';

    // 日付をフォーマット
    const dateObj = new Date(article.created_at);
    const formattedDate = `${dateObj.getMonth() + 1}月 ${dateObj.getDate()}日`;

    card.innerHTML = `
      <div class="prompt-meta">
        <span class="prompt-date">${formattedDate}</span> 
        <span class="prompt-category">${article.category}</span>
      </div>
      <div class="prompt-content">
        <h2 class="prompt-title">
          <a href="/prompts/${article.id}">${article.title}</a>
        </h2>
      </div>
    `;
    return card;
  }
});