# 🛡️ ページ操作コントローラー

**Chrome拡張機能（Manifest V3）**

ウェブページ上の特定操作を無効化できるChrome拡張機能です。個人のブラウジング体験を改善し、アクセシビリティを向上させることを目的としています。

---

## ⚠️ 重要な注意事項

### 法的・倫理的利用について

この拡張機能は、**あなた自身のブラウジング体験を改善するためのツール**です。以下の点を必ず守ってください：

- ✅ **正当な用途での使用**
  - アクセシビリティの向上（視覚障害者など）
  - 不便なページ制限の回避（個人的な利便性のため）
  - 学習・教育目的（拡張機能開発の学習）
  - 自己のブラウジング環境のカスタマイズ

- ❌ **禁止事項（絶対に行わないでください）**
  - 他者のウェブサイトのセキュリティ機能を回避すること
  - 著作権を侵害する目的での使用
  - ウェブサイトの利用規約に違反する行為
  - 認証バイパスやセキュリティ機能の無効化
  - マルウェア的な使用や不正操作

**この拡張機能の使用によって生じた問題について、開発者は一切の責任を負いません。**

---

## 📋 機能一覧

この拡張機能では、以下の操作を無効化できます（すべてオプション）：

1. **右クリックメニュー** - コンテキストメニューの表示を禁止
2. **テキスト選択** - マウスドラッグでのテキスト選択を禁止
3. **コピー操作** - Ctrl/Cmd+Cやコンテキストメニューのコピーを禁止
4. **ペースト操作** - Ctrl/Cmd+Vでのペーストを禁止
5. **印刷操作** - Ctrl/Cmd+Pでの印刷ダイアログを禁止
6. **ドラッグ&ドロップ** - ファイルやテキストのドラッグ&ドロップを禁止
7. **フォーム送信** - フォームの送信を禁止（注意して使用）
8. **キーボードショートカット** - 特定のショートカットを禁止（カスタマイズ可能）

### 追加機能

- **ドメイン別ホワイトリスト** - 特定のドメインでは無効化を適用しない
- **グローバルON/OFF** - ワンクリックですべての機能を有効/無効化
- **リアルタイム設定** - 設定変更後、ページをリロードすれば即座に反映

---

## 📂 プロジェクト構造

```
chrome-extension-disable-actions/
├── manifest.json              # 拡張機能のマニフェストファイル（Manifest V3）
├── popup.html                 # ポップアップUI（アイコンクリック時）
├── options.html               # 設定ページのHTML
├── styles.css                 # スタイルシート
├── js/
│   ├── service_worker.js      # バックグラウンドスクリプト（Service Worker）
│   ├── content_script.js      # コンテンツスクリプト（ページに注入）
│   ├── popup.js               # ポップアップのロジック
│   └── options.js             # 設定ページのロジック
├── icons/
│   ├── icon16.png             # 16x16 アイコン
│   ├── icon48.png             # 48x48 アイコン
│   └── icon128.png            # 128x128 アイコン
└── README.md                  # このファイル
```

---

## 🚀 インストール方法

### 前提条件

- Google Chrome または Chromium ベースのブラウザ（Edge, Brave など）
- デベロッパーモードを有効にする権限

### 手順

1. **リポジトリをクローンまたはダウンロード**

   ```bash
   git clone <リポジトリURL>
   cd chrome-extension-disable-actions
   ```

2. **アイコン画像を準備**（オプション）

   `icons/` フォルダに以下のサイズのアイコンを配置してください：
   - `icon16.png` (16x16)
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)

   アイコンがない場合でも動作しますが、警告が表示されることがあります。

3. **Chromeで拡張機能を読み込む**

   1. Chromeを開き、アドレスバーに `chrome://extensions/` と入力してEnterキーを押す
   2. 右上の **「デベロッパーモード」** をONにする
   3. **「パッケージ化されていない拡張機能を読み込む」** をクリック
   4. `chrome-extension-disable-actions` フォルダを選択

4. **拡張機能が読み込まれたことを確認**

   - 拡張機能一覧に「ページ操作コントローラー」が表示されればOK
   - ツールバーにアイコンが表示されます（アイコン画像がある場合）

---

## 🎮 使い方

### 基本的な使い方

1. **設定ページを開く**

   - 拡張機能アイコンをクリック → 「⚙️ 詳細設定を開く」
   - または `chrome://extensions/` から「オプション」をクリック

2. **機能を有効化**

   - 「🌐 グローバル設定」セクションで「機能を有効化」をONにする
   - デフォルトはOFF（何も無効化しない）

3. **無効化したい操作を選択**

   - 「🚫 無効化する操作」セクションで、無効化したい操作にチェックを入れる
   - 例: 右クリック、コピー、テキスト選択など

4. **ホワイトリストを設定**（オプション）

   - 「✅ ホワイトリスト」セクションで、無効化を適用したくないドメインを追加
   - 例: `example.com` を追加すると、そのドメインでは無効化が適用されない

5. **設定を保存**

   - 「💾 設定を保存」をクリック
   - 開いているタブをリロードして設定を反映

### ポップアップからの操作

- 拡張機能アイコンをクリックすると、簡易的なポップアップが表示されます
- ポップアップから「機能を有効化」のON/OFF切り替えが可能
- 現在のドメインとステータスが表示されます

---

## 🧪 動作テスト

### テスト手順

1. **設定ページでテスト**

   - 設定ページの「🧪 動作テスト」セクションを使用
   - テキストを選択、コピー、ペーストなどを試してみる
   - 設定を保存後、ページをリロードしてテスト

2. **実際のウェブページでテスト**

   - 任意のウェブページを開く
   - 設定した操作が無効化されていることを確認
   - 例: 右クリックメニューが表示されない、テキストが選択できないなど

3. **ホワイトリストのテスト**

   - ホワイトリストに登録したドメインで、無効化が適用されないことを確認

### デバッグ方法

1. **コンソールログの確認**

   - `F12` キーを押して開発者ツールを開く
   - 「Console」タブで `[Content Script]` や `[Service Worker]` などのログを確認

2. **Service Workerのログ**

   - `chrome://extensions/` → 拡張機能の「Service Worker」リンクをクリック
   - Service Workerのコンソールでログを確認

3. **設定の確認**

   - `chrome://extensions/` → 拡張機能の「詳細」→「ストレージエクスプローラー」
   - 保存された設定を確認

---

## 🔧 開発者向け情報

### 技術スタック

- **Manifest Version**: V3（最新仕様）
- **Permissions**: `storage`, `activeTab`, `<all_urls>`
- **Storage**: `chrome.storage.sync`（クロスデバイス同期）
- **Architecture**:
  - Service Worker（バックグラウンド処理）
  - Content Script（ページ注入、イベント無効化）
  - Options Page（設定UI）
  - Popup（簡易UI）

### セキュリティ設計

- **ユーザーデータの保護**: 設定はローカル/同期ストレージのみに保存、外部送信なし
- **非破壊的動作**: ページの機能を変更せず、イベントリスナーで操作を防止するのみ
- **フォールバック**: 設定読み込み失敗時は安全側（何も無効化しない）にフォールバック
- **Content Script Isolation**: ページのJavaScriptと隔離された環境で実行

### カスタマイズ方法

#### 新しい操作を追加する

1. **設定に追加**（`js/service_worker.js`）

   ```javascript
   const DEFAULT_SETTINGS = {
     // ...既存の設定
     disableNewAction: false  // 新しい操作
   };
   ```

2. **Content Scriptに実装**（`js/content_script.js`）

   ```javascript
   if (settings.disableNewAction) {
     document.addEventListener('newaction', handleNewAction, true);
   }

   function handleNewAction(event) {
     event.preventDefault();
     logBlock('newaction');
   }
   ```

3. **UIに追加**（`options.html`, `options.js`）

   - HTMLにチェックボックスを追加
   - JavaScriptで設定の読み書きを追加

---

## 📝 既知の問題・制限事項

### 制限事項

1. **ブラウザUIには影響しない**
   - この拡張機能はページ上の操作のみを無効化します
   - ブラウザのメニュー、タブ、アドレスバーなどには影響しません

2. **一部のサイトで動作しない可能性**
   - Content Security Policy（CSP）が厳格なサイトでは動作しない場合があります
   - ページのJavaScriptがイベントを早く処理している場合、無効化できないことがあります

3. **設定変更にはリロードが必要**
   - 設定を変更した後、ページをリロードしないと反映されません
   - より洗練された実装では、動的にリスナーを追加/削除することも可能です

### トラブルシューティング

- **設定が反映されない**
  → ページをリロードしてください（F5またはCtrl+R）

- **一部の操作が無効化されない**
  → ページのJavaScriptが先に処理している可能性があります
  → `content_script.js`の`run_at`を`document_start`に設定済み（早期実行）

- **拡張機能が読み込めない**
  → デベロッパーモードがONになっているか確認
  → `manifest.json`の構文エラーをチェック

---

## 🤝 貢献

バグ報告や機能リクエストは、GitHubのIssuesで受け付けています。

プルリクエストも歓迎します！

---

## 📜 ライセンス

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 サポート

質問やサポートが必要な場合は、以下までお問い合わせください：

- GitHub Issues: [リポジトリURL]/issues
- Email: [メールアドレス]（任意）

---

## 🙏 謝辞

このプロジェクトは、個人のブラウジング体験を改善し、アクセシビリティを向上させることを目的として開発されました。

すべてのユーザーが安全かつ倫理的に使用することを願っています。

---

**バージョン**: 1.0.0
**最終更新**: 2025年11月
**開発者**: [あなたの名前]
