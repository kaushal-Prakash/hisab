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
import { toast, Toaster } from "sonner";
import axios from "axios";
import { PlusCircle } from "lucide-react";

function ContactPageForm({ otherUser, currentUserId, onExpenseAdded }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "food",
    note: "",
  });

  const categories = [
    { value: "food", label: "Food & Dining" },
    { value: "transport", label: "Transportation" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" },
    { value: "utilities", label: "Utilities" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
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
      const obj = {
        amount,
        groupId: null, // this is a personal expense
        description: formData.description,
        category: formData.category,
        note: formData.note,
        splitType: "unequal",
        splits: [
          {
            userId: otherUser.id,
            amount: amount,
          },{
            userId: currentUserId,
            amount: 0,
          }
        ],
        paidByUserId: currentUserId,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/add-expense`,
        obj,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Expense added successfully");
        setOpen(false);
        setFormData({
          amount: "",
          description: "",
          category: "food",
          note: "",
          paidBy: currentUserId,
        });
        onExpenseAdded();
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      console.error("Error adding expense:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="What was this for?"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
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
              {isLoading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}

export default ContactPageForm;
