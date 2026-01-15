import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
app.use(bodyParser.json());

const DB_FILE = "./guilds.json";

function loadDB() {
  return fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE))
    : {};
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* === TOS ACCEPT === */
app.post("/api/tos/accept", (req, res) => {
  const { guildId, ownerId } = req.body;
  if (!guildId || !ownerId) {
    return res.status(400).json({ error: "Missing data" });
  }

  const db = loadDB();

  db[guildId] = {
    guildId,
    ownerId,
    tosAccepted: true,
    rulesConfirmed: false,
    acceptedAt: new Date().toISOString()
  };

  saveDB(db);
  res.json({ success: true });
});

/* === RULES CONFIRM === */
app.post("/api/rules/confirm", (req, res) => {
  const { guildId } = req.body;
  const db = loadDB();

  if (!db[guildId]) {
    return res.status(404).json({ error: "Guild not found" });
  }

  db[guildId].rulesConfirmed = true;
  saveDB(db);

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("🩸 Dark Wolf API running on port 3000");
});
