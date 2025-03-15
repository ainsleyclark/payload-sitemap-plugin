import type { PayloadHandler, PayloadRequest, Where } from 'payload'
import type { ErrorLevel } from 'sitemap/dist/lib/types.js'

import { SitemapStream, streamToPromise } from 'sitemap'

import type { SitemapPluginConfig } from '../types.js'

import { SitemapCache } from './cache.js'
import { generate } from './generate.js'

export const sitemapXML = (pluginConfig: SitemapPluginConfig): PayloadHandler => {
	return async (req: PayloadRequest): Promise<Response> => {
		const { payload } = req
		const logger = payload.logger
		const cache = new SitemapCache(req, pluginConfig)

		if (pluginConfig.disabled) {
			return new Response('Sitemap is disabled', { status: 404 })
		}

		const items = await generate(req, pluginConfig);

		/**
		 * If the sitemap is in the cache and valid, return it straight away.
		 */
		const cachedSitemap = await cache.get()
		if (cachedSitemap) {
			logger.debug('Serving sitemap from cache')
			return new Response(cachedSitemap, {
				headers: { 'Content-Type': 'application/xml' },
			})
		}

		/**
		 * Generate the sitemap and return the response to the writer.
		 */
		try {
			const stream = new SitemapStream({
				errorHandler: (error: Error, level: ErrorLevel) => {
					logger.error(`Error generating sitemap:  ${error}, level: ${level}`)
				},
				hostname: pluginConfig.hostname,
			})
			items.forEach((item) => stream.write(item))
			stream.end()

			const xmlData = await streamToPromise(stream)

			// Save the generated sitemap to cache
			await cache.set(xmlData.toString())

			return new Response(xmlData.toString(), {
				headers: { 'Content-Type': 'application/xml' },
			})
		} catch (error) {
			logger.error('Sitemap generation failed', error)
			return new Response('Error generating sitemap', { status: 500 })
		}
	}
}
