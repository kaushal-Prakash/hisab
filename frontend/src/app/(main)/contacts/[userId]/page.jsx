"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import ContactPageForm from "@/components/ContactPageForm";
import PersonalSettlementForm from "@/components/ContactSettlementForm";

export default function PersonalExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("expenses");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    expenses: [],
    settlements: [],
    otherUser: null,
    balance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/contact/contact/${params.userId}`,
          { withCredentials: true }
        );
        setData(response.data);
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 space-y-4">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-6 max-w-4xl"
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
          <Avatar className="h-16 w-16">
            <AvatarImage src={data.otherUser?.imageUrl} />
            <AvatarFallback>
              {data.otherUser?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{data.otherUser?.name}</h1>
            <p className="text-muted-foreground">{data.otherUser?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
            <PersonalSettlementForm
              otherUser={data.otherUser}
              currentUserId={data.user}
              onSettlementAdded={() => {
                // Refresh data after adding settlement
                const fetchData = async () => {
                  try {
                    const response = await axios.get(
                      `${process.env.NEXT_PUBLIC_API_URL}/contact/contact/${params.userId}`,
                      { withCredentials: true }
                    );
                    setData(response.data);
                  } catch (error) {
                    console.error("Error refreshing data:", error);
                  }
                };
                fetchData();
              }}
            />
          <ContactPageForm
            otherUser={data.otherUser}
            currentUserId={data.user}
            onExpenseAdded={() => {
              // Refresh data after adding expense
              const fetchData = async () => {
                try {
                  const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/contact/contact/${params.userId}`,
                    { withCredentials: true }
                  );
                  setData(response.data);
                } catch (error) {
                  console.error("Error refreshing data:", error);
                }
              };
              fetchData();
            }}
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              {data.balance === 0 ? (
                <p>You are all settled up</p>
              ) : data.balance > 0 ? (
                <p>
                  <span className="font-medium">{data.otherUser?.name}</span>{" "}
                  owes you
                </p>
              ) : (
                <p>
                  You owe{" "}
                  <span className="font-medium">{data.otherUser?.name}</span>
                </p>
              )}
            </div>
            <div
              className={`text-xl font-bold ${
                data.balance > 0
                  ? "text-green-600"
                  : data.balance < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              ₹{Math.abs(data.balance).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {data.expenses.length > 0 ? (
            data.expenses.map((expense) => (
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
                        ₹{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expense.paidByUserId._id === data.otherUser.id
                          ? `${data.otherUser.name} paid`
                          : "You paid"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No expenses yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          {data.settlements.length > 0 ? (
            data.settlements.map((settlement) => (
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
                          settlement.paidByUserId._id === data.otherUser.id
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{settlement.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {settlement.paidByUserId._id === data.otherUser.id
                          ? `${data.otherUser.name} paid you`
                          : "You paid"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No settlements yet
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
