import Link from 'next/link';
import { Mail, MessageCircle, Send, Clock, Zap, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Message Scheduler</h1>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Schedule messages across{' '}
          <span className="text-primary">Email, WhatsApp, and Telegram</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Automate your messaging workflow. Send scheduled messages to your
          contacts across multiple platforms with a single dashboard.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Start for free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <h3 className="text-center text-2xl font-bold">
            Everything you need to automate messaging
          </h3>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Flexible Scheduling"
              description="Schedule messages for specific times, dates, or recurring patterns using cron expressions."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Multi-Platform"
              description="Connect Email, WhatsApp, and Telegram. Send messages from a single unified dashboard."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Reliable"
              description="Your credentials are encrypted. Messages are delivered reliably with retry mechanisms."
            />
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20">
          <h3 className="text-center text-2xl font-bold">
            Supported Platforms
          </h3>
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <PlatformBadge
              icon={<Mail className="h-6 w-6" />}
              name="Email"
              description="Send via SMTP"
            />
            <PlatformBadge
              icon={<MessageCircle className="h-6 w-6" />}
              name="WhatsApp"
              description="QR code pairing"
            />
            <PlatformBadge
              icon={<Send className="h-6 w-6" />}
              name="Telegram"
              description="Bot integration"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Message Scheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h4 className="mb-2 font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PlatformBadge({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-6 py-4">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
