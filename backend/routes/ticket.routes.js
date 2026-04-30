import express from "express";
import { createTicket, getTickets, getTicketById, updateTicketStatus, replyToTicket } from "../controllers/ticket.controller.js";
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

export default router;
