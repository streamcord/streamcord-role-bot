import { Client, Guild, Role } from "discord.js";
import { logHandler } from "./utils/logHandler";

(async () => {
  const bot = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

  let role: Role | null = null;
  let guild: Guild | null = null;

  bot.on("ready", async () => {
    guild = await bot.guilds.fetch(process.env.HOME_GUILD || "oh no");

    if (!guild) {
      logHandler.log("error", "Cannot find my home guild!");
      process.exit(1);
    }

    role = await guild.roles.fetch(process.env.MESSAGE_ROLE || "oh no");

    if (!role) {
      logHandler.log("error", "Cannot find my message role.");
      process.exit(1);
    }

    logHandler.log("info", "Bot is online and ready to go.");
  });

  bot.on("messageCreate", async (message) => {
    if (!guild || !role || !message.member) {
      return;
    }

    if (message.guildId !== guild.id) {
      return;
    }

    if (message.member?.roles.cache.has(role.id) || message.author.bot) {
      return;
    }

    await message.member.roles
      .add(role)
      .then(() =>
        logHandler.log("info", `Assigned role to ${message.author.username}`)
      )
      .catch((err) => {
        logHandler.log(
          "error",
          `Error giving role to ${message.author.username}`
        );
        logHandler.log("error", err);
      });
  });

  await bot.login(process.env.BOT_TOKEN || "oh no");
})();
