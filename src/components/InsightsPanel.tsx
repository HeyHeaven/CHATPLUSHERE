import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, MessageCircle, Clock, Target, CheckCircle } from "lucide-react";

interface Insight {
  id?: string;
  insight_type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable_recommendations: string[];
}

interface InsightsPanelProps {
  insights: Insight[];
}

const priorityConfig = {
  critical: { color: 'destructive', icon: AlertCircle },
  high: { color: 'orange', icon: TrendingUp },
  medium: { color: 'yellow', icon: MessageCircle },
  low: { color: 'blue', icon: CheckCircle },
};

const typeIcons = {
  sentiment: MessageCircle,
  engagement: TrendingUp,
  satisfaction: CheckCircle,
  topic: Target,
  response_time: Clock,
  opportunity: TrendingUp,
};

export const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Business Insights</h2>
      </div>

      <div className="grid gap-4">
        {insights.map((insight, index) => {
          const TypeIcon = typeIcons[insight.insight_type as keyof typeof typeIcons] || Target;
          const priorityStyle = priorityConfig[insight.priority];
          const PriorityIcon = priorityStyle.icon;

          return (
            <Card key={insight.id || index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{insight.title}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {insight.insight_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityIcon className="h-4 w-4" />
                  <Badge 
                    variant={priorityStyle.color as any}
                    className="capitalize"
                  >
                    {insight.priority}
                  </Badge>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{insight.description}</p>

              {insight.actionable_recommendations && insight.actionable_recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {insight.actionable_recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};