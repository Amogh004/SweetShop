import React, { useState } from 'react';
import { Sweet, CreateSweetRequest, UpdateSweetRequest } from '../types/sweet';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Package, RefreshCw, Settings } from 'lucide-react';
import { sweetApi } from '../api/sweetApi';
import { toast } from '../hooks/use-toast';

interface AdminPanelProps {
  onUpdate: () => void;
  selectedSweet?: Sweet | null;
  onClearSelection?: () => void;
}

const categories = ['Chocolate', 'Gummies', 'Hard Candy', 'Pastries', 'Fudge', 'Specialty'];

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onUpdate, 
  selectedSweet, 
  onClearSelection 
}) => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateSweetRequest>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    description: ''
  });

  const [editForm, setEditForm] = useState<UpdateSweetRequest>({
    id: '',
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    description: ''
  });

  const [restockQuantity, setRestockQuantity] = useState(0);

  // Update edit form when selectedSweet changes
  React.useEffect(() => {
    if (selectedSweet) {
      setEditForm({
        id: selectedSweet.id,
        name: selectedSweet.name,
        category: selectedSweet.category,
        price: selectedSweet.price,
        quantity: selectedSweet.quantity,
        description: selectedSweet.description || ''
      });
      setIsEditOpen(true);
    }
  }, [selectedSweet]);

  if (user?.role !== 'admin') return null;

  const handleCreate = async () => {
    if (!createForm.name || !createForm.category || createForm.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sweetApi.createSweet(createForm);
      toast({
        title: "Sweet created!",
        description: `${createForm.name} has been added to the inventory.`,
      });
      setCreateForm({ name: '', category: '', price: 0, quantity: 0, description: '' });
      setIsCreateOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Failed to create sweet",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm.name || !editForm.category || editForm.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sweetApi.updateSweet(editForm);
      toast({
        title: "Sweet updated!",
        description: `${editForm.name} has been updated.`,
      });
      setIsEditOpen(false);
      onClearSelection?.();
      onUpdate();
    } catch (error) {
      toast({
        title: "Failed to update sweet",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedSweet || restockQuantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity to restock.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sweetApi.restockSweet(selectedSweet.id, { quantity: restockQuantity });
      toast({
        title: "Restock successful!",
        description: `Added ${restockQuantity} units to ${selectedSweet.name}.`,
      });
      setRestockQuantity(0);
      setIsRestockOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Restock failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sweetId: string) => {
    if (!confirm('Are you sure you want to delete this sweet? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await sweetApi.deleteSweet(sweetId);
      toast({
        title: "Sweet deleted",
        description: "The sweet has been removed from inventory.",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Failed to delete sweet",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 bg-gradient-secondary border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Admin Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {/* Create Sweet Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Sweet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Sweet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Sweet name"
                  />
                </div>
                <div>
                  <Label htmlFor="create-category">Category</Label>
                  <Select value={createForm.category} onValueChange={(value) => setCreateForm({ ...createForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="create-price">Price ($)</Label>
                    <Input
                      id="create-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={createForm.price}
                      onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-quantity">Quantity</Label>
                    <Input
                      id="create-quantity"
                      type="number"
                      min="0"
                      value={createForm.quantity}
                      onChange={(e) => setCreateForm({ ...createForm, quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <Button 
                  onClick={handleCreate} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creating...' : 'Create Sweet'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Sweet Dialog */}
          <Dialog open={isEditOpen} onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) onClearSelection?.();
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Sweet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-quantity">Quantity</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleEdit} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Updating...' : 'Update Sweet'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(editForm.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Restock Dialog */}
          {selectedSweet && (
            <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  Restock
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Restock {selectedSweet.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="restock-quantity">Add Quantity</Label>
                    <Input
                      id="restock-quantity"
                      type="number"
                      min="1"
                      value={restockQuantity}
                      onChange={(e) => setRestockQuantity(Number(e.target.value))}
                      placeholder="Quantity to add"
                    />
                  </div>
                  <Button 
                    onClick={handleRestock} 
                    disabled={isLoading || restockQuantity <= 0}
                    className="w-full"
                  >
                    {isLoading ? 'Restocking...' : 'Add to Stock'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};