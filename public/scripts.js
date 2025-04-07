// プロンプトの一覧を表示
const promptDetailView = document.getElementById('promptDetailView');
const promptCards = document.getElementById('promptCards');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailContent = document.getElementById('detailContent');
const searchInput = document.getElementById('searchInput');
const promptTreeContent = document.getElementById('promptTreeContent');

// プロンプトのデータを保持
let prompts = [];

// セクションを表示する関数
function showSection(sectionId) {
  // すべてのセクションを非表示にする
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  
  // 指定されたセクションを表示
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
  
  // タブのアクティブ状態を更新
  if (sectionId === 'listSection') {
    document.querySelector('.tab-button').classList.add('active');
  } else {
    document.querySelector('.tab-button').classList.remove('active');
  }
}

// 戻るボタンで一覧セクションに戻る
function goBackToList() {
  showSection('listSection');
}

// 初期化
function init() {
  console.log('init() called');
  showSection('listSection'); // ページが読み込まれた時にプロンプト一覧を表示
  fetchPrompts(); // プロンプトデータの取得を呼び出す
  
  // タブボタンのイベントリスナーを追加
  document.querySelectorAll('.tab-button').forEach((button, index) => {
    button.addEventListener('click', () => {
      // すべてのタブからアクティブクラスを削除
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // クリックされたタブにアクティブクラスを追加
      button.classList.add('active');
      
      // ここでタブに応じた内容を表示する処理を追加（必要に応じて）
    });
  });
}

// プロンプト一覧をAPIから取得
function fetchPrompts() {
  fetch('/get-prompts')
    .then(response => response.json())
    .then(data => {
      prompts = data;
      console.log(prompts); // ここでデータが正しく取得されているか確認
      renderPromptCards(prompts);
      const urlParams = new URLSearchParams(window.location.search);
      const promptId = urlParams.get('id');
      if (promptId) {
        showPromptDetail(prompts.find(p => p.id === promptId)); // idを文字列として比較
      }
    })
    .catch(error => {
      console.error('プロンプト取得エラー:', error);
    });
}

// プロンプトカード一覧を表示
function renderPromptCards(data) {
  promptCards.innerHTML = ''; // 既存のカードをクリア

  data.forEach(prompt => {
    const userName = getUserNameFromEmail(prompt.email);
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    // カード内のコンテンツを構造化
    card.innerHTML = `
      <div>
        ${userName} / <strong>${prompt.title}</strong>
      </div>
    `;
    
    // 修正: 正しいリンクを生成
    card.onclick = () => {
      window.location.href = `/prompt?id=${prompt.id}`;
    };
    promptCards.appendChild(card);
  });
}

// ユーザ名を取得する関数（emailから＠より前の部分を取得）
function getUserNameFromEmail(email) {
  return email.split('@')[0]; // 「＠」より前の部分を返す
}

// 詳細表示
function showPromptDetail(prompt) {
  if (!prompt) {
    console.log('Prompt not found');
    return;
  }
  
  detailTitle.textContent = prompt.title;
  detailDescription.textContent = prompt.description;
  detailContent.textContent = prompt.user_prompt;
  
  // プロンプトツリーの表示
  renderPromptTree(prompt, prompts);
  
  showSection('promptDetailView'); // 詳細セクションを表示
}

// プロンプト詳細のツリー表示関数
function renderPromptTree(prompt, allPrompts) {
  promptTreeContent.innerHTML = ''; // 既存の内容をクリア

  // 子プロンプトを取得
  const children = allPrompts.filter(p => p.parent_id == prompt.id);

  // 現在のプロンプトノードを作成
  const currentNode = document.createElement('div');
  currentNode.className = 'prompt-tree-node this-prompt';
  currentNode.innerHTML = `
    <strong>${prompt.title}</strong> - 現在表示中のプロンプト
  `;
  promptTreeContent.appendChild(currentNode);

  // 親プロンプトがある場合
  if (prompt.parent_id) {
    const parent = allPrompts.find(p => p.id == prompt.parent_id);
    if (parent) {
        const parentNode = document.createElement('div');
        parentNode.className = 'prompt-tree-node';
        parentNode.innerHTML = `
          <strong>${parent.title}</strong> - ${parent.description}
        `;
        parentNode.onclick = () => {
            window.location.href = `/prompt?id=${parent.id}`;
        };
        parentNode.style.cursor = 'pointer';
        promptTreeContent.insertBefore(parentNode, currentNode);
    }
}

  // 子プロンプトがある場合
  if (children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'prompt-tree-children';

    children.forEach(child => {
      const childNode = document.createElement('div');
      childNode.className = 'prompt-tree-node';
      childNode.innerHTML = `
        <strong>${child.title}</strong> - ${child.description}
      `;
      childNode.onclick = () => {
        window.location.href = `/prompt?id=${child.id}`;
      };
      childNode.style.cursor = 'pointer';
      childrenContainer.appendChild(childNode);
    });

    promptTreeContent.appendChild(childrenContainer);
  } else {
    const noChildrenMsg = document.createElement('p');
    noChildrenMsg.textContent = 'このプロンプトには派生プロンプトがありません。';
    noChildrenMsg.style.color = '#5f6368';
    noChildrenMsg.style.fontStyle = 'italic';
    promptTreeContent.appendChild(noChildrenMsg);
  }
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  // 戻るボタン
  document.getElementById('backButton').addEventListener('click', () => {
    showSection('listSection');
  });
  
  // 検索処理
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = prompts.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.user_prompt.toLowerCase().includes(keyword)
      );
      renderPromptCards(filtered);
    });
  }
  
  // プロンプト投稿フォーム
  const promptForm = document.getElementById('promptForm');
  if (promptForm) {
    promptForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      
      fetch('/submit-prompt', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(message => {
        alert(message);
        fetchPrompts(); // プロンプト一覧を更新
        showSection('listSection'); // 一覧セクションに戻る
      })
      .catch(error => {
        console.error('Error:', error);
        alert('送信中にエラーが発生しました。');
      });
    });
  }

  // 派生プロンプト投稿フォーム
  const derivePromptForm = document.getElementById('derivePromptForm');
  if (derivePromptForm) {
    derivePromptForm.addEventListener('submit', function (e) {
      e.preventDefault(); // デフォルトのフォーム送信を防止

      const formData = new FormData(this);

      fetch('/submit-prompt', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.text())
        .then((message) => {
          console.log(message); // 成功メッセージをコンソールに表示
          fetchPrompts(); // プロンプト一覧を更新
        })
        .catch((error) => {
          console.error('送信エラー:', error);
          alert('送信中にエラーが発生しました。');
        });
    });
  }
});

// アプリ起動
init();