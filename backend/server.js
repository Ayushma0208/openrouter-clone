const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000,http://localhost:3001";
const MONGODB_URI = process.env.MONGODB_URI;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";
const ADMIN_ROLE = "admin";

let isMongoConnected = false;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const allowedOrigins = ALLOWED_ORIGIN.split(",").map((origin) => origin.trim());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

const ensureSingleAdmin = async () => {
  const existingAdmin = await User.findOne({ role: "admin" });

  if (!existingAdmin) {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      role: "admin"
    });
    console.log("Admin user created in MongoDB.");
    return;
  }

  const extraAdmins = await User.find({ role: "admin", _id: { $ne: existingAdmin._id } });
  if (extraAdmins.length > 0) {
    await User.deleteMany({ _id: { $in: extraAdmins.map((admin) => admin._id) } });
    console.log("Removed duplicate admin users.");
  }
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    db: isMongoConnected ? "connected" : "fallback-env-admin",
    fallbackAdminEmail: ADMIN_EMAIL
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (isMongoConnected) {
    const adminUser = await User.findOne({ email: email.toLowerCase(), role: ADMIN_ROLE });
    if (!adminUser || adminUser.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = {
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token, user });
  }

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const user = { email: ADMIN_EMAIL.toLowerCase(), name: ADMIN_NAME, role: ADMIN_ROLE };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token, user });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { email: user.email, name: user.name } });
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

const startServer = async () => {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI missing. Starting in fallback mode.");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    isMongoConnected = true;
    console.log("MongoDB connected.");
    await ensureSingleAdmin();
  } catch (error) {
    isMongoConnected = false;
    console.warn(`MongoDB unavailable (${error.message}). Starting in fallback mode.`);
  }

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
