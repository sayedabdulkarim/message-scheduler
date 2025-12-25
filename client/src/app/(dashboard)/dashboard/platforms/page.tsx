'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  QrCode,
  Unplug,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { platformApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Platform } from '@/types';

export default function PlatformsPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [whatsappQr, setWhatsappQr] = useState<string | null>(null);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [showTelegramDialog, setShowTelegramDialog] = useState(false);
  const [telegramCode, setTelegramCode] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['platforms'],
    queryFn: platformApi.getAll,
  });

  const platforms = data?.platforms || [];

  const emailPlatform = platforms.find((p) => p.platform === 'email');
  const whatsappPlatform = platforms.find((p) => p.platform === 'whatsapp');
  const telegramPlatform = platforms.find((p) => p.platform === 'telegram');

  // Socket connection for WhatsApp QR
  useEffect(() => {
    if (!accessToken) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token: accessToken },
    });

    newSocket.on('connect', () => {
      // Join user room
      newSocket.emit('join', accessToken);
    });

    newSocket.on('whatsapp:qr', ({ qr }) => {
      setWhatsappQr(qr);
    });

    newSocket.on('whatsapp:ready', () => {
      setWhatsappQr(null);
      setShowWhatsappDialog(false);
      toast.success('WhatsApp connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    });

    newSocket.on('whatsapp:disconnected', () => {
      toast.info('WhatsApp disconnected');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken, queryClient]);

  const connectWhatsApp = useMutation({
    mutationFn: platformApi.connectWhatsApp,
    onSuccess: () => {
      setShowWhatsappDialog(true);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to connect WhatsApp');
    },
  });

  const disconnectWhatsApp = useMutation({
    mutationFn: platformApi.disconnectWhatsApp,
    onSuccess: () => {
      toast.success('WhatsApp disconnected');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
    onError: () => {
      toast.error('Failed to disconnect WhatsApp');
    },
  });

  const verifyTelegram = useMutation({
    mutationFn: platformApi.verifyTelegram,
    onSuccess: () => {
      setShowTelegramDialog(false);
      setTelegramCode('');
      toast.success('Telegram verified successfully!');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to verify Telegram');
    },
  });

  const disconnectTelegram = useMutation({
    mutationFn: platformApi.disconnectTelegram,
    onSuccess: () => {
      toast.success('Telegram disconnected');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
    onError: () => {
      toast.error('Failed to disconnect Telegram');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platforms</h1>
        <p className="text-muted-foreground">
          Connect your messaging platforms to start scheduling messages
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Email Platform */}
        <PlatformCard
          icon={Mail}
          name="Email"
          description="Send emails via SMTP. Auto-connected with your account email."
          isConnected={emailPlatform?.isVerified || false}
          identifier={emailPlatform?.data?.email}
          onConnect={() => {}}
          onDisconnect={() => {}}
          disabled
        />

        {/* WhatsApp Platform */}
        <PlatformCard
          icon={MessageCircle}
          name="WhatsApp"
          description="Connect via QR code to send WhatsApp messages."
          isConnected={whatsappPlatform?.isVerified || false}
          identifier={whatsappPlatform?.data?.phoneNumber}
          onConnect={() => connectWhatsApp.mutate()}
          onDisconnect={() => disconnectWhatsApp.mutate()}
          isLoading={connectWhatsApp.isPending || disconnectWhatsApp.isPending}
        />

        {/* Telegram Platform */}
        <PlatformCard
          icon={Send}
          name="Telegram"
          description="Connect via Telegram bot to send messages."
          isConnected={telegramPlatform?.isVerified || false}
          identifier={telegramPlatform?.data?.username}
          onConnect={() => setShowTelegramDialog(true)}
          onDisconnect={() => disconnectTelegram.mutate()}
          isLoading={disconnectTelegram.isPending}
        />
      </div>

      {/* WhatsApp QR Dialog */}
      <Dialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp</DialogTitle>
            <DialogDescription>
              Scan this QR code with your WhatsApp mobile app
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            {whatsappQr ? (
              <img src={whatsappQr} alt="WhatsApp QR Code" className="h-64 w-64" />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              </div>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device
          </p>
        </DialogContent>
      </Dialog>

      {/* Telegram Verification Dialog */}
      <Dialog open={showTelegramDialog} onOpenChange={setShowTelegramDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Telegram</DialogTitle>
            <DialogDescription>
              Follow these steps to connect your Telegram account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 1:</p>
              <p className="text-sm text-muted-foreground">
                Open Telegram and search for our bot: <code className="bg-muted px-1 rounded">@YourBotUsername</code>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 2:</p>
              <p className="text-sm text-muted-foreground">
                Send <code className="bg-muted px-1 rounded">/start</code> to the bot
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 3:</p>
              <p className="text-sm text-muted-foreground">
                The bot will send you a verification code. Enter it below:
              </p>
              <Input
                placeholder="Enter verification code"
                value={telegramCode}
                onChange={(e) => setTelegramCode(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={() => verifyTelegram.mutate(telegramCode)}
            disabled={!telegramCode || verifyTelegram.isPending}
          >
            {verifyTelegram.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Verify
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PlatformCardProps {
  icon: React.ElementType;
  name: string;
  description: string;
  isConnected: boolean;
  identifier?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

function PlatformCard({
  icon: Icon,
  name,
  description,
  isConnected,
  identifier,
  onConnect,
  onDisconnect,
  isLoading,
  disabled,
}: PlatformCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-3">
            {identifier && (
              <p className="text-sm text-muted-foreground">
                Connected: <span className="font-medium text-foreground">{identifier}</span>
              </p>
            )}
            {!disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="mr-2 h-4 w-4" />
                )}
                Disconnect
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isLoading || disabled}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            Connect {name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
