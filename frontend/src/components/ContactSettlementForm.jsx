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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeftRight } from "lucide-react";

function PersonalSettlementForm({ otherUser, currentUserId, onSettlementAdded }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "Settlement payment",
    note: "",
    relatedExpenseId: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      setIsLoading(false);
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const settlementData = {
        paidByUserId: currentUserId,
        receivedByUserId: otherUser.id,
        amount: amount,
        description: formData.description,
        note: formData.note,
        relatedExpenseId: formData.relatedExpenseId,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/settlements/add-personal-settlement`,
        settlementData,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Settlement recorded successfully");
        setOpen(false);
        setFormData({
          amount: "",
          description: "Settlement payment",
          note: "",
          relatedExpenseId: null,
        });
        onSettlementAdded();
      } else {
        toast.error(response.data?.message || "Failed to record settlement");
      }
    } catch (error) {
      console.error("Error recording settlement:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to record settlement");
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
          <DialogTitle>Record a Settlement with {otherUser.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
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
              placeholder="What's this settlement for?"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Note (Optional)
            </label>
            <Textarea
              name="note"
              placeholder="Any additional details"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Record Settlement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonalSettlementForm;