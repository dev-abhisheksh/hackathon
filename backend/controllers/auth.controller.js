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
    const { name, email, password, role, orgName, orgCode } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    let orgId = null;
    let actualOrgCode = null;

    if (role === "admin") {
      if (!orgName) {
         return res.status(400).json({ success: false, message: "Organization name required for admin" });
      }
      const organization = await Organization.create({ name: orgName });
      orgId = organization._id;
      actualOrgCode = organization.orgCode;
    } else {
       if (!orgCode) {
           return res.status(400).json({ success: false, message: "Organization Code required" });
       }
       const organization = await Organization.findOne({ orgCode: orgCode.toUpperCase() });
       if (!organization) {
           return res.status(400).json({ success: false, message: "Invalid Organization Code" });
       }
       orgId = organization._id;
       actualOrgCode = organization.orgCode;
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
        orgCode: actualOrgCode,
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

    const user = await User.findOne({ email }).select("+password").populate("orgId", "orgCode");

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
        orgId: user.orgId ? user.orgId._id : null,
        orgCode: user.orgId ? user.orgId.orgCode : null,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("orgId", "name domain orgCode");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};
