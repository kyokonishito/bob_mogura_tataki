# 🔨 もぐらたたきゲーム

Webブラウザで遊べる本格的なもぐらたたきゲームです。[IBM Bob](https://www.ibm.com/products/bob)で作成されました。

実際に動くものはこちら:<br>
https://kyokonishito.github.io/bob_mogura_tataki/

## 🎮 ゲームの特徴

### 基本機能
- **3つの難易度**: 簡単・普通・難しい
- **60秒間のタイムアタック**
- **ハイスコア記録**: 各難易度ごとに保存

### 特殊機能
- **コンボシステム**: 連続ヒットでボーナスポイント
- **特殊もぐら**:
  - ⭐ ボーナスもぐら（金色）: +5点
  - 💣 爆弾もぐら（黒色）: -3点
- **効果音**: Web Audio APIによる動的サウンド
- **パーティクルエフェクト**: ヒット時の視覚効果
- **スコアポップアップ**: 獲得ポイントの表示

## 🚀 遊び方

1. 難易度を選択
2. もぐらが出現したらクリック！
3. コンボを繋げて高得点を狙おう
4. 爆弾もぐらに注意！

## 📁 ファイル構成

```
whack-a-mole/
├── index.html    # メインHTML
├── style.css     # スタイルシート
├── game.js       # ゲームロジック
└── README.md     # このファイル
```

## 🌐 GitHub Pagesで公開する方法

### 1. GitHubリポジトリの作成

```bash
# Gitの初期化
git init

# ファイルをステージング
git add .

# コミット
git commit -m "Initial commit: もぐらたたきゲーム"

# GitHubでリポジトリを作成後、リモートを追加
git remote add origin https://github.com/あなたのユーザー名/whack-a-mole.git

# プッシュ
git branch -M main
git push -u origin main
```

### 2. GitHub Pagesの有効化

1. GitHubのリポジトリページにアクセス
2. **Settings** タブをクリック
3. 左サイドバーの **Pages** をクリック
4. **Source** で `main` ブランチを選択
5. **Save** をクリック

数分後、以下のURLでアクセス可能になります：
```
https://あなたのユーザー名.github.io/whack-a-mole/
```

### 3. 簡単な方法（GitHub Desktop使用）

1. [GitHub Desktop](https://desktop.github.com/)をダウンロード
2. **File** → **Add Local Repository** でこのフォルダを選択
3. **Publish repository** をクリック
4. GitHubのリポジトリ設定でPagesを有効化

## 💻 ローカルで実行

1. このフォルダをダウンロード
2. `index.html` をブラウザで開く
3. すぐにプレイ可能！

## 🔧 技術スタック

- **HTML5**: ゲーム構造
- **CSS3**: スタイリングとアニメーション
- **Vanilla JavaScript**: ゲームロジック
- **Web Audio API**: 効果音生成
- **LocalStorage**: ハイスコア保存

## 📱 対応ブラウザ

- Chrome（推奨）
- Firefox
- Safari
- Edge

## 🎯 難易度別設定

| 難易度 | 出現間隔 | 表示時間 | 特殊もぐら出現率 |
|--------|----------|----------|------------------|
| 簡単   | 800-1800ms | 1200-2000ms | 15% |
| 普通   | 500-1500ms | 800-1500ms | 20% |
| 難しい | 300-1000ms | 500-1000ms | 25% |

## 📊 スコアリング

- 通常もぐら: **+1点**
- ボーナスもぐら: **+5点**
- 爆弾もぐら: **-3点**
- コンボボーナス: **3コンボごとに+1点**

## 🤝 共有方法

### URLで共有
GitHub Pagesで公開後、URLを共有するだけ！

### QRコード生成
1. [QR Code Generator](https://www.qr-code-generator.com/)にアクセス
2. GitHub PagesのURLを入力
3. QRコードを生成して共有

### SNSで共有
```
🔨 もぐらたたきゲームを作りました！
遊んでみてください 👉 https://あなたのユーザー名.github.io/whack-a-mole/
#もぐらたたき #ゲーム #JavaScript
```

## 📝 ライセンス

このプロジェクトは自由に使用・改変・配布できます。

## 🎨 カスタマイズ

### 色の変更
`style.css` の以下の部分を編集：
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 難易度の調整
`game.js` の `difficulties` オブジェクトを編集：
```javascript
const difficulties = {
    easy: {
        popInterval: { min: 800, max: 1800 },
        showTime: { min: 1200, max: 2000 },
        specialChance: 0.15
    },
    // ...
};
```

## 🐛 トラブルシューティング

### 効果音が鳴らない
- ブラウザの音量を確認
- 一部のブラウザではユーザー操作後に音声が有効化されます

### ハイスコアが保存されない
- ブラウザのプライベートモードでは保存されません
- LocalStorageが有効か確認してください

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。

---

楽しんでプレイしてください！🎮✨