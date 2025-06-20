# 風水マップシステム変更履歴

## v2.2.0 - Map ID環境変数対応 + パフォーマンス最適化 (2025-06-18)

### 🔧 Map ID 設定対応
- **NEW**: `VITE_GOOGLE_MAPS_MAP_ID` 環境変数サポート
- Google Cloud Console Map ID 作成手順書 (`MAP_ID_SETUP.md`)
- Map ID バリデーションとフォールバック機能
- 開発環境での警告メッセージ最適化

### ⚡ パフォーマンス最適化
- グリッドオーバーレイの60fps最適化実装
- `requestIdleCallback` による非ブロッキング計算
- WebGL ベクターマップレイヤー対応
- カスタムフック `useGoogleMap` 作成

### 🏗️ アーキテクチャ改善
- パフォーマンス監視ツール実装
- FPS カウンター統合
- メモリ効率化されたグリッド生成

## v2.1.0 - AdvancedMarkerElement完全移行 (2025-06-18)

### 🔧 Google Maps API 最適化
- **BREAKING**: `google.maps.Marker` から `google.maps.marker.AdvancedMarkerElement` に完全移行
- カスタムマーカーコンテンツ実装（青い円形アイコン、白いボーダー、影効果）
- TypeScript型定義の最適化
- 非推奨警告の完全解消

### 📦 ライブラリ統合
- `@googlemaps/js-api-loader` による非同期読み込み実装
- マーカーライブラリ (`'marker'`) の動的インポート
- エラーハンドリングの強化

### 🏗️ アーキテクチャ改善
- 共通地理計算ユーティリティ (`shared/utils/geom.ts`) 作成
- 重複マップコンポーネントの `deprecated/` フォルダへの移動
- 環境変数設定例 (`.env.example`) の提供

### 🎯 パフォーマンス向上
- ブロッキング読み込みの解消
- バンドルサイズの最適化
- メモリリーク防止のためのマーカー参照管理

### 🛠️ 技術負債解消
- Google Maps API v3.57+ 対応
- TypeScript 5.x 対応
- 最新ブラウザAPI対応

### 📝 ドキュメント整備
- 最適化レポート (`OPTIMIZATION_SUMMARY.md`) 作成
- 変更履歴 (`CHANGELOG.md`) 開始
- 手動コミット手順書の提供

## 次期予定機能
- InfoWindow の AdvancedMarkerElement 対応
- カスタムマーカーアイコンライブラリ
- 九星気学計算結果のマーカー表示最適化