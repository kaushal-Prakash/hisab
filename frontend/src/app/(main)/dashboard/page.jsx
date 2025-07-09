"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, ArrowUp, ArrowDown, Users, User, CreditCard, Calendar, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const chartItem = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, monthlyRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/get-dashboard-data`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/get-total-monthly-spent`, { withCredentials: true })
        ]);

        setDashboardData(dashboardRes.data);
        setMonthlySpending(monthlyRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const chartData = monthlySpending.map(item => ({
    name: monthNames[item.month - 1],
    amount: item.total
  }));

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="p-6 space-y-6"
    >
      {/* Balance Overview */}
      <motion.div 
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <IndianRupee className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${
                  dashboardData?.totalBalance >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatCurrency(dashboardData?.totalBalance || 0)}
                </span>
                {dashboardData?.totalBalance >= 0 ? (
                  <ArrowUp className="h-4 w-4 ml-1 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1 text-red-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData?.totalBalance >= 0 ? 'You are owed money' : 'You owe money'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total this month</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData?.monthlyTotal || 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total this year</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData?.yearlyTotal || 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">You are owed</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(dashboardData?.youAreOwed || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From {dashboardData?.peopleOwingYou?.length || 0} people
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Chart */}
        <motion.div variants={chartItem}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Amount']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                      animationBegin={500}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Balance Details */}
        <motion.div variants={chartItem}>
          <Card>
            <CardHeader>
              <CardTitle>Balance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Owed to you</h3>
                {dashboardData?.peopleOwingYou?.length > 0 ? (
                  <motion.div 
                    variants={container}
                    className="space-y-2"
                  >
                    {dashboardData.peopleOwingYou.map((person, index) => (
                      <motion.div 
                        key={index} 
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <ArrowDown className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-xs text-gray-500">Owes you</p>
                          </div>
                        </div>
                        <p className="font-medium text-green-600">
                          {formatCurrency(person.amount)}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-sm text-gray-500">No one owes you money</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">You owe</h3>
                {dashboardData?.peopleYouOwe?.length > 0 ? (
                  <motion.div 
                    variants={container}
                    className="space-y-2"
                  >
                    {dashboardData.peopleYouOwe.map((person, index) => (
                      <motion.div 
                        key={index} 
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-100 p-2 rounded-full">
                            <ArrowUp className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-xs text-gray-500">You owe</p>
                          </div>
                        </div>
                        <p className="font-medium text-red-600">
                          {formatCurrency(person.amount)}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-sm text-gray-500">You don't owe anyone</p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.01 }}>
                <Button variant="outline" className="w-full">
                  View all <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}