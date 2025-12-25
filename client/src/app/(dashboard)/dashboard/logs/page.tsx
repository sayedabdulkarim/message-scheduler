'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  History,
  CheckCircle,
  XCircle,
  Mail,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { logApi } from '@/lib/api';
import type { Log, Schedule } from '@/types';

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    platform: 'all',
  });

  const { data: statsData } = useQuery({
    queryKey: ['logStats'],
    queryFn: logApi.getStats,
  });

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['logs', page, filters],
    queryFn: () =>
      logApi.getAll({
        page,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : undefined,
        platform: filters.platform !== 'all' ? filters.platform : undefined,
      }),
  });

  const stats = statsData?.stats;
  const logs = logsData?.logs || [];
  const pagination = logsData?.pagination;

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
      <div>
        <h1 className="text-2xl font-bold">Message Logs</h1>
        <p className="text-muted-foreground">
          View your message delivery history
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalSent}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.totalFailed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sent Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Message History</CardTitle>
            <div className="flex gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) => {
                  setFilters({ ...filters, status: value });
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.platform}
                onValueChange={(value) => {
                  setFilters({ ...filters, platform: value });
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Message logs will appear here once you start sending scheduled messages
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const schedule = log.scheduleId as Schedule;
                    return (
                      <TableRow key={log._id}>
                        <TableCell>
                          {log.status === 'sent' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {schedule?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            {getPlatformIcon(log.platform)}
                            <span className="capitalize">{log.platform}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.recipientIdentifier}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.sentAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.error ? (
                            <span className="text-red-600">{log.error}</span>
                          ) : (
                            <span className="text-muted-foreground">{log.message}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
