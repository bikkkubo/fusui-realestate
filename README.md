# 風水方位分析ツール v2.0

高精度な風水方位計算と九星気学分析を行うWebアプリケーションです。

## 主な機能

- **高精度方位計算**: WGS84測地系による正確な方位表示
- **Google Maps統合**: 高品質な地図表示とジオコーディング
- **九星気学分析**: 生年月日による本命星計算と吉凶方位判定
- **運気ヒートマップ**: 1km解像度で120km範囲の運気可視化
- **レスポンシブデザイン**: デスクトップ・モバイル対応

## 技術スタック

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Drizzle ORM)
- **地図**: Google Maps API, OpenStreetMap (Leaflet)
- **UI**: shadcn/ui, Radix UI

## セットアップ

### 1. リポジトリクローン
```bash
git clone https://github.com/bikkkubo/fusui-realestate.git
cd fusui-realestate
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 環境変数設定
```bash
# .env ファイルを作成
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
DATABASE_URL=your_postgresql_url
```

### 4. データベースセットアップ
```bash
npm run db:push
```

### 5. 開発サーバー起動
```bash
npm run dev
```

## Google Maps API設定

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクト作成
2. 以下のAPIを有効化:
   - Maps JavaScript API
   - Geocoding API
3. APIキーを作成し環境変数に設定

## 使用方法

詳細な使用方法は [`manual.txt`](./manual.txt) をご参照ください。

### 基本操作
1. 住所検索で地点を設定
2. 方位線表示で風水分析
3. 九星気学モードで運気計算
4. ヒートマップで可視化

## 機能詳細

### 風水方位計算
- 八方位・十六方位対応
- 表示距離500m〜5000m調整可能
- リアルタイム標高データ取得

### 九星気学分析
- 本命星自動計算
- 年盤・月盤による吉凶判定
- 暗剣殺・五黄殺・歳破考慮
- 視覚的な扇形セクター表示

### 運気ヒートマップ
- 1km四方グリッド分析
- 半径120km範囲カバー
- 吉方位（緑）・凶方位（赤）色分け
- 非同期処理によるパフォーマンス最適化

## ライセンス

MIT License

## 更新履歴

### v2.0
- Google Maps統合
- 運気ヒートマップ機能
- モバイル最適化
- 非同期ローディング対応

### v1.0
- 基本方位表示機能
- 九星気学計算
- OpenStreetMap対応