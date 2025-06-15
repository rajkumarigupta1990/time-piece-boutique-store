
import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
  formatPrice: (price: number) => string;
}

const CartItem = ({ item, onUpdateQuantity, onRemove, formatPrice }: CartItemProps) => {
  const moq = item.moq || 1;

  return (
    <div className="flex items-center space-x-4 border-b pb-4">
      <img
        src={item.images[0]}
        alt={item.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <h4 className="font-medium text-sm">{item.name}</h4>
        <p className="text-luxury-gold font-semibold">{formatPrice(item.price)}</p>
        {moq > 1 && (
          <p className="text-xs text-blue-600">MOQ: {moq}</p>
        )}
        <div className="flex items-center space-x-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, item.quantity - moq)}
            className="h-8 w-8"
            disabled={item.quantity <= moq}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, item.quantity + moq)}
            className="h-8 w-8"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-700"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CartItem;
