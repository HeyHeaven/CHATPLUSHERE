import { useState } from "react";
import { Hero } from "@/components/Hero";
import { FileUpload } from "@/components/FileUpload";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { parseWhatsAppChat, analyzeChat } from "@/utils/chatParser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ViewState = 'hero' | 'upload' | 'dashboard';

const Index = () => {
  const [view, setView] = useState<ViewState>('hero');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleGetStarted = () => {
    setView('upload');
  };

  const handleFilesSelected = async (files: File[]) => {
    setIsAnalyzing(true);
    
    try {
      // Parse all files
      const parsedChats = await Promise.all(
        files.map(file => parseWhatsAppChat(file))
      );

      // Analyze combined data
      const analysis = await analyzeChat(parsedChats);
      
      // Mock sentiment data for now (will be replaced with AI analysis)
      const mockSentiment = {
        positive: Math.floor(Math.random() * 30) + 40, // 40-70%
        neutral: Math.floor(Math.random() * 20) + 20,  // 20-40%
        negative: 0,
      };
      mockSentiment.negative = 100 - mockSentiment.positive - mockSentiment.neutral;

      setAnalysisData({
        ...analysis,
        sentiment: mockSentiment,
      });

      setView('dashboard');
      
      toast({
        title: "Analysis complete!",
        description: `Successfully analyzed ${analysis.totalMessages} messages from ${analysis.totalUsers} users.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze chat files. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    if (view === 'dashboard') {
      setView('upload');
    } else if (view === 'upload') {
      setView('hero');
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-background">
      {view !== 'hero' && (
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {view === 'dashboard' && (
              <Button onClick={handleNewAnalysis} variant="outline">
                New Analysis
              </Button>
            )}
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Analyzing chats...</h3>
            <p className="text-muted-foreground">This may take a few moments</p>
          </div>
        </div>
      )}

      {view === 'hero' && <Hero onGetStarted={handleGetStarted} />}
      {view === 'upload' && <FileUpload onFilesSelected={handleFilesSelected} />}
      {view === 'dashboard' && analysisData && (
        <AnalyticsDashboard 
          data={analysisData} 
          sentimentData={analysisData.sentiment}
        />
      )}
    </div>
  );
};

export default Index;
