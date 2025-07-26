"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";

const GroupBalances = ({ currentUserId, balances, userLookupMap }) => {
  // Display a loading skeleton if the user ID isn't available yet
  if (!currentUserId) {
    return <Skeleton className="h-40 w-full" />;
  }

  const userBal = balances.find((b) => b.id === currentUserId);
  if (!userBal) {
    return null; // Don't render anything if the user has no balance data
  }

  const hasOwedBy = userBal.owedBy?.length > 0;
  const hasOwes = userBal.owes?.length > 0;

  return (
    <div className="space-y-4">
      {/* Card 1: Your Total Balance Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Your Balance</h3>
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
              className={`text-2xl font-bold ${
                userBal.totalBalance > 0
                  ? "text-green-600"
                  : userBal.totalBalance < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {userBal.totalBalance >= 0 ? "+" : ""}&#8377;
              {Math.abs(userBal.totalBalance).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Detailed Breakdown of Balances */}
      {(hasOwedBy || hasOwes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Balance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className=" -pt-4 text-sm">
            {/* "Owed to You" section */}
            {hasOwedBy && (
              <div className="space-y-2">
                {userBal.owedBy.map((owed) => {
                  const member = userLookupMap[owed.from] || {
                    name: "Unknown User",
                    imageUrl: "",
                  };
                  return (
                    <div
                      key={owed.from}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback>
                            {member.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name} owes you</span>
                      </div>
                      <span className="font-medium text-green-600">
                        +&#8377;{owed.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Divider if both sections are present */}
            {hasOwedBy && hasOwes && <hr className="my-3" />}

            {/* "You Owe" section */}
            {hasOwes && (
              <div className="space-y-2">
                {userBal.owes.map((owe) => {
                  const member = userLookupMap[owe.to] || {
                    name: "Unknown User",
                    imageUrl: "",
                  };
                  return (
                    <div
                      key={owe.to}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback>
                            {member.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>You owe {member.name}</span>
                      </div>
                      <span className="font-medium text-red-600">
                        -&#8377;
                        {owe.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupBalances;
