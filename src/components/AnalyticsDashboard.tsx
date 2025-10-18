import { Card } from "@/components/ui/card";
import { Users, MessageSquare, Calendar, TrendingUp, Clock, Hash, Smile } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsDashboardProps {
  data: any;
  sentimentData?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const SENTIMENT_COLORS = {
  positive: "hsl(var(--success))",
  neutral: "hsl(var(--warning))",
  negative: "hsl(var(--destructive))",
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const AnalyticsDashboard = ({ data, sentimentData }: AnalyticsDashboardProps) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const hourChartData = data.timeAnalysis.hourCounts.map((count: number, hour: number) => ({
    hour: `${hour}:00`,
    messages: count,
  }));

  const dayChartData = data.timeAnalysis.dayOfWeekCounts.map((count: number, day: number) => ({
    day: dayNames[day],
    messages: count,
  }));

  const userChartData = data.topUsers.slice(0, 5).map(([user, count]: [string, number]) => ({
    user: user.length > 15 ? user.substring(0, 15) + '...' : user,
    messages: count,
  }));

  const sentimentChartData = sentimentData ? [
    { name: 'Positive', value: sentimentData.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentimentData.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentimentData.negative, color: SENTIMENT_COLORS.negative },
  ] : [];

  return (
    <section className="container mx-auto px-4 py-12 space-y-8 animate-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Analysis Results</h2>
        <p className="text-muted-foreground">
          {data.dateRange.start.toLocaleDateString()} - {data.dateRange.end.toLocaleDateString()}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{data.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{data.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Clock className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Active Hour</p>
              <p className="text-2xl font-bold">{data.timeAnalysis.mostActiveHour}:00</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Active Day</p>
              <p className="text-2xl font-bold">{dayNames[data.timeAnalysis.mostActiveDay].slice(0, 3)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sentiment Analysis */}
      {sentimentData && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sentiment Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-sm text-muted-foreground mb-1">Positive</p>
              <p className="text-2xl font-bold text-success">{sentimentData.positive}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <p className="text-sm text-muted-foreground mb-1">Neutral</p>
              <p className="text-2xl font-bold text-warning">{sentimentData.neutral}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-sm text-muted-foreground mb-1">Negative</p>
              <p className="text-2xl font-bold text-destructive">{sentimentData.negative}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* User Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Top Active Users
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="user" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} 
            />
            <Bar dataKey="messages" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Time Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Activity by Hour
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="messages" stroke={CHART_COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activity by Day
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="messages" fill={CHART_COLORS[2]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Word & Emoji Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Most Used Words
          </h3>
          <div className="space-y-3">
            {data.topWords.slice(0, 10).map(([word, count]: [string, number], index: number) => (
              <div key={word} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                  <span className="font-medium">{word}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / data.topWords[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" />
            Most Used Emojis
          </h3>
          <div className="space-y-3">
            {data.topEmojis.map(([emoji, count]: [string, number], index: number) => (
              <div key={emoji} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(count / data.topEmojis[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
