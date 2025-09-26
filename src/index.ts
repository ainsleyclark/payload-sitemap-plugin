import type { Config, Field, GlobalConfig } from 'payload';

import type { SitemapPluginConfig } from './types.js';

import { regenerate } from './endpoints/regenerate.js';
import { sitemapXML } from './endpoints/xml.js';
import { ExcludeFromSitemap } from './fields/excludeFromSitemap.js';
import { SitemapPriority } from './fields/sitemapPriority.js';
import { SitemapGlobal } from './globals/sitemap.js';

export const sitemapPlugin = (pluginConfig: SitemapPluginConfig) => (config: Config): Config => {
	if (!config.collections) {
		config.collections = [];
	}

	/**
	 * Setup sitemap global with optional overrides.
	 */
	let globalWithOverrides: GlobalConfig = {
		...SitemapGlobal,
		...pluginConfig.globalOverrides,
		fields: SitemapGlobal.fields,
	};

	// Apply field overrides for global if provided
	if (pluginConfig.globalOverrides?.fields) {
		globalWithOverrides = {
			...globalWithOverrides,
			fields: pluginConfig.globalOverrides.fields({
				defaultFields: SitemapGlobal.fields ?? [],
			}),
		};
	}

	config.globals = [
		...(config.globals || []),
		globalWithOverrides,
	];

	/**
	 * Attach the sitemap fields to each collection
	 */
	if (pluginConfig.collections) {
		for (const collectionSlug in pluginConfig.collections) {
			const collection = config.collections.find(
				(collection) => collection.slug === collectionSlug,
			);

			if (!collection) {
				continue
			}

			let defaultFields: Field[] = [
				...(collection.fields || []),
				SitemapPriority,
				ExcludeFromSitemap,
			];

			// Apply per-collection field overrides if provided,
			const collConfig = pluginConfig.collections[collectionSlug];
			if (typeof collConfig !== 'boolean' && collConfig?.fieldOverrides) {
				defaultFields = collConfig.fieldOverrides({
					defaultFields,
				});
			}

			collection.fields = defaultFields;
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
			path: '/plugin-sitemap/sitemap/index.xml',
		},
		{
			handler: regenerate(pluginConfig),
			method: 'post',
			path: '/plugin-sitemap/regenerate',
		},
	];

	return config;
};
