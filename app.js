const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// EJS の設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静的ファイルの提供
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multerの設定（フォームデータ処理用）
const upload = multer();

// メインページを提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// フォーム送信処理のルート
app.post('/submit-prompt', upload.none(), (req, res) => {
  const { title, email, description, userPrompt } = req.body;
  const systemPrompt = req.body.systemPrompt || '';
  const permission = req.body.permission || 'public';
  const parentId = req.body.parentId && req.body.parentId.trim() !== '' ? req.body.parentId : null;
  
  console.log('受信したデータ:', req.body);
  
  if (!title || !email || !userPrompt || !description) {
    return res.status(400).send('必須フィールドが入力されていません');
  }
  
  const promptData = {
    id: Date.now().toString(),
    title,
    email,
    system_prompt: systemPrompt,
    user_prompt: userPrompt,
    description,
    permission_of_use: permission,
    created_at: new Date().toISOString(),
    parent_id: parentId
  };

  let prompts = [];
  try {
    if (fs.existsSync('prompts.json')) {
      const data = fs.readFileSync('prompts.json', 'utf8');
      prompts = JSON.parse(data);
    }
  } catch (err) {
    console.error('既存のプロンプト読み込みエラー:', err);
    return res.status(500).send('サーバーエラーが発生しました');
  }

  prompts.push(promptData);

  try {
    fs.writeFileSync('prompts.json', JSON.stringify(prompts, null, 2), 'utf8');
    res.status(200).send('プロンプトが正常に送信されました！');
  } catch (err) {
    console.error('プロンプト保存エラー:', err);
    res.status(500).send('プロンプトの保存中にエラーが発生しました');
  }
});

// プロンプト一覧を取得するエンドポイント
app.get('/get-prompts', (req, res) => {
  try {
    if (!fs.existsSync('prompts.json')) {
      return res.json([]);
    }
    
    const data = fs.readFileSync('prompts.json', 'utf8');
    const prompts = JSON.parse(data);
    prompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(prompts);
  } catch (err) {
    console.error('プロンプト取得エラー:', err);
    res.status(500).json({ error: 'プロンプトの取得に失敗しました' });
  }
});

// プロンプト詳細ページのエンドポイント（EJS テンプレートを利用）
app.get('/prompt', (req, res) => {
  const promptId = req.query.id;
  console.log('Received promptId:', promptId);

  if (!promptId) {
    return res.status(400).send('IDが指定されていません');
  }

  try {
    if (!fs.existsSync('prompts.json')) {
      return res.status(404).send('プロンプトが見つかりません');
    }

    const data = fs.readFileSync('prompts.json', 'utf8');
    const prompts = JSON.parse(data);
    const prompt = prompts.find(p => p.id == promptId);

    if (!prompt) {
      return res.status(404).send('プロンプトが見つかりません');
    }

    const childPrompts = prompts.filter(p => p.parent_id == prompt.id);
    let parentPrompt = null;
    if (prompt.parent_id) {
      parentPrompt = prompts.find(p => p.id == prompt.parent_id);
    }

    res.render('prompt_detail', { prompt, childPrompts, parentPrompt });
  } catch (err) {
    console.error('プロンプト取得エラー:', err);
    res.status(500).send('プロンプトの取得中にエラーが発生しました');
  }
});

// 子プロンプト一覧ページのエンドポイント
app.get('/child-prompts', (req, res) => {
  const promptId = req.query.id;
  if (!promptId) {
    return res.status(400).send('IDが指定されていません');
  }

  try {
    if (!fs.existsSync('prompts.json')) {
      return res.status(404).send('プロンプトが見つかりません');
    }
    
    const data = fs.readFileSync('prompts.json', 'utf8');
    const prompts = JSON.parse(data);
    const childPrompts = prompts.filter(p => p.parent_id == promptId);

    res.render('child_prompts', { childPrompts });
  } catch (err) {
    console.error('プロンプト取得エラー:', err);
    res.status(500).send('プロンプトの取得中にエラーが発生しました');
  }
});

// 検索エンドポイント
app.get('/search-prompts', (req, res) => {
  const query = req.query.q?.toLowerCase();
  
  if (!query) {
    return res.status(400).json({ error: '検索クエリが指定されていません' });
  }
  
  try {
    if (!fs.existsSync('prompts.json')) {
      return res.json([]);
    }
    
    const data = fs.readFileSync('prompts.json', 'utf8');
    const prompts = JSON.parse(data);
    const results = prompts.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.user_prompt.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (err) {
    console.error('検索エラー:', err);
    res.status(500).json({ error: '検索中にエラーが発生しました' });
  }
});

// プロンプト削除エンドポイント
app.post('/delete-prompt', upload.none(), (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: '削除するプロンプトのIDが指定されていません' });
  }
  try {
    if (!fs.existsSync('prompts.json')) {
      return res.status(404).json({ success: false, message: 'プロンプトが見つかりません' });
    }
    const data = fs.readFileSync('prompts.json', 'utf8');
    let prompts = JSON.parse(data);
    const promptExists = prompts.some(p => p.id === id);
    if (!promptExists) {
      return res.status(404).json({ success: false, message: '指定したプロンプトは存在しません' });
    }
    const newPrompts = prompts.filter(p => p.id !== id);
    fs.writeFileSync('prompts.json', JSON.stringify(newPrompts, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('プロンプト削除エラー:', err);
    res.status(500).json({ success: false, message: 'プロンプトの削除中にエラーが発生しました' });
  }
});

// 404ハンドラ
app.use((req, res, next) => {
  res.status(404).send('ページが見つかりません');
});

// エラーハンドラ
app.use((err, req, res, next) => {
  console.error('サーバーエラー:', err);
  res.status(500).send('サーバーエラーが発生しました');
});

app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で実行中`);
});