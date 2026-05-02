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
    orgCode: {
      type: String,
      unique: true,
    }
  },
  { timestamps: true }
);

organizationSchema.pre('save', function(next) {
  if (!this.orgCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.orgCode = code;
  }
  next();
});

export default mongoose.model("Organization", organizationSchema);
