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
  ejs.renderFile(path.join(__dirname, 'views/pages/home.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering home.ejs');
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
// すべてのプロンプトを表示するページ
app.get('/all-prompt', (req, res) => {
  ejs.renderFile(path.join(__dirname, 'views/pages/all-prompt.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering all-prompt.ejs');
    }

    res.render('layout', {
      title: 'OCAIS Prompt Community',
      body: str,
      stylesheets: ['header-styles', 'all-prompt'], 
      scripts: ['header-navi', 'all-prompt']
    });
  });
});

// 各々のプロンプトを表示するページ
app.get('/article', (req, res) => {
  ejs.renderFile(path.join(__dirname, 'views/pages/article.ejs'), {}, {}, (err, str) => {
    if (err) {
      return res.status(500).send('Error rendering article.ejs');
    }

    res.render('layout', {
      title: 'OCAIS Prompt Community',
      body: str,
      stylesheets: ['header-styles', 'article'],
      scripts: ['header-navi', 'article']
    });
  });
});

// サーバー起動
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
