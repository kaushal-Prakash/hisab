import Contact from "../models/Contact.js";
import User from "../models/User.js";

const addContact = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const contact = await Contact.findOne({ userId: req.user._id });
    if (!contact) {
      // If contact does not exist, create a new one
      const newContact = new Contact({
        userId: req.user._id,
        contactIds: [user._id],
      });
      await newContact.save();
      return res.status(200).json({ message: "Contact added successfully" });
    } else {
      // If contact exists, add the user to the contactIds array
      if (contact.contactIds.includes(user._id)) {
        return res.status(400).json({ message: "User is already in contacts" });
      }
      contact.contactIds.push(user._id);
      await contact.save();
      return res.status(200).json({ message: "Contact added successfully" });
    }
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getContacts = async (req, res) => {
  try {
    const contact = await Contact.findOne({ userId: req.user._id }).populate(
      "contactIds",
      "name email imageUrl"
    );
    if (!contact) {
      return res.status(404).json({ message: "No contacts found" });
    }
    res.status(200).json(contact.contactIds);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }
    const contact = await Contact.findOne({ userId: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: "No contacts found" });
    }
    contact.contactIds = contact.contactIds.filter(
      (id) => id.toString() !== contactId
    );
    await contact.save();
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { addContact, getContacts, deleteContact };
