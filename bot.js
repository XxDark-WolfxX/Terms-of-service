
import fs from "fs";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

const DB_FILE = "./guilds.json";

function loadDB() {
  return fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE))
    : {};
}

/* === BOT JOIN === */
client.on("guildCreate", async (guild) => {
  const owner = await guild.fetchOwner();
  const db = loadDB();
  const record = db[guild.id];

  if (!record?.tosAccepted) {
    owner.send(
      "🐺 **Dark Wolf Setup Required**\n\n" +
      "You must complete the Terms of Service before the bot can operate.\n\n" +
      `https://yourdomain.com/tos.html?guild_id=${guild.id}&owner_id=${owner.id}`
    );
  } else if (!record.rulesConfirmed) {
    owner.send(
      "🩸 **Dark Wolf Setup – Step 2**\n\n" +
      "Terms accepted. Please add the Dark Wolf rules to your server rules channel."
    );
  }
});

/* === COMMAND LOCKOUT === */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const db = loadDB();
  const record = db[interaction.guild.id];

  if (!record || !record.tosAccepted || !record.rulesConfirmed) {
    return interaction.reply({
      content: "🩸 Dark Wolf is locked. Check your DMs to complete setup.",
      ephemeral: true
    });
  }

  // normal commands below
});

/* === DM OWNER WHEN TOS COMPLETED === */
client.on("ready", () => {
  console.log(`🐺 Logged in as ${client.user.tag}`);
});

setInterval(async () => {
  const db = loadDB();

  for (const guildId in db) {
    const record = db[guildId];
    if (record.tosAccepted && !record.notified) {
      try {
        const user = await client.users.fetch(record.ownerId);
        await user.send(
          "🩸 **Dark Wolf — ToS Completed**\n\n" +
          `Guild ID: ${guildId}\n` +
          `Accepted at: ${record.acceptedAt}\n\n` +
          "Next step: Add the Dark Wolf rules and confirm."
        );

        record.notified = true;
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      } catch {}
    }
  }
}, 10000);

client.login("YOUR_BOT_TOKEN");
