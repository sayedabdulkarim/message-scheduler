'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, FileText, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { templateApi } from '@/lib/api';
import type { Template } from '@/types';

const CATEGORIES = [
  { value: 'greeting', label: 'Greeting' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'notification', label: 'Notification' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'custom', label: 'Custom' },
];

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    message: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: templateApi.getAll,
  });

  const templates = data?.templates || [];
  const systemTemplates = templates.filter((t) => t.isSystem);
  const userTemplates = templates.filter((t) => !t.isSystem);

  const createMutation = useMutation({
    mutationFn: templateApi.create,
    onSuccess: () => {
      toast.success('Template created');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      handleCloseDialog();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; category?: string; message?: string } }) =>
      templateApi.update(id, data),
    onSuccess: () => {
      toast.success('Template updated');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      handleCloseDialog();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: templateApi.delete,
    onSuccess: () => {
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const handleOpenDialog = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        category: template.category,
        message: template.message,
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', category: 'custom', message: '' });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTemplate(null);
    setFormData({ name: '', category: 'custom', message: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate._id, data: formData });
    } else {
      createMutation.mutate(formData);
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
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage message templates
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* User Templates */}
      <Card>
        <CardHeader>
          <CardTitle>My Templates ({userTemplates.length})</CardTitle>
          <CardDescription>Your custom message templates</CardDescription>
        </CardHeader>
        <CardContent>
          {userTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create templates to reuse messages across schedules
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onEdit={() => handleOpenDialog(template)}
                  onDelete={() => {
                    if (confirm('Are you sure you want to delete this template?')) {
                      deleteMutation.mutate(template._id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Templates */}
      {systemTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              System Templates ({systemTemplates.length})
            </CardTitle>
            <CardDescription>
              Pre-built templates you can use (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {systemTemplates.map((template) => (
                <TemplateCard key={template._id} template={template} isSystem />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Update your template'
                : 'Create a reusable message template'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="Morning Greeting"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message template here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={8}
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
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  isSystem?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function TemplateCard({ template, isSystem, onEdit, onDelete }: TemplateCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium">{template.name}</h4>
          <Badge variant="secondary" className="text-xs mt-1">
            {template.category}
          </Badge>
        </div>
        {!isSystem && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">
        {template.message}
      </p>
    </div>
  );
}
