import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Play, 
  Lock, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  User, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch modules for this course
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', id)
        .order('module_number', { ascending: true });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This course doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/courses')}>
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const completedLessons = 0; // TODO: Get from progress tracking
  const totalLessons = modules.reduce((acc, module) => acc + (module.key_points?.length || 0), 0);
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Hero */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="h-24 w-24 text-primary/50" />
                  )}
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {course.level || 'General'}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_minutes || 0} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{modules.length} modules</span>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
                    <p className="text-lg text-muted-foreground">{course.description}</p>
                  </div>

                  {progressPercentage > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}

                  <Button size="lg" className="w-full md:w-auto">
                    <Play className="h-5 w-5 mr-2" />
                    {progressPercentage > 0 ? 'Continue Course' : 'Start Course'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {modules.length} modules • {totalLessons} lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modules.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {modules.map((module, index) => (
                      <AccordionItem 
                        key={module.id} 
                        value={`module-${index}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                              {module.module_number || index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {module.key_points?.length || 0} lessons • {module.duration_minutes || 0} min
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-11 pr-4 pb-2">
                            {module.content && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {module.content}
                              </p>
                            )}
                            <div className="space-y-2">
                              {module.key_points?.map((point: string, i: number) => (
                                <div 
                                  key={i}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                  <div className="flex-shrink-0">
                                    {Math.random() > 0.5 ? (
                                      <CheckCircle2 className="h-5 w-5 text-success" />
                                    ) : Math.random() > 0.5 ? (
                                      <Play className="h-5 w-5 text-primary" />
                                    ) : (
                                      <Lock className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{point}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {Math.floor(Math.random() * 10) + 3} min
                                    </p>
                                  </div>
                                </div>
                              )) || (
                                <p className="text-sm text-muted-foreground">
                                  Lessons coming soon
                                </p>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No modules available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Rick Strickland</h4>
                    <p className="text-sm text-muted-foreground">
                      Expert hitting coach with 20+ years of experience in player development and the 4B Framework.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Master the fundamentals of the 4B Framework</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Improve your swing mechanics and consistency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Understand kinematic sequences and power generation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Apply drills and exercises for immediate results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-20 h-14 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold line-clamp-1 mb-1">
                        Related Course {i}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 60) + 30} min
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
