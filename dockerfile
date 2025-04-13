FROM node:18

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースをコピー
COPY . .

# ポート公開
EXPOSE 3000

# アプリ起動
CMD ["node", "app.js"]