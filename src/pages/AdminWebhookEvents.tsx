import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebhookEvent {
  id: string;
  event_id: string;
  event_type: string;
  processed_at: string;
  created_at: string;
}

export default function AdminWebhookEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("webhook_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading webhook events:", error);
      toast({
        title: "Error loading events",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeBadge = (type: string) => {
    if (type.includes("checkout")) return <Badge variant="default">Checkout</Badge>;
    if (type.includes("payment")) return <Badge variant="outline">Payment</Badge>;
    if (type.includes("subscription")) return <Badge>Subscription</Badge>;
    return <Badge variant="secondary">{type}</Badge>;
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Webhook Events</h1>
            <p className="text-muted-foreground">
              Monitor Stripe webhook processing and idempotency
            </p>
          </div>
          <Button onClick={loadEvents} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Events</CardTitle>
            <CardDescription>
              Last 100 processed events with idempotency tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No webhook events processed yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Processed At</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">
                          {event.event_id.substring(0, 20)}...
                        </TableCell>
                        <TableCell>{getEventTypeBadge(event.event_type)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(event.processed_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(event.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Webhook Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Events:</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Event:</span>
                <span className="font-medium">
                  {events.length > 0 ? formatDate(events[0].created_at) : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idempotency:</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
