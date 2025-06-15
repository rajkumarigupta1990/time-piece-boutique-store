
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CouponManagement = () => {
  const { toast } = useToast();
  const { data: coupons = [] } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    name: '',
    description: '',
    type: 'flat_amount',
    value: 0,
    cap_amount: undefined,
    minimum_order_amount: 0,
    max_uses: undefined,
    is_active: true,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: undefined
  });

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      ...coupon,
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : undefined
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'flat_amount',
      value: 0,
      cap_amount: undefined,
      minimum_order_amount: 0,
      max_uses: undefined,
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: undefined
    });
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const couponData = {
        code: formData.code!.toUpperCase(),
        name: formData.name!,
        description: formData.description || '',
        type: formData.type as Coupon['type'],
        value: formData.value!,
        cap_amount: formData.cap_amount || undefined,
        minimum_order_amount: formData.minimum_order_amount || 0,
        max_uses: formData.max_uses || undefined,
        is_active: formData.is_active!,
        valid_from: new Date(formData.valid_from!).toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : undefined
      };

      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, ...couponData });
        toast({
          title: "Success",
          description: "Coupon updated successfully.",
        });
      } else {
        await createCoupon.mutateAsync(couponData);
        toast({
          title: "Success",
          description: "Coupon created successfully.",
        });
      }

      setEditingCoupon(null);
      setIsAddingNew(false);
      setFormData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save coupon.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      await deleteCoupon.mutateAsync(couponId);
      toast({
        title: "Success",
        description: "Coupon deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coupon.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingCoupon(null);
    setIsAddingNew(false);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAddNew} className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep">
          <Plus className="w-4 h-4 mr-2" />
          Add New Coupon
        </Button>
      </div>

      {(editingCoupon || isAddingNew) && (
        <div className="bg-white rounded-lg shadow-lg p-8 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-navy-deep">
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
                <Input
                  value={formData.code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="20% Off Sale"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Get 20% off on all luxury watches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Coupon['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat_amount">Flat Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="free_delivery">Free Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value * {formData.type === 'percentage' ? '(%)' : formData.type === 'flat_amount' ? '(₹)' : ''}
                </label>
                <Input
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  placeholder={formData.type === 'percentage' ? '20' : formData.type === 'flat_amount' ? '500' : '0'}
                />
              </div>

              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cap Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.cap_amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cap_amount: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="1000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.minimum_order_amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses</label>
                <Input
                  type="number"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                  <Input
                    type="date"
                    value={formData.valid_from || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                  <Input
                    type="date"
                    value={formData.valid_until || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value || undefined }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep">
              <Save className="w-4 h-4 mr-2" />
              Save Coupon
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono">{coupon.code}</TableCell>
                <TableCell>{coupon.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {coupon.type === 'flat_amount' ? 'Flat' : 
                     coupon.type === 'percentage' ? 'Percentage' : 'Free Delivery'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {coupon.type === 'percentage' ? `${coupon.value}%` : 
                   coupon.type === 'flat_amount' ? formatPrice(coupon.value) : 'Free'}
                </TableCell>
                <TableCell>
                  {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={coupon.is_active ? "default" : "secondary"}
                    className={coupon.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CouponManagement;
