
import React from 'react';
import CartDialog from './cart/CartDialog';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  return <CartDialog isOpen={isOpen} onClose={onClose} />;
};

export default Cart;
