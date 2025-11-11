import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModelUploadWizard } from "@/components/ModelUploadWizard";
import { ModelDetailView } from "@/components/ModelDetailView";

interface ModelProfile {
  player_name: string;
  level: string;
  handedness: string;
  team?: string;
  height_inches?: number;
  weight_lbs?: number;
  swingCount: number;
  analyzedCount: number;
  swings: any[];
}

export default function AdminProSwings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proSwings, setProSwings] = useState<any[]>([]);
  const [modelProfiles, setModelProfiles] = useState<ModelProfile[]>([]);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [showModelDetail, setShowModelDetail] = useState(false);

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
    
    // Group by model profile
    const grouped = new Map<string, ModelProfile>();
    
    (data || []).forEach((swing) => {
      const key = `${swing.player_name}-${swing.level}-${swing.handedness}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          player_name: swing.player_name || swing.label,
          level: swing.level || 'Unknown',
          handedness: swing.handedness || 'R',
          team: swing.team,
          height_inches: swing.height_inches,
          weight_lbs: swing.weight_lbs,
          swingCount: 0,
          analyzedCount: 0,
          swings: [],
        });
      }
      
      const profile = grouped.get(key)!;
      profile.swingCount++;
      if (swing.has_analysis && swing.metrics_reboot) {
        profile.analyzedCount++;
      }
      profile.swings.push(swing);
    });
    
    setModelProfiles(Array.from(grouped.values()));
    setLoading(false);
  };


  const handleDelete = async (swingId: string) => {
    try {
      const { error } = await supabase
        .from('pro_swings')
        .delete()
        .eq('id', swingId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Swing removed from model.",
      });
      
      await loadProSwings();
      
      // Update selected model if open
      if (selectedModel) {
        const updatedModel = modelProfiles.find(
          m => m.player_name === selectedModel.player_name && 
               m.level === selectedModel.level && 
               m.handedness === selectedModel.handedness
        );
        setSelectedModel(updatedModel || null);
        if (!updatedModel) setShowModelDetail(false);
      }
    } catch (error) {
      console.error('Error deleting swing:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete swing.",
        variant: "destructive",
      });
    }
  };

  const existingModels = modelProfiles.map(m => ({
    player_name: m.player_name,
    level: m.level,
    handedness: m.handedness,
  }));

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
              <h1 className="text-3xl font-bold mb-2">Model Database</h1>
              <p className="text-muted-foreground">
                Structured model profiles with Reboot-style analysis
              </p>
            </div>
            <Button onClick={() => setShowUploadWizard(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Model Swing
            </Button>
          </div>

          {modelProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Model Profiles Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create model profiles with biomechanical analysis
                </p>
                <Button onClick={() => setShowUploadWizard(true)}>
                  Add First Model
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelProfiles.map((model, idx) => (
                <Card 
                  key={idx} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelDetail(true);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.player_name}</CardTitle>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {model.team && <Badge variant="secondary">{model.team}</Badge>}
                          <Badge>{model.level}</Badge>
                          <Badge variant="outline">
                            {model.handedness === 'L' ? 'Left' : 'Right'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(model.height_inches || model.weight_lbs) && (
                        <p className="text-sm text-muted-foreground">
                          {model.height_inches && `${Math.floor(model.height_inches / 12)}'${model.height_inches % 12}"`}
                          {model.height_inches && model.weight_lbs && ' • '}
                          {model.weight_lbs && `${model.weight_lbs} lbs`}
                        </p>
                      )}
                      
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Swings:</span>
                          <span className="font-semibold">{model.swingCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Analyzed:</span>
                          <Badge variant={model.analyzedCount > 0 ? "default" : "secondary"}>
                            {model.analyzedCount}
                          </Badge>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Model Upload Wizard */}
      <ModelUploadWizard
        open={showUploadWizard}
        onOpenChange={setShowUploadWizard}
        onComplete={loadProSwings}
        existingModels={existingModels}
      />

      {/* Model Detail View */}
      <ModelDetailView
        model={selectedModel}
        open={showModelDetail}
        onOpenChange={setShowModelDetail}
        onDelete={handleDelete}
      />

    </AppLayout>
  );
}
