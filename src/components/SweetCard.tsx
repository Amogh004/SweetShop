import React, { useState } from 'react';
import { Sweet } from '../types/sweet';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ShoppingCart, Package, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { sweetApi } from '../api/sweetApi';
import { toast } from '../hooks/use-toast';

interface SweetCardProps {
  sweet: Sweet;
  onUpdate?: () => void;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (id: string) => void;
}

export const SweetCard: React.FC<SweetCardProps> = ({ 
  sweet, 
  onUpdate, 
  onEdit, 
  onDelete 
}) => {
  const { user } = useAuth();
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user || purchaseQuantity <= 0 || purchaseQuantity > sweet.quantity) return;
    
    setIsLoading(true);
    try {
      await sweetApi.purchaseSweet(sweet.id, { quantity: purchaseQuantity });
      toast({
        title: "Purchase successful!",
        description: `${purchaseQuantity} ${sweet.name}(s) purchased.`,
      });
      setPurchaseQuantity(1);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Failed to purchase sweet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = () => {
    if (sweet.quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (sweet.quantity <= 10) return { label: 'Low Stock', variant: 'destructive' as const };
    return { label: 'In Stock', variant: 'success' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="group hover:shadow-sweet transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{sweet.name}</CardTitle>
          {user?.role === 'admin' && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(sweet)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(sweet.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{sweet.category}</Badge>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {sweet.description && (
          <p className="text-sm text-muted-foreground mb-3">{sweet.description}</p>
        )}
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-primary">${sweet.price.toFixed(2)}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span className="text-sm">{sweet.quantity} left</span>
          </div>
        </div>

        {sweet.quantity > 0 && (
          <div className="space-y-2">
            <Label htmlFor={`quantity-${sweet.id}`} className="text-sm">
              Quantity to purchase
            </Label>
            <div className="flex gap-2">
              <Input
                id={`quantity-${sweet.id}`}
                type="number"
                min="1"
                max={sweet.quantity}
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={handlePurchase}
                disabled={isLoading || purchaseQuantity <= 0 || purchaseQuantity > sweet.quantity}
                className="gap-2"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {sweet.quantity === 0 && (
        <CardFooter className="pt-0">
          <div className="w-full flex items-center justify-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Currently out of stock</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};