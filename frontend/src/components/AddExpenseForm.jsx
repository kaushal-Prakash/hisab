"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";

const AddExpenseForm = ({ contact, onSuccess, onClose }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount){
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/add-expense`,
        {
          amount: parseFloat(amount),
          description,
          category,
          note,
          splitType: "equal",
          splits: [
            { 
              _id: contact._id, 
              amount: parseFloat(amount) / 2 // Each pays half
            }
          ],
          paidByUserId: null // This should probably be the current user's ID
        },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Expense added successfully");
        onSuccess(); // Refresh the expenses list
        onClose(); // Close the form
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
          min="0.01"
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
          maxLength={100}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
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
          maxLength={200}
        />
      </div>
      
      <div className="pt-2 flex flex-col gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !amount || !description}
        >
          {isLoading ? "Adding..." : "Add Expense"}
        </Button>
      </div>
    </form>
  );
};

export default AddExpenseForm;