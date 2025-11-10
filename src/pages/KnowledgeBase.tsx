import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Video, FileText, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const categories = ["Brain", "Body", "Bat", "Ball"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  const content = [
    {
      id: 1,
      title: "Understanding Exit Velocity",
      type: "article",
      category: "Bat",
      level: "Beginner",
      description: "Learn the fundamentals of exit velocity and how to improve it"
    },
    {
      id: 2,
      title: "Mental Approach at the Plate",
      type: "video",
      category: "Brain",
      level: "Intermediate",
      description: "Coach Rick discusses pre-at-bat routines and mental preparation"
    },
    {
      id: 3,
      title: "Kinetic Sequence Breakdown",
      type: "pdf",
      category: "Body",
      level: "Advanced",
      description: "Deep dive into optimal energy transfer through the swing"
    }
  ];

  const handleAskCoachRick = async () => {
    // TODO: Call knowledge-search edge function
    setAiResponse("Coach Rick AI response will appear here...");
  };

  return (
    <AppLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">Your complete hitting education library</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, videos, drills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                {cat}
              </Badge>
            ))}
            {levels.map((level) => (
              <Badge key={level} variant="secondary" className="cursor-pointer">
                {level}
              </Badge>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid gap-4">
            {content.map((item) => (
              <Card key={item.id} className="hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === "video" && <Video className="h-5 w-5 text-primary" />}
                      {item.type === "article" && <BookOpen className="h-5 w-5 text-primary" />}
                      {item.type === "pdf" && <FileText className="h-5 w-5 text-primary" />}
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <Badge>{item.category}</Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{item.level}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coach Rick AI Panel (1 column) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">CR</span>
                </div>
                Ask Coach Rick AI
              </CardTitle>
              <CardDescription>Get instant answers from the knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ask a question about hitting mechanics, drills, or game preparation..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAskCoachRick} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Ask Coach Rick
              </Button>

              {aiResponse && (
                <ScrollArea className="h-[300px] rounded border p-4">
                  <div className="prose prose-sm dark:prose-invert">
                    <p>{aiResponse}</p>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
