import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calculator, Star } from "lucide-react";
import { calcHomenStar, getGoodAzimuths, getKyuseiAnalysis, KYUSEI_STARS } from "@/lib/kyusei-calculations";
import { useToast } from "@/hooks/use-toast";

interface KyuseiFormProps {
  currentPosition: { lat: number; lng: number };
  onSectorsCalculated: (sectors: Array<{start: number, end: number}>) => void;
  onClose: () => void;
  isMobile?: boolean;
}

export default function KyuseiForm({ 
  currentPosition, 
  onSectorsCalculated, 
  onClose,
  isMobile = false
}: KyuseiFormProps) {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [moveYear, setMoveYear] = useState(new Date().getFullYear().toString());
  const [moveMonth, setMoveMonth] = useState((new Date().getMonth() + 1).toString());
  const [isCalculating, setIsCalculating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const { toast } = useToast();

  const handleCalculate = () => {
    if (!birthYear || !birthMonth || !birthDay) {
      toast({
        title: "入力エラー",
        description: "生年月日をすべて入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      const homenStar = calcHomenStar(
        parseInt(birthYear), 
        parseInt(birthMonth), 
        parseInt(birthDay)
      );
      
      const analysis = getKyuseiAnalysis(
        homenStar,
        parseInt(moveYear),
        parseInt(moveMonth)
      );
      
      setAnalysisResult(analysis);
      onSectorsCalculated(analysis.goodSectors);
      
      toast({
        title: "計算完了",
        description: `${analysis.homenStar.name}の吉方位を表示しました`,
      });
      
    } catch (error) {
      toast({
        title: "計算エラー",
        description: "吉方位の計算に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClear = () => {
    onSectorsCalculated([]);
    setAnalysisResult(null);
    toast({
      title: "クリア完了",
      description: "吉方位表示を削除しました",
    });
  };

  return (
    <div className={`${isMobile ? 'fixed top-0 left-0 right-0 z-50' : 'relative'} bg-white shadow-lg border-b`}>
      <Card className="rounded-none border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              九星気学 吉方位計算
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
            {/* 生年月日入力 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">生年月日</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="年"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-20"
                />
                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        {i+1}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="日" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 31}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        {i+1}日
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 引越し予定月 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">引越し予定</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="年"
                  value={moveYear}
                  onChange={(e) => setMoveYear(e.target.value)}
                  className="w-20"
                />
                <Select value={moveMonth} onValueChange={setMoveMonth}>
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        {i+1}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 計算ボタン */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">操作</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {isCalculating ? "計算中..." : "描画"}
                </Button>
                <Button 
                  onClick={handleClear}
                  variant="outline"
                >
                  クリア
                </Button>
              </div>
            </div>

            {/* 結果表示 */}
            {analysisResult && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">分析結果</Label>
                <div className="text-sm space-y-1">
                  <div className="font-medium text-primary">
                    {analysisResult.homenStar.name}
                  </div>
                  <div className="text-gray-600">
                    吉方位: {analysisResult.totalGoodSectors}方向
                  </div>
                  <div className="text-xs text-gray-500">
                    {analysisResult.recommendation}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}