import type { PayloadHandler, PayloadRequest } from 'payload';
import type { EnumChangefreq, ErrorLevel, SitemapItemLoose } from 'sitemap/dist/lib/types.js';

import { SitemapStream, streamToPromise } from 'sitemap';

import type { SitemapPluginConfig } from '../types.js';

import { generate } from '../sitemap/generate.js';

export const sitemapXML = (pluginConfig: SitemapPluginConfig): PayloadHandler => {
	return async (req: PayloadRequest): Promise<Response> => {
		const { payload } = req;
		const logger = payload.logger;
		const items = await generate({
			config: pluginConfig,
			req,
			useCache: true,
		});
		const sitemapItems: SitemapItemLoose[] = items.map((item) => ({
			changefreq: item.changeFreq as EnumChangefreq,
			lastmod: item.lastModified,
			priority: item.priority,
			url: item.url,
		}));

		/**
		 * Generate the sitemap and return the response to the writer.
		 */
		try {
			const stream = new SitemapStream({
				errorHandler: (error: Error, level: ErrorLevel) => {
					logger.error(`Error generating sitemap:  ${error}, level: ${level}`);
				},
				hostname: typeof pluginConfig.hostname === 'function'
					? await pluginConfig.hostname(req)
					: pluginConfig.hostname,
			});
			sitemapItems.forEach((item) => stream.write(item));
			stream.end();

			const xmlData = await streamToPromise(stream);

			return new Response(xmlData.toString(), {
				headers: { 'Content-Type': 'application/xml' },
			});
		} catch (error) {
			logger.error('Sitemap generation failed', error);
			return new Response('Error generating sitemap', { status: 500 });
		}
	};
};
