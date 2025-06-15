
import React from 'react';
import { usePaymentCollectionSettings, useUpdatePaymentCollectionSettings } from '@/hooks/usePaymentCollectionSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PaymentCollectionSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePaymentCollectionSettings();
  const updateSettings = useUpdatePaymentCollectionSettings();

  const handleToggle = async (field: 'collect_shipping_upfront' | 'collect_other_charges_upfront', value: boolean) => {
    if (!settings) return;
    
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        [field]: value
      });
      toast({
        title: "Success",
        description: "Payment collection settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment collection settings.",
        variant: "destructive"
      });
    }
  };

  const handleShippingChargeUpdate = async (value: number) => {
    if (!settings) return;
    
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        shipping_charge: value
      });
      toast({
        title: "Success",
        description: "Shipping charge updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shipping charge.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading payment collection settings...</div>;
  }

  if (!settings) {
    return <div>Failed to load payment collection settings.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Collection Settings</CardTitle>
        <CardDescription>
          Configure when shipping and additional charges are collected from customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Collect Shipping Upfront</Label>
            <p className="text-sm text-gray-500">
              Collect shipping charges during checkout instead of at delivery
            </p>
          </div>
          <Switch
            checked={settings.collect_shipping_upfront}
            onCheckedChange={(checked) => handleToggle('collect_shipping_upfront', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Collect Other Charges Upfront</Label>
            <p className="text-sm text-gray-500">
              Collect additional product charges during checkout instead of at delivery
            </p>
          </div>
          <Switch
            checked={settings.collect_other_charges_upfront}
            onCheckedChange={(checked) => handleToggle('collect_other_charges_upfront', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping-charge" className="text-base font-medium">Default Shipping Charge (₹)</Label>
          <div className="flex space-x-2">
            <Input
              id="shipping-charge"
              type="number"
              value={settings.shipping_charge}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0) {
                  handleShippingChargeUpdate(value);
                }
              }}
              className="max-w-32"
            />
          </div>
          <p className="text-sm text-gray-500">
            This will be the default shipping charge applied to orders
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCollectionSettings;
