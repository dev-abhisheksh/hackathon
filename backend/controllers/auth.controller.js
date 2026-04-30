import User from "../models/User.js";
import Organization from "../models/Organization.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, orgName } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    let orgId = null;

    if (role === "admin") {
      if (!orgName) {
         return res.status(400).json({ success: false, message: "Organization name required for admin" });
      }
      const organization = await Organization.create({ name: orgName });
      orgId = organization._id;
    } else {
       orgId = req.body.orgId;
       if (!orgId) {
           return res.status(400).json({ success: false, message: "Organization ID required" });
       }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      orgId,
    });
    
    if (role === "admin") {
        await Organization.findByIdAndUpdate(orgId, { createdBy: user._id });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("orgId", "name domain");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};
