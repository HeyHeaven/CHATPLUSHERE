import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { InsightsPanel } from "./InsightsPanel";
import { CustomerProfiles } from "./CustomerProfiles";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

interface ResultsTabsProps {
  analysisData: any;
  insights: any[];
  customerProfiles: any[];
}

export const ResultsTabs = ({ analysisData, insights, customerProfiles }: ResultsTabsProps) => {
  const { toast } = useToast();

  const downloadPDF = async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your report...",
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246);
      pdf.text('ChatPlus Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date Range
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `${analysisData.dateRange.start.toLocaleDateString()} - ${analysisData.dateRange.end.toLocaleDateString()}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
      );
      yPosition += 15;

      // Summary Stats
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Summary', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.text(`Total Messages: ${analysisData.totalMessages.toLocaleString()}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Users: ${analysisData.totalUsers}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Most Active Hour: ${analysisData.timeAnalysis.mostActiveHour}:00`, 20, yPosition);
      yPosition += 15;

      // Sentiment Analysis
      if (analysisData.sentiment) {
        pdf.setFontSize(14);
        pdf.text('Sentiment Analysis', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setTextColor(34, 197, 94);
        pdf.text(`Positive: ${analysisData.sentiment.positive}%`, 20, yPosition);
        pdf.setTextColor(234, 179, 8);
        pdf.text(`Neutral: ${analysisData.sentiment.neutral}%`, 70, yPosition);
        pdf.setTextColor(239, 68, 68);
        pdf.text(`Negative: ${analysisData.sentiment.negative}%`, 120, yPosition);
        yPosition += 15;
      }

      // Top Words
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Top Words', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      analysisData.topWords.slice(0, 10).forEach(([word, count]: [string, number], index: number) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${word}: ${count}`, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Business Insights
      if (insights.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('AI Business Insights', 20, yPosition);
        yPosition += 10;

        insights.slice(0, 5).forEach((insight) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.setTextColor(59, 130, 246);
          pdf.text(insight.title, 20, yPosition);
          yPosition += 7;

          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          const descLines = pdf.splitTextToSize(insight.description, pageWidth - 40);
          pdf.text(descLines, 20, yPosition);
          yPosition += descLines.length * 5 + 8;
        });
      }

      // Save PDF
      pdf.save(`chatplus-report-${new Date().getTime()}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your report has been successfully downloaded.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Analysis Results</h2>
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="analytics">📊 Analytical Insights</TabsTrigger>
          <TabsTrigger value="business">💼 AI Business Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard data={analysisData} sentimentData={analysisData.sentiment} />
          
          {customerProfiles.length > 0 && (
            <div className="mt-8">
              <CustomerProfiles profiles={customerProfiles} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          {insights.length > 0 ? (
            <InsightsPanel insights={insights} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No AI insights available for this analysis
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};