// backend/scripts/seedUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lms_dev";

const testUsers = [
  { name: "Soham Saha", email: "soham@gmail.com", password: "password1", role: "student" },
  { name: "Rwita Pan", email: "rwitapan@gmail.com", password: "password2", role: "librarian" },
  { name: "Akash Roy", email: "akash@gmail.com", password: "adminpass", role: "admin" },
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to DB for seeding");

  for (const u of testUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log("Skipping existing user:", u.email);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const doc = new User({ name: u.name, email: u.email, password: hashed, role: u.role });
    await doc.save();
    console.log("Created user:", u.email, "password:", u.password);
  }

  console.log("Seeding done");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
