import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Search, Target, Clock, Video, ChevronDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Drill, DrillCategory, DrillPriority } from "@/lib/drillPrescription";

export function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DrillCategory | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<DrillPriority | "all">("all");

  useEffect(() => {
    loadDrills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [drills, searchQuery, categoryFilter, priorityFilter]);

  const loadDrills = async () => {
    const { data } = await supabase
      .from('drills')
      .select('*')
      .order('priority_level', { ascending: true })
      .order('title', { ascending: true });

    if (data) {
      setDrills(data as Drill[]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...drills];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(drill =>
        drill.title.toLowerCase().includes(query) ||
        drill.description?.toLowerCase().includes(query) ||
        drill.targets?.some(t => t.includes(query)) ||
        drill.checklist_items_trained?.some(c => c.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(drill => drill.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(drill => drill.priority_level === priorityFilter);
    }

    setFilteredDrills(filtered);
  };

  const getPriorityColor = (priority: DrillPriority): string => {
    switch (priority) {
      case 'very_high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return '';
    }
  };

  const getCategoryColor = (category: DrillCategory): string => {
    switch (category) {
      case 'anchor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'stability': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'whip': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'multi': return 'bg-brand-gold/10 text-brand-gold border-brand-gold/20';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Loading drill library...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drill Library</CardTitle>
        <CardDescription>
          Browse all available drills organized by biomechanical categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drills, metrics, or checklist items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as DrillCategory | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
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

            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as DrillPriority | "all")}>
              <SelectTrigger className="w-[180px]">
                <Target className="h-4 w-4 mr-2" />
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
        </div>

        {/* Drill List */}
        <div className="space-y-4">
          {filteredDrills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drills match your search criteria. Try adjusting your filters.
            </div>
          ) : (
            filteredDrills.map((drill) => (
              <Collapsible key={drill.id}>
                <div className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{drill.title}</h4>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(drill.category)}>
                            {drill.category}
                          </Badge>
                          {drill.priority_level && (
                            <Badge className={getPriorityColor(drill.priority_level)}>
                              {drill.priority_level.replace('_', ' ')}
                            </Badge>
                          )}
                          {drill.difficulty && (
                            <Badge variant="outline">{drill.difficulty}</Badge>
                          )}
                        </div>
                        {drill.description && (
                          <p className="text-sm text-muted-foreground">
                            {drill.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {drill.duration_minutes && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{drill.duration_minutes}m</span>
                          </div>
                        )}
                        {drill.video_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(drill.video_url, '_blank');
                            }}
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-4">
                    {drill.simple_explanation && (
                      <div>
                        <h5 className="text-sm font-semibold mb-1">What This Drill Does:</h5>
                        <p className="text-sm text-foreground/80">{drill.simple_explanation}</p>
                      </div>
                    )}

                    {drill.coach_rick_says && (
                      <div className="p-3 bg-brand-gold/10 rounded border-l-2 border-brand-gold">
                        <p className="text-sm font-medium text-brand-gold">💡 Coach Rick Says:</p>
                        <p className="text-sm text-foreground/90 mt-1">{drill.coach_rick_says}</p>
                      </div>
                    )}

                    {drill.coaching_cues && drill.coaching_cues.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Coaching Cues:</h5>
                        <ul className="space-y-1">
                          {drill.coaching_cues.map((cue, i) => (
                            <li key={i} className="text-sm text-foreground/70 pl-4 list-disc">
                              {cue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {drill.progression && (
                      <div>
                        <h5 className="text-sm font-semibold mb-1">Progression:</h5>
                        <p className="text-sm text-foreground/70">{drill.progression}</p>
                      </div>
                    )}

                    {drill.targets && drill.targets.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Targets Checklist Items:</h5>
                        <div className="flex flex-wrap gap-1">
                          {drill.targets.map((target) => (
                            <Badge key={target} variant="outline" className="text-xs">
                              {target}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {drill.contraindications && drill.contraindications.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Note:</strong> {drill.contraindications.join(', ')}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>

        {filteredDrills.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing {filteredDrills.length} of {drills.length} drills
          </div>
        )}
      </CardContent>
    </Card>
  );
}
