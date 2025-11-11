import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Video, FileText, BookOpen, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminContent() {
  const navigate = useNavigate();
  const content = [
    {
      id: 1,
      title: "Exit Velocity Fundamentals",
      type: "video",
      category: "Bat",
      level: "Beginner",
      views: 234
    },
    {
      id: 2,
      title: "Mental Approach Guide",
      type: "article",
      category: "Brain",
      level: "All Levels",
      views: 189
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/admin")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">Upload drills, lessons, and knowledge base materials</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="drills">Drills</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {content.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          {item.type === "video" && <Video className="h-5 w-5 text-primary" />}
                          {item.type === "article" && <FileText className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <CardTitle>{item.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {item.views} views
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{item.category}</Badge>
                        <Badge variant="secondary">{item.level}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Publish</Button>
                      <Button variant="outline" size="sm">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
