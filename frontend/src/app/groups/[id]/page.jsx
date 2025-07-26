"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, ArrowLeftRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BarLoader } from "react-spinners";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { AddExpenseForm } from "@/components/ExpenseForm";
import GroupBalances from "@/components/GroupBalance";
import SettleUpForm from "@/components/SettleUpForm";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userBalance, setUserBalance] = useState(null);

  const fetchData = async () => {
    try {
      // Get current user first
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/get-user`,
        { withCredentials: true }
      );
      const userId = userResponse.data.user._id;
      setCurrentUserId(userId); // This is async!

      // Then get group data
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/groups/get-group-expenses/${params.id}`,
        { withCredentials: true }
      );
      setData(response.data);

      // Find balance for current user - use userId directly here
      const userBal = response.data.balances.find((b) => b.id === userId);
      setUserBalance(userBal || null);
    } catch (error) {
      toast.error("Failed to fetch group data");
      console.error("Error fetching group data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  useEffect(() => {
    try {
      const response = axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/get-user`,
        { withCredentials: true }
      );
      response
        .then((res) => {
          setCurrentUserId(res.data.user._id);
        })
        .catch((err) => {
          console.error("Error fetching current user ID:", err);
        });
    } catch (error) {
      console.error("Error setting current user ID:", error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  if (!data) {
    return <div className="container mx-auto py-12">Group not found</div>;
  }

  const handleExpenseAdded = () => {
    fetchData(); // This will re-fetch all group data
  };

  // Expense List Component
  const ExpenseList = ({ expenses, userLookupMap }) => {
    if (expenses.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No expenses yet
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense._id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(expense.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    &#8377;
                    {expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paid by{" "}
                    {expense.paidByUserId?.name ||
                      userLookupMap[expense.paidByUserId]?.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Settlement List Component
  const SettlementList = ({ settlements, userLookupMap }) => {
    if (settlements.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No settlements yet
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {settlements.map((settlement) => {
          const isCurrentUserPayer =
            settlement.paidByUserId.id === currentUserId;

          return (
            <Card key={settlement._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Settlement</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(settlement.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        isCurrentUserPayer ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      ${settlement.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isCurrentUserPayer
                        ? `You paid ${
                            settlement.paidToUserId?.name ||
                            userLookupMap[settlement.paidToUserId]?.name
                          }`
                        : `${
                            settlement.paidByUserId?.name ||
                            userLookupMap[settlement.paidByUserId]?.name
                          } paid you`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Group Members Component
  const GroupMembers = ({ members }) => {
    return (
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.imageUrl} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{member.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-6 max-w-4xl pt-24"
    >
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-4 rounded-md">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{data.group.name}</h1>
            <p className="text-muted-foreground">
              {data.group.description} • {data.members.length} members
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <SettleUpForm
              group={data}
              currentUserId={currentUserId}
              onSettlementAdded={fetchData}
            />
          </Button>

          <AddExpenseForm group={data} onExpenseAdded={handleExpenseAdded} />
        </div>
      </div>

      {/* Grid layout for group details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupBalances
                currentUserId={currentUserId}
                balances={data.balances}
                userLookupMap={data.userLookupMap}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupMembers members={data.members} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for expenses and settlements */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">
            Expenses ({data.expenses.length})
          </TabsTrigger>
          <TabsTrigger value="settlements">
            Settlements ({data.settlements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseList
            expenses={data.expenses}
            userLookupMap={data.userLookupMap}
          />
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          <SettlementList
            settlements={data.settlements}
            userLookupMap={data.userLookupMap}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
