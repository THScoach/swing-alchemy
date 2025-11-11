import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, MapPin, Plus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingModal } from "@/components/BookingModal";

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchSessions();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: members } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (members && members.length > 0) {
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', members[0].organization_id)
          .order('start_time', { ascending: true });
        
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', user.id);
      
      if (players && players.length > 0) {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*')
          .eq('player_id', players[0].id)
          .order('scheduled_at', { ascending: true });
        
        setSessions(sessionsData || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  return (
    <AppLayout>
      <BookingModal 
        open={bookingModalOpen} 
        onOpenChange={setBookingModalOpen}
        sessionType="4b-evaluation"
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Your training schedule and events</p>
          </div>
          <Button onClick={() => setBookingModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </div>

        <div className="grid gap-4">
          {/* Booked Sessions */}
          {sessions.map((session) => {
            const scheduledAt = new Date(session.scheduled_at);
            const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            
            return (
              <Card key={session.id} className="border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{session.session_type}</CardTitle>
                        <CardDescription>
                          {dateStr} at {timeStr}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={session.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {session.payment_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {session.location && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {session.location}
                    </p>
                  )}
                  {session.notes && (
                    <p className="text-sm">{session.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Team Events */}
          {events.length === 0 && sessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No events scheduled yet</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const startTime = new Date(event.start_time);
              const dateStr = startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
              const timeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {event.zoom_link ? (
                          <Video className="h-5 w-5 text-primary" />
                        ) : (
                          <MapPin className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            {dateStr} at {timeStr}
                          </CardDescription>
                        </div>
                      </div>
                      {event.is_recurring && (
                        <Badge variant="secondary">Recurring</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.zoom_link && (
                      <Button className="w-full" asChild>
                        <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Join Zoom Meeting
                        </a>
                      </Button>
                    )}
                    {event.location && !event.zoom_link && (
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm mt-2">{event.description}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
