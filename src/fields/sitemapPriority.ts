import type { Field } from 'payload';

export const SitemapPriority: Field = {
	name: 'sitemapPriority',
	type: 'number',
	admin: {
		position: 'sidebar',
		step: 0.1,
	},
	label: 'Sitemap Priority',
	max: 1,
	min: 0,
};
