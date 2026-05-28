const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Branch = require("../models/Branch");
const Subscription = require("../models/Subscription");
const VerificationCode = require("../models/VerificationCode");
const { protect } = require("../middleware/authMiddleware");

// Email service + templates
const { sendEmail, generateVerificationCode } = require("../services/emailService");
const verifyEmailTemplate = require("../templates/emails/verifyEmail");
const welcomeEmailTemplate = require("../templates/emails/welcomeEmail");
const crypto = require("crypto");
const passwordResetEmailTemplate = require("../templates/emails/passwordResetEmail");
const passwordChangedEmailTemplate = require("../templates/emails/passwordChangedEmail");

const router = express.Router();

// Constants
const CODE_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

// ============================================================
// POST /api/auth/send-verification
// Send a 6-digit verification code to email
// Used during signup AND for resending
// ============================================================
router.post("/send-verification", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if user already exists AND is verified
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login instead."
      });
    }

    // Check resend cooldown
    const recentCode = await VerificationCode.findOne({
      email: lowerEmail,
      purpose: "signup",
      createdAt: { $gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) }
    }).sort({ createdAt: -1 });

    if (recentCode) {
      const secondsLeft = Math.ceil(
        (recentCode.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft} seconds before requesting another code`,
        cooldownSeconds: secondsLeft
      });
    }

    // Delete old unused codes for this email
    await VerificationCode.deleteMany({
      email: lowerEmail,
      purpose: "signup",
      used: false
    });

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await VerificationCode.create({
      email: lowerEmail,
      code,
      purpose: "signup",
      expiresAt
    });

    // Send email
    const emailResult = await sendEmail({
      to: lowerEmail,
      subject: `Your NUVLYX verification code: ${code}`,
      html: verifyEmailTemplate({
        name: name || "there",
        code,
        expiresInMin: CODE_EXPIRY_MINUTES
      })
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again."
      });
    }

    res.json({
      success: true,
      message: `Verification code sent to ${lowerEmail}`,
      expiresInMinutes: CODE_EXPIRY_MINUTES,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS
    });

  } catch (error) {
    console.error("Send verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code"
    });
  }
});

// ============================================================
// POST /api/auth/verify-code
// Verify the 6-digit code
// Returns success, doesn't create account yet
// ============================================================
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required"
      });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Find latest unused code
    const verificationCode = await VerificationCode.findOne({
      email: lowerEmail,
      purpose: "signup",
      used: false
    }).sort({ createdAt: -1 });

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one."
      });
    }

    // Check expiry
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Code expired. Please request a new one.",
        code: "EXPIRED"
      });
    }

    // Check max attempts
    if (verificationCode.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
        code: "MAX_ATTEMPTS"
      });
    }

    // Check code
    if (verificationCode.code !== code) {
      verificationCode.attempts += 1;
      await verificationCode.save();

      const remaining = MAX_ATTEMPTS - verificationCode.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        attemptsRemaining: remaining
      });
    }

    // Mark code as used
    verificationCode.used = true;
    await verificationCode.save();

    res.json({
      success: true,
      message: "Email verified successfully",
      email: lowerEmail
    });

  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify code"
    });
  }
});


// ============================================================
// POST /api/auth/register
// Create org + owner — REQUIRES verified email
// ✅ UPDATED: Staff emails now use [role]@[slug].nuvlyx.app pattern
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { organizationName, name, email, password } = req.body;

    if (!organizationName || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Verify email was verified within last 30 minutes
    const recentVerification = await VerificationCode.findOne({
      email: lowerEmail,
      purpose: "signup",
      used: true,
      updatedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    }).sort({ updatedAt: -1 });

    if (!recentVerification) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
        code: "EMAIL_NOT_VERIFIED"
      });
    }

    // Check email not already used
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login instead."
      });
    }

    // Generate slug from org name
    const baseSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // ✅ NEW: Staff email domain uses the slug + .nuvlyx.app
    // Example: chiya-factory → admin@chiya-factory.nuvlyx.app
    const staffEmailDomain = `${slug}.nuvlyx.app`;
    const staffPassword = `${slug.replace(/-/g, "")}123`;

    // 1. Create owner with their REAL email
    const owner = await User.create({
      name,
      email: lowerEmail,           // ✅ Their real email
      password,
      role: "owner",
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    // 2. Create organization
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const organization = await Organization.create({
      name: organizationName,
      slug,
      owner: owner._id,
      subscription: {
        plan: "business",
        status: "trialing",
        trialEndsAt
      },
      limits: {
        branches: 5, tables: 50, staff: 20, menuItems: 200, analyticsRetention: 30
      },
      features: {
        pdfReceipts: true,
        customBranding: true,
        inventory: true,
        employeeMetrics: true,
        qrOrdering: true
      },
      settings: {
        currency: "NPR", timezone: "Asia/Kathmandu", taxRate: 13, serviceCharge: 10
      },
      isActive: true
    });

    // 3. Create default branch
    let branchCode = `${slug.substring(0, 3).toUpperCase()}-BR001`;
    let branchCounter = 1;
    while (await Branch.findOne({ code: branchCode })) {
      branchCounter++;
      branchCode = `${slug.substring(0, 3).toUpperCase()}-BR${String(branchCounter).padStart(3, "0")}`;
    }

    const branch = await Branch.create({
      organization: organization._id,
      name: "Main Branch",
      code: branchCode,
      location: { country: "Nepal" },
      isActive: true,
      settings: {
        autoAcceptOrders: true,
        allowReservations: false,
        printAutomatically: false
      }
    });

    // 4. Update owner with org + branch
    owner.organization = organization._id;
    owner.branches = [branch._id];
    await owner.save();

    // 5. ✅ Auto-create staff accounts with NEW email pattern
    // Pattern: [role]@[slug].nuvlyx.app
    // Example: admin@chiya-factory.nuvlyx.app
    const staffRoles = [
      { role: "admin",          prefix: "admin",   displayName: "Admin" },
      { role: "branch_manager", prefix: "manager", displayName: "Manager" },
      { role: "waiter",         prefix: "waiter",  displayName: "Waiter" },
      { role: "kitchen",        prefix: "kitchen", displayName: "Kitchen" }
    ];

    const generatedStaff = [];

    for (const staff of staffRoles) {
      // ✅ NEW PATTERN: prefix@slug.nuvlyx.app
      const staffEmail = `${staff.prefix}@${staffEmailDomain}`;

      // Should always be unique since slug is unique, but check anyway
      const exists = await User.findOne({ email: staffEmail });
      if (exists) continue;

      await User.create({
        organization: organization._id,
        branches: [branch._id],
        name: staff.displayName,
        email: staffEmail,
        password: staffPassword,
        role: staff.role,
        isActive: true,
        emailVerified: true   // Internal accounts pre-verified
      });

      generatedStaff.push({
        role: staff.role,
        email: staffEmail,
        password: staffPassword
      });
    }

    // 6. Subscription record
    await Subscription.create({
      organization: organization._id,
      plan: "business",
      status: "trialing",
      provider: "manual",
      billingCycle: "monthly",
      amount: 0,
      currency: "NPR",
      trialStart: new Date(),
      trialEnd: trialEndsAt
    });

    // 7. Send welcome email to OWNER (only)
    sendEmail({
      to: lowerEmail,
      subject: `Welcome to NUVLYX, ${name.split(" ")[0]}! 🎉`,
      html: welcomeEmailTemplate({
        name,
        orgName: organizationName,
        staff: generatedStaff,
        trialEndsAt
      })
    }).catch(err => {
      console.error("Welcome email failed:", err.message);
    });

    // 8. JWT
    const token = jwt.sign(
      { id: owner._id, role: owner.role, organization: organization._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = await User.findById(owner._id)
      .populate("organization", "name slug subscription limits features settings")
      .populate("branches", "name code");

    res.status(201).json({
      success: true,
      message: "Account created successfully. Welcome to NUVLYX!",
      token,
      user: userResponse,
      generatedStaff
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
});

// ============================================================
// POST /api/auth/login
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate("organization", "name slug subscription limits features settings")
      .populate("branches", "name code");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const organizationId = user.organization?._id || user.organization || null;

    const token = jwt.sign(
      { id: user._id, role: user.role, organization: organizationId },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed"
    });
  }
});

// ============================================================
// GET /api/auth/me
// ============================================================
router.get("/me", protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
});

// ============================================================
// POST /api/auth/test-email
// DEV ONLY — test that email system works
// Remove in production
// ============================================================
router.post("/test-email", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }

  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: "to required" });

    const result = await sendEmail({
      to,
      subject: "NUVLYX Test Email",
      html: verifyEmailTemplate({
        name: "Test User",
        code: "123456",
        expiresInMin: 10
      })
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// POST /api/auth/forgot-password
// Request password reset email
// Returns same response whether email exists or not (security)
// ============================================================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Always return success (don't reveal if email exists)
    const genericResponse = {
      success: true,
      message: "If an account exists with this email, you'll receive a password reset link shortly."
    };

    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${lowerEmail}`);
      return res.json(genericResponse);
    }

    if (!user.isActive) {
      console.log(`Password reset requested for inactive account: ${lowerEmail}`);
      return res.json(genericResponse);
    }

    // Check rate limiting (max 3 requests per hour)
    if (user.passwordResetExpires && user.passwordResetExpires > new Date()) {
      // Calculate how many recent requests
      const minutesSinceLastRequest =
        (Date.now() - new Date(user.passwordResetExpires).getTime() + 60 * 60 * 1000) / 60000;

      if (minutesSinceLastRequest < 5) {
        return res.json({
          ...genericResponse,
          message: "If an account exists, please wait a few minutes before requesting another reset."
        });
      }
    }

    // Generate secure token (32 bytes = 256 bits, hex = 64 chars)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash for storage (so DB breach doesn't leak tokens)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Build reset URL (frontend will handle the token)
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(lowerEmail)}`;

    // Send email
    const emailResult = await sendEmail({
      to: lowerEmail,
      subject: "Reset your NUVLYX password",
      html: passwordResetEmailTemplate({
        name: user.name,
        resetUrl,
        expiresInMin: 60
      })
    });

    if (!emailResult.success) {
      console.error("Password reset email failed:", emailResult.error);
      // Still return generic response — don't expose email failures
    }

    res.json(genericResponse);

  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({
      success: true,
      message: "If an account exists with this email, you'll receive a password reset link shortly."
    });
  }
});

// ============================================================
// POST /api/auth/verify-reset-token
// Check if token is valid before showing reset form
// ============================================================
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired"
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      name: user.name  // Show name on reset page
    });

  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify token"
    });
  }
});

// ============================================================
// POST /api/auth/reset-password
// Set new password using reset token
// ============================================================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Hash the incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired. Please request a new one."
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email (don't await — fire and forget)
    sendEmail({
      to: user.email,
      subject: "Your NUVLYX password was changed",
      html: passwordChangedEmailTemplate({
        name: user.name,
        changedAt: new Date()
      })
    }).catch(err => {
      console.error("Password changed email failed:", err.message);
    });

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
});


module.exports = router;