import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    systemPrompt: {
      type: String,
      default:
        "You are a helpful customer support agent. Assist the customer with their query professionally and concisely.",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
