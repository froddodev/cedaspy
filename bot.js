import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { getUsers, getBansInfo, getMMRRange } from './utils.js'; // Import getMMRRange function

dotenv.config(); // Load environment variables

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

// Get the channel ID from the .env file
const allowedChannelId = process.env.ALLOWED_CHANNEL_ID;

client.once('ready', () => {
  console.log('Bot is online');
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages or messages not from the allowed channel
  if (message.author.bot || message.channel.id !== allowedChannelId) return;

  const content = message.content.trim();

  // Detect the #id command
  if (content.startsWith('#id')) {
    const searchValue = content.slice(3).trim(); // Get the Steam ID or player name
    try {
      const userInfo = await getUsers(searchValue); // Wait to get the player info

      if (userInfo) {
        const mmrInfo = getMMRRange(userInfo.mmr);  // Get MMR range and color

        // Create an embed with player info
        const embed = new EmbedBuilder()
          .setColor(mmrInfo.color) // Set color based on the MMR range
          .setTitle(`Player Profile: ${userInfo.playerName}`)
          .setURL(`https://steamcommunity.com/profiles/${userInfo.steamId}`)
          .setThumbnail(userInfo.avatar)
          .addFields(
            { name: 'Steam ID', value: userInfo.steamId, inline: true },
            { name: 'MMR', value: mmrInfo.label, inline: true },  // Show range + MMR
            { name: 'Last Played', value: userInfo.lastPlayed.toString(), inline: true },
          )
          .setFooter({ text: 'Data fetched from Cedapug' })
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      } else {
        message.channel.send("Player not found or invalid name.");
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      message.channel.send("There was an error fetching user data.");
    }
  }

  // Detect the #bans command
  if (content.startsWith('#bans')) {
    const searchValue = content.slice(6).trim(); // Get the Steam ID or player name
    try {
      const userInfo = await getUsers(searchValue); // Wait to get the player info

      if (userInfo) {
        const bansInfo = await getBansInfo(userInfo.steamId); // Wait for ban info

        if (bansInfo && bansInfo.bans.length > 0) {
          // Create an embed with the list of bans
          const bansEmbed = new EmbedBuilder()
            .setColor('#ff0000') // Red border color for bans
            .setTitle(`Bans for ${userInfo.playerName}`)
            .setThumbnail(userInfo.avatar)
            .addFields(
              { name: 'Steam ID', value: userInfo.steamId, inline: true },
              { name: 'Total Bans', value: bansInfo.bans.length.toString(), inline: true }
            )
            .setFooter({ text: 'Cedapug Ban Information' })
            .setTimestamp();

          bansInfo.bans.forEach((ban, index) => {
            bansEmbed.addFields({
              name: `Ban #${index + 1}`,
              value: `**Name:** ${ban.name}\n**Reason:** ${ban.reason}\n**Banned by:** ${ban.bannedBy || 'Unknown'}\n**Start:** ${ban.start}\n**End:** ${ban.end}`,
              inline: false,
            });
          });

          message.channel.send({ embeds: [bansEmbed] });
        } else {
          message.channel.send("No bans found.");
        }
      } else {
        message.channel.send("Player not found or invalid name.");
      }
    } catch (error) {
      console.error('Error fetching bans:', error);
      message.channel.send("There was an error fetching ban information.");
    }
  }

  // Detect the #cedaspy command
  if (content.startsWith('#cedaspy')) {
    const embed = new EmbedBuilder()
      .setColor('#00FF00') // Set a green color for the bot info
      .setTitle('I am a Cedapug Spy Bot')
      .setDescription('This bot can only be used in the `#cedapug` text channel with the Cedapug role.')
      .addFields(
        { name: '#id', value: 'Get player profile and stats by Steam ID or name.' },
        { name: '#bans', value: 'Check a player\'s ban history.' },
        { name: '#cedaspy', value: 'Get information bot.' }
      )
      .setFooter({ text: 'Cedapug Spy Bot - Tracking player data!' })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
