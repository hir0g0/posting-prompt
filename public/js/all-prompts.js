document.addEventListener('DOMContentLoaded', function() {
  // Latest/Popular タブの処理
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabSlider = document.querySelector('.tab-slider');
  
  // 初期化時にスライダーの位置とサイズを設定
  const activeTabButton = document.querySelector('.tab-button.active');
  tabSlider.style.width = `${activeTabButton.offsetWidth}px`;
  tabSlider.style.left = `${activeTabButton.offsetLeft}px`;
  
  tabButtons.forEach(button => {
      button.addEventListener('click', function() {
          // アクティブなクラスを削除
          tabButtons.forEach(btn => btn.classList.remove('active'));
          
          // クリックされたボタンをアクティブに
          this.classList.add('active');
          
          // スライダーの位置とサイズを更新
          tabSlider.style.width = `${this.offsetWidth}px`;
          tabSlider.style.left = `${this.offsetLeft}px`;
          
          // タブに応じたコンテンツのフィルタリング
          loadPrompts(this.getAttribute('data-tab'));
      });
  });

  // カテゴリタブの処理
  const categoryTabs = document.querySelectorAll('.category-tabs .tab');
  const categorySlider = document.querySelector('.category-slider');
  
  // 初期化時にカテゴリスライダーの位置とサイズを設定
  const activeTab = document.querySelector('.category-tabs .tab.active');
  categorySlider.style.width = `${activeTab.offsetWidth}px`;
  categorySlider.style.left = `${activeTab.offsetLeft}px`;
  
  categoryTabs.forEach(tab => {
      tab.addEventListener('click', function() {
          // アクティブなクラスを削除
          categoryTabs.forEach(t => t.classList.remove('active'));
          
          // クリックされたタブをアクティブに
          this.classList.add('active');
          
          // スライダーの位置とサイズを更新
          categorySlider.style.width = `${this.offsetWidth}px`;
          categorySlider.style.left = `${this.offsetLeft}px`;
          
          // カテゴリに応じたコンテンツのフィルタリング
          filterPromptsByCategory(this.getAttribute('data-category'));
      });
  });

  // サンプルデータで記事を読み込む
  loadPrompts('latest');

  // プロンプトを読み込む関数
function loadPrompts(tabType) {
  // prompts.jsonからデータを読み込む
  fetch('/prompts.json')  // prompts.jsonへのパスを適宜調整してください
      .then(response => {
          if (!response.ok) {
              throw new Error('データの読み込みに失敗しました');
          }
          return response.json();
      })
      .then(prompts => {
          // タブに応じてデータをソート
          let filteredPrompts = [...prompts];
          if (tabType === 'latest') {
              // 新着順（日付でソート）
              filteredPrompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          } else if (tabType === 'popular') {
              // 人気順（いいね数でソート）
              filteredPrompts.sort((a, b) => b.likes - a.likes);
          }

          // 現在のカテゴリフィルターを適用
          const currentCategory = document.querySelector('.category-tabs .tab.active').getAttribute('data-category');
          if (currentCategory !== 'all') {
              filteredPrompts = filteredPrompts.filter(prompt => prompt.category === currentCategory);
          }

          renderPrompts(filteredPrompts);
      })
      .catch(error => {
          console.error('Error:', error);
          document.querySelector('.cards-container').innerHTML = '<div class="error-message">データの読み込みに失敗しました</div>';
      });
}

  // カテゴリでフィルタリングする関数
  function filterPromptsByCategory(category) {
      const tabType = document.querySelector('.tab-button.active').getAttribute('data-tab');
      loadPrompts(tabType);
  }

  // プロンプトを描画する関数
  function renderPrompts(prompts) {
      const container = document.querySelector('.cards-container');
      container.innerHTML = '';

      if (prompts.length === 0) {
          container.innerHTML = '<div class="no-results">該当するプロンプトが見つかりませんでした</div>';
          return;
      }

      prompts.forEach(prompt => {
          const card = createPromptCard(prompt);
          container.appendChild(card);
      });
  }

  // プロンプトカード生成関数
  function createPromptCard(prompt) {
      const link = document.createElement('a');
      link.href = `/prompts/${prompt.id}`; // プロンプト詳細ページへのリンク
      link.className = 'pickup-card-link';
  
      // 日付をフォーマット
      const dateObj = new Date(prompt.created_at);
      const formattedDate = `${dateObj.getMonth() + 1}月 ${dateObj.getDate()}日`;
  
      link.innerHTML = `
          <div class="pickup-card">
              <img src="${prompt.image}" alt="${prompt.category}" class="pickup-image">
              <div class="pickup-meta">
                  <span class="pickup-date">${formattedDate}</span> 
                  <span class="pickup-category">${prompt.category}</span>
              </div>
              <h2 class="pickup-title">${prompt.title}</h2>
          </div>
      `;
  
      return link;
  }
});