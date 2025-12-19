# mcp-pyodide

[日本語](README.ja.md) | [中文](README.md) | [English](README.en.md)

Model Context Protocol (MCP)のPyodide実装サーバーです。このサーバーを使用することで、大規模言語モデル（LLM）がMCPインターフェースを通じてPythonコードを実行することができます。

## 機能

- Pyodideを使用したLLMからのPythonコード実行機能
- MCPに準拠したサーバー実装
- stdio、SSE、およびStreamable HTTPトランスポートのサポート
- TypeScriptで書かれた堅牢な実装
- コマンドラインツールとしても利用可能

## インストール

```bash
git clone <repository-url>
cd mcp-pyodide
npm i
npm run build
```

## 使用方法

本プロジェクトは現在 **npm レジストリに公開されていません**。ローカルでビルドして実行してください。

stdio モードで起動（デフォルト）:

```bash
node build/index.js
```

SSEモードで起動:

```bash
node build/index.js --sse
```

Streamable HTTPモードで起動:

```bash
node build/index.js --streamable
```

### SSE Mode

SSEモードでは、以下のエンドポイントを提供します:

- SSE Connection: `http://localhost:3020/sse`
- Message Handler: `http://localhost:3020/messages`

### Streamable HTTP Mode

Streamable HTTPモードでは、以下のエンドポイントを提供します:

- MCP Endpoint: `http://localhost:3020/mcp`

このエンドポイントは以下をサポートします:

- `POST /mcp` (初期化を含むMCPリクエスト)
- `GET /mcp` (初期化後の通知ストリーム)
- `DELETE /mcp` (セッション終了)

## プロジェクト構造

```
mcp-pyodide/
├── src/
│   ├── formatters/    # データフォーマット処理
│   ├── handlers/      # リクエストハンドラー
│   ├── lib/          # ライブラリコード
│   ├── tools/        # ユーティリティツール
│   ├── utils/        # ユーティリティ関数
│   └── index.ts      # メインエントリーポイント
├── build/            # ビルド成果物
├── pyodide-packages/ # Pyodide関連パッケージ
└── package.json
```

## 依存パッケージ

- `@modelcontextprotocol/sdk`: MCPのSDK（^1.25.1）
- `pyodide`: Python実行環境（^0.29.0）
- `arktype`: 型検証ライブラリ（^2.0.1）

## 環境変数

- `PYODIDE_CACHE_DIR`: Pyodideキャッシュ用ディレクトリ (デフォルト: "./cache")
- `PYODIDE_DATA_DIR`: マウントするデータ用ディレクトリ (デフォルト: "./data")
- `MCP_PORT`: HTTPサーバー（SSE / Streamable HTTP）のポート (デフォルト: 3020)
- `PORT`: `MCP_PORT` のエイリアス (デフォルト: 3020)

## 開発

### 必要条件

- Node.js 18以上
- npm 9以上

### セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>

# 依存パッケージのインストール
npm install

# ビルド
npm run build
```

### スクリプト

- `npm run build`: TypeScriptのコンパイルと実行権限の設定

## ライセンス

MIT

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -am 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 注意事項

- このプロジェクトは開発中であり、APIは変更される可能性があります
- 本番環境での使用は十分なテストを行ってください
- セキュリティの観点から、信頼できないコードの実行には注意が必要です

## サポート

問題や質問がある場合は、Issueトラッカーを使用してください。