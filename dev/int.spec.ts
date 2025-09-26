/* eslint-disable no-console */

import type {  FieldBase, Payload } from 'payload';

import dotenv from 'dotenv';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import path from 'path';
import { getPayload } from 'payload';
import { fileURLToPath } from 'url';

import type { SitemapRecord } from '../src/sitemap/generate.js';

import { NextRESTClient } from './helpers/NextRESTClient.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

let payload: Payload;
let restClient: NextRESTClient;
let memoryDB: MongoMemoryReplSet | undefined;

describe('Plugin tests', () => {
	beforeAll(async () => {
		process.env.DISABLE_PAYLOAD_HMR = 'true';
		process.env.PAYLOAD_DROP_DATABASE = 'true';

		dotenv.config({
			path: path.resolve(dirname, './.env'),
		});

		if (!process.env.DATABASE_URI) {
			console.log('Starting memory database');
			memoryDB = await MongoMemoryReplSet.create({
				replSet: {
					count: 3,
					dbName: 'payloadmemory',
				},
			});
			console.log('Memory database started');

			process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`;
		}

		const { default: config } = await import('./payload.config.js');

		payload = await getPayload({ config });
		restClient = new NextRESTClient(payload.config);
	});

	afterAll(async () => {
		if (payload.db.destroy) {
			await payload.db.destroy();
		}

		if (memoryDB) {
			await memoryDB.stop();
		}
	});

	it('plugin creates and seeds posts', async () => {
		expect(payload.collections['posts']).toBeDefined();
		const { docs } = await payload.find({ collection: 'posts' });
		expect(docs).toHaveLength(3);
	});

	it('adds sitemap global for caching', () => {
		const sitemapGlobal = payload.globals.config.find(global => global.slug === 'sitemap');
		expect(sitemapGlobal).toBeDefined();
	});

	it('adds sitemap fields correctly', () => {
		const fields = payload.collections['posts'].config.fields as FieldBase[];

		const sitemapPriorityField = fields.find(field => field.name === 'sitemapPriority');
		expect(sitemapPriorityField).toBeDefined();

		const excludeFromSitemapField = fields.find(field => field.name === 'excludeFromSitemap');
		expect(excludeFromSitemapField).toBeDefined();
	});

	it('generates a basic site map and caches response', async () => {
		const response = await restClient.GET('/plugin-sitemap/sitemap/index.xml');
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('application/xml');

		const data = await response.text();

		expect(data).toContain('<loc>https://ainsley.dev/</loc>');
		expect(data).toContain('<loc>https://ainsley.dev/title-2</loc>');
		expect(data).toContain('<loc>https://ainsley.dev/title-1</loc>');
		expect(data).not.toContain('<loc>https://ainsley.dev/title-3</loc>');

		const global = await payload.findGlobal({ slug: 'sitemap' });
		expect(global).toBeDefined();

		const contentObj = JSON.parse(global.content as string) as SitemapRecord[];
		expect(contentObj).toBeDefined();
		expect(contentObj).toHaveLength(3);
	});

	it('applies collection fieldOverrides correctly', () => {
		const fields = payload.collections['posts'].config.fields as FieldBase[];
		const exists = fields.some((f) => f.name === 'customSEO');
		expect(exists).toBe(true);
	});

	it('applies globalOverrides correctly', () => {
		const sitemapGlobal = payload.globals.config.find(g => g.slug === 'sitemap');
		expect(sitemapGlobal?.label).toBe('Custom Sitemap Global');

		const globalFields = sitemapGlobal?.fields as FieldBase[];
		const exists = globalFields.some((f) => f.name === 'extraSetting');
		expect(exists).toBe(true);
	});
});

