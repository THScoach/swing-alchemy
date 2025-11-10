import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, ExternalLink, BookOpen, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoachRickAvatarProps {
  playerLevel?: string;
  currentTab?: "brain" | "body" | "bat" | "ball";
  weakMetrics?: string[];
  contextTip?: string;
}

interface KnowledgeItem {
  id: string;
  title: string | null;
  body: string;
  source_url: string | null;
  content_type: string | null;
  topic: string | null;
  tags: string[] | null;
}

export function CoachRickAvatar({
  playerLevel = "HS (14-18)",
  currentTab = "brain",
  weakMetrics = [],
  contextTip = "Let's work on improving your game!",
}: CoachRickAvatarProps) {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const topicMap = {
    brain: "Brain",
    body: "Body",
    bat: "Bat",
    ball: "Ball",
  };

  const fetchRecommendations = async (query?: string) => {
    setLoading(true);
    try {
      const searchQuery = query || weakMetrics.join(" ") || "fundamentals";
      
      const { data, error } = await supabase.functions.invoke(
        "knowledge-search",
        {
          body: {
            query: searchQuery,
            topic: topicMap[currentTab],
            level: playerLevel,
            limit: 3,
          },
        }
      );

      if (error) throw error;

      setRecommendations(data.results || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Could not fetch recommendations",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExplainScore = () => {
    fetchRecommendations(`${currentTab} fundamentals ${playerLevel}`);
  };

  const handleShowDrills = () => {
    fetchRecommendations(`${currentTab} drills ${playerLevel}`);
  };

  const handleCompareToPro = () => {
    fetchRecommendations(`${currentTab} pro techniques ${playerLevel}`);
  };

  const getTopicEmoji = (topic: string | null) => {
    switch (topic) {
      case "Brain":
        return "🧠";
      case "Body":
        return "💪";
      case "Bat":
        return "⚾";
      case "Ball":
        return "🎯";
      default:
        return "📝";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full h-16 w-16 shadow-lg z-50"
          onClick={() => fetchRecommendations()}
        >
          <Avatar className="h-14 w-14">
            <AvatarImage src="/placeholder.svg" alt="Coach Rick" />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              CR
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" alt="Coach Rick" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                CR
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl">Coach Rick</div>
              <div className="text-sm font-normal text-muted-foreground">
                Your AI Hitting Coach
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Contextual Tip */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    {getTopicEmoji(topicMap[currentTab])} {topicMap[currentTab]}{" "}
                    Insight
                  </h3>
                  <p className="text-sm text-muted-foreground">{contextTip}</p>
                  {weakMetrics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {weakMetrics.map((metric, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExplainScore}
                disabled={loading}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Explain My Score
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleShowDrills}
                disabled={loading}
              >
                <Video className="h-4 w-4 mr-2" />
                Show Me Drills
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCompareToPro}
                disabled={loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Compare to Pro
              </Button>
            </div>

            {/* Recommendations */}
            {loading ? (
              <Card className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-4">
                  Searching knowledge base...
                </p>
              </Card>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended for You
                </h3>
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {getTopicEmoji(rec.topic)}
                          </span>
                          <h4 className="font-semibold text-sm">
                            {rec.title || "Lesson"}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {rec.content_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {rec.body}
                        </p>
                        {rec.tags && rec.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rec.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {rec.source_url && (
                        <a
                          href={rec.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              Powered by Coach Rick's Knowledge Base
              <br />
              {playerLevel} · {topicMap[currentTab]} Focus
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
