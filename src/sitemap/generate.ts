import type { PayloadRequest, Where } from 'payload';

import type { ChangeFrequency, SitemapPluginConfig, SitemapPriority } from '../types.js';

import { SitemapCache } from './cache.js';

export type SitemapRecord = {
	changeFreq?: ChangeFrequency
	lastModified?: Date
	priority?: SitemapPriority
	url: string
}

export type GenerateConfig = {
    config: SitemapPluginConfig
    req: PayloadRequest
	useCache: boolean
}

export const generate = async (args: GenerateConfig): Promise<SitemapRecord[]> => {
    const { config, req, useCache } = args;
	const cache = new SitemapCache(req, config);
	const { payload } = req;
	const logger = payload.logger;
	const records: SitemapRecord[] = [];

	/**
	 * If the sitemap is in the cache and valid, return it straight away.
	 */
	if (useCache) {
		const cachedSitemap = await cache.get();
		if (cachedSitemap) {
			logger.debug('Serving sitemap from cache');
			return JSON.parse(cachedSitemap);
		}
	}

	/**
	 * Add the homepage to the routes if it's set to true
	 * within the plugin config.
	 */
	if (config.includeHomepage !== false) {
		records.push({
			changeFreq: 'weekly',
			priority: 1.0,
			url: config.hostname,
		});
	}

	/**
	 * Add custom routes that have been defined by the user.
	 */
	if (config.customRoutes && config.customRoutes.length > 0) {
		for (const route of config.customRoutes) {
			records.push({
				changeFreq: route.changeFreq,
				lastModified: route.lastMod ? route.lastMod : undefined,
				priority: route.priority,
				url: route.loc,
			});
		}
	}

	/**
	 * Add all the records defined in the collections.
	 */
	for (const slug in config.collections) {
		const collConfig = config.collections[slug];
		if (!collConfig) {
			continue;
		}

		let collectionConfig: {
			changeFreq?: ChangeFrequency;
			includeDrafts?: boolean;
			lastModField?: string;
			priority?: SitemapPriority;
		} & NonNullable<typeof config.collections[typeof slug]>;

		if (typeof collConfig === 'boolean') {
			if (!collConfig) { // Skip the collection if it's false
				continue;
			}

			collectionConfig = {
				changeFreq: 'weekly',
				includeDrafts: config.includeDrafts ?? false,
				lastModField: 'updatedAt',
				priority: config.defaultPriority ?? 0.5,
			};
		} else {
			collectionConfig = collConfig;
		}

		const includeDrafts = collectionConfig.includeDrafts ?? config.includeDrafts ?? false;

		const whereQuery: Where = {
			excludeFromSitemap: {
				not_equals: true,
			},
		};

		if (!includeDrafts) {
			whereQuery._status = {
				equals: 'published',
			};
		}

		const items = await payload.find({
			collection: slug,
			pagination: false,
			req,
			where: whereQuery,
		});

		if (items.docs) {
			for (const doc of items.docs) {
				// Get last modified date
				let lastModified = undefined;
				if (collectionConfig.lastModField && doc[collectionConfig.lastModField]) {
					lastModified = new Date(doc[collectionConfig.lastModField]);
				} else if (doc.updatedAt) {
					lastModified = new Date(doc.updatedAt);
				}

				// Call the user defined generate URL function.
				const url = await config.generateURL({
					doc,
					locale: req.locale ?? undefined,
					req,
				});

				records.push({
					changeFreq: collectionConfig.changeFreq,
					lastModified,
					priority:
						doc.sitemapPriority ||
						collectionConfig.priority ||
                        config.defaultPriority ||
						0.5,
					url,
				});
			}
		}
	}

	// Set the items back in cache.
	await cache.set(JSON.stringify(records));

	return records;
};
