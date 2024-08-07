import { ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } from 'discord.js';

/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'nsfw',
		description: 'Get a random or specified image with tags from e621.',
		options: [
			{
				name: 'tags',
				type: ApplicationCommandOptionType.String,
				description: 'Tags to search for.',
				required: false,
				autocomplete: true,
			},
			{
				name: 'random',
				type: ApplicationCommandOptionType.Boolean,
				description: 'Whether to return a random image or the latest. Defaults to true.',
				required: false,
			},
		],
		nsfw: true,
		contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
		integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	},

	async execute(interaction) {
		await interaction.deferReply();

		let tags = interaction.options.getString('tags') || '';
		const random = interaction.options.getBoolean('random') ?? true;

		if (random && !tags.includes('order:')) tags += ' order:random';

		const url = `https://e621.net/posts.json?tags=${tags}&limit=1`;

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'FurryBot',
			},
		});

		if (!response.ok) {
			await interaction.editReply('Failed to fetch image.');
			return;
		}

		const data = await response.json();
		const posts = data.posts;

		if (!posts.length) {
			await interaction.editReply('No images found.');
			return;
		}

		const post = posts[0];

		if (!post) {
			await interaction.editReply('No images found.');
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(`Post #${post.id}`)
			.setURL(`https://e621.net/posts/${post.id}`)
			.setColor('#0099ff');

		if (post.file.ext !== 'webm') {
			if (post.sample && post.sample.url) {
				embed.setImage(post.sample.url);
			} else if (post.preview && post.preview.url) {
				embed.setImage(post.preview.url);
			} else {
				embed.setImage(post.file.url);
			}
		}

		if (post.tags.artist && post.tags.artist.length) {
			embed.addFields({
				name: 'Artist',
				value: post.tags.artist.join(', ').slice(0, 1_024),
			});
		}

		if (post.tags.character && post.tags.character.length) {
			embed.addFields({
				name: 'Character',
				value: post.tags.character.join(', ').slice(0, 1_024),
			});
		}

		if (post.description) {
			embed.setDescription(post.description).slice(0, 4_096);
		}

		const actionRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setLabel('Source')
				.setStyle(ButtonStyle.Link)
				.setURL(`https://e621.net/posts/${post.id}`)
				.setEmoji('🔗'),
			new ButtonBuilder()
				.setLabel('HD Download')
				.setStyle(ButtonStyle.Link)
				.setURL(post.file.url || post.sample.url || post.preview.url)
				.setEmoji('⬇️'),
		);

		if (embed.data.image) {
			await interaction.editReply({ embeds: [embed], components: [actionRow] });
		} else {
			await interaction.editReply({
				embeds: [embed],
				components: [actionRow],
			});
			await interaction.followUp({
				content: `[Video Post](${post.file.url || post.sample.url || post.preview.url})`,
			});
		}
	},

	async autocomplete(interaction) {
		const tags = interaction.options.getFocused();
		const lastTag = tags.split(' ').pop();

		if (tags.trim().length === 0) return interaction.respond([{ name: 'order:random', value: 'order:random' }]);
		if (lastTag.length <= 2) return interaction.respond([{ name: tags, value: tags }]);

		const url = `https://e621.net/tags/autocomplete.json?search%5Bname_matches%5D=${lastTag}&expiry=7`;

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'FurryBot',
			},
		});

		if (!response.ok) {
			return interaction.respond([{ name: tags, value: tags }]);
		}

		const data = await response.json();
		const fetchedTags = data.map((tag) => tag.name);

		return interaction.respond(
			fetchedTags.map((tag) => ({
				name: `${tags.split(' ').slice(0, -1).join(' ')} ${tag}`,
				value: `${tags.split(' ').slice(0, -1).join(' ')} ${tag}`,
			})),
		);
	},
};
