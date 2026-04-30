import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcryptjs";

export const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const totalTickets = await Ticket.countDocuments({ orgId });
    const openTickets = await Ticket.countDocuments({ orgId, status: "open" });
    const resolvedTickets = await Ticket.countDocuments({ orgId, status: "resolved" });
    
    const technicalTickets = await Ticket.countDocuments({ 
      orgId, 
      $or: [{ category: "technical" }, { priority: "urgent" }],
      status: { $nin: ["resolved", "closed"] } 
    });
    const totalAgents = await User.countDocuments({ orgId, role: "agent" });

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        resolvedTickets,
        technicalTickets,
        totalAgents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ orgId: req.user.orgId, role: "agent" }).select("-password");
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "agent",
      orgId: req.user.orgId
    });

    res.status(201).json({ success: true, data: { _id: agent._id, name: agent.name, email: agent.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrgContext = async (req, res) => {
    try {
        const org = await Organization.findById(req.user.orgId);
        res.status(200).json({ success: true, data: org });
    } catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateOrgContext = async (req, res) => {
  try {
    const { systemPrompt } = req.body;
    
    const org = await Organization.findByIdAndUpdate(
      req.user.orgId,
      { systemPrompt },
      { new: true }
    );

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
