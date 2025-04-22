
// ソートタブの設定
const sortOptions = [
    { label: '投稿者順', value: 'name' },
    { label: 'Updated順', value: 'updated' },
    { label: 'いいね順', value: 'likes' }
];

// ソートタブを動的に生成
function createSortTabs() {
    const searchTitle = document.getElementById('search-title'); // 検索タイトル要素を取得

    // searchTitle が存在しない場合はエラーを出力して終了
    if (!searchTitle) {
    console.error('search-title 要素が見つかりませんでした。');
    return;
    }

    const existingSortTabs = document.querySelector('.sort-tabs'); // 既存のソートタブを確認

    // 既存のソートタブがあれば削除
    if (existingSortTabs) {
    existingSortTabs.remove();
    }

    // 新しいソートタブを作成
    const sortTabsContainer = document.createElement('div');
    sortTabsContainer.className = 'sort-tabs';
    sortTabsContainer.innerHTML = sortOptions.map(option => `
    <button class="sort-tab" onclick="sortResults('${option.value}')">${option.label}</button>
    `).join('');

    // 検索タイトルの直後にソートタブを挿入
    searchTitle.insertAdjacentElement('afterend', sortTabsContainer);
}

// ソートロジック
let currentSort = 'name'; // デフォルトのソート順
let filteredPrompts = []; // 検索結果を格納する配列

function sortResults(criteria) {
    currentSort = criteria;

    // ソートロジック
    filteredPrompts.sort((a, b) => {
    if (criteria === 'name') {
        return a.email.localeCompare(b.email); // 投稿者の名前順
    } else if (criteria === 'updated') {
        return new Date(b.updated_at) - new Date(a.updated_at); // 更新日順
    } else if (criteria === 'likes') {
        return b.likes - a.likes; // いいね順
    }
    });

    // ソート後に再描画
    renderResults();

    // タブのアクティブ状態を更新
    document.querySelectorAll('.sort-tab').forEach(tab => {
    tab.classList.remove('active');
    });
    document.querySelector(`.sort-tab[onclick="sortResults('${currentSort}')"]`).classList.add('active');
}

// 検索結果を描画
function renderResults() {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = filteredPrompts.map(prompt => `
    <div class="result-item">
        <div class="result-header">
        <span class="result-title">${prompt.title}</span>
        </div>
        <div class="result-meta">
        投稿者: ${prompt.email}
        <span> ・ </span>
        カテゴリ: ${prompt.category}
        <span> ・ </span>
        Updated: ${new Date(prompt.updated_at).toLocaleDateString()}
        <span> ・ </span>
        ♡ ${prompt.likes}
        </div>
    </div>
    `).join('');
}

// 検索クエリを取得して結果を表示
async function loadSearchResults() {
    console.log('loadSearchResults が実行されました');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query'); // 検索クエリを取得

    const searchResultsContainer = document.getElementById('search-results');
    const searchTitle = document.getElementById('search-title'); // h2 要素を取得

    if (!query) {
    searchTitle.textContent = '検索結果';
    searchResultsContainer.innerHTML = '<p>検索クエリが指定されていません。</p>';
    searchResultsContainer.style.overflowY = 'hidden'; 
    return;
    }

    searchTitle.textContent = `検索結果: "${query}"`;

    try {
    // prompts.json を取得
    const response = await fetch('/prompts.json');
    if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
    }
    const prompts = await response.json();

    // クエリに一致する結果をフィルタリング
    filteredPrompts = prompts.filter(prompt =>
        prompt.title.includes(query) || 
        prompt.email.includes(query) ||
        prompt.user_prompt.includes(query) ||
        prompt.system_prompt.includes(query) ||
        prompt.description.includes(query) || 
        prompt.category.includes(query)
    );

    if (filteredPrompts.length === 0) {
        searchResultsContainer.innerHTML = '<p>一致する結果が見つかりませんでした。</p>';
        searchResultsContainer.style.overflowY = 'hidden'; // スクロールを無効化
        return;
    }

    // ソートタブを生成
    createSortTabs();

    // 検索結果を描画
    renderResults();

    // 検索結果がある場合はスクロールを有効化
    searchResultsContainer.style.overflowY = 'auto';

    // 初期描画時にデフォルトのソートを適用
    sortResults(currentSort);
    } catch (error) {
    console.error('検索結果の読み込み中にエラーが発生しました:', error);
    searchResultsContainer.innerHTML = '<p>検索結果を読み込めませんでした。</p>';
    searchResultsContainer.style.overflowY = 'hidden'; // スクロールを無効化
    }
}

// 初期化処理
window.onload = () => {
    createSortTabs(); // ソートタブを生成
    loadSearchResults(); // 検索結果をロード
};