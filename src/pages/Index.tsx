import { useState } from "react";
import { Hero } from "@/components/Hero";
import { FileUpload } from "@/components/FileUpload";
import { ResultsTabs } from "@/components/ResultsTabs";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ReportsHistory } from "@/components/ReportsHistory";
import { parseWhatsAppChat, analyzeChat } from "@/utils/chatParser";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, User, LogOut, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

type ViewState = 'hero' | 'upload' | 'dashboard' | 'history';

const Index = () => {
  return (
    <AuthWrapper>
      {(session) => <IndexContent session={session} />}
    </AuthWrapper>
  );
};

const IndexContent = ({ session }: { session: Session }) => {
  const [view, setView] = useState<ViewState>('hero');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
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
      
      // Call AI for sentiment and insights
      const { data: aiAnalysis, error: aiError } = await supabase.functions.invoke('analyze-chat-ai', {
        body: {
          messages: analysis.messages,
          totalMessages: analysis.totalMessages,
          totalUsers: analysis.totalUsers,
          topWords: analysis.topWords,
          topEmojis: analysis.topEmojis,
        },
      });

      if (aiError) throw aiError;

      // Save analysis to database
      const analysisDataForDb = {
        ...analysis,
        dateRange: {
          start: analysis.dateRange.start.toISOString(),
          end: analysis.dateRange.end.toISOString(),
        },
        messages: analysis.messages.map((m: any) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        })),
      };

      const { data: savedAnalysis, error: saveError } = await supabase
        .from('chat_analyses')
        .insert([{
          user_id: session.user.id,
          file_names: files.map(f => f.name),
          total_messages: analysis.totalMessages,
          total_users: analysis.totalUsers,
          date_range_start: analysis.dateRange.start.toISOString(),
          date_range_end: analysis.dateRange.end.toISOString(),
          sentiment_positive: aiAnalysis.sentiment.positive,
          sentiment_neutral: aiAnalysis.sentiment.neutral,
          sentiment_negative: aiAnalysis.sentiment.negative,
          analysis_data: analysisDataForDb,
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      // Save insights
      if (aiAnalysis.insights && aiAnalysis.insights.length > 0) {
        const insightsToSave = aiAnalysis.insights.map((insight: any) => ({
          analysis_id: savedAnalysis.id,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          priority: insight.priority,
          actionable_recommendations: insight.recommendations,
        }));

        const { data: savedInsights, error: insightsError } = await supabase
          .from('insights')
          .insert(insightsToSave)
          .select();

        if (insightsError) throw insightsError;
        setInsights(savedInsights);
      }

      // Update customer profiles
      const userMessageCounts = new Map<string, number>();
      analysis.messages.forEach((msg: any) => {
        userMessageCounts.set(msg.user, (userMessageCounts.get(msg.user) || 0) + 1);
      });

      for (const [username, messageCount] of userMessageCounts.entries()) {
        const avgSentiment = 
          aiAnalysis.sentiment.positive > aiAnalysis.sentiment.negative ? 70 :
          aiAnalysis.sentiment.neutral > 50 ? 50 : 30;

        const engagementLevel = 
          messageCount > analysis.totalMessages * 0.2 ? 'high' :
          messageCount > analysis.totalMessages * 0.05 ? 'medium' : 'low';

        await supabase
          .from('customer_profiles')
          .upsert({
            user_id: session.user.id,
            customer_identifier: username,
            total_interactions: 1,
            last_interaction_date: analysis.dateRange.end.toISOString(),
            avg_sentiment_score: avgSentiment,
            total_messages_sent: messageCount,
            engagement_level: engagementLevel,
            key_topics: analysis.topWords.slice(0, 5).map((w: any) => w[0]),
          }, {
            onConflict: 'user_id,customer_identifier',
            ignoreDuplicates: false,
          });
      }

      // Fetch updated profiles
      const { data: profiles } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('total_messages_sent', { ascending: false })
        .limit(10);

      if (profiles) setCustomerProfiles(profiles);

      setAnalysisData({
        ...analysis,
        sentiment: aiAnalysis.sentiment,
      });

      setView('dashboard');
      
      toast({
        title: "Analysis complete!",
        description: `Successfully analyzed ${analysis.totalMessages} messages with AI-powered insights.`,
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
    if (view === 'dashboard' || view === 'history') {
      setView('upload');
    } else if (view === 'upload') {
      setView('hero');
    }
  };

  const handleViewHistory = () => {
    setView('history');
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const { data: report, error } = await supabase
        .from('chat_analyses')
        .select('*, insights(*)')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      const { data: profiles } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('total_messages_sent', { ascending: false })
        .limit(10);

      const analysisData = report.analysis_data as any;
      
      setAnalysisData({
        ...analysisData,
        sentiment: {
          positive: report.sentiment_positive,
          neutral: report.sentiment_neutral,
          negative: report.sentiment_negative,
        },
        dateRange: {
          start: new Date(report.date_range_start),
          end: new Date(report.date_range_end),
        },
        messages: analysisData?.messages?.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })) || [],
      });
      setInsights(report.insights || []);
      setCustomerProfiles(profiles || []);
      setView('dashboard');
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive",
      });
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setInsights([]);
    setView('upload');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
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
            <div className="flex items-center gap-2">
              {view === 'dashboard' && (
                <>
                  <Button onClick={handleNewAnalysis} variant="outline">
                    New Analysis
                  </Button>
                  <Button onClick={handleViewHistory} variant="outline" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                  </Button>
                </>
              )}
              {view === 'upload' && (
                <Button onClick={handleViewHistory} variant="outline" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.email}</span>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
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
      {view === 'history' && (
        <div className="container mx-auto px-4 py-8">
          <ReportsHistory userId={session.user.id} onViewReport={handleViewReport} />
        </div>
      )}
      {view === 'dashboard' && analysisData && (
        <div className="container mx-auto px-4 py-8">
          <ResultsTabs
            analysisData={analysisData}
            insights={insights}
            customerProfiles={customerProfiles}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
