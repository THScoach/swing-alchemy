import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Copy, Archive, Video, CheckCircle, XCircle } from "lucide-react";
import { DrillEditor } from "@/components/drill/DrillEditor";
import type { Drill } from "@/lib/drillPrescription";
import { format } from "date-fns";

export default function AdminDrills() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [drillToArchive, setDrillToArchive] = useState<Drill | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDrills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [drills, searchQuery, categoryFilter, priorityFilter]);

  const loadDrills = async () => {
    try {
      const query: any = supabase.from('drills');
      const result: any = await query
        .select('*')
        .eq('archived', false)
        .order('updated_at', { ascending: false });
      
      const data = result.data;
      const error = result.error;

      if (error) {
        toast({
          title: "Error loading drills",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setDrills(data as Drill[]);
      }
    } catch (err: any) {
      toast({
        title: "Error loading drills",
        description: err.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...drills];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(drill =>
        drill.title.toLowerCase().includes(query) ||
        drill.description?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(drill => drill.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(drill => drill.priority_level === priorityFilter);
    }

    setFilteredDrills(filtered);
  };

  const handleEdit = (drill: Drill) => {
    setEditingDrill(drill);
    setShowEditor(true);
  };

  const handleDuplicate = async (drill: Drill) => {
    const duplicate = {
      ...drill,
      id: undefined,
      title: `${drill.title} (Copy)`,
    };
    setEditingDrill(duplicate as Drill);
    setShowEditor(true);
  };

  const handleArchive = (drill: Drill) => {
    setDrillToArchive(drill);
    setArchiveDialogOpen(true);
  };

  const confirmArchive = async () => {
    if (!drillToArchive) return;

    const { error } = await supabase
      .from('drills')
      .update({ archived: true } as any)
      .eq('id', drillToArchive.id);

    if (error) {
      toast({
        title: "Error archiving drill",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Drill archived",
        description: "The drill has been archived and will no longer appear in recommendations.",
      });
      loadDrills();
    }

    setArchiveDialogOpen(false);
    setDrillToArchive(null);
  };

  const handleSave = async () => {
    await loadDrills();
    setShowEditor(false);
    setEditingDrill(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'very_high': return 'bg-red-500/10 text-red-500';
      case 'high': return 'bg-orange-500/10 text-orange-500';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500';
      case 'low': return 'bg-green-500/10 text-green-500';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'anchor': return 'bg-blue-500/10 text-blue-500';
      case 'stability': return 'bg-purple-500/10 text-purple-500';
      case 'whip': return 'bg-pink-500/10 text-pink-500';
      case 'multi': return 'bg-brand-gold/10 text-brand-gold';
      default: return '';
    }
  };

  if (showEditor) {
    return (
      <AppLayout>
        <DrillEditor
          drill={editingDrill}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingDrill(null);
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-gold">Drill Library Management</h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage training drills for the 4B System
            </p>
          </div>
          <Button onClick={() => setShowEditor(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New Drill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>Find and filter drills in your library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="anchor">Anchor</SelectItem>
                  <SelectItem value="stability">Stability</SelectItem>
                  <SelectItem value="whip">Whip</SelectItem>
                  <SelectItem value="multi">Multi-Pillar</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Drills ({filteredDrills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
              </div>
            ) : filteredDrills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drills found. Try adjusting your filters or create a new drill.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrills.map((drill) => (
                    <TableRow key={drill.id}>
                      <TableCell className="font-medium">{drill.title}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(drill.category)}>
                          {drill.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {drill.priority_level && (
                          <Badge className={getPriorityColor(drill.priority_level)}>
                            {drill.priority_level.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {drill.targets?.slice(0, 3).map((target) => (
                            <Badge key={target} variant="outline" className="text-xs">
                              {target}
                            </Badge>
                          ))}
                          {drill.targets && drill.targets.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{drill.targets.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {drill.video_url ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {drill.updated_at ? format(new Date(drill.updated_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(drill)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(drill)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(drill)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this drill?</AlertDialogTitle>
              <AlertDialogDescription>
                This will hide the drill from future recommendations but keep past data intact.
                You can restore it later if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchive}>
                Archive Drill
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
