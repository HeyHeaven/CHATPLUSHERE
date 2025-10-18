import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CustomerProfile {
  id: string;
  customer_identifier: string;
  total_interactions: number;
  total_messages_sent: number;
  last_interaction_date: string;
  avg_sentiment_score: number;
  engagement_level: 'low' | 'medium' | 'high';
  key_topics: string[];
}

interface CustomerProfilesProps {
  profiles: CustomerProfile[];
}

const engagementColors = {
  high: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const CustomerProfiles = ({ profiles }: CustomerProfilesProps) => {
  if (!profiles || profiles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Customer Profiles Yet</h3>
        <p className="text-muted-foreground">
          Analyze more chats to build customer interaction profiles.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Customer Interaction Profiles</h2>
        <Badge variant="outline" className="ml-auto">
          {profiles.length} {profiles.length === 1 ? 'Profile' : 'Profiles'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => {
          const initials = profile.customer_identifier
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const sentimentLabel = 
            profile.avg_sentiment_score >= 60 ? 'Positive' :
            profile.avg_sentiment_score >= 40 ? 'Neutral' : 'Negative';

          return (
            <Card key={profile.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{profile.customer_identifier}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={engagementColors[profile.engagement_level]}
                    >
                      {profile.engagement_level} engagement
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{profile.total_messages_sent}</div>
                    <div className="text-xs text-muted-foreground">Messages</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{profile.total_interactions}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sentiment:</span>
                  <Badge variant="secondary">{sentimentLabel}</Badge>
                </div>
                
                {profile.last_interaction_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last seen: {format(new Date(profile.last_interaction_date), 'MMM d, yyyy')}</span>
                  </div>
                )}

                {profile.key_topics && profile.key_topics.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground mb-2">Key Topics:</div>
                    <div className="flex flex-wrap gap-1">
                      {profile.key_topics.slice(0, 3).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};