import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Video, MapPin, Plus } from "lucide-react";

export default function Calendar() {
  const events = [
    {
      id: 1,
      title: "Monday Zoom - Weekly Review",
      date: "2025-11-11",
      time: "6:00 PM EST",
      type: "zoom",
      link: "https://zoom.us/j/example",
      recurring: true
    },
    {
      id: 2,
      title: "Team Practice",
      date: "2025-11-13",
      time: "4:00 PM EST",
      type: "facility",
      location: "Main Training Facility"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Your training schedule and events</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {event.type === "zoom" ? (
                        <Video className="h-5 w-5 text-primary" />
                      ) : (
                        <MapPin className="h-5 w-5 text-primary" />
                      )}
                      {event.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {event.date} at {event.time}
                    </CardDescription>
                  </div>
                  {event.recurring && (
                    <Badge variant="secondary">Recurring</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {event.type === "zoom" && event.link && (
                  <Button asChild>
                    <a href={event.link} target="_blank" rel="noopener noreferrer">
                      Join Zoom Meeting
                    </a>
                  </Button>
                )}
                {event.type === "facility" && event.location && (
                  <p className="text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {event.location}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
