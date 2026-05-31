// ✅ MUST be the FIRST line — loads env vars before any other imports
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const Organization = require('./models/Organization');
const Branch = require('./models/Branch');
const Subscription = require('./models/Subscription');
const { startTrialCron } = require('./cron/trialCron');
const { enforceReadOnly } = require('./middleware/subscriptionMiddleware');

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

connectDB();

const app = express();
const server = http.createServer(app);

/* ---------------- ALLOWED ORIGINS ---------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:4174",
  "https://cafe-pos-system-wheat.vercel.app",
  "https://cafepos.dpdns.org",
  "https://www.cafepos.dpdns.org",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ---------------- SOCKET.IO ---------------- */
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});
app.set("io", io);

/* ---------------- HANDLE PRE-FLIGHT REQUESTS ---------------- */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ---------------- BASIC MIDDLEWARE ---------------- */
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// ✅ Apply read-only enforcement to all protected routes
app.use(enforceReadOnly);

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/layout", require("./routes/layoutRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/organization", require("./routes/organization"));
app.use("/api/branches", require("./routes/branches"));
app.use("/api/local-payments", require("./routes/localPayments"));
app.use("/api/stripe", require("./routes/stripe"));
app.use("/api/super-admin", require("./routes/superAdmin"));
app.use("/api/billing", require("./routes/billing"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/public", require("./routes/publicRoutes"));
app.use("/api/trial", require("./routes/trialRoutes"));

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("🚀 Cafe POS Backend Running");
});

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

/* ---------------- SOCKET EVENTS ---------------- */
io.on("connection", (socket) => {
  console.log("🔌 Client Connected:", socket.id);

  socket.on("join:branch", (branchId) => {
    if (branchId) {
      socket.join(`branch_${branchId}`);
      console.log(`📍 ${socket.id} joined branch_${branchId}`);
    }
  });

  socket.on("leave:branch", (branchId) => {
    if (branchId) {
      socket.leave(`branch_${branchId}`);
      console.log(`📤 ${socket.id} left branch_${branchId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected:", socket.id);
  });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ✅ Start trial cron job
  startTrialCron();
});