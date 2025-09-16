import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { EventData } from '@/types/qr-types';
import { Calendar, MapPin, Clock, User, Mail } from 'lucide-react';

interface EventFormProps {
  data: EventData;
  onChange: (data: EventData) => void;
}

export function EventForm({ data, onChange }: EventFormProps) {
  const generateCalendarEvent = (eventData: EventData): string => {
    // Generate iCal format for calendar events
    const formatDate = (dateString: string, allDay: boolean) => {
      const date = new Date(dateString);
      if (allDay) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
      }
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let ical = 'BEGIN:VCALENDAR\n';
    ical += 'VERSION:2.0\n';
    ical += 'PRODID:-//QRCraft Studio//QR Event//EN\n';
    ical += 'BEGIN:VEVENT\n';
    ical += `UID:${Date.now()}@qrcraft.studio\n`;
    ical += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
    
    if (eventData.title) {
      ical += `SUMMARY:${eventData.title}\n`;
    }
    
    if (eventData.description) {
      ical += `DESCRIPTION:${eventData.description.replace(/\n/g, '\\n')}\n`;
    }
    
    if (eventData.location) {
      ical += `LOCATION:${eventData.location}\n`;
    }
    
    if (eventData.start_date) {
      const dtstart = formatDate(eventData.start_date, eventData.all_day);
      ical += `DTSTART${eventData.all_day ? ';VALUE=DATE' : ''}:${dtstart}\n`;
    }
    
    if (eventData.end_date) {
      const dtend = formatDate(eventData.end_date, eventData.all_day);
      ical += `DTEND${eventData.all_day ? ';VALUE=DATE' : ''}:${dtend}\n`;
    }
    
    if (eventData.organizer_name && eventData.organizer_email) {
      ical += `ORGANIZER;CN=${eventData.organizer_name}:mailto:${eventData.organizer_email}\n`;
    }
    
    ical += 'END:VEVENT\n';
    ical += 'END:VCALENDAR';
    
    return ical;
  };

  const handleChange = (field: keyof EventData, value: any) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  React.useEffect(() => {
    // Update the QR content when event data changes
    if (data.title && data.start_date) {
      const calendarString = generateCalendarEvent(data);
      console.log('Calendar Event QR String:', calendarString);
    }
  }, [data]);

  return (
    <Card className="card-elevated space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Calendar Event</h3>
          <p className="text-sm text-muted-foreground">Create an event that can be added to calendars</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Annual Company Meeting"
            className="input-elevated"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed description of the event..."
            className="input-elevated min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <Input
              id="location"
              value={data.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Conference Room A, Main Office"
              className="input-elevated pl-10"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="all_day">All Day Event</Label>
            <p className="text-xs text-muted-foreground">
              Enable if this event lasts the entire day
            </p>
          </div>
          <Switch
            id="all_day"
            checked={data.all_day}
            onCheckedChange={(checked) => handleChange('all_day', checked)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start {data.all_day ? 'Date' : 'Date & Time'} *</Label>
            <div className="relative">
              <Input
                id="start_date"
                type={data.all_day ? "date" : "datetime-local"}
                value={data.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="input-elevated pl-10"
              />
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End {data.all_day ? 'Date' : 'Date & Time'}</Label>
            <div className="relative">
              <Input
                id="end_date"
                type={data.all_day ? "date" : "datetime-local"}
                value={data.end_date || ''}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="input-elevated pl-10"
              />
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organizer_name">Organizer Name</Label>
            <div className="relative">
              <Input
                id="organizer_name"
                value={data.organizer_name || ''}
                onChange={(e) => handleChange('organizer_name', e.target.value)}
                placeholder="John Doe"
                className="input-elevated pl-10"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer_email">Organizer Email</Label>
            <div className="relative">
              <Input
                id="organizer_email"
                type="email"
                value={data.organizer_email || ''}
                onChange={(e) => handleChange('organizer_email', e.target.value)}
                placeholder="organizer@example.com"
                className="input-elevated pl-10"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-foreground">How it works:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Scan to add event directly to calendar app</li>
          <li>• Compatible with Google Calendar, Apple Calendar, Outlook</li>
          <li>• Includes automatic reminders and notifications</li>
          <li>• All event details are embedded in the QR code</li>
        </ul>
      </div>
    </Card>
  );
}