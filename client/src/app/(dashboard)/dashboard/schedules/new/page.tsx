'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { scheduleApi, platformApi, recipientApi, templateApi } from '@/lib/api';

const DAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export default function NewSchedulePage() {
  const router = useRouter();
  const [scheduleType, setScheduleType] = useState<'once' | 'recurring'>('recurring');
  const [formData, setFormData] = useState({
    name: '',
    platformId: '',
    recipients: [] as string[],
    message: '',
    scheduledAt: '',
    time: '09:00',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  });

  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: platformApi.getAll,
  });

  const { data: recipientsData } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => recipientApi.getAll(),
  });

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: templateApi.getAll,
  });

  const platforms = (platformsData?.platforms || []).filter((p) => p.isVerified);
  const allRecipients = recipientsData?.recipients || [];
  const templates = templatesData?.templates || [];

  // Filter recipients by selected platform
  const filteredRecipients = allRecipients.filter((r) => {
    const platformId = typeof r.platformId === 'string' ? r.platformId : r.platformId?.id;
    return platformId === formData.platformId;
  });

  const createMutation = useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
      toast.success('Schedule created!');
      router.push('/dashboard/schedules');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create schedule');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      platformId: formData.platformId,
      recipients: formData.recipients,
      message: formData.message,
      scheduleType,
      scheduledAt: scheduleType === 'once' ? formData.scheduledAt : undefined,
      time: scheduleType === 'recurring' ? formData.time : undefined,
      days: scheduleType === 'recurring' ? formData.days : undefined,
    });
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const toggleRecipient = (recipientId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(recipientId)
        ? prev.recipients.filter((r) => r !== recipientId)
        : [...prev.recipients, recipientId],
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      case 'telegram':
        return <Send className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/schedules">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Schedule</h1>
          <p className="text-muted-foreground">
            Set up a new scheduled message
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Name your schedule and select the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  placeholder="Daily Morning Message"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platformId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platformId: value, recipients: [] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id || ''}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform.platform)}
                          <span className="capitalize">{platform.platform}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Type */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Type</CardTitle>
              <CardDescription>
                Choose when to send the message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as 'once' | 'recurring')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="once">One Time</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring</TabsTrigger>
                </TabsList>
                <TabsContent value="once" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledAt: e.target.value })
                      }
                      required={scheduleType === 'once'}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="recurring" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required={scheduleType === 'recurring'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          size="sm"
                          variant={formData.days.includes(day.value) ? 'default' : 'outline'}
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>
              Select who will receive this message
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!formData.platformId ? (
              <p className="text-sm text-muted-foreground">
                Please select a platform first
              </p>
            ) : filteredRecipients.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  No recipients for this platform
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/recipients">Add Recipients</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredRecipients.map((recipient) => (
                  <Button
                    key={recipient._id}
                    type="button"
                    size="sm"
                    variant={formData.recipients.includes(recipient._id) ? 'default' : 'outline'}
                    onClick={() => toggleRecipient(recipient._id)}
                  >
                    {recipient.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>
              Write your message or use a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label>Use Template (Optional)</Label>
                <Select
                  onValueChange={(templateId) => {
                    const template = templates.find((t) => t._id === templateId);
                    if (template) {
                      setFormData({ ...formData, message: template.message });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/schedules">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={
              createMutation.isPending ||
              !formData.name ||
              !formData.platformId ||
              formData.recipients.length === 0 ||
              !formData.message
            }
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Schedule
          </Button>
        </div>
      </form>
    </div>
  );
}
