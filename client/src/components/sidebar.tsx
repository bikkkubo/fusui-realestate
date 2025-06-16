import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Eye, 
  Ruler, 
  Plus, 
  Trash2, 
  Download,
  Image as ImageIcon,
  Compass,
  Star
} from "lucide-react";

interface SidebarProps {
  searchAddress: string;
  setSearchAddress: (address: string) => void;
  currentPosition: { lat: number; lng: number };
  elevation: number;
  showPrimaryDirections: boolean;
  setShowPrimaryDirections: (show: boolean) => void;
  showSecondaryDirections: boolean;
  setShowSecondaryDirections: (show: boolean) => void;
  displayRadius: number;
  setDisplayRadius: (radius: number) => void;
  onAddMarker: () => void;
  onClearMarkers: () => void;
  onLocationJump: (lat: number, lng: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showKyuseiMode: boolean;
  onToggleKyuseiMode: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  searchAddress,
  setSearchAddress,
  currentPosition,
  elevation,
  showPrimaryDirections,
  setShowPrimaryDirections,
  showSecondaryDirections,
  setShowSecondaryDirections,
  displayRadius,
  setDisplayRadius,
  onAddMarker,
  onClearMarkers,
  onLocationJump,
  isLoading,
  setIsLoading,
  showKyuseiMode,
  onToggleKyuseiMode,
  isMobile = false,
  onCloseMobile
}: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/geocode", { address });
      return response.json();
    },
    onSuccess: (data) => {
      onLocationJump(data.lat, data.lng);
      toast({
        title: "住所検索完了",
        description: `${data.formattedAddress} に移動しました`,
      });
      setIsLoading(false);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "住所の検索に失敗しました",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const handleAddressSearch = () => {
    if (!searchAddress.trim()) {
      toast({
        title: "エラー",
        description: "住所を入力してください",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    geocodeMutation.mutate(searchAddress);
  };

  const handleFengShuiJump = () => {
    // Calculate optimal feng shui position (mock calculation)
    const optimalLat = currentPosition.lat + (Math.random() - 0.5) * 0.01;
    const optimalLng = currentPosition.lng + (Math.random() - 0.5) * 0.01;
    
    onLocationJump(optimalLat, optimalLng);
    toast({
      title: "風水ジャンプ",
      description: "最適な風水位置に移動しました",
    });
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Type", "Latitude", "Longitude", "Elevation"],
      ["Center", currentPosition.lat.toString(), currentPosition.lng.toString(), elevation.toString()]
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feng-shui-data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "エクスポート完了",
      description: "CSVファイルをダウンロードしました",
    });
  };

  const handleSaveImage = () => {
    toast({
      title: "準備中",
      description: "画像保存機能は開発中です",
    });
  };

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-primary text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">風水方位分析</h1>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">v2.0</span>
        </div>
        <p className="text-sm opacity-90 mt-1">高精度方位計算システム</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Section */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              住所検索
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="住所を入力してください"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddressSearch()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleAddressSearch}
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isLoading || !searchAddress.trim()}
              >
                <MapPin className="h-4 w-4 mr-2" />
                地点を検索
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Position */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              現在の中心点座標
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">緯度:</span>
                <span className="font-mono text-primary">{currentPosition.lat.toFixed(13)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">経度:</span>
                <span className="font-mono text-primary">{currentPosition.lng.toFixed(13)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">標高:</span>
                <span className="font-mono text-secondary">{elevation.toFixed(3)}m</span>
              </div>
            </div>
            <Button 
              onClick={handleFengShuiJump}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Compass className="h-4 w-4 mr-2" />
              風水ジャンプ！
            </Button>
          </CardContent>
        </Card>

        {/* Direction Settings */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              方位の表示
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-sm">
                  <Checkbox
                    checked={showPrimaryDirections}
                    onCheckedChange={setShowPrimaryDirections}
                    className="mr-2"
                  />
                  <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                  四正線
                </Label>
                <span className="text-xs text-gray-500">東西南北</span>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-sm">
                  <Checkbox
                    checked={showSecondaryDirections}
                    onCheckedChange={setShowSecondaryDirections}
                    className="mr-2"
                  />
                  <span className="w-3 h-3 bg-accent rounded-full mr-2"></span>
                  四隅線
                </Label>
                <span className="text-xs text-gray-500">北東・南東・南西・北西</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">表示半径（メートル）</Label>
              <Slider
                value={[displayRadius]}
                onValueChange={(value) => setDisplayRadius(value[0])}
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>100m</span>
                <span>{displayRadius}m</span>
                <span>5km</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marker Management */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              マーカー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={onAddMarker}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              中心にマーカーを置く
            </Button>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• クリックした地点を検索</p>
              <p>• マーカーをドラッグ移動可能</p>
              <p>• 右クリックでマーカー削除</p>
            </div>
          </CardContent>
        </Card>

        {/* Kyusei Mode Toggle */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              九星気学モード
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onToggleKyuseiMode}
              className={`w-full ${showKyuseiMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              <Star className="h-4 w-4 mr-2" />
              {showKyuseiMode ? '九星気学モード ON' : '九星気学モード'}
            </Button>
            {showKyuseiMode && (
              <p className="text-xs text-gray-500 mt-2">
                生年月日から吉方位を計算して地図に表示します
              </p>
            )}
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card className="m-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              データ出力
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleExportCSV}
              className="w-full bg-success hover:bg-success/90 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
            
            <Button 
              onClick={handleSaveImage}
              variant="outline"
              className="w-full text-sm"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              画像として保存
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
