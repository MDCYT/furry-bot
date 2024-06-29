import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/** @type {import('./index.js').Command} */
export default {
	data: {
		name: 'image',
		description: 'Get a random or specified image with tags from e926.',
		options: [
			{
				name: 'tags',
				type: 3,
				description: 'Tags to search for.',
				required: false,
			},
			{
				name: 'random',
				type: 5,
				description: 'Whether to return a random image or the latest. Defaults to true.',
				required: false,
			},
		],
		contexts: [0, 1, 2],
		integration_types: [0, 1],
	},
	async execute(interaction) {
		await interaction.deferReply();

		let tags = interaction.options.getString('tags') || '';
		const random = interaction.options.getBoolean('random') ?? true;

		if (random && !tags.includes('order:')) tags += ' order:random';

		const url = `https://e926.net/posts.json?tags=${tags}&limit=1`;

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
			.setURL(`https://e926.net/posts/${post.id}`)
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
			embed.setDescription(post.description);
		}

		const actionRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setLabel('Source')
				.setStyle(ButtonStyle.Link)
				.setURL(`https://e926.net/posts/${post.id}`)
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
				content: `**Video Post:** ${post.file.url || post.sample.url || post.preview.url}`,
			});
		}
	},
};
