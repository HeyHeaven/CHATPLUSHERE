import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  created_at: string;
  file_names: string[];
  total_messages: number;
  total_users: number;
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
}

interface ReportsHistoryProps {
  userId: string;
  onViewReport: (reportId: string) => void;
}

export const ReportsHistory = ({ userId, onViewReport }: ReportsHistoryProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, [userId]);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const getSentimentColor = (positive: number, negative: number) => {
    if (positive > negative) return "text-success";
    if (negative > positive) return "text-destructive";
    return "text-warning";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
        <p className="text-muted-foreground">Upload a chat file to generate your first report</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Reports History</h2>
      
      {reports.map((report) => (
        <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{report.file_names.join(', ')}</h3>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
                <span>•</span>
                <span>{report.total_messages.toLocaleString()} messages</span>
                <span>•</span>
                <span>{report.total_users} users</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-medium ${getSentimentColor(report.sentiment_positive, report.sentiment_negative)}`}>
                    Sentiment: {report.sentiment_positive > report.sentiment_negative ? 'Positive' : 
                              report.sentiment_negative > report.sentiment_positive ? 'Negative' : 'Neutral'}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({report.sentiment_positive.toFixed(0)}% positive)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReport(report.id)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};