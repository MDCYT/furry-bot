import { EmbedBuilder } from 'discord.js';

/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'info',
		description: 'Get information about the bot.',
	},
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('Information')
			.setDescription(
				'This bot is a simple example of a Discord bot written in JavaScript using the Discord.js library.',
			)
			.addField('Source Code', '[GitHub](https://github.com/mdcyt/furry-bot)')
			.setColor('#0099ff');

		await interaction.reply({ embeds: [embed] });
	},
};
