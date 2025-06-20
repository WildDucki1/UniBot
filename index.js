const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const PREFIX = '!';
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const FORTNITE_API_KEY = process.env.FORTNITE_API_KEY; // Fortnite Tracker API Key in Umgebungsvariablen speichern

client.once('ready', () => {
    console.log(`UniBot ist online! Eingeloggt als ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {
        message.channel.send(
            `**UniBot Commands:**\n` +
            `\`!help\` - Zeigt alle verfügbaren Befehle\n` +
            `\`!track [game] [username]\` - Zeigt deine Stats für das Spiel\n\n` +
            `**Beispiel:** \`!track fortnite Ninja\``
        );
    } else if (command === 'track') {
        if (args.length < 2) {
            return message.channel.send('Bitte benutze: `!track [game] [username]`');
        }
        const game = args.shift().toLowerCase();
        const username = args.join(' ');

        if (game === 'fortnite') {
            const stats = await getFortniteStats(username);
            if (!stats) {
                return message.channel.send(`Keine Stats für "${username}" gefunden oder Fehler bei der API.`);
            }
            message.channel.send(formatFortniteStats(stats, username));
        } else {
            message.channel.send(`Sorry, das Spiel "${game}" wird noch nicht unterstützt.`);
        }
    }
});

async function getFortniteStats(username) {
    try {
        const response = await fetch(`https://api.fortnitetracker.com/v1/profile/pc/${encodeURIComponent(username)}`, {
            headers: { 'TRN-Api-Key': FORTNITE_API_KEY }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function formatFortniteStats(data, username) {
    try {
        const lifetime = data.lifeTimeStats;
        const kills = lifetime.find(stat => stat.key === 'Kills')?.value || 'N/A';
        const wins = lifetime.find(stat => stat.key === 'Wins')?.value || 'N/A';
        const matches = lifetime.find(stat => stat.key === 'Matches Played')?.value || 'N/A';

        return `**Fortnite Stats für ${username}:**\nKills: ${kills}\nWins: ${wins}\nMatches Played: ${matches}`;
    } catch {
        return 'Fehler beim Verarbeiten der Stats.';
    }
}

client.login(DISCORD_TOKEN);
