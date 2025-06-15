
import React, { useState } from 'react';
import { Calendar, TrendingUp, ShoppingCart, DollarSign, Package, Users } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';

const AdminDashboard = () => {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  
  const [timeFrame, setTimeFrame] = useState('30');

  const getFilteredOrders = () => {
    const days = parseInt(timeFrame);
    const cutoffDate = subDays(new Date(), days);
    
    return orders.filter(order => {
      const orderDate = parseISO(order.created_at);
      return isAfter(orderDate, cutoffDate);
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.in_stock).length;
  
  // Order status breakdown
  const ordersByStatus = filteredOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Daily revenue chart data
  const getDailyRevenueData = () => {
    const days = parseInt(timeFrame);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = parseISO(order.created_at);
        return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        revenue: revenue,
        orders: dayOrders.length
      });
    }
    
    return data;
  };

  const dailyData = getDailyRevenueData();

  // Top selling products (based on order items)
  const getTopProducts = () => {
    const productSales = {} as Record<string, { name: string; quantity: number; revenue: number }>;
    
    filteredOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const productId = item.product_id;
        const productName = item.product?.name || 'Unknown Product';
        
        if (!productSales[productId]) {
          productSales[productId] = { name: productName, quantity: 0, revenue: 0 };
        }
        
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += Number(item.price) * item.quantity;
      });
    });
    
    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-navy-deep">Dashboard</h2>
          <p className="text-gray-600">Overview of your e-commerce performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Out of {totalProducts} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
            <CardDescription>
              Revenue and order count over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => [
                          name === 'revenue' ? formatPrice(Number(value)) : String(value),
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fill="var(--color-revenue)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of orders by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={status === 'delivered' ? 'default' : 'secondary'}
                      className={
                        status === 'delivered' ? 'bg-green-100 text-green-800' :
                        status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-luxury-gold h-2 rounded-full"
                        style={{
                          width: `${(count / totalOrders) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {((count / totalOrders) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Best performing products by revenue in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-luxury-gold text-navy-deep flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.quantity} units sold
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(product.revenue)}</div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sales data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
