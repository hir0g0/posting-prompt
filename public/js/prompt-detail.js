// JSONデータを読み込む関数
function loadPromptsData() {
    try {
      const data = fs.readFileSync(path.join(__dirname, '../data/prompts.json'), 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('プロンプトデータの読み込みエラー:', error);
      return [];
    }
  }

  // コピー機能
  function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    // コピー対象のテキストを持つ要素（例: <div class="copy-text">...</div>）からテキストを取得する
    const textElement = element.querySelector('.copy-text') || element;
    const text = textElement.textContent.trim();
    
    navigator.clipboard.writeText(text).then(() => {
      const button = element.querySelector('.copy-button');
      const originalText = button.textContent;
      button.textContent = 'コピー完了!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    });
  }
  
  // プロンプト詳細ページのルート
  router.get('/:id', (req, res) => {
    const promptsData = loadPromptsData();
    const prompt = promptsData.find(p => p.id === req.params.id);
    
    if (!prompt) {
      return res.status(404).render('error', { message: 'プロンプトが見つかりません' });
    }
    
    res.render('prompt-detail', { prompt });
  });
  
  module.exports = router;