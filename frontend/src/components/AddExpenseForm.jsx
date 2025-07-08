"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
const AddExpenseForm = ({ contact, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/expenses/add-expense",
        {
          amount: parseFloat(amount),
          description,
          category,
          note,
          splitType: "equal",
          splits: [
            { userId: contact._id, amount: parseFloat(amount) / 2 }
          ],
          // This will create a "virtual" group for 1:1 expenses
          groupId: null,
          paidByUserId: null // The backend should use the logged-in user as payer
        },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        onSuccess();
      } else {
        toast.error(response.data?.message || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="food">Food & Dining</option>
          <option value="transport">Transportation</option>
          <option value="shopping">Shopping</option>
          <option value="entertainment">Entertainment</option>
          <option value="utilities">Utilities</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Note (Optional)</label>
        <Input
          placeholder="Any additional details"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Expense"}
        </Button>
      </div>
    </form>
  );
};

export default AddExpenseForm;