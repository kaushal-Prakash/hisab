"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeftRight } from "lucide-react";

function SettleUpForm({ group, currentUserId, onSettlementAdded }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "Settlement payment",
    paidToUserId: "",
    note: "",
    relatedExpenseId: null,
  });

  // Get the current user's balance
  const currentUserBalance = group.balances.find(b => b.id === currentUserId);

  // Get users you owe money to (where your balance is negative)
  const usersYouOwe = currentUserBalance?.owes?.map(debt => ({
    id: debt.to,
    name: debt.toName || group.userLookupMap[debt.to]?.name || "Unknown User",
    amount: debt.amount,
  })) || [];

  // Get users who owe you money (where your balance is positive)
  const usersWhoOweYou = currentUserBalance?.owedBy?.map(debt => ({
    id: debt.from,
    name: debt.fromName || group.userLookupMap[debt.from]?.name || "Unknown User",
    amount: debt.amount,
  })) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (userId) => {
    const selectedUser = [...usersYouOwe, ...usersWhoOweYou].find(u => u.id === userId);
    setFormData(prev => ({
      ...prev,
      paidToUserId: userId,
      amount: selectedUser ? selectedUser.amount.toFixed(2) : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.paidToUserId) {
      toast.error("Please select a user to settle with");
      setIsLoading(false);
      return;
    }

    if (!formData.amount || isNaN(formData.amount)) {
      toast.error("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      setIsLoading(false);
      return;
    }

    try {
      const settlementData = {
        groupId: group.group.id,
        paidByUserId: currentUserId,
        receivedByUserId: formData.paidToUserId,
        amount: amount,
        description: formData.description,
        note: formData.note,
        relatedExpenseId: formData.relatedExpenseId,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/settlements/add-settlement`,
        settlementData,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Settlement recorded successfully");
        setOpen(false);
        setFormData({
          amount: "",
          description: "Settlement payment",
          paidToUserId: "",
          note: "",
          relatedExpenseId: null,
        });
        onSettlementAdded();
      } else {
        toast.error(response.data?.message || "Failed to record settlement");
      }
    } catch (error) {
      console.error("Error recording settlement:", error);
      toast.error(
        error.response?.data?.message || "Failed to record settlement"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Settle Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record a Settlement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {usersYouOwe.length > 0 && usersWhoOweYou.length > 0
                ? "Select user to settle with"
                : usersYouOwe.length > 0
                ? "Select user you're paying"
                : "Select user who's paying you"}
            </label>
            <Select
              value={formData.paidToUserId}
              onValueChange={handleUserSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {/* Users you owe money to (you're paying them) */}
                {usersYouOwe.length > 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    You owe these users
                  </div>
                )}
                {usersYouOwe.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} (you owe ${user.amount.toFixed(2)})
                  </SelectItem>
                ))}

                {/* Users who owe you money (they're paying you) */}
                {usersWhoOweYou.length > 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    These users owe you
                  </div>
                )}
                {usersWhoOweYou.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} (owes you ${user.amount.toFixed(2)})
                  </SelectItem>
                ))}

                {usersYouOwe.length === 0 && usersWhoOweYou.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No balances to settle
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              name="description"
              placeholder="Settlement description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Related Expense (Optional)
            </label>
            <Select
              value={formData.relatedExpenseId || ""}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, relatedExpenseId: value || null }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expense (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {group.expenses
                  .filter(exp => 
                    exp.paidByUserId === currentUserId || 
                    exp.splits.some(s => s.userId === currentUserId)
                  )
                  .map(exp => (
                    <SelectItem key={exp._id} value={exp._id}>
                      {exp.description} (${exp.amount.toFixed(2)})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Note (Optional)
            </label>
            <Textarea
              name="note"
              placeholder="Any additional details about this settlement"
              value={formData.note}
              onChange={handleChange}
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.paidToUserId}
            >
              {isLoading ? "Processing..." : "Record Settlement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SettleUpForm;