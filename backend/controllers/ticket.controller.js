import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import Organization from "../models/Organization.js";
import { classifyAndSuggest, handleFollowUp } from "../services/ai.service.js";
import { getIo } from "../socket/socket.handler.js";

export const createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    const org = await Organization.findById(req.user.orgId);

    // Call real Groq AI service
    const aiResponse = await classifyAndSuggest(
      `Subject: ${subject}\n\nDescription: ${description}`,
      org?.systemPrompt || ""
    );

    const ticket = await Ticket.create({
      orgId: req.user.orgId,
      customerId: req.user._id,
      subject,
      description,
      category: aiResponse.category || "general",
      priority: aiResponse.priority || "medium",
      aiSuggestedReply: aiResponse.suggestedReply,
      confidence: aiResponse.confidence || 0
    });

    // 1. Save customer's original message
    await Message.create({
      ticketId: ticket._id,
      senderId: req.user._id,
      senderRole: req.user.role,
      content: description
    });

    // 2. Automatically reply to the customer with the AI's suggestion
    if (aiResponse.suggestedReply) {
      const aiMessage = await Message.create({
        ticketId: ticket._id,
        senderRole: "ai",
        content: aiResponse.suggestedReply,
        isAiGenerated: true
      });

      const io = getIo();
      if (io) {
        // Emit the new message back to the customer's thread instantly
        io.to(ticket._id.toString()).emit("new_message", aiMessage);
      }
    }

    // Notify agents in the org about the new ticket
    const io = getIo();
    if (io) {
      io.to(req.user.orgId.toString()).emit("new_ticket", ticket);
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error(error);
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
    const { status, agentId, category, priority } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (agentId) updateFields.agentId = agentId;
    if (category) updateFields.category = category;
    if (priority) updateFields.priority = priority;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    const io = getIo();
    if (io) {
      io.to(req.params.id).emit("ticket_updated", ticket);
      io.to(ticket.orgId.toString()).emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { content, isAiGenerated } = req.body;

    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    if (ticket.status === "resolved" || ticket.status === "closed") {
      return res.status(400).json({ success: false, message: "Cannot reply to a resolved or closed ticket." });
    }

    const message = await Message.create({
      ticketId: req.params.id,
      senderId: req.user._id,
      senderRole: req.user.role,
      content,
      isAiGenerated: isAiGenerated || false
    });

    if (req.user.role === "customer") {
      ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: "open" }, { new: true });
    }

    const io = getIo();
    if (io) {
      io.to(req.params.id).emit("new_message", message);
      io.to(req.user.orgId.toString()).emit("ticket_updated", req.params.id);
    }

    res.status(201).json({ success: true, data: message });

    if (req.user.role === "customer" && ticket) {
      (async () => {
        try {
          const org = await Organization.findById(req.user.orgId);
          const aiResponse = await handleFollowUp(content, org?.systemPrompt || "");

          if (aiResponse.canAnswer || aiResponse.reply) {
            const aiMessage = await Message.create({
              ticketId: req.params.id,
              senderRole: "ai",
              content: aiResponse.reply,
              isAiGenerated: true
            });

            if (io) {
              io.to(req.params.id).emit("new_message", aiMessage);
              io.to(req.user.orgId.toString()).emit("ticket_updated", req.params.id);
            }
          }
        } catch (err) {
          console.error("Background AI generation failed:", err);
        }
      })();
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};