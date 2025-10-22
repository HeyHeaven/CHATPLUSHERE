import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  PieChart,
  Settings,
  LogOut,
  Upload,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalChats: 0,
    totalReports: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    loadStats();
  }, [session]);

  const loadStats = async () => {
    const { data: analyses } = await supabase
      .from("chat_analyses")
      .select("id, total_messages")
      .eq("user_id", session.user.id);

    const analysisIds = analyses?.map((a) => a.id) || [];

    const { data: insights } = await supabase
      .from("insights")
      .select("id")
      .in("analysis_id", analysisIds);

    setStats({
      totalChats: analyses?.length || 0,
      totalReports: analyses?.length || 0,
      totalMessages:
        analyses?.reduce((sum, a) => sum + a.total_messages, 0) || 0,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">ChatPlus</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/")}
                variant="default"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                New Analysis
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.email}</span>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 gradient-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Chats</p>
                    <p className="text-2xl font-bold">{stats.totalChats}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <PieChart className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Reports Generated
                    </p>
                    <p className="text-2xl font-bold">{stats.totalReports}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <FileText className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Messages Analyzed
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalMessages.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to ChatPlus</h2>
              <p className="text-muted-foreground mb-6">
                Start analyzing WhatsApp chats to gain actionable business
                insights
              </p>
              <Button onClick={() => navigate("/")} size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload New Chat
              </Button>
            </Card>
          </TabsContent>

          {/* Optional reports tab if you want to keep it */}
          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Reports will be shown here
              </h2>
              <p className="text-muted-foreground">
                Your analysis reports will appear in this section
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Account ID</label>
                  <p className="text-muted-foreground text-xs">
                    {session.user.id}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
