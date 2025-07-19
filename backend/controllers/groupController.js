import Expenses from "../models/Expenses.js";
import Group from "../models/Group.js";
import Settlement from "../models/Settlements.js";
import User from "../models/User.js";

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const emails = req.body?.emails; // should be an array of emails
    const userId = req.user?._id; // Get user ID from request

    // Validate input
    if (!name || !description || !userId || !emails || !Array.isArray(emails)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find users by their emails
    const invitedUsers = await User.find({ email: { $in: emails } });
    const invitedUserIds = invitedUsers.map((u) => u._id);

    // Create new group
    const newGroup = new Group({
      name,
      description,
      members: [userId, ...invitedUserIds],
      createdBy: userId,
    });

    await newGroup.save();

    return res.status(201).json({
      message: "Group created successfully",
      group: {
        id: newGroup._id,
        name: newGroup.name,
        description: newGroup.description,
        createdBy: newGroup.createdBy,
        members: [
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            imageUrl: req.user.imageUrl,
          },
          ...invitedUsers.map((u) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            imageUrl: u.imageUrl,
          })),
        ],
      },
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user?._id; // Get user ID from request

    // Validate input
    if (!groupId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate ObjectId format (avoid CastError)
    if (!groupId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== userId.toString()) {
      // User is not the creator: remove them from members
      const updatedMembers = group.members.filter(
        (member) => member.toString() !== userId.toString()
      );

      // Update only if the user was actually in the group
      if (updatedMembers.length === group.members.length) {
        return res
          .status(400)
          .json({ message: "User is not a member of the group" });
      }

      group.members = updatedMembers;
      await group.save();

      return res.status(200).json({
        message: "User removed from group successfully",
      });
    }

    // User is the creator: delete the group
    await Group.findByIdAndDelete(groupId);

    return res.status(200).json({
      message: "Group deleted successfully",
      deletedGroupId: groupId,
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId, newMemberEmail } = req.body;
    const userId = req.user?._id;

    // Validate input
    if (!groupId || !userId || !newMemberEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if requesting user is a member
    if (!group.members.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Find the user to add
    const newMember = await User.findOne({ email: newMemberEmail });
    if (!newMember) {
      return res
        .status(404)
        .json({ message: "User with this email not found" });
    }

    // Check if user is already a member
    if (group.members.includes(newMember._id)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // Add user to group
    group.members.push(newMember._id);
    await group.save();

    return res.status(200).json({
      message: "Member added successfully",
      newMember: {
        id: newMember._id,
        name: newMember.name,
        email: newMember.email,
        imageUrl: newMember.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error adding member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find groups where the user is a member
    const groups = await Group.find({ members: userId })
      .populate("createdBy", "name email imageUrl")
      .populate("members", "name email imageUrl");

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;

    // Validate input
    if (!groupId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the group and check if user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Get all expenses for the group
    const expenses = await Expenses.find({ groupId })
      .populate("paidByUserId", "name imageUrl")
      .populate("splits._id", "name imageUrl");

    // Get all settlements for the group
    const settlements = await Settlement.find({ groupId })
      .populate("paidByUserId", "name imageUrl")
      .populate("receivedByUserId", "name imageUrl");

    // Get member details
    const members = await User.find(
      { _id: { $in: group.members } },
      "name imageUrl"
    );
    const memberDetails = members.map((member) => ({
      id: member._id,
      name: member.name,
      imageUrl: member.imageUrl,
    }));

    const ids = memberDetails.map((m) => m.id);

    /* ----------  ledgers ---------- */
    // total net balance
    const totals = Object.fromEntries(ids.map((id) => [id.toString(), 0]));
    // pair-wise ledger debtor -> creditor -> amount
    const ledger = {};
    ids.forEach((a) => {
      ledger[a.toString()] = {};
      ids.forEach((b) => {
        if (a.toString() !== b.toString()) {
          ledger[a.toString()][b.toString()] = 0;
        }
      });
    });

    /* ----------  apply expenses ---------- */
    for (const exp of expenses) {
      const payer = exp.paidByUserId._id.toString();
      for (const split of exp.splits) {
        const debtor = split._id._id.toString();
        if (debtor === payer || split.paid) continue; // skip payer & settled

        const amt = split.amount;

        totals[payer] += amt;
        totals[debtor] -= amt;

        ledger[debtor][payer] += amt; // debtor owes payer
      }
    }

    /* ----------  apply settlements ---------- */
    for (const s of settlements) {
      const payer = s.paidByUserId._id.toString();
      const receiver = s.receivedByUserId._id.toString();

      totals[payer] += s.amount;
      totals[receiver] -= s.amount;

      ledger[payer][receiver] -= s.amount; // they paid back
    }

    /* ----------  net the pair-wise ledger ---------- */
    ids.forEach((a) => {
      const aStr = a.toString();
      ids.forEach((b) => {
        const bStr = b.toString();
        if (aStr >= bStr) return; // visit each unordered pair once

        const diff = ledger[aStr][bStr] - ledger[bStr][aStr];
        if (diff > 0) {
          ledger[aStr][bStr] = diff;
          ledger[bStr][aStr] = 0;
        } else if (diff < 0) {
          ledger[bStr][aStr] = -diff;
          ledger[aStr][bStr] = 0;
        } else {
          ledger[aStr][bStr] = ledger[bStr][aStr] = 0;
        }
      });
    });

    /* ----------  shape the response ---------- */
    const balances = memberDetails.map((m) => {
      const memberId = m.id.toString();
      return {
        ...m,
        totalBalance: totals[memberId],
        owes: Object.entries(ledger[memberId])
          .filter(([, v]) => v > 0)
          .map(([to, amount]) => ({
            to,
            amount,
            toName:
              memberDetails.find((m) => m.id.toString() === to)?.name || "",
          })),
        owedBy: ids
          .filter((other) => ledger[other.toString()][memberId] > 0)
          .map((other) => ({
            from: other.toString(),
            amount: ledger[other.toString()][memberId],
            fromName:
              memberDetails.find((m) => m.id.toString() === other.toString())
                ?.name || "",
          })),
      };
    });

    const userLookupMap = {};
    memberDetails.forEach((member) => {
      userLookupMap[member.id.toString()] = member;
    });

    return res.status(200).json({
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
      },
      members: memberDetails,
      expenses: expenses.map((exp) => ({
        ...exp.toObject(),
        paidByUserId: exp.paidByUserId._id,
        paidByName: exp.paidByUserId.name,
        paidByImageUrl: exp.paidByUserId.imageUrl,
        splits: exp.splits.map((split) => ({
          userId: split._id._id,
          userName: split._id.name,
          userImageUrl: split._id.imageUrl,
          amount: split.amount,
          paid: split.paid || false,
        })),
      })),
      settlements: settlements.map((s) => ({
        ...s.toObject(),
        paidByUserId: s.paidByUserId._id,
        paidByName: s.paidByUserId.name,
        paidByImageUrl: s.paidByUserId.imageUrl,
        receivedByUserId: s.receivedByUserId._id,
        receivedByName: s.receivedByUserId.name,
        receivedByImageUrl: s.receivedByUserId.imageUrl,
      })),
      balances,
      userLookupMap,
    });
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createGroup, deleteGroup, addMember, getUserGroups, getGroupExpenses };
