import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Play, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminProSwings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proSwings, setProSwings] = useState<any[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newSwing, setNewSwing] = useState({
    label: '',
    description: '',
    handedness: 'R',
    level: '',
    video_url: ''
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      navigate("/feed");
      return;
    }

    setIsAdmin(true);
    loadProSwings();
  };

  const loadProSwings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pro_swings')
      .select('*')
      .order('created_at', { ascending: false });

    setProSwings(data || []);
    setLoading(false);
  };

  const handleUploadSwing = async () => {
    setUploadError(null);

    if (!newSwing.label) {
      toast({
        title: "Missing Label",
        description: "Please provide a label for this pro swing.",
        variant: "destructive",
      });
      return;
    }

    if (!newSwing.video_url && files.length === 0) {
      toast({
        title: "Video Required",
        description: "Add a video URL or upload video file(s).",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Get user's organization
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Handle multiple files or single URL
      const filesToUpload = files.length > 0 ? files : [];
      const urlToUse = !filesToUpload.length ? newSwing.video_url?.trim() : "";

      if (filesToUpload.length > 0) {
        // Upload multiple files
        let successCount = 0;
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          try {
            const ext = file.name.split('.').pop() || 'mp4';
            const path = `pro-swings/${user.id}/${Date.now()}-${newSwing.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')}-${i}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from('pro-swings')
              .upload(path, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('pro-swings')
              .getPublicUrl(path);

            // Create pro_swing row for each file
            const { error: insertError } = await supabase
              .from('pro_swings')
              .insert({
                label: `${newSwing.label}${filesToUpload.length > 1 ? ` (${i + 1})` : ''}`,
                description: newSwing.description,
                handedness: newSwing.handedness,
                level: newSwing.level,
                video_url: publicUrl,
                organization_id: orgMember?.organization_id ?? null,
                created_by: user.id,
              });

            if (!insertError) {
              successCount++;
            }
          } catch (err) {
            console.error('Error processing file:', err);
          }
        }

        if (successCount === 0) {
          throw new Error('Failed to upload any files');
        }

        toast({
          title: "Pro Swings Added",
          description: `Successfully added ${successCount} of ${filesToUpload.length} swing(s).`,
        });
      } else if (urlToUse) {
        // Single URL upload
        const { error: insertError } = await supabase
          .from('pro_swings')
          .insert({
            label: newSwing.label,
            description: newSwing.description,
            handedness: newSwing.handedness,
            level: newSwing.level,
            video_url: urlToUse,
            organization_id: orgMember?.organization_id ?? null,
            created_by: user.id,
          });

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Pro Swing Added",
          description: "Model swing added to the library.",
        });
      }

      // Keep label and other fields, just clear description, URL and files
      setNewSwing({
        ...newSwing,
        description: '',
        video_url: ''
      });
      setFiles([]);
      loadProSwings();
    } catch (error: any) {
      console.error('Error adding pro swing:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to add pro swing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pro_swings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Pro swing removed from library.",
      });
      loadProSwings();
    } catch (error) {
      console.error('Error deleting pro swing:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete pro swing.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pro Swing Library</h1>
              <p className="text-muted-foreground">Curated reference swings for comparison and analysis</p>
            </div>
            <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pro Swing
            </Button>
          </div>

          {proSwings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pro Swings Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add reference swings to use in comparisons and ghost overlays
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  Add First Pro Swing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proSwings.map((swing) => (
                <Card key={swing.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{swing.label}</CardTitle>
                        <CardDescription className="mt-1">
                          {swing.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(swing.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <video 
                      src={swing.video_url} 
                      controls 
                      className="w-full aspect-video bg-black rounded-lg mb-4"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{swing.handedness === 'R' ? 'Right' : 'Left'} Handed</Badge>
                      {swing.level && <Badge variant="secondary">{swing.level}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pro Swing</DialogTitle>
            <DialogDescription>
              Add a reference swing to the library for comparison
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Mike Trout - HR Swing"
                value={newSwing.label}
                onChange={(e) => setNewSwing({ ...newSwing, label: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this swing..."
                value={newSwing.description}
                onChange={(e) => setNewSwing({ ...newSwing, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                type="url"
                placeholder="https://..."
                value={newSwing.video_url}
                onChange={(e) => setNewSwing({ ...newSwing, video_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a public URL, <strong>or</strong> upload a file below.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_file">Or Upload Video File(s)</Label>
              <Input
                id="video_file"
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  setFiles(selectedFiles);
                  setUploadError(null);
                }}
              />
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {files.length} file(s) selected
                </p>
              )}
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Select multiple files to batch upload swings with the same label.
              </p>
            </div>

            <div>
              <Label htmlFor="handedness">Handedness</Label>
              <Select 
                value={newSwing.handedness} 
                onValueChange={(value) => setNewSwing({ ...newSwing, handedness: value })}
              >
                <SelectTrigger id="handedness">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R">Right Handed</SelectItem>
                  <SelectItem value="L">Left Handed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                placeholder="e.g., MLB, College, HS"
                value={newSwing.level}
                onChange={(e) => setNewSwing({ ...newSwing, level: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSwing} disabled={uploading}>
              {uploading ? "Adding..." : "Add Pro Swing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
