const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

/* ---------------- ALLOWED ORIGINS ---------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://cafe-pos-system-wheat.vercel.app",
  "https://cafe-pos-system-2ntm1803p-anjef1010s-projects.vercel.app",
];

/* ---------------- SOCKET.IO ---------------- */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/* ---------------- CORS CONFIG ---------------- */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);

      // DO NOT throw error (important for production)
      return callback(null, false);
    },
    credentials: true,
  })
);

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

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/layout", require("./routes/layoutRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("🚀 Cafe POS Backend Running");
});

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

/* ---------------- SOCKET EVENTS ---------------- */
io.on("connection", (socket) => {
  console.log("🔌 Client Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected:", socket.id);
  });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);