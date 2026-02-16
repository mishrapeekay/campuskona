import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
    fetchEvents,
    createEvent
} from '../../store/slices/communicationSlice';
import { fetchClasses } from '../../store/slices/academicsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/ui/primitives/dialog';
import { Label } from '@/ui/primitives/label';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Plus,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Loader2,
    Clock,
    Tag
} from 'lucide-react';
import showToast from '../../utils/toast';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const SchoolCalendar = () => {
    const dispatch = useDispatch();
    const { events } = useSelector((state) => state.communication);
    const { classes } = useSelector((state) => state.academics);
    const { user } = useSelector((state) => state.auth);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'OTHER',
        start_date: '',
        end_date: '',
        location: '',
        participants: [],
        is_public: true
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchEvents());
        if (canCreateEvent) {
            dispatch(fetchClasses());
        }
    }, [dispatch]);

    const canCreateEvent = ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(user?.role);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'participants') {
            const options = e.target.selectedOptions;
            const values = [];
            for (let i = 0; i < options.length; i++) {
                values.push(options[i].value);
            }
            setFormData(prev => ({ ...prev, participants: values }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await dispatch(createEvent(formData)).unwrap();
            setIsCreateModalOpen(false);
            setFormData({
                title: '',
                description: '',
                event_type: 'OTHER',
                start_date: '',
                end_date: '',
                location: '',
                participants: [],
                is_public: true
            });
            showToast.success('Event created successfully!');
            dispatch(fetchEvents());
        } catch (error) {
            showToast.error('Failed to create event: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = 'hsl(var(--primary))';
        let className = 'border-0 rounded-md shadow-sm';

        switch (event.resource?.event_type) {
            case 'HOLIDAY': backgroundColor = '#ef4444'; break; // destructive
            case 'EXAM': backgroundColor = '#f59e0b'; break;    // amber/warning
            case 'SPORTS': backgroundColor = '#10b981'; break;  // emerald/success
            case 'MEETING': backgroundColor = '#8b5cf6'; break; // violet
            case 'ACADEMIC': backgroundColor = '#3b82f6'; break;// blue
            default: backgroundColor = '#6b7280'; break;        // gray
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.8rem',
                padding: '2px 4px'
            },
            className
        };
    };

    const calendarEvents = (events.data || []).map(evt => ({
        id: evt.id,
        title: evt.title,
        start: new Date(evt.start_date),
        end: new Date(evt.end_date),
        resource: evt
    }));

    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource);
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 h-full">
                <PageHeader
                    title="School Calendar"
                    description="Schedule and upcoming events"
                    action={
                        canCreateEvent && (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Event
                            </Button>
                        )
                    }
                />

                <Card className="h-[calc(100vh-200px)] min-h-[600px]">
                    <CardContent className="h-full p-6">
                        {events.loading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading calendar data...</p>
                            </div>
                        ) : (
                            <div className="h-full w-full calendar-custom">
                                <Calendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: '100%' }}
                                    eventPropGetter={eventStyleGetter}
                                    onSelectEvent={handleSelectEvent}
                                    views={['month', 'week', 'day', 'agenda']}
                                    defaultView="month"
                                    className="text-sm font-sans"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Event Details Modal */}
                <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedEvent?.title}
                                <Badge variant="outline" className="text-xs">
                                    {selectedEvent?.event_type}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                <div className="space-y-3 mt-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {selectedEvent && format(new Date(selectedEvent.start_date), 'PPP p')}
                                            </p>
                                            <p className="text-muted-foreground">to</p>
                                            <p className="font-medium text-foreground">
                                                {selectedEvent && format(new Date(selectedEvent.end_date), 'PPP p')}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedEvent?.location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>{selectedEvent.location}</span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <p className="text-muted-foreground max-h-[150px] overflow-y-auto">
                                            {selectedEvent?.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {selectedEvent?.participants && selectedEvent.participants.length > 0 && (
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                {selectedEvent.participants.length} Participants
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Event Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>
                                Schedule a new event on the school calendar.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Principals Meeting"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="event_type">Event Type</Label>
                                    <select
                                        id="event_type"
                                        name="event_type"
                                        value={formData.event_type}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="ACADEMIC">Academic</option>
                                        <option value="HOLIDAY">Holiday</option>
                                        <option value="EXAM">Exam</option>
                                        <option value="SPORTS">Sports</option>
                                        <option value="MEETING">Meeting</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Auditorum"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Time</Label>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="datetime-local"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Time</Label>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Add details about the event..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Participants (Optional)</Label>
                                <select
                                    name="participants"
                                    multiple
                                    value={formData.participants}
                                    onChange={handleInputChange}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {classes?.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                <p className="text-[0.8rem] text-muted-foreground">Hold Ctrl/Cmd to select multiple classes</p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="is_public" className="font-normal cursor-pointer">
                                    Public Event (Visible to all)
                                </Label>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        'Create Event'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default SchoolCalendar;
