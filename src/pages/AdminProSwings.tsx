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
  const [fpsConfirmed, setFpsConfirmed] = useState<number | null>(null);
  const [showFpsDialog, setShowFpsDialog] = useState(false);
  const [manualFps, setManualFps] = useState<string>("240");
  const [newSwing, setNewSwing] = useState({
    label: '',
    description: '',
    handedness: 'R',
    level: '',
    video_url: '',
    player_name: '',
    team: '',
    height_inches: '',
    weight_lbs: ''
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

    // Require FPS confirmation for model swings
    if (!fpsConfirmed) {
      setShowFpsDialog(true);
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
            const { data: proSwingData, error: insertError } = await supabase
              .from('pro_swings')
              .insert({
                label: `${newSwing.label}${filesToUpload.length > 1 ? ` (${i + 1})` : ''}`,
                description: newSwing.description,
                handedness: newSwing.handedness,
                level: newSwing.level,
                video_url: publicUrl,
                player_name: newSwing.player_name || newSwing.label,
                team: newSwing.team || null,
                height_inches: newSwing.height_inches ? Number(newSwing.height_inches) : null,
                weight_lbs: newSwing.weight_lbs ? Number(newSwing.weight_lbs) : null,
                is_model: true,
                fps: fpsConfirmed,
                fps_confirmed: true,
                organization_id: orgMember?.organization_id ?? null,
                created_by: user.id,
              })
              .select()
              .single();

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
        const { data: proSwingData, error: insertError } = await supabase
          .from('pro_swings')
          .insert({
            label: newSwing.label,
            description: newSwing.description,
            handedness: newSwing.handedness,
            level: newSwing.level,
            video_url: urlToUse,
            player_name: newSwing.player_name || newSwing.label,
            team: newSwing.team || null,
            height_inches: newSwing.height_inches ? Number(newSwing.height_inches) : null,
            weight_lbs: newSwing.weight_lbs ? Number(newSwing.weight_lbs) : null,
            is_model: true,
            fps: fpsConfirmed,
            fps_confirmed: true,
            organization_id: orgMember?.organization_id ?? null,
            created_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Pro Swing Added",
          description: "Model swing added to the library.",
        });
      }

      // Reset form
      setNewSwing({
        label: '',
        description: '',
        handedness: 'R',
        level: '',
        video_url: '',
        player_name: '',
        team: '',
        height_inches: '',
        weight_lbs: ''
      });
      setFiles([]);
      setFpsConfirmed(null);
      setManualFps("240");
      setShowUploadDialog(false);
      await loadProSwings();
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
                      <CardTitle className="text-lg">{swing.player_name || swing.label}</CardTitle>
                      {(swing.team || swing.level) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {swing.team && `${swing.team}`}
                          {swing.team && swing.level && ' • '}
                          {swing.level}
                        </p>
                      )}
                      {swing.description && (
                        <CardDescription className="mt-1">
                          {swing.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {swing.has_analysis && (
                        <Badge variant="secondary" className="mr-2">
                          Analyzed
                        </Badge>
                      )}
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
                    <div className="space-y-2">
                      {(swing.height_inches || swing.weight_lbs) && (
                        <p className="text-xs text-muted-foreground">
                          {swing.height_inches && `${Math.floor(swing.height_inches / 12)}'${swing.height_inches % 12}"`}
                          {swing.height_inches && swing.weight_lbs && ' • '}
                          {swing.weight_lbs && `${swing.weight_lbs} lbs`}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{swing.handedness === 'R' ? 'Right' : 'Left'} Handed</Badge>
                        {swing.level && <Badge variant="secondary">{swing.level}</Badge>}
                      </div>
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
              <Label htmlFor="player_name">Player Name *</Label>
              <Input
                id="player_name"
                placeholder="e.g., Freddie Freeman"
                value={newSwing.player_name}
                onChange={(e) => setNewSwing({ ...newSwing, player_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                placeholder="e.g., Dodgers"
                value={newSwing.team}
                onChange={(e) => setNewSwing({ ...newSwing, team: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  min={55}
                  max={82}
                  placeholder="e.g., 77"
                  value={newSwing.height_inches}
                  onChange={(e) => setNewSwing({ ...newSwing, height_inches: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={120}
                  max={280}
                  placeholder="e.g., 215"
                  value={newSwing.weight_lbs}
                  onChange={(e) => setNewSwing({ ...newSwing, weight_lbs: e.target.value })}
                />
              </div>
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
              <Label htmlFor="level">Level *</Label>
              <Select value={newSwing.level} onValueChange={(value) => setNewSwing({ ...newSwing, level: value })}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MLB">MLB</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="HS">High School</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSwing} disabled={uploading}>
              {uploading ? "Adding..." : fpsConfirmed ? "Add Pro Swing" : "Next: Confirm FPS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FPS Confirmation Dialog */}
      <Dialog open={showFpsDialog} onOpenChange={setShowFpsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Frame Rate</DialogTitle>
            <DialogDescription>
              Model/Pro swings require accurate FPS for Reboot-style biomechanical analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Frame Rate (FPS) *</Label>
              <p className="text-xs text-muted-foreground">
                Enter the confirmed frame rate for these videos. This is critical for accurate timing and kinematic calculations.
              </p>
              <Input
                type="number"
                min={30}
                max={480}
                placeholder="e.g., 240"
                value={manualFps}
                onChange={(e) => setManualFps(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[480, 300, 240, 120, 60, 30].map((fps) => (
                <Button
                  key={fps}
                  type="button"
                  variant={manualFps === String(fps) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setManualFps(String(fps))}
                >
                  {fps} fps
                </Button>
              ))}
            </div>

            {manualFps && Number(manualFps) < 120 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                ⚠️ For professional-grade Reboot analysis, ≥120 fps is recommended (ideally 240+ fps)
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFpsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const fps = Number(manualFps);
                if (fps && fps > 0) {
                  setFpsConfirmed(fps);
                  setShowFpsDialog(false);
                  toast({
                    title: "FPS Confirmed",
                    description: `Frame rate set to ${fps} fps. Ready to upload.`,
                  });
                } else {
                  toast({
                    title: "Invalid FPS",
                    description: "Please enter a valid frame rate.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Confirm & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
