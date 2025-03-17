import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { sitemapPlugin } from 'payload-sitemap-plugin';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import type { Post } from './payload-types.js';

import { devUser } from './helpers/credentials.js';
import { testEmailAdapter } from './helpers/testEmailAdapter.js';
import { seed } from './seed.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.ROOT_DIR) {
	process.env.ROOT_DIR = dirname;
}

export default buildConfig({
	admin: {
		autoLogin: devUser,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [
		{
			slug: 'posts',
			fields: [
				{ name: 'title', type: 'text' },
				{ name: 'slug', type: 'text' },
				{ name: 'updatedAt', type: 'date' },
			],
			timestamps: true,
			versions: true,
		},
		{
			slug: 'media',
			fields: [],
			upload: {
				staticDir: path.resolve(dirname, 'media'),
			},
		},
	],
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || '',
	}),
	editor: lexicalEditor(),
	email: testEmailAdapter,
	onInit: async (payload) => {
		await seed(payload);
	},
	plugins: [
		sitemapPlugin({
			cache: true,
			collections: {
				posts: {
					includeDrafts: true,
					lastModField: 'updatedAt',
					priority: 0.6,
				},
			},
			generateURL: (args): string => {
				const doc = args.doc as Post;
				return `/${doc.slug}`;
			},
			hostname: 'https://ainsley.dev',
		}),
	],
	secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
});
