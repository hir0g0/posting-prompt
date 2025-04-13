const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// prompts.json のパス
const promptsFilePath = path.join(__dirname, 'public', 'prompts.json');

// POST リクエストで新しいプロンプトを追加
app.post('/prompts.json', (req, res) => {
  const newPrompt = req.body;

  fs.readFile(promptsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('ファイルの読み込み中にエラーが発生しました:', err);
      return res.status(500).send('サーバーエラー');
    }

    const prompts = JSON.parse(data);
    prompts.push(newPrompt);

    fs.writeFile(promptsFilePath, JSON.stringify(prompts, null, 2), (err) => {
      if (err) {
        console.error('ファイルの書き込み中にエラーが発生しました:', err);
        return res.status(500).send('サーバーエラー');
      }

      res.status(201).send('プロンプトが追加されました');
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});