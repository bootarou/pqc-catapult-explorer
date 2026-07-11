# NFTDrive Symbol Explorer with SMD — BNL Post-Quantum fork

> ⚠️ **Unofficial, experimental post-quantum (PQC) fork** of the NFTDrive Symbol Explorer (SMD
> edition) for browsing a **BNL Post-Quantum Catapult** chain (ML-DSA-44 / ML-KEM-768 / iVRF).
> It cannot browse public Symbol networks (mainnet/testnet), and the official explorer cannot
> parse PQC chains. Unaffiliated with official Symbol/NEM.

公式 Symbol/NEM とは無関係の、非公式・実験的なポスト量子（PQC）フォークです。
**BNL Post-Quantum Catapult チェーン専用**のブロックエクスプローラで、
公開 Symbol ネットワーク（mainnet/testnet）の閲覧はできません。

ブロックチェーンの内容（トランザクション・アカウント・ネームスペース・モザイク・ブロック）を
閲覧する読み取り専用の Web アプリケーションです。NFTDrive 版の **SMD（Social MetaData）機能**を含みます。

## SMD（Social MetaData）機能

- チェーン上に登録されたソーシャルメタデータの一覧・検索
- アイコン・URL・ネームスペース情報付きのソーシャルプロファイル表示
- 名前 / ネームスペース / URL / 登録順のソート、日英対応
- アカウント・ネームスペースページへの直接ナビゲーション

**モザイク詳細ページの拡張:**

- ホルダー一覧（残高・divisibility 整形、10 件ページング）
- モザイク別トランザクション履歴（`transferMosaicId` フィルタ、10 件ページング）

## 通常の Symbol Explorer（SMD 版）との差分 — PQC 対応

- **symbol-sdk を PQC 版に差し替え**:
  [`pqc-catapult-sdk-v2`](https://github.com/bootarou/pqc-catapult-sdk-v2)（`feat-pqc`）を
  GitHub 依存として使用。ML-DSA-44 の公開鍵（1312 B / hex 2624 桁）と署名（2420 B）、
  iVRF ブロックモデルを扱えます。
- **ブロック詳細の VRF 表示を iVRF に変更**: 旧 ECVRF の
  `proofGamma` / `proofScalar` / `proofVerificationHash` を廃止し、
  **`iVrfProofLeaf` / `iVrfProofPath`** を表示（全 i18n ロケール更新済み）。
- `js-sha3` を明示的な依存に追加（旧 SDK 経由の間接依存だったもの）。

UI・画面構成・操作方法は SMD 版 Symbol Explorer と同一です。

## 動作要件

- Node.js v20 以上（v22 で検証済み）
- 接続先: BNL PQC チェーンの REST ゲートウェイ（iVRF ブロックスキーマ対応、
  例: [`docker-compose.pqc.yml`](https://github.com/bootarou/bnl-catapult-pqc/blob/feat-VRF/votiong/docker-compose.pqc.yml) や
  [symbol-bootstrap PQC 版](https://github.com/bootarou/symbol-bootstrap/tree/pqc-bootstrap) で起動した `http://localhost:3000`）

## インストールと起動

```bash
git clone https://github.com/bootarou/pqc-catapult-explorer.git
cd pqc-catapult-explorer
npm install          # PQC symbol-sdk は GitHub から自動取得・ビルドされます
npm run dev
```

ブラウザで http://localhost:8080/#/ を開きます。

接続先ノードの設定は `src/config/default.json`（ビルド時）または
`public/config.js` の `window.globalConfig`（デプロイ後の上書き）で行います。

## 開発メモ

- `/src/config`: エクスプローラの設定
- `/src/infrastructure`: Symbol ノードへの API / SDK リクエスト（`MetadataService` = SMD、`MosaicService` = ホルダー/Tx 履歴）
- `/src/store`: 状態管理・アプリケーションロジック（`socialMetadata` = SMD）
- `/src/views`: UI
- `/src/components/widgets`: SMD（Social MetaData）ウィジェット等

## 関連リポジトリ

| | |
|---|---|
| [bnl-catapult-pqc](https://github.com/bootarou/bnl-catapult-pqc) | 本体モノレポ（catapult-server / REST / SDK v3） |
| [PQC-SUMMARY.md](https://github.com/bootarou/bnl-catapult-pqc/blob/feat-VRF/votiong/PQC-SUMMARY.md) ([EN](https://github.com/bootarou/bnl-catapult-pqc/blob/feat-VRF/votiong/PQC-SUMMARY.en.md)) | PQC 移行作業の総括資料 |
| [pqc-catapult-sdk-v2](https://github.com/bootarou/pqc-catapult-sdk-v2) | 本エクスプローラが使用する PQC SDK（symbol-sdk 2.x 系） |
| [pqc-catapult-sdk-v3](https://github.com/bootarou/pqc-catapult-sdk-v3) | PQC SDK v3（新規アプリにはこちらを推奨） |
| [symbol-bootstrap](https://github.com/bootarou/symbol-bootstrap)（`pqc-bootstrap`） | PQC ネットワークの生成・運用 CLI |
| [blockchain-network-launcher](https://github.com/bootarou/blockchain-network-launcher) | **BNL 本体** — カスタムブロックチェーンネットワークの起動・管理ツール |
| Docker Hub `nftdrive/bnl-catapult-server-pqc` / `bnl-catapult-rest-pqc` | PQC ノード / REST イメージ |

## ライセンス / 派生元

Apache License 2.0。
Copyright 2019-present NEM ／ Copyright 2024-present NFTDrive。
派生元: [symbol/symbol-explorer](https://github.com/symbol/symbol-explorer) → NFTDrive 版
[explorer-smd](https://github.com/bootarou/explorer-smd)（SMD 機能）→ 本 PQC フォーク。
上流の CI バッジ・公式リンクは本フォークには該当しないため削除しています。
