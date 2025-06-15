
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Package } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  const moq = product.moq || 1;

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.original_price && (
            <Badge className="absolute top-3 left-3 bg-luxury-gold text-navy-deep">
              Save ₹{(product.original_price - product.price).toLocaleString('en-IN')}
            </Badge>
          )}
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              Out of Stock
            </Badge>
          )}
          {moq > 1 && (
            <Badge className="absolute bottom-3 left-3 bg-blue-600 text-white">
              <Package className="w-3 h-3 mr-1" />
              MOQ: {moq}
            </Badge>
          )}
        </div>
        
        <div className="p-6">
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <h3 className="text-lg font-semibold text-navy-deep group-hover:text-luxury-gold transition-colors">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) 
                      ? 'text-luxury-gold fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              ({product.reviews})
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xl font-bold text-navy-deep">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.in_stock ? (moq > 1 ? `Add ${moq} to Cart` : 'Add to Cart') : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
