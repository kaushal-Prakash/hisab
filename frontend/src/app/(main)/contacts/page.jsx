"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  UserPlus,
  Search,
  X,
  User,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios";

// Mock data - replace with your actual data fetching
const groups = [
  {
    _id: "1",
    name: "Roommates",
    description: "Apartment expenses",
    members: [
      { _id: "101", name: "You", email: "you@example.com" },
      { _id: "102", name: "Alex", email: "alex@example.com" },
      { _id: "103", name: "Sam", email: "sam@example.com" },
    ],
  },
  {
    _id: "2",
    name: "Trip to Goa",
    description: "December vacation",
    members: [
      { _id: "101", name: "You", email: "you@example.com" },
      { _id: "104", name: "Priya", email: "priya@example.com" },
    ],
  },
];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("groups");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [newContactEmail, setNewContactEmail] = useState("");

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/contact/get-contacts",
        {
          withCredentials: true, // Include cookies in the request
        }
      );
      if (response.status === 200) {
        setContacts(response.data);
      } else {
        toast.error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     try {
  //       const response = await axios.get(
  //         process.env.NEXT_PUBLIC_API_URL + "/group/get-groups",
  //         {
  //           withCredentials: true, // Include cookies in the request
  //         }
  //       );
  //       if (response.status === 200) {
  //         // Assuming response.data is an array of groups
  //         setGroups(response.data);
  //       } else {
  //         toast.error("Failed to fetch groups");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching groups:", error);
  //       toast.error("Failed to fetch groups");
  //     }
  //   };
  //   fetchGroups();
  // }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (contact) =>
      contact?.name &&
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    // Add your API call here
    toast.success(`Group "${newGroup.name}" created successfully`);
    setIsCreateGroupOpen(false);
    setNewGroup({ name: "", description: "", members: [] });
  };

  const handleAddContact = async () => {
    try {
      const email = newContactEmail.trim();
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/contact/add-contact",
        {
          email,
        },
        {
          withCredentials: true, // Include cookies in the request
        }
      );
      console.log(response.data);
      if (response.status !== 200) {
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);
        await fetchContacts(); // Refresh contacts after adding
      }
      setIsAddContactOpen(false);
      setNewContactEmail("");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error(error.response?.data?.message);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/contact/delete-contact",
        {
          contactId,
        },
        {
          withCredentials: true, // Include cookies in the request
        }
      );
      if (response.status === 200) {
        setContacts(contacts.filter((contact) => contact._id !== contactId));
        toast.success("Contact deleted successfully");
      } else {
        toast.error("Failed to delete contact: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Contacts</h1>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog
              open={isCreateGroupOpen}
              onOpenChange={setIsCreateGroupOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Group name"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Description"
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Add Members ({newGroup.members.length} selected)
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <UserPlus className="h-4 w-4" />
                            Add Contacts
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Select Contacts</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {contacts.map((contact) => (
                              <div
                                key={contact._id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {contact.name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {contact.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {contact.email}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant={
                                    newGroup.members.includes(contact._id)
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    setNewGroup({
                                      ...newGroup,
                                      members: newGroup.members.includes(
                                        contact._id
                                      )
                                        ? newGroup.members.filter(
                                            (id) => id !== contact._id
                                          )
                                        : [...newGroup.members, contact._id],
                                    })
                                  }
                                >
                                  {newGroup.members.includes(contact._id)
                                    ? "Added"
                                    : "Add"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="border rounded p-3 min-h-16">
                      {newGroup.members.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {newGroup.members.map((memberId) => {
                            const member = contacts.find(
                              (c) => c._id === memberId
                            );
                            return (
                              <div
                                key={memberId}
                                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                              >
                                <span className="text-sm">
                                  {member?.name || "Unknown"}
                                </span>
                                <button
                                  onClick={() =>
                                    setNewGroup({
                                      ...newGroup,
                                      members: newGroup.members.filter(
                                        (id) => id !== memberId
                                      ),
                                    })
                                  }
                                >
                                  <X className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No members added yet
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateGroup}
                    disabled={!newGroup.name || !newGroup.description}
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Contact</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleAddContact}
                    disabled={!newContactEmail}
                  >
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "groups"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            <Users className="h-4 w-4" />
            Groups
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "contacts"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("contacts")}
          >
            <User className="h-4 w-4" />
            Contacts
          </button>
        </div>

        {/* Content */}
        {activeTab === "groups" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{group.name}</CardTitle>
                          <p className="text-xs text-gray-500 mt-1">
                            {group.members.length} members
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {group.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center -space-x-2">
                        {group.members.slice(0, 5).map((member) => (
                          <Avatar
                            key={member._id}
                            className="border-2 border-white"
                          >
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {group.members.length > 5 && (
                          <Avatar className="border-2 border-white">
                            <AvatarFallback>
                              +{group.members.length - 5}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          View Group
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No groups found</h3>
                <p className="mt-1 text-gray-500">
                  Create your first group to get started
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsCreateGroupOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {contact.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-500">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteContact(contact._id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No contacts found</h3>
                <p className="mt-1 text-gray-500">
                  Add contacts to start sharing expenses
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsAddContactOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
      <Toaster />
    </div>
  );
}
