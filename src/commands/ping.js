import { EmbedBuilder } from 'discord.js';

/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'ping',
		description: 'Ping!',
	},
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('Pong! :3')
			.setDescription(`Latency is ${Date.now() - interaction.createdTimestamp}ms.`)
			.setColor('#0099ff');

		await interaction.reply({ embeds: [embed] });
	},
};
