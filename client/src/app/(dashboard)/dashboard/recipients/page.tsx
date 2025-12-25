'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Users, Mail, MessageCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { recipientApi, platformApi } from '@/lib/api';
import type { Recipient, Platform } from '@/types';

export default function RecipientsPage() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [formData, setFormData] = useState({
    platformId: '',
    name: '',
    identifier: '',
  });

  const { data: recipientsData, isLoading } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => recipientApi.getAll(),
  });

  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: platformApi.getAll,
  });

  const recipients = recipientsData?.recipients || [];
  const platforms = (platformsData?.platforms || []).filter((p) => p.isVerified);

  const createMutation = useMutation({
    mutationFn: recipientApi.create,
    onSuccess: () => {
      toast.success('Recipient added');
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      handleCloseDialog();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add recipient');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; identifier: string } }) =>
      recipientApi.update(id, data),
    onSuccess: () => {
      toast.success('Recipient updated');
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      handleCloseDialog();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update recipient');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: recipientApi.delete,
    onSuccess: () => {
      toast.success('Recipient deleted');
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
    onError: () => {
      toast.error('Failed to delete recipient');
    },
  });

  const handleOpenDialog = (recipient?: Recipient) => {
    if (recipient) {
      setEditingRecipient(recipient);
      setFormData({
        platformId: typeof recipient.platformId === 'string' ? recipient.platformId : recipient.platformId.id || '',
        name: recipient.name,
        identifier: recipient.identifier,
      });
    } else {
      setEditingRecipient(null);
      setFormData({ platformId: '', name: '', identifier: '' });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRecipient(null);
    setFormData({ platformId: '', name: '', identifier: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecipient) {
      updateMutation.mutate({
        id: editingRecipient._id,
        data: { name: formData.name, identifier: formData.identifier },
      });
    } else {
      createMutation.mutate(formData);
    }
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

  const getIdentifierLabel = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    switch (platform?.platform) {
      case 'email':
        return 'Email Address';
      case 'whatsapp':
        return 'Phone Number';
      case 'telegram':
        return 'Username or Chat ID';
      default:
        return 'Identifier';
    }
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
          <h1 className="text-2xl font-bold">Recipients</h1>
          <p className="text-muted-foreground">
            Manage your message recipients for each platform
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipient
        </Button>
      </div>

      {recipients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No recipients yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add recipients to start sending scheduled messages
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Recipients ({recipients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient) => {
                  const platform = typeof recipient.platformId === 'object' ? recipient.platformId : null;
                  return (
                    <TableRow key={recipient._id}>
                      <TableCell className="font-medium">{recipient.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          {platform && getPlatformIcon(platform.platform)}
                          <span className="capitalize">{platform?.platform || 'Unknown'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {recipient.identifier}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(recipient.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(recipient)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this recipient?')) {
                                deleteMutation.mutate(recipient._id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRecipient ? 'Edit Recipient' : 'Add Recipient'}
            </DialogTitle>
            <DialogDescription>
              {editingRecipient
                ? 'Update the recipient details'
                : 'Add a new recipient to send messages to'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {!editingRecipient && (
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={formData.platformId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, platformId: value })
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
              )}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{getIdentifierLabel(formData.platformId)}</Label>
                <Input
                  placeholder={
                    formData.platformId
                      ? getIdentifierLabel(formData.platformId)
                      : 'Select a platform first'
                  }
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRecipient ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
