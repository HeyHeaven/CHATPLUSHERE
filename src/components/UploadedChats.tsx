import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Trash2, Download, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UploadedChat {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  analysis_status: string;
  analysis_id: string | null;
}

interface UploadedChatsProps {
  userId: string;
  onViewAnalysis?: (analysisId: string) => void;
}

export const UploadedChats = ({ userId, onViewAnalysis }: UploadedChatsProps) => {
  const [chats, setChats] = useState<UploadedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from("uploaded_chats")
        .select("*")
        .eq("user_id", userId)
        .order("upload_date", { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch uploaded chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [userId]);

  const handleDownload = async (chat: UploadedChat) => {
    try {
      const { data, error } = await supabase.storage
        .from("chat-files")
        .download(chat.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = chat.file_name;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Chat file downloaded",
      });
    } catch (error) {
      console.error("Error downloading chat:", error);
      toast({
        title: "Error",
        description: "Failed to download chat file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (chat: UploadedChat) => {
    if (!confirm(`Delete "${chat.file_name}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("chat-files")
        .remove([chat.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("uploaded_chats")
        .delete()
        .eq("id", chat.id);

      if (dbError) throw dbError;

      setChats(chats.filter((c) => c.id !== chat.id));

      toast({
        title: "Success",
        description: "Chat file deleted",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No uploaded chats yet</h3>
        <p className="text-muted-foreground">
          Upload WhatsApp chat files to get started with analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Uploaded Chats</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chats.map((chat) => (
          <Card key={chat.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate" title={chat.file_name}>
                      {chat.file_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(chat.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Uploaded {formatDistanceToNow(new Date(chat.upload_date), { addSuffix: true })}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    chat.analysis_status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : chat.analysis_status === "failed"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {chat.analysis_status}
                </span>
              </div>

              <div className="flex gap-2">
                {chat.analysis_id && onViewAnalysis && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onViewAnalysis(chat.analysis_id!)}
                    className="flex-1"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(chat)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(chat)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
