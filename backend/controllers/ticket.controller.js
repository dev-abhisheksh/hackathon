import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import Organization from "../models/Organization.js";
import { classifyAndSuggest } from "../services/ai.service.js";
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
    const { status, agentId } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (agentId) updateFields.agentId = agentId;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    const io = getIo();
    if (io) {
      io.to(req.params.id).emit("ticket_updated", ticket);
    }

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

    let ticket = null;
    if (req.user.role === "customer") {
      ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: "open" });
    }

    const io = getIo();
    if (io) {
      io.to(req.params.id).emit("new_message", message);
      io.to(req.user.orgId.toString()).emit("ticket_updated", req.params.id);
    }

    res.status(201).json({ success: true, data: message });

    // BACKGROUND TASK: Generate AI auto-reply when a customer sends a message
    if (req.user.role === "customer" && ticket) {
      (async () => {
        try {
          const org = await Organization.findById(req.user.orgId);
          const messages = await Message.find({ ticketId: req.params.id }).sort("createdAt");
          
          let chatHistory = `Subject: ${ticket.subject}\n\nChat History:\n`;
          messages.forEach(m => {
             chatHistory += `[${m.senderRole.toUpperCase()}]: ${m.content}\n`;
          });

          // The AI sees the entire conversation up to this point
          const aiResponse = await classifyAndSuggest(chatHistory, org?.systemPrompt || "");

          if (aiResponse.suggestedReply) {
             // 1. Update the ticket's active suggestion
             await Ticket.findByIdAndUpdate(req.params.id, {
                aiSuggestedReply: aiResponse.suggestedReply,
                confidence: aiResponse.confidence || 0
             });

             // 2. Insert the AI's reply into the chat thread
             const aiMessage = await Message.create({
                ticketId: req.params.id,
                senderRole: "ai",
                content: aiResponse.suggestedReply,
                isAiGenerated: true
             });

             // 3. Emit real-time events to the customer and agents
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
