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

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userBalance, setUserBalance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/groups/get-group-expenses/${params.id}`,
          { withCredentials: true }
        );
        setData(response.data);

        const currentUserId = "68668b8ec0c26e4cf0083d95";
        const userBal = response.data.balances.find(
          (b) => b.id === currentUserId
        );
        setUserBalance(userBal || null);
      } catch (error) {
        toast.error("Failed to fetch group data");
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    };

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
          setCurrentUserId(res.data._id);
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
                  <p className="font-medium">${expense.amount.toFixed(2)}</p>
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
          const currentUserId = "68668b8ec0c26e4cf0083d95"; // TODO: Replace with actual current user ID
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

  // Group Balances Component
  const GroupBalances = ({ balances, userLookupMap }) => {
    const currentUserId = "68668b8ec0c26e4cf0083d95"; // TODO: Replace with actual current user ID
    const userBal = balances.find((b) => b.id === currentUserId);

    if (!userBal) return null;

    return (
      <div>
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Your balance</h3>
              {userBal.totalBalance === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You are all settled up
                </p>
              ) : userBal.totalBalance > 0 ? (
                <p className="text-sm text-muted-foreground">
                  You are owed money
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">You owe money</p>
              )}
            </div>
            <div
              className={`text-xl font-bold ${
                userBal.totalBalance > 0
                  ? "text-green-600"
                  : userBal.totalBalance < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              ${Math.abs(userBal.totalBalance).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {userBal.owedBy.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Owed to you</h4>
              {userBal.owedBy.map((owed) => {
                const member = userLookupMap[owed.userId];
                return (
                  <div
                    key={owed.userId}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member?.imageUrl} />
                        <AvatarFallback>
                          {member?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member?.name}</span>
                    </div>
                    <span className="font-medium text-green-600">
                      ${owed.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {userBal.owes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">You owe</h4>
              {userBal.owes.map((owe) => {
                const member = userLookupMap[owe.userId];
                return (
                  <div
                    key={owe.userId}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member?.imageUrl} />
                        <AvatarFallback>
                          {member?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member?.name}</span>
                    </div>
                    <span className="font-medium text-red-600">
                      ${owe.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
            <Link href={`/settlements/group/${params.id}`}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Settle up
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/expenses/new?groupId=${data.group.id}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add expense
            </Link>
          </Button>
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
