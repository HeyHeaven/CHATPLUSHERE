import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-analytics.jpg";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Analytics Dashboard" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        </div>

        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">ChatSense AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Turn WhatsApp Conversations into
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
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform"
              >
                <Upload className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                View Demo
              </Button>
            </div>

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
      </section>

      {/* What It Does Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What ChatSense AI Does
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform raw WhatsApp conversations into structured, actionable business insights using advanced AI and machine learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sentiment Analysis</h3>
              <p className="text-muted-foreground">
                Understand customer emotions with AI-powered sentiment detection across all conversations
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Deep Analytics</h3>
              <p className="text-muted-foreground">
                Get comprehensive metrics on message patterns, user activity, and conversation trends
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Insights</h3>
              <p className="text-muted-foreground">
                Receive actionable recommendations to improve customer satisfaction and business performance
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock powerful insights from your WhatsApp conversations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Upload Chat</h3>
              <p className="text-muted-foreground text-center">
                Export your WhatsApp chat as a .txt file and upload it to ChatSense AI
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">AI Processing</h3>
              <p className="text-muted-foreground text-center">
                Our AI cleans and analyzes your data using advanced machine learning models
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success text-success-foreground flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Get Insights</h3>
              <p className="text-muted-foreground text-center">
                View comprehensive analytics and AI-powered business recommendations instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Safety Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Your Privacy, Our Priority
            </h2>
            <p className="text-xl text-muted-foreground">
              We take data security seriously. Your conversations are safe with us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">End-to-End Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    All data transfers are encrypted using industry-standard protocols
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">No Permanent Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Your chat data is processed temporarily and not stored on our servers
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">GDPR Compliant</h3>
                  <p className="text-sm text-muted-foreground">
                    We follow strict data protection regulations and privacy standards
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Secure Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    All analysis happens in isolated, secure environments
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-success mb-8">
            <div className="bg-background rounded-xl px-12 py-16">
              <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Conversations?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join businesses worldwide using ChatSense AI to unlock valuable insights from their customer conversations
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-semibold text-lg">ChatSense AI</p>
              <p className="text-sm text-muted-foreground">
                Transform conversations into intelligence
              </p>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2025 ChatSense AI. All rights reserved.</p>
              <p className="mt-1">Built with AI & powered by insights</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
