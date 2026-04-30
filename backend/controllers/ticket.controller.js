import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";

export const createTicket = async (req, res) => {
  try {
    const { subject, description, category } = req.body;

    const mockAiResponse = {
      category: category || "general",
      priority: "medium",
      suggestedReply: "Thank you for reaching out. An agent will be with you shortly.",
      confidence: 65
    };

    const ticket = await Ticket.create({
      orgId: req.user.orgId,
      customerId: req.user._id,
      subject,
      description,
      category: mockAiResponse.category,
      priority: mockAiResponse.priority,
      aiSuggestedReply: mockAiResponse.suggestedReply,
      confidence: mockAiResponse.confidence
    });

    await Message.create({
      ticketId: ticket._id,
      senderId: req.user._id,
      senderRole: req.user.role,
      content: description
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    let query = { orgId: req.user.orgId };

    if (req.user.role === "customer") {
      query.customerId = req.user._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const tickets = await Ticket.find(query)
      .populate("customerId", "name email")
      .populate("agentId", "name email")
      .sort("-createdAt");

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customerId", "name email")
      .populate("agentId", "name email");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const messages = await Message.find({ ticketId: ticket._id }).sort("createdAt");

    res.status(200).json({ success: true, data: { ticket, messages } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status, agentId } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (agentId) updateFields.agentId = agentId;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { content, isAiGenerated } = req.body;

    const message = await Message.create({
      ticketId: req.params.id,
      senderId: req.user._id,
      senderRole: req.user.role,
      content,
      isAiGenerated: isAiGenerated || false
    });

    if (req.user.role === "customer") {
      await Ticket.findByIdAndUpdate(req.params.id, { status: "open" });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
