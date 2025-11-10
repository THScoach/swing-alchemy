import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Analyze() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = (method: "record" | "import") => {
    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "Upload Started",
        description: `${method === "record" ? "Recording" : "Import"} initiated successfully`,
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Analyze Swing</h1>
          <p className="text-muted-foreground">
            Upload or record a video to analyze your hitting mechanics
          </p>
        </div>

        {uploading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold mb-2">Processing Your Video...</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                We're analyzing your swing mechanics. This usually takes 30-60 seconds.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center">Record Now</CardTitle>
                <CardDescription className="text-center">
                  Use your device camera to record a new swing video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleUpload("record")} 
                  className="w-full"
                  size="lg"
                >
                  Start Recording
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted hover:border-muted-foreground/30 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 mx-auto">
                  <Upload className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-center">Import From Library</CardTitle>
                <CardDescription className="text-center">
                  Select an existing video from your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleUpload("import")} 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  Choose Video
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Record from the side view for optimal analysis</p>
                <p>• Ensure good lighting and clear visibility</p>
                <p>• Capture the full swing from load to follow-through</p>
                <p>• Keep the camera stable during recording</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
