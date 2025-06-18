# Google Maps Map ID 設定手順

## 問題
AdvancedMarkerElement を使用するには、Google Cloud Console で作成された有効な Map ID が必要です。

## 解決手順

### 1. Google Cloud Console での Map ID 作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIs & Services」→ 「Credentials」
4. 「Map management」→ 「Map IDs」を選択
5. 「CREATE MAP ID」をクリック
6. Map type: `JavaScript` を選択
7. Map ID: `FENG_SHUI_MAP` (または任意の名前)
8. 作成完了

### 2. 環境変数設定

`.env` ファイルに以下を追加：
```bash
VITE_GOOGLE_MAPS_MAP_ID=your_created_map_id
```

### 3. 開発モード（一時的対応）

Map ID が未設定の場合、システムは自動的に `DEMO_MAP_ID` を使用します。
これは開発・テスト目的のフォールバック機能です。

### 4. 本番環境

本番環境では必ず有効な Map ID を設定してください。
無効な Map ID では AdvancedMarkerElement が正常に動作しません。

## 確認方法

- ブラウザコンソールで「有効なマップ ID を使用せず...」エラーが表示されない
- マーカーが正常に表示される
- AdvancedMarkerElement の機能が利用可能

## トラブルシューティング

### Map ID エラーが続く場合
1. Google Cloud Console で Map ID が正しく作成されているか確認
2. `.env` ファイルの変数名が `VITE_GOOGLE_MAPS_MAP_ID` であることを確認
3. ハードリロード（Ctrl+F5 / Cmd+Shift+R）を実行