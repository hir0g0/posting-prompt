const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const app = express();

// ビューエンジン設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静的ファイル（CSS, JSなど）の提供
app.use(express.static(path.join(__dirname, 'public')));

// prompts.json のパス
const promptsFilePath = path.join(__dirname, 'public', 'prompts.json');

// TOPページ表示
app.get('/', (req, res) => {
  ejs.renderFile(path.join(__dirname, 'views/pages/top.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering top.ejs');
    }

    res.render('layout-top', {
      title: 'OCAIS Prompt Community',
      body: str,
      stylesheets: ['top-styles'],      // /css/top-styles.css
      scripts: ['scripts']           // /js/header-navi.js
    });
  });
});

// 共通スタイルページ表示
// home
app.get('/home', (req, res) => {
  ejs.renderFile(path.join(__dirname, 'views/pages/home.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering home.ejs');
    }

    res.render('layout', {
      title: 'OCAIS Prompt Community',
      body: str,
      stylesheets: ['header-styles', 'home'], 
      scripts: ['header-navi', 'home']
    });
  });
});

// all-prompts
app.get('/all-prompts', (req, res) => {
  ejs.renderFile(path.join(__dirname, 'views/pages/all-prompts.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering all-prompts.ejs');
    }

    res.render('layout', {
      title: 'OCAIS Prompt Community',
      body: str,
      stylesheets: ['header-styles', 'home', 'all-prompts'],
      scripts: ['header-navi', 'all-prompts']
    });
  });
});

// 各々のプロンプトを表示するページ
// app.get('/article', (req, res) => {
//   ejs.renderFile(path.join(__dirname, 'views/pages/article.ejs'), {}, {}, (err, str) => {
//     if (err) {
//       return res.status(500).send('Error rendering article.ejs');
//     }

//     res.render('layout', {
//       title: 'OCAIS Prompt Community',
//       body: str,
//       stylesheets: ['header-styles', 'article'],
//       scripts: ['header-navi', 'article']
//     });
//   });
// });

// 新規: プロンプト詳細ページのルート追加
app.get('/prompts/:id', (req, res) => {
  fs.readFile(promptsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('プロンプトデータの読み込みに失敗しました');
    }
    let prompts;
    try {
      prompts = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).send('プロンプトデータのパースに失敗しました');
    }
    const prompt = prompts.find(p => String(p.id) === req.params.id);
    if (!prompt) {
      return res.status(404).send('プロンプトが見つかりません');
    }
    ejs.renderFile(path.join(__dirname, 'views/pages/prompt-detail.ejs'), { prompt }, {}, (err, str) => {
      if (err) {
        return res.status(500).send('Error rendering prompt-detail.ejs');
      }
      res.render('layout', {
        title: 'OCAIS Prompt Community',
        body: str,
        stylesheets: ['header-styles', 'prompt-details'],
        scripts: ['header-navi', 'prompt-detail']
      });
    });
  });
});

// 新規: 検索結果ページのルート追加
app.get('/search', (req, res) => {
  const query = req.query.query || '';
  if (!query) {
    return res.status(400).send('検索クエリが指定されていません');
  }

  ejs.renderFile(path.join(__dirname, 'views/pages/search-results.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering search-results.ejs');
    }
    res.render('layout', {
      title: 'OCAIS Prompt Community',
      body: str,
      stylesheets: ['header-styles', 'search-results'],
      scripts: ['header-navi', 'search-results'],
      query: query
    });
  });
});

// サーバー起動
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
