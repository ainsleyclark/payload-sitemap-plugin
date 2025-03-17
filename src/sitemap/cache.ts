import type { Payload, PayloadRequest } from 'payload';

import type { SitemapPluginConfig } from '../types.js';

import { SitemapGlobal } from '../globals/sitemap.js';

/**
 * Responsible for caching sitemaps so that it's not
 * generated on every request.
 */
export class SitemapCache {
	private readonly DEFAULT_CACHE_EXPIRY = 86400; // 1 Day
	private readonly GLOBAL_SLUG = SitemapGlobal.slug;
	private logger: Payload['logger'];
	private payload: Payload;
	private pluginConfig: SitemapPluginConfig;

	constructor(req: PayloadRequest, pluginConfig: SitemapPluginConfig) {
		this.pluginConfig = pluginConfig;
		this.payload = req.payload;
		this.logger = req.payload.logger;
	}

	/**
	 * Obtains how long the cache should last for in seconds.
	 */
	private expiryInSeconds(): number {
		const cacheConfig = this.pluginConfig.cache;
		const cacheDuration = (cacheConfig && typeof cacheConfig !== 'boolean') ? cacheConfig.duration : this.DEFAULT_CACHE_EXPIRY;
		return cacheDuration || this.DEFAULT_CACHE_EXPIRY; // Returns a number
	}

	/**
	 * Determines if the cache is enabled.
	 */
	private isEnabled(): boolean {
		const cacheConfig = this.pluginConfig.cache;

		if (typeof cacheConfig === 'boolean') {
			return cacheConfig; // Boolean directly represents enabled state.
		} else if (cacheConfig) {
			return cacheConfig.enabled !== false; // Defaults to true if not provided.
		}

		return false; // Default: caching is disabled
	}

	/**
	 * Wipes the cached sitemap by clearing the content and lastGenerated date.
	 */
	async clear(): Promise<void> {
		try {
			await this.payload.updateGlobal({
				slug: this.GLOBAL_SLUG,
				data: {
					content: null,
					lastGenerated: null,
				},
			});
			this.logger.debug('Sitemap cache wiped successfully');
		} catch (error) {
			this.logger.error('Error wiping sitemap cache:', error);
		}
	}

	/**
	 * Retrieves the sitemap from the cache layer if it's not expired.
	 * If the cache is not present, or expired, it will return null.
	 */
	async get(): Promise<null | string> {
		if (!this.isEnabled()) {
			return null;
		}

		const cacheConfig = this.expiryInSeconds();
		const cacheTTL = cacheConfig * 1000;

		try {
			const sitemapGlobal = await this.payload.findGlobal({ slug: this.GLOBAL_SLUG });
			const lastGenerated = sitemapGlobal.lastGenerated ? new Date(sitemapGlobal.lastGenerated).getTime() : 0;
			const isCacheValid = Date.now() - lastGenerated < cacheTTL;

			if (sitemapGlobal.content && isCacheValid) {
				return sitemapGlobal.content;
			}

			return null;
		} catch (error) {
			this.logger.error('Error retrieving cached sitemap:', error);
			return null;
		}
	}

	/**
	 * Persists a new sitemap to the cache.
	 */
	async set(content: string): Promise<void> {
		try {
			await this.payload.updateGlobal({
				slug: this.GLOBAL_SLUG,
				data: {
					content,
					lastGenerated: new Date().toISOString(),
				},
			});
		} catch (error) {
			this.logger.error('Error saving sitemap to cache:', error);
		}
	}
}
