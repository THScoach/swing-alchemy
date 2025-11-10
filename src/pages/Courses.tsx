import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, PlayCircle } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Hitting Fundamentals",
    description: "Master the basics of a great swing",
    level: "Beginner",
    modules: 8,
    duration: 120,
    progress: 75,
  },
  {
    id: 2,
    title: "Advanced Bat Path",
    description: "Optimize your swing plane for power",
    level: "Advanced",
    modules: 12,
    duration: 180,
    progress: 0,
  },
  {
    id: 3,
    title: "Kinetic Sequence Mastery",
    description: "Perfect your body's chain of movement",
    level: "Intermediate",
    modules: 10,
    duration: 150,
    progress: 30,
  },
  {
    id: 4,
    title: "Launch Angle Science",
    description: "Understand and control your launch angle",
    level: "Intermediate",
    modules: 6,
    duration: 90,
    progress: 0,
  },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-success/10 text-success border-success/20";
    case "Intermediate":
      return "bg-primary/10 text-primary border-primary/20";
    case "Advanced":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Courses() {
  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Courses</h1>
          <p className="text-muted-foreground">
            Structured training programs to improve your hitting
          </p>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.modules} modules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} min</span>
                  </div>
                </div>

                {course.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                )}

                <Button className="w-full" variant={course.progress > 0 ? "default" : "outline"}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {course.progress > 0 ? "Continue Course" : "Start Course"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
