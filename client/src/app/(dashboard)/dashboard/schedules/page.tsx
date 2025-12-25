'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  Loader2,
  Play,
  Pause,
  Trash2,
  Clock,
  Mail,
  MessageCircle,
  Send,
  MoreVertical,
  PlayCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { scheduleApi } from '@/lib/api';
import type { Schedule, Platform, Recipient } from '@/types';

export default function SchedulesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: scheduleApi.getAll,
  });

  const schedules = data?.schedules || [];

  const toggleMutation = useMutation({
    mutationFn: scheduleApi.toggle,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: () => {
      toast.error('Failed to toggle schedule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: scheduleApi.delete,
    onSuccess: () => {
      toast.success('Schedule deleted');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: () => {
      toast.error('Failed to delete schedule');
    },
  });

  const testMutation = useMutation({
    mutationFn: scheduleApi.test,
    onSuccess: () => {
      toast.success('Test message sent!');
    },
    onError: () => {
      toast.error('Failed to send test message');
    },
  });

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

  const formatDays = (days?: string[]) => {
    if (!days || days.length === 0) return '-';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      return 'Weekdays';
    }
    return days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">
            Manage your scheduled messages
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedules/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Link>
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No schedules yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first scheduled message
            </p>
            <Button asChild>
              <Link href="/dashboard/schedules/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Schedules ({schedules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const platform = schedule.platformId as Platform;
                  const recipients = schedule.recipients as Recipient[];
                  return (
                    <TableRow key={schedule._id}>
                      <TableCell>
                        <Switch
                          checked={schedule.isEnabled}
                          onCheckedChange={() => toggleMutation.mutate(schedule._id)}
                          disabled={toggleMutation.isPending}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {schedule.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          {getPlatformIcon(platform?.platform || '')}
                          <span className="capitalize">{platform?.platform}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.scheduleType === 'recurring' ? 'default' : 'outline'}>
                          {schedule.scheduleType === 'recurring' ? (
                            <Clock className="mr-1 h-3 w-3" />
                          ) : null}
                          {schedule.scheduleType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {schedule.scheduleType === 'recurring' ? (
                          <span className="text-sm">
                            {schedule.time} - {formatDays(schedule.days)}
                          </span>
                        ) : (
                          <span className="text-sm">
                            {schedule.scheduledAt
                              ? new Date(schedule.scheduledAt).toLocaleString()
                              : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {recipients?.length || 0} recipient(s)
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => testMutation.mutate(schedule._id)}
                              disabled={testMutation.isPending}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Send Test
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleMutation.mutate(schedule._id)}
                            >
                              {schedule.isEnabled ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this schedule?')) {
                                  deleteMutation.mutate(schedule._id);
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
