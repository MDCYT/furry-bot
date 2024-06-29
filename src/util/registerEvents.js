import { Events } from 'discord.js';

/**
 * @param {Map<string, import('../commands/index.js').Command>} commands
 * @param {import('../events/index.js').Event[]} events
 * @param {import('discord.js').Client} client
 */
export function registerEvents(commands, events, client) {
	// Create an event to handle command interactions
	/** @type {import('../events/index.js').Event<Events.InteractionCreate>} */
	const interactionCreateEvent = {
		name: Events.InteractionCreate,
		async execute(interaction) {
			try {
				if (interaction.isCommand()) {
					const command = commands.get(interaction.commandName);

					if (!command) {
						throw new Error(`Command '${interaction.commandName}' not found.`);
					}

					await command.execute(interaction);
				} else if (interaction.isAutocomplete()) {
					const command = commands.get(interaction.commandName);

					if (!command) {
						throw new Error(`Command '${interaction.commandName}' not found.`);
					}

					await command.autocomplete(interaction);
				}
			} catch (error) {
				console.error(error);
				// Check if is deferred
				if (interaction.isCommand()) {
					if (interaction.deferred || interaction.replied) {
						await interaction.editReply({
							content: 'There was an error while executing this command!',
							ephemeral: true,
						});
					} else {
						await interaction.reply({
							content: 'There was an error while executing this command!',
							ephemeral: true,
						});
					}
				}
			}
		},
	};

	for (const event of [...events, interactionCreateEvent]) {
		client[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
	}
}
