'use client';

import { Mail, MessageCircle, Send, Calendar, Users, Clock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const { user, platforms } = useAuthStore();

  const platformIcons = {
    email: Mail,
    whatsapp: MessageCircle,
    telegram: Send,
  };

  const stats = [
    { label: 'Active Schedules', value: '0', icon: Calendar },
    { label: 'Recipients', value: '0', icon: Users },
    { label: 'Messages Sent', value: '0', icon: Mail },
    { label: 'Pending', value: '0', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your messaging dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connected Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            {platforms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  No platforms connected yet
                </p>
                <Button asChild>
                  <Link href="/dashboard/platforms">Connect Platform</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {platforms.map((p) => {
                  const Icon = platformIcons[p.platform];
                  return (
                    <div
                      key={p.platform}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium capitalize">
                          {p.platform}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Connected
                      </span>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/platforms">Manage Platforms</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/schedules/new">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Schedule
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/recipients">
                <Users className="mr-2 h-4 w-4" />
                Manage Recipients
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/templates">
                <Mail className="mr-2 h-4 w-4" />
                Create Template
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/logs">
                <Clock className="mr-2 h-4 w-4" />
                View Message History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
