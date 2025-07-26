import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, FileText, BarChart3, Calendar, Target, TrendingUp } from "lucide-react";

export const Dashboard = () => {
  // Mock data for demonstration
  const recentEssays = [
    {
      id: 1,
      title: "Why Stanford Essay",
      college: "Stanford University",
      score: 85,
      status: "analyzed",
      date: "2 days ago",
      feedback: "Strong mission alignment, consider adding more personal experiences"
    },
    {
      id: 2,
      title: "MIT Personal Statement",
      college: "MIT",
      score: 72,
      status: "analyzed",
      date: "1 week ago",
      feedback: "Good technical focus, needs more values demonstration"
    },
    {
      id: 3,
      title: "Harvard Supplement",
      college: "Harvard University",
      score: 0,
      status: "pending",
      date: "Processing...",
      feedback: "Analysis in progress"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const getStatusBadge = (status: string) => {
    if (status === "analyzed") return <Badge variant="secondary">Analyzed</Badge>;
    if (status === "pending") return <Badge variant="outline">Processing</Badge>;
    return <Badge variant="destructive">Error</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your essay analyses and improve your college applications
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/upload">
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last analysis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colleges Targeted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Across 6 different states
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Essays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Essays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEssays.map((essay) => (
              <div
                key={essay.id}
                className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{essay.title}</h3>
                    {getStatusBadge(essay.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Target: {essay.college}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {essay.feedback}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {essay.score > 0 && (
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full ${getScoreColor(essay.score)} flex items-center justify-center text-white font-bold`}>
                        {essay.score}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Score</p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">{essay.date}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {essay.status === "analyzed" && (
                        <Button variant="ghost" size="sm">
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {recentEssays.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No essays yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first essay to get started with AI analysis
              </p>
              <Button variant="default" asChild>
                <Link to="/upload">Upload Essay</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};