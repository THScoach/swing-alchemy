import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Note = {
  id: string;
  title: string | null;
  body: string;
  source: string | null;
  source_url: string | null;
  content_type: string | null;
  topic: string | null;
  subtopics: string[] | null;
  level_tags: string[] | null;
  tags: string[] | null;
  created_at: string;
};

export default function AdminNotebook() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    source: "Manual",
    source_url: "",
    content_type: "Note",
    topic: "Brain",
    subtopics: "",
    level_tags: "",
    tags: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchNotes();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterNotes();
  }, [searchQuery, filterTopic, notes]);

  const checkAdminAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    setLoading(false);
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setNotes(data || []);
  };

  const filterNotes = () => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (filterTopic !== "all") {
      filtered = filtered.filter((note) => note.topic === filterTopic);
    }

    setFilteredNotes(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const noteData = {
      title: formData.title || null,
      body: formData.body,
      source: formData.source as any,
      source_url: formData.source_url || null,
      content_type: formData.content_type as any,
      topic: formData.topic as any,
      subtopics: formData.subtopics
        ? formData.subtopics.split(",").map((s) => s.trim())
        : null,
      level_tags: formData.level_tags
        ? (formData.level_tags.split(",").map((s) => s.trim()) as any)
        : null,
      tags: formData.tags
        ? formData.tags.split(",").map((s) => s.trim())
        : null,
    };

    if (editingNote) {
      const { error } = await supabase
        .from("notes")
        .update(noteData)
        .eq("id", editingNote.id);

      if (error) {
        toast({
          title: "Error updating note",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Note updated successfully" });
    } else {
      const { error } = await supabase.from("notes").insert(noteData);

      if (error) {
        toast({
          title: "Error creating note",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Note created successfully" });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchNotes();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || "",
      body: note.body,
      source: note.source || "Manual",
      source_url: note.source_url || "",
      content_type: note.content_type || "Note",
      topic: note.topic || "Brain",
      subtopics: note.subtopics?.join(", ") || "",
      level_tags: note.level_tags?.join(", ") || "",
      tags: note.tags?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Note deleted successfully" });
    fetchNotes();
  };

  const resetForm = () => {
    setEditingNote(null);
    setFormData({
      title: "",
      body: "",
      source: "Manual",
      source_url: "",
      content_type: "Note",
      topic: "Brain",
      subtopics: "",
      level_tags: "",
      tags: "",
    });
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
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="h-8 w-8" />
                Coach Rick's Notebook
              </h1>
              <p className="text-muted-foreground">
                Knowledge base for AI-powered coaching recommendations
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? "Edit Note" : "Add New Note"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (optional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Impulse Control Drills for HS Players"
                    />
                  </div>

                  <div>
                    <Label htmlFor="body">Content *</Label>
                    <Textarea
                      id="body"
                      value={formData.body}
                      onChange={(e) =>
                        setFormData({ ...formData, body: e.target.value })
                      }
                      placeholder="Enter note content, lesson transcript, or drill instructions..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) =>
                          setFormData({ ...formData, source: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manual">Manual Entry</SelectItem>
                          <SelectItem value="Membership.io">
                            Membership.io
                          </SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="Upload">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="content_type">Content Type</Label>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, content_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Note">Note</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="Course">Course</SelectItem>
                          <SelectItem value="Drill">Drill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="source_url">Source URL (optional)</Label>
                    <Input
                      id="source_url"
                      type="url"
                      value={formData.source_url}
                      onChange={(e) =>
                        setFormData({ ...formData, source_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                      value={formData.topic}
                      onValueChange={(value) =>
                        setFormData({ ...formData, topic: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brain">🧠 Brain</SelectItem>
                        <SelectItem value="Body">💪 Body</SelectItem>
                        <SelectItem value="Bat">⚾ Bat</SelectItem>
                        <SelectItem value="Ball">🎯 Ball</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subtopics">
                      Subtopics (comma-separated)
                    </Label>
                    <Input
                      id="subtopics"
                      value={formData.subtopics}
                      onChange={(e) =>
                        setFormData({ ...formData, subtopics: e.target.value })
                      }
                      placeholder="e.g., Impulse Control, Pitch Recognition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="level_tags">
                      Level Tags (comma-separated)
                    </Label>
                    <Input
                      id="level_tags"
                      value={formData.level_tags}
                      onChange={(e) =>
                        setFormData({ ...formData, level_tags: e.target.value })
                      }
                      placeholder="e.g., Youth (10-13), HS (14-18)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">General Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="e.g., drills, fundamentals, advanced"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingNote ? "Update" : "Create"} Note
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes, tags, content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="Brain">🧠 Brain</SelectItem>
                  <SelectItem value="Body">💪 Body</SelectItem>
                  <SelectItem value="Bat">⚾ Bat</SelectItem>
                  <SelectItem value="Ball">🎯 Ball</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {notes.length === 0
                          ? "No notes yet. Add your first note to start building the knowledge base."
                          : "No notes match your search."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">
                        {note.title || (
                          <span className="text-muted-foreground italic">
                            {note.body.substring(0, 50)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{note.topic}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{note.content_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {note.source}
                          {note.source_url && (
                            <a
                              href={note.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {note.tags?.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {note.tags && note.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(note.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {filteredNotes.length} of {notes.length} notes
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
