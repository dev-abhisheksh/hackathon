import express from "express";
import { getDashboardStats, getAgents, createAgent, updateOrgContext, getOrgContext } from "../controllers/admin.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getDashboardStats);
router.route("/agents")
  .get(getAgents)
  .post(createAgent);

router.route("/context")
    .get(getOrgContext)
    .patch(updateOrgContext);

export default router;
