import process from 'node:process';
import { URL } from 'node:url';
import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import { loadCommands, loadEvents } from './util/loaders.js';
import { registerEvents } from './util/registerEvents.js';

const PORT = process.env.PORT || 3_000;

// Initialize the client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

// Initialize the express server
const app = express();

// Set up the server
app.get('/', (req, res) => {
	// Show the ip address of the user
	let ip =
		req.headers['cf-connecting-ip'] ||
		req.headers.cf_ip ||
		req.ip ||
		req.headers['x-forwarded-for'] ||
		req.socket.remoteAddress;

	if (ip.startsWith('::ffff:')) {
		ip = ip.slice(7);
	}

	res.send(
		`<body style="background-color: #36393f; color: #fff; font-family: Arial, sans-serif; text-align: center; padding-top: 20%;">Your IP address is: ${ip} :3 ${JSON.stringify(req.headers)}</body>`,
	);
});

// Load the events and commands
const events = await loadEvents(new URL('events/', import.meta.url));
const commands = await loadCommands(new URL('commands/', import.meta.url));

// Register the event handlers
registerEvents(commands, events, client);

// Login to the client
void client.login(process.env.DISCORD_TOKEN);

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
