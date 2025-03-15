import type { PayloadRequest } from 'payload'

import type { SitemapPluginConfig } from '../types.js'

import { SitemapGlobal } from '../globals/sitemap.js'

const DEFAULT_CACHE_EXPIRY = 86400; // 1 Day

/**
 * Retrieves the sitemap from the cache layer if it's not expired.
 * If the cache is not present, or expired, it will return null.
 *
 * @param req
 * @param pluginConfig
 */
export const getCachedSitemap = async (
	req: PayloadRequest,
	pluginConfig: SitemapPluginConfig,
): Promise<null | string> => {
	const { payload } = req
	const logger = payload.logger

	try {
		const sitemapGlobal = await payload.findGlobal({ slug: SitemapGlobal.slug })

    const cacheDuration = pluginConfig.cache?.duration || DEFAULT_CACHE_EXPIRY;
    const cacheTTL = cacheDuration * 1000;

    const lastGenerated = sitemapGlobal.lastGenerated ? new Date(sitemapGlobal.lastGenerated).getTime() : 0;
    const isCacheValid = Date.now() - lastGenerated < cacheTTL;

		if (sitemapGlobal.content && isCacheValid) {
			logger.debug('Serving sitemap from cache')
			return sitemapGlobal.content
		}

		return null
	} catch (error) {
		logger.error('Error retrieving cached sitemap:', error)
		return null
	}
}

/**
 * Persists a new sitemap to the cache.
 *
 * @param req
 * @param content
 */
export const saveSitemapToCache = async (req: PayloadRequest, content: string): Promise<void> => {
	try {
		await req.payload.updateGlobal({
			slug: SitemapGlobal.slug,
			data: {
				content,
				lastGenerated: new Date().toISOString(),
			},
		})
	} catch (error) {
		req.payload.logger.error('Error saving sitemap to cache:', error)
	}
}
