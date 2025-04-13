document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('promptForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // フォームのデフォルト送信を防止

    // フォームデータを取得
    const title = document.getElementById('title').value;
    const email = document.getElementById('email').value;
    const description = document.getElementById('description').value;
    const systemPrompt = document.getElementById('systemPrompt').value;
    const userPrompt = document.getElementById('userPrompt').value;

    // 新しいプロンプトデータを作成
    const newPrompt = {
      title,
      email,
      description,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      category: "未分類", // 必要に応じてカテゴリを追加
      updated_at: new Date().toISOString().split('T')[0], // 現在の日付
      likes: 0 // 初期値
    };

    try {
      // prompts.json に新しいプロンプトを追加
      const response = await fetch('/prompts.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPrompt)
      });

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      alert('プロンプトが正常に投稿されました！');
      form.reset(); // フォームをリセット
    } catch (error) {
      console.error('プロンプトの投稿中にエラーが発生しました:', error);
      alert('プロンプトの投稿に失敗しました。');
    }
  });
});