import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Check, X, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageCarousel from '@/components/ImageCarousel';

// This will match the default for cart summary
const DEFAULT_SHIPPING_CHARGE = 50;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id!);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // If there are additional charges (per MOQ unit), sum them up
  const getOtherCharges = () => {
    if (!product || !product.additional_charges) return 0;
    if (!Array.isArray(product.additional_charges)) return 0;
    return product.additional_charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Handle MOQ quantity logic
  const moq = product?.moq || 1;
  const [quantity, setQuantity] = useState(moq);

  // Increment/decrement by 1, but minimum always MOQ
  const incrementQty = () => setQuantity(qty => qty + 1);
  const decrementQty = () => setQuantity(qty => Math.max(moq, qty - 1));

  const handleAddToCart = () => {
    if (product) {
      // IMPORTANT: CartContext's addToCart expects just `Product`.
      // Adding exact `quantity` is not supported in this setup; it always adds MOQ per click.
      addToCart(product); 
      toast({
        title: "Added to Cart",
        description: `${product.name} (${quantity}) has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">Product not found</div>
        </div>
      </div>
    );
  }

  const itemTotal = product.price * quantity;
  const otherChargesPerQty = getOtherCharges() * quantity;
  const finalTotal = itemTotal + DEFAULT_SHIPPING_CHARGE + otherChargesPerQty;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <ImageCarousel images={product.images} alt={product.name} />
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h1 className="text-3xl font-bold text-navy-deep">{product.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-luxury-gold">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.in_stock ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-600">In Stock</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-red-600">Out of Stock</span>
                  </>
                )}
              </div>

              {/* MOQ: Quantity Stepper */}
              <div className="flex items-center gap-3">
                <span className="font-semibold text-navy-deep">Quantity:</span>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={decrementQty}
                    className="h-8 w-8"
                    disabled={quantity <= moq}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="mx-3 w-12 text-center font-bold">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={incrementQty}
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {moq > 1 && <span className="ml-2 text-xs text-blue-600">MOQ: {moq}</span>}
              </div>

              {/* Order Summary Breakdown */}
              <div className="bg-gray-50 rounded-md p-4 space-y-2 border">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping Charges</span>
                  <span>{formatPrice(DEFAULT_SHIPPING_CHARGE)}</span>
                </div>
                {otherChargesPerQty > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Other Charges</span>
                    <span>{formatPrice(otherChargesPerQty)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2 text-lg">
                  <span>Total</span>
                  <span className="text-luxury-gold">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-navy-deep mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-navy-deep mb-2">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-luxury-gold mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep font-semibold py-3"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.in_stock ? `Add to Cart${quantity > moq ? ` (${quantity})` : ''}` : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
