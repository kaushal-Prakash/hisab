"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IndianRupeeIcon, Plus, User } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Travel",
  "Other",
];

const SPLIT_TYPES = [
  { value: "equal", label: "Equal" },
  { value: "unequal", label: "Unequal" },
];

export function AddExpenseForm({ group }) {
    const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    note: "",
    splitType: "equal",
    paidBy: "",
    groupId: group?.id,
  });
  const [splits, setSplits] = useState([]);
  const [errors, setErrors] = useState({
    amount: "",
    description: "",
    category: "",
    paidBy: "",
  });

  useEffect(() => {
    if (group?.members && open) {
      // Initialize splits when form opens
      const initialSplits = group.members.map((member) => ({
        userId: member.id,
        name: member.name,
        amount: "",
        share: "",
      }));
      setSplits(initialSplits);

      // Set first member as default payer
      if (group.members.length > 0) {
        setFormData((prev) => ({ ...prev, paidBy: group.members[0].id }));
      }
    }
  }, [open, group?.members]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSplitChange = (userId, value) => {
    const numericValue = parseFloat(value) || 0;
    setSplits((prev) =>
      prev.map((split) =>
        split.userId === userId ? { ...split, amount: numericValue } : split
      )
    );
  };

  const handleSplitTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, splitType: value }));

    // Reset splits when changing type
    if (group?.members) {
      const resetSplits = group.members.map((member) => ({
        userId: member.id,
        name: member.name,
        amount: "",
        share: "",
      }));
      setSplits(resetSplits);
    }
  };

  const calculateEqualSplits = () => {
    if (!formData.amount || isNaN(parseFloat(formData.amount))) return;

    const amountPerPerson = parseFloat(formData.amount) / group.members.length;
    const updatedSplits = splits.map((split) => ({
      ...split,
      amount: amountPerPerson.toFixed(2),
    }));
    setSplits(updatedSplits);
  };

  const calculateRemainingAmount = () => {
    const totalSplitAmount = splits.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0
    );
    return parseFloat(formData.amount) - totalSplitAmount;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      amount: "",
      description: "",
      category: "",
      paidBy: "",
    };

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
      valid = false;
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Amount must be a number";
      valid = false;
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be positive";
      valid = false;
    }

    if (!formData.description) {
      newErrors.description = "Description is required";
      valid = false;
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
      valid = false;
    }

    if (!formData.paidBy) {
      newErrors.paidBy = "Payer is required";
      valid = false;
    }

    // Validate unequal splits
    if (formData.splitType === "unequal") {
      const remaining = calculateRemainingAmount();
      if (Math.abs(remaining) > 0.01) {
        toast.error(`Amounts don't add up. ₹${remaining.toFixed(2)} remaining`);
        valid = false;
      }

      const hasInvalidAmount = splits.some(
        (split) => isNaN(split.amount) || split.amount <= 0
      );
      if (hasInvalidAmount) {
        toast.error("All members must have a positive amount");
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // For equal splits, calculate amounts automatically
      let finalSplits = splits;
      if (formData.splitType === "equal") {
        const amountPerPerson =
          parseFloat(formData.amount) / group.members.length;
        finalSplits = splits.map((split) => ({
          userId: split.userId,
          amount: parseFloat(amountPerPerson.toFixed(2)),
        }));
      }
      const expenseData = {
        groupId: group.group.id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        note: formData.note,
        splitType: formData.splitType,
        paidByUserId: formData.paidBy,
        splits: finalSplits.map((split) => ({
          userId: split.userId,
          amount: parseFloat(split.amount),
        })),
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/add-expense`,
        expenseData,
        { withCredentials: true }
      );
      console.log("Response:", response.status);
      if(response.status === 201) {
        toast.success("Expense added successfully");
        router.push(`/groups/${group.group.id}`); // To refresh the page to reflect changes
      }else{
        toast.error(response.data.message);
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      category: "",
      note: "",
      splitType: "equal",
      paidBy: group?.members[0]?.id || "",
    });
    setErrors({
      amount: "",
      description: "",
      category: "",
      paidBy: "",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
        }
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <IndianRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                placeholder="Amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onBlur={() =>
                  formData.splitType === "equal" && calculateEqualSplits()
                }
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-4 justify-between items-center">
            <div>
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
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <Select
                value={formData.paidBy}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paidBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {group?.members?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paidBy && (
                <p className="text-red-500 text-xs mt-1">{errors.paidBy}</p>
              )}
            </div>
            <div>
            <Select
              value={formData.splitType}
              onValueChange={handleSplitTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Split type" />
              </SelectTrigger>
              <SelectContent>
                {SPLIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          </div>

          
          {formData.splitType === "unequal" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Split Amounts</h4>
                <div className="text-sm">
                  Remaining: ₹{calculateRemainingAmount().toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                {splits.map((split) => (
                  <div key={split.userId} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{split.name}</span>
                    </div>
                    <div className="relative w-32">
                      <IndianRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-10"
                        placeholder="0.00"
                        value={split.amount || ""}
                        onChange={(e) =>
                          handleSplitChange(split.userId, e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.splitType === "equal" && (
            <div className="text-sm text-muted-foreground">
              The amount will be split equally among all{" "}
              {group?.members?.length} members.
            </div>
          )}

          <div>
            <Textarea
              placeholder="Note (optional)"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}
