import { Button } from "@/components/ui/button";
import { Upload, BarChart3, MessageSquare, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-analytics.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Analytics Dashboard" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Enterprise-Grade Analytics</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform WhatsApp Chats into
            <span className="block mt-2 gradient-primary bg-clip-text text-transparent">
              Business Intelligence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze customer conversations with AI-powered sentiment analysis, discover actionable insights, and make data-driven decisions to grow your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Analyzing
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
            >
              View Demo
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Sentiment Analysis</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
              <BarChart3 className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Deep Insights</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-success/50 transition-colors">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Actionable Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
    </section>
  );
};
