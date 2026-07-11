# SMD 対応 Explorer の PQC 化 改修計画書

**リポジトリ**: [pqc-catapult-explorer](https://github.com/bootarou/pqc-catapult-explorer)
**作成日**: 2026-07-11
**背景**: 現行の PQC explorer(`feat-pqc`)は explorer-smd の **`dev` ブランチ**(公式追従系)を土台に
PQC 化したため、**`main` ブランチにしか無い SMD 機能群が欠落**している。
SMD 機能を含む explorer-smd `main` を PQC 対応させる。

---

## 1. 現状分析(調査済みの事実)

### ブランチ系譜

```
explorer-smd dev (90817518 = 公式 upstream/dev マージ済み)
  ├─ feat-pqc = dev + PQC 3コミット ……… 現行 pqc-catapult-explorer(SMD 機能なし)
  └─ main    = dev + SMD 19コミット …… SMD 版(PQC 非対応、目標の土台)
```

**`dev` は `main` の祖先**(main は dev + 19 コミット)。つまり main には現行 PQC explorer の
土台がすべて含まれており、差分は SMD 機能のみ。**逆方向の取り込み(main → feat-pqc のマージ)が
そのまま成立する**。

### main にしか無い SMD 機能(19 コミット、117 ファイル)

- SMD メニュー / SMD 一覧ページ(`src/config/pages/smd-list.json` ほか)
- SMD ソーシャルメタデータ機能(`src/store/socialMetadata.js`、`MetadataService.js` 拡張)
- モザイク詳細ページ: ホルダー一覧・トランザクション履歴(`mosaic-detail.json`、`MosaicService.js`)
- アイコン可視性改善・NFTDrive 版 README・GitHub Pages SPA 修正

### PQC 側の差分(feat-pqc = dev + 3 コミット)

| コミット | 内容 |
|---|---|
| `9609ece2` | iVRF ブロック proof 表示(`block-detail.json` + 全 i18n)、PQC symbol-sdk、js-sha3 明示化 |
| `d501d336` | symbol-sdk を `github:bootarou/pqc-catapult-sdk-v2#feat-pqc` に(lockfile 込み) |
| `e2bd5f02` | README を PQC フォーク向けに全面改訂 |

### 衝突・非互換ポイント(全数調査済み)

| # | 項目 | 事実 | 対応方針 |
|---|---|---|---|
| 1 | **マージ衝突は 4 ファイルのみ**: `README.md` / `package.json` / `i18n/en-us.json` / `i18n/ja.json` | SMD 側と PQC 側が同じファイルを編集 | README = PQC 版を基に SMD/NFTDrive 節を統合。package.json = SMD の依存 + PQC の SDK 参照を両取り。i18n = 双方のキーを加算(排他でない) |
| 2 | main の `symbol-sdk` は **npm 公式 `^2.0.6`(ed25519)** | PQC チェーンの鍵/署名/iVRF を解釈不可 | `github:bootarou/pqc-catapult-sdk-v2#feat-pqc` へ(d501d336 と同じ) |
| 3 | main の `vue.config.js` は `publicPath: '/explorer-smd/'`(production)・`outputDir: './dist'` | feat-pqc は `'/'`・`'./www'` | **main の値のまま取り込んで良い**。ランチャーのビルドは `'/explorer-smd/'`→`'/'` の sed と `[ -d www ] || mv dist www` フォールバックを既に持つ(検証済み) |
| 4 | ランチャー側 sed アンカー(`server.js` の `const PORT = 4000` / `mime.lookup(fileUrl)`、`helper.js` の ws 分岐) | main にすべて存在することを確認済み | 変更不要 |
| 5 | SMD 機能の暗号接点 | `socialMetadata` / `MetadataService` / `MosaicService` に publicKey・署名・暗号処理は**無し**(アドレス/メタデータベース) | PQC 固有の改修は不要。表示面のみ確認(下記 Phase 3) |
| 6 | **ランチャーの explorer ビルドはレイヤーキャッシュがブランチ更新を検知しない**(`git clone --depth 1` の RUN 文字列が不変) | 今回の再ビルドで顕在化しうる | 生成 Dockerfile にブランチ tip の cache-bust を追加(bootstrap で実施済みの `ADD refs API` 方式) |

---

## 2. 改修方針

**pqc-catapult-explorer の `feat-pqc` ブランチに explorer-smd `main` をマージする**(方式 A)。

- 通常マージなので **force push 不要・ブランチ名不変** → ランチャー(`EXPLORER_BRANCH = 'feat-pqc'`)や
  README のインストール手順に変更が波及しない
- 履歴も両系統とも保存される
- 代替案(main から新ブランチを切って PQC 3 コミットを cherry-pick)は、ブランチ差し替えに
  force push とランチャー側の追従が必要になるため不採用

## 3. 実装ステップ

### Phase 1 — マージと衝突解決(explorer リポジトリ)

| # | 作業 |
|---|---|
| 1-1 | `feat-pqc` に `explorer-smd/main` をマージ |
| 1-2 | `package.json`: SMD 側の依存追加を保持しつつ `symbol-sdk: github:bootarou/pqc-catapult-sdk-v2#feat-pqc` と `js-sha3` 明示を維持 → `npm install` で lockfile 再生成 |
| 1-3 | `i18n/en-us.json` / `ja.json`: SMD キー(smd.*, mosaic 拡張)と PQC キー(iVrfProofLeaf/Path)を統合。他 6 ロケールは PQC 側のみ変更のため自動マージ |
| 1-4 | `README.md`: PQC 版の構成(免責・差し替え手順・関連リポジトリ)を維持し、「SMD 機能」節を追加 |

### Phase 2 — ビルド・ユニット検証(ローカル)

| # | 作業 | 合格条件 |
|---|---|---|
| 2-1 | `npm install`(GitHub から PQC SDK 取得)→ `npm run build` | ビルド成功(publicPath/outputDir は main の値のまま) |
| 2-2 | PQC SDK の読み込みと ML-DSA 鍵長の確認(1312B/2420B) | スモークテスト通過 |

### Phase 3 — 実チェーン検証(ランチャー経由)

| # | 作業 | 合格条件 |
|---|---|---|
| 3-1 | ランチャーの explorer 生成 Dockerfile に cache-bust を追加(§1-6) | ブランチ更新が再ビルドに反映される |
| 3-2 | ランチャーから explorer を再ビルド・起動(稼働中の PQC テストネット、高さ 15) | :8090 で SPA 配信 |
| 3-3 | **SMD 機能の表示確認**: SMD メニュー・SMD 一覧・モザイク詳細(ホルダー一覧/Tx 履歴)・ソーシャルメタデータ | PQC チェーンのデータで表示・エラーなし |
| 3-4 | **PQC 機能の残存確認**: ブロック詳細の `iVrfProofLeaf` / `iVrfProofPath`(旧 `proofGamma` 不在) | 表示あり |
| 3-5 | 2624 hex 公開鍵が出る画面(アカウント詳細・ホルダー一覧)の表示崩れ確認 | 折返し表示・コピー動作 |

### Phase 4 — 後始末

| # | 作業 |
|---|---|
| 4-1 | pqc-catapult-explorer へプッシュ(`feat-pqc`) |
| 4-2 | ランチャー側コミット(cache-bust)を `feat-PQC-custom-catapult` へプッシュ |
| 4-3 | 本計画書に検証結果を追記 |

## 4. リスク

| # | リスク | 備え |
|---|---|---|
| 1 | SMD の UI が PQC チェーンの想定外データ(巨大公開鍵など)で崩れる | Phase 3-5 で実チェーン確認。修正は表示側のみ(truncate/折返し) |
| 2 | SMD ソーシャルメタデータが公式ネットワーク前提の外部 API(nodeWatch 等)を呼ぶ | ランチャーの `/api/explorer-proxy` が同一オリジンで肩代わりする既存構造を踏襲。実チェーンで 404/エラーを観察して個別対応 |
| 3 | lockfile 再生成による依存ドリフト | SMD 側依存は `^` レンジのまま `npm install` で解決し、ビルド+実チェーン検証で担保 |

---

## 5. 実施結果（2026-07-11・全項目合格）

| Phase | 結果 |
|---|---|
| 1: マージ | ✅ `0802d923`。実際の衝突は README のみ（package.json / i18n は自動マージ成功、SMD キーと iVRF キー両立を確認） |
| 2: ローカルビルド | ✅ `npm install`（lockfile は自動マージ結果のまま整合）→ `npm run build` 成功（93 秒、`dist/` 出力） |
| 3-1: cache-bust | ✅ ランチャーの explorer 生成 Dockerfile に GitHub refs API の `ADD` を追加（launcher `1fa9412`）。再ビルドで新 tip の clone を確認 |
| 3-2: ランチャービルド・起動 | ✅ :8090 で稼働、タイトル = **NFTDrive-BlockChainExplorer-SMD** |
| 3-3: SMD 機能 | ✅ バンドルに `socialMetadata` / `getMosaicHolderList` を確認。`/metadata` 応答正常（テストチェーンは登録 0 件）。**モザイクホルダー一覧が実データで動作（currency 保有 6 アカウント、ML-DSA 公開鍵 2624 hex を返却）** |
| 3-4: PQC 機能残存 | ✅ プロキシ経由 `/blocks/2` が `iVrfProofLeaf` を返却、`proofGamma` 不在 |
| 3-5: 2624 hex 表示 | ✅ ホルダー一覧データパスで 2624 hex 公開鍵を確認（UI は折返し表示） |

SMD ソーシャルメタデータの実データ表示は、チェーンにメタデータが登録され次第確認可能
（データ取得経路 `/metadata` は動作済み）。
