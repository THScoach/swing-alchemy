import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Upload, Target } from "lucide-react";

interface PlayerReport {
  player_name: string;
  player_email: string;
  player_id?: string;
  status: string;
  last_upload_at: string | null;
  uploads_count_last_30d: number;
  avg_overall_score: number | null;
  focus_area: string | null;
}

export default function TeamReports() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<PlayerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (teamId) {
      loadReports();
    }
  }, [teamId]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("team-reports", {
        body: { teamId },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setReports(data.reports || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({
        title: "Error loading reports",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getScoreBadge = (score: number | null) => {
    if (!score) return <Badge variant="outline">No data</Badge>;
    if (score >= 80) return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge variant="default">Good</Badge>;
    return <Badge variant="outline">Needs Work</Badge>;
  };

  const getActivityStatus = (lastUpload: string | null, uploadsCount: number) => {
    if (!lastUpload) return { color: "text-muted-foreground", text: "Inactive" };
    
    const daysSinceUpload = Math.floor(
      (Date.now() - new Date(lastUpload).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (uploadsCount >= 4) return { color: "text-green-500", text: "Very Active" };
    if (uploadsCount >= 2) return { color: "text-blue-500", text: "Active" };
    if (daysSinceUpload <= 7) return { color: "text-yellow-500", text: "Low Activity" };
    return { color: "text-orange-500", text: "Needs Attention" };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading team reports...</div>
        </div>
      </AppLayout>
    );
  }

  const filteredReports = statusFilter === "all" 
    ? reports 
    : reports.filter(r => r.status === statusFilter);
  
  const activeReports = reports.filter(r => r.status === "active");
  const invitedReports = reports.filter(r => r.status === "invited");

  const exportToCSV = () => {
    const headers = ["Player Name", "Email", "Status", "Last Upload", "30-day Uploads", "4B Score", "Focus Area"];
    const rows = filteredReports.map(r => [
      r.player_name,
      r.player_email,
      r.status,
      formatDate(r.last_upload_at),
      r.uploads_count_last_30d.toString(),
      r.avg_overall_score?.toFixed(0) || "—",
      r.focus_area || "—"
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "CSV exported",
      description: "Team reports downloaded successfully",
    });
  };

  // Calculate team stats
  const totalUploads = activeReports.reduce((sum, r) => sum + r.uploads_count_last_30d, 0);
  const avgScore = activeReports.length > 0
    ? activeReports.reduce((sum, r) => sum + (r.avg_overall_score || 0), 0) / activeReports.length
    : 0;
  const activeThisWeek = activeReports.filter(r => {
    if (!r.last_upload_at) return false;
    const daysSince = Math.floor((Date.now() - new Date(r.last_upload_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 7;
  }).length;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(`/coach/teams/${teamId}`)} className="mb-4">
          ← Back to Team
        </Button>

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Progress Reports</h1>
            <p className="text-muted-foreground">
              Track player activity and performance metrics
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Total Uploads
              </CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUploads}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {(totalUploads / Math.max(activeReports.length, 1)).toFixed(1)} avg per player
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Team Average
              </CardTitle>
              <CardDescription>Overall 4B Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgScore.toFixed(0)}</div>
              <div className="mt-2">
                {getScoreBadge(avgScore)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active This Week
              </CardTitle>
              <CardDescription>Players with uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeThisWeek}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {activeReports.length > 0 
                  ? `${Math.round((activeThisWeek / activeReports.length) * 100)}% engagement`
                  : "No active players"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Players Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Players</CardTitle>
            <CardDescription>
              Players who have joined and uploaded swings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active players yet. Send invites to get started!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Last Upload</TableHead>
                    <TableHead>Uploads (30d)</TableHead>
                    <TableHead>4B Score</TableHead>
                    <TableHead>Focus Area</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeReports.map((report, index) => {
                    const activityStatus = getActivityStatus(report.last_upload_at, report.uploads_count_last_30d);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{report.player_name}</div>
                            <div className="text-xs text-muted-foreground">{report.player_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={activityStatus.color}>{activityStatus.text}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(report.last_upload_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.uploads_count_last_30d}</Badge>
                        </TableCell>
                        <TableCell>
                          {report.avg_overall_score 
                            ? <Badge variant="default">{report.avg_overall_score.toFixed(0)}</Badge>
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.focus_area || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Invited Players */}
        {invitedReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Players who haven't joined yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitedReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell>{report.player_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Invited</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
