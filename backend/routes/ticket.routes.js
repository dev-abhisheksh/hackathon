import express from "express";
import { createTicket, getTickets, getTicketById, updateTicketStatus, replyToTicket, tuneMessageTone, translateMessage, generateLiveDraft } from "../controllers/ticket.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(authorize("customer"), createTicket)
  .get(getTickets);

router.route("/:id")
  .get(getTicketById)
  .patch(authorize("admin", "agent"), updateTicketStatus);

router.route("/:id/reply")
  .post(replyToTicket);

router.route("/:id/tune")
  .post(authorize("admin", "agent"), tuneMessageTone);

router.route("/:id/translate")
  .post(authorize("admin", "agent"), translateMessage);

router.route("/:id/live-draft")
  .post(authorize("admin", "agent"), generateLiveDraft);

export default router;
