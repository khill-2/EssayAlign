import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Upload as UploadIcon, FileText, Search, Zap, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabaseClient";

const ScoreItem = ({ label, score }: { label: string; score: number }) => {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className="p-4 rounded border bg-muted/30 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{score}</p>
    </div>
  );
};

export const Upload = () => {
  const [essay, setEssay] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [scores, setScores] = useState<{
    alignment: number;
    values: number;
    tone: number;
    improvement: number;
  } | null>(null);

  // Mock colleges data
  const popularColleges = [
    "Harvard University",
    "Stanford University",
    "MIT",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "University of Pennsylvania",
    "Duke University",
    "Northwestern University",
    "University of Chicago"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEssay(content);
        if (!title) {
          setTitle(file.name.replace('.txt', ''));
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
    }
  };

  // const handleAnalyze = async () => {
  //   if (!essay.trim() || !selectedCollege || !title.trim()) {
  //     toast({
  //       title: "Missing information",
  //       description: "Please fill in all fields before analyzing",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsAnalyzing(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsAnalyzing(false);
  //     toast({
  //       title: "Analysis complete!",
  //       description: "Your essay has been analyzed successfully",
  //     });
  //     navigate("/dashboard");
  //   }, 3000);
  // };


  const handleAnalyze = async () => {
    if (!essay.trim() || !selectedCollege || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before analyzing",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!user) {
      toast({
        title: "Please log in first",
        description: "You must be authenticated to submit essays.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      return;
    }

    try {
      // const res = await fetch("http://localhost:3001/analyze-essay", {
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/analyze-essay`, {
      const res = await fetch("https://essay-align.onrender.com", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay,
          title,
          email: user.email,
          user_id: user.id,
          college: {
            name: selectedCollege,
            mission: "The mission of this college will go here temporarily."
          }
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Analysis failed");

      setFeedback(json.feedback);
      setScores(json.scores);

      toast({
        title: "Analysis Complete!",
        description: "Your essay was successfully analyzed.",
      });

    } catch (err: any) {
      toast({
        title: "Error analyzing essay",
        description: err.message || "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const wordCount = essay.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Upload Your Essay</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your college essay and select your target college to get AI-powered insights and recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Essay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Essay Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Why Stanford Essay, Personal Statement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* College Selection */}
                <div className="space-y-2">
                  <Label htmlFor="college">Target College</Label>
                  <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or search for a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularColleges.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Don't see your college? We'll automatically find and analyze their information.
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UploadIcon className="h-4 w-4" />
                      .txt files only
                    </div>
                  </div>
                </div>

                {/* Essay Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="essay">Essay Text</Label>
                    <Badge variant="outline">{wordCount} words</Badge>
                  </div>
                  <Textarea
                    id="essay"
                    placeholder="Paste your essay here or upload a file above..."
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    className="min-h-[300px] resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 250-650 words for most college essays
                  </p>
                </div>

                {/* Analyze Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Zap className="h-5 w-5 animate-pulse" />
                      Analyzing Essay...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Analyze Essay
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {feedback && scores && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Essay Analysis Scorecard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ScoreItem label="Mission Alignment" score={scores.alignment} />
                    <ScoreItem label="Values Match" score={scores.values} />
                    <ScoreItem label="Tone & Voice" score={scores.tone} />
                    <ScoreItem label="Improvement Potential" score={scores.improvement} />
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium">Summary</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{feedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analysis Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Mission Alignment Score</p>
                    <p className="text-xs text-muted-foreground">How well your essay matches the college's mission</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Values Assessment</p>
                    <p className="text-xs text-muted-foreground">Analysis of how you demonstrate core values</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Improvement Suggestions</p>
                    <p className="text-xs text-muted-foreground">Specific recommendations to strengthen your essay</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Tone & Voice Analysis</p>
                    <p className="text-xs text-muted-foreground">Whether your writing style fits the college culture</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg text-accent">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• Include specific examples and personal stories</p>
                <p>• Research the college's recent initiatives and values</p>
                <p>• Show, don't tell - use concrete examples</p>
                <p>• Connect your experiences to future goals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
