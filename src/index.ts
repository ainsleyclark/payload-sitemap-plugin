import type { Config } from 'payload';
import { regenerate } from './endpoints/regenerate.js';
import { sitemapXML } from './endpoints/xml.js';
import { ExcludeFromSitemap } from './fields/excludeFromSitemap.js';
import { SitemapPriority } from './fields/sitemapPriority.js';
import { SitemapGlobal } from './globals/sitemap.js';
import type { SitemapPluginConfig } from './types.js';

export const payloadSitemapPlugin = (pluginConfig: SitemapPluginConfig) => (config: Config): Config => {
	if (!config.collections) {
		config.collections = [];
	}

	config.globals = [
		...(config.globals || []),
		SitemapGlobal,
	];

	if (pluginConfig.collections) {
		for (const collectionSlug in pluginConfig.collections) {
			const collection = config.collections.find(
				(collection) => collection.slug === collectionSlug,
			);

			if (collection) {
				collection.fields = [
					...(collection.fields || []),
					SitemapPriority,
					ExcludeFromSitemap,
				];
			}
		}
	}

	/**
	 * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
	 * If your plugin heavily modifies the database schema, you may want to remove this property.
	 */
	if (pluginConfig.disabled) {
		return config;
	}

	config.endpoints = [
		...(config.endpoints || []),
		{
			handler: sitemapXML(pluginConfig),
			method: 'get',
			path: '/plugin-sitemap/sitemap.xml',
		},
		{
			handler: regenerate(pluginConfig),
			method: 'post',
			path: '/plugin-sitemap/regenerate',
		},
	];

	return config;
};
