import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminBookings() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchSessions();
    }
  }, [isAdmin, filterType, filterStatus]);

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
    setLoading(false);
  };

  const fetchSessions = async () => {
    try {
      let query = supabase
        .from("sessions")
        .select(`
          *,
          players (
            id,
            name,
            profiles (name)
          )
        `)
        .order("scheduled_at", { ascending: true });

      if (filterType !== "all") {
        query = query.eq("session_type", filterType);
      }

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load bookings");
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;
      toast.success("Session status updated");
      fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session");
    }
  };

  const updatePaymentStatus = async (sessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ payment_status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;
      toast.success("Payment status updated");
      fetchSessions();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment");
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Session Bookings</h1>
              <p className="text-muted-foreground">Manage in-person and hybrid training sessions</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              ← Back to Admin
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-2 block">Session Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="4b-evaluation">4B Evaluation</SelectItem>
                      <SelectItem value="pod">Training Pod</SelectItem>
                      <SelectItem value="hybrid-addon">Hybrid Add-On</SelectItem>
                      <SelectItem value="nine-inning">Nine-Inning Intensive</SelectItem>
                      <SelectItem value="private-session">Private Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sessions found</p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => {
                const scheduledAt = new Date(session.scheduled_at);
                const dateStr = scheduledAt.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeStr = scheduledAt.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {session.players?.name || "Unknown Player"}
                          </CardTitle>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {dateStr}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {timeStr} ({session.duration_minutes} min)
                            </div>
                            {session.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {session.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs">
                            {session.session_type}
                          </Badge>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                            className="ml-2 text-xs"
                          >
                            {session.status}
                          </Badge>
                          <Badge
                            variant={
                              session.payment_status === "paid"
                                ? "default"
                                : session.payment_status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className="ml-2 text-xs"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            {session.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Select
                          value={session.status}
                          onValueChange={(value) => updateSessionStatus(session.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={session.payment_status}
                          onValueChange={(value) => updatePaymentStatus(session.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {session.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Notes:</p>
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )}

                      {session.add_ons && Object.keys(session.add_ons).length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Add-ons:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(session.add_ons).map(
                              ([key, value]) =>
                                value && (
                                  <Badge key={key} variant="outline" className="text-xs">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </Badge>
                                )
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
