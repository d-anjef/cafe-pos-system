const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ---------------- GENERATE TOKEN ---------------- */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

/* ---------------- LOGIN ---------------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    // ✅ IMPORTANT: ONLY ONE COOKIE SYSTEM
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // required for Render (HTTPS)
      sameSite: "none",    // required for Vercel cross-domain
      path: "/",
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.json({
      id: user._id,
      name: user.name,
      role: user.role,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- LOGOUT ---------------- */
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({ message: "Logged out" });
};

/* ---------------- GET USER ---------------- */
exports.getMe = async (req, res) => {
  res.json(req.user);
};