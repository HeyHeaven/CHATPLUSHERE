import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Sidebar } from "@/components/Sidebar";
import { FileUpload } from "@/components/FileUpload";
import { ResultsTabs } from "@/components/ResultsTabs";
import { ReportsHistory } from "@/components/ReportsHistory";
import { Dashboard } from "./Dashboard";
import { parseWhatsAppChat, analyzeChat } from "@/utils/chatParser";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { UploadedChats } from "@/components/UploadedChats";
import { Button } from "@/components/ui/button";

const MainApp = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    if (!session) return;
    
    setIsAnalyzing(true);
    
    // Track uploaded chat IDs for error handling
    const uploadedChatIds: string[] = [];

    try {
      // Upload files to storage and create records
      
      for (const file of files) {
        const filePath = `${session.user.id}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("chat-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: chatRecord, error: recordError } = await supabase
          .from("uploaded_chats")
          .insert({
            user_id: session.user.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            analysis_status: "processing",
          })
          .select()
          .single();

        if (recordError) throw recordError;
        uploadedChatIds.push(chatRecord.id);
      }

      const parsedChats = await Promise.all(
        files.map((file) => parseWhatsAppChat(file))
      );

      const analysis = await analyzeChat(parsedChats);

      const { data: aiAnalysis, error: aiError } =
        await supabase.functions.invoke("analyze-chat-ai", {
          body: {
            messages: analysis.messages,
            totalMessages: analysis.totalMessages,
            totalUsers: analysis.totalUsers,
            topWords: analysis.topWords,
            topEmojis: analysis.topEmojis,
          },
        });

      if (aiError) throw aiError;

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
        .from("chat_analyses")
        .insert([
          {
            user_id: session.user.id,
            file_names: files.map((f) => f.name),
            total_messages: analysis.totalMessages,
            total_users: analysis.totalUsers,
            date_range_start: analysis.dateRange.start.toISOString(),
            date_range_end: analysis.dateRange.end.toISOString(),
            sentiment_positive: aiAnalysis.sentiment.positive,
            sentiment_neutral: aiAnalysis.sentiment.neutral,
            sentiment_negative: aiAnalysis.sentiment.negative,
            analysis_data: analysisDataForDb,
          },
        ])
        .select()
        .single();

      if (saveError) throw saveError;

      // Update uploaded chat records with analysis ID
      for (const chatId of uploadedChatIds) {
        await supabase
          .from("uploaded_chats")
          .update({
            analysis_id: savedAnalysis.id,
            analysis_status: "completed",
          })
          .eq("id", chatId);
      }

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
          .from("insights")
          .insert(insightsToSave)
          .select();

        if (insightsError) throw insightsError;
        setInsights(savedInsights);
      }

      const userMessageCounts = new Map<string, number>();
      analysis.messages.forEach((msg: any) => {
        userMessageCounts.set(msg.user, (userMessageCounts.get(msg.user) || 0) + 1);
      });

      for (const [username, messageCount] of userMessageCounts.entries()) {
        const avgSentiment =
          aiAnalysis.sentiment.positive > aiAnalysis.sentiment.negative
            ? 70
            : aiAnalysis.sentiment.neutral > 50
            ? 50
            : 30;

        const engagementLevel =
          messageCount > analysis.totalMessages * 0.2
            ? "high"
            : messageCount > analysis.totalMessages * 0.05
            ? "medium"
            : "low";

        await supabase.from("customer_profiles").upsert(
          {
            user_id: session.user.id,
            customer_identifier: username,
            total_interactions: 1,
            last_interaction_date: analysis.dateRange.end.toISOString(),
            avg_sentiment_score: avgSentiment,
            total_messages_sent: messageCount,
            engagement_level: engagementLevel,
            key_topics: analysis.topWords.slice(0, 5).map((w: any) => w[0]),
          },
          {
            onConflict: "user_id,customer_identifier",
            ignoreDuplicates: false,
          }
        );
      }

      const { data: profiles } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .order("total_messages_sent", { ascending: false })
        .limit(10);

      if (profiles) setCustomerProfiles(profiles);

      setAnalysisData({
        ...analysis,
        sentiment: aiAnalysis.sentiment,
      });

      toast({
        title: "Analysis complete!",
        description: `Successfully analyzed ${analysis.totalMessages} messages with AI-powered insights.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      
      // Mark uploaded chats as failed
      for (const chatId of uploadedChatIds) {
        await supabase
          .from("uploaded_chats")
          .update({ analysis_status: "failed" })
          .eq("id", chatId);
      }
      
      toast({
        title: "Analysis failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to analyze chat files.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    if (!session) return;

    try {
      const { data: report, error } = await supabase
        .from("chat_analyses")
        .select("*, insights(*)")
        .eq("id", reportId)
        .single();

      if (error) throw error;

      const { data: profiles } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .order("total_messages_sent", { ascending: false })
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
        messages:
          analysisData?.messages?.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })) || [],
      });
      setInsights(report.insights || []);
      setCustomerProfiles(profiles || []);
      
      // Navigate to home page to show the analysis
      navigate("/app");
    } catch (error) {
      console.error("Error loading report:", error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setInsights([]);
    setCustomerProfiles([]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-auto bg-background">
        {/* Header with New Analysis button */}
        {analysisData && (
          <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
            <Button onClick={handleNewAnalysis} className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
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

        <Routes>
          <Route
            path="/"
            element={
              <div className="container mx-auto px-4 py-8">
                {analysisData ? (
                  <ResultsTabs
                    analysisData={analysisData}
                    insights={insights}
                    customerProfiles={customerProfiles}
                  />
                ) : (
                  <FileUpload onFilesSelected={handleFilesSelected} />
                )}
              </div>
            }
          />
          <Route path="/profile" element={<Dashboard session={session} />} />
          <Route
            path="/chats"
            element={
              <div className="container mx-auto px-4 py-8">
                <UploadedChats
                  userId={session.user.id}
                  onViewAnalysis={handleViewReport}
                />
              </div>
            }
          />
          <Route
            path="/reports"
            element={
              <div className="container mx-auto px-4 py-8">
                <ReportsHistory
                  userId={session.user.id}
                  onViewReport={handleViewReport}
                />
              </div>
            }
          />
          <Route path="/settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default MainApp;
