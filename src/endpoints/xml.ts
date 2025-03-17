import type { PayloadHandler, PayloadRequest } from 'payload';
import { SitemapStream, streamToPromise } from 'sitemap';
import type { ErrorLevel } from 'sitemap/dist/lib/types.js';
import { generate } from '../sitemap/generate.js';
import type { SitemapPluginConfig } from '../types.js';

export const sitemapXML = (pluginConfig: SitemapPluginConfig): PayloadHandler => {
	return async (req: PayloadRequest): Promise<Response> => {
		const { payload } = req;
		const logger = payload.logger;
		const items = await generate({
			config: pluginConfig,
			req,
			useCache: true,
		});

		/**
		 * Generate the sitemap and return the response to the writer.
		 */
		try {
			const stream = new SitemapStream({
				errorHandler: (error: Error, level: ErrorLevel) => {
					logger.error(`Error generating sitemap:  ${error}, level: ${level}`);
				},
				hostname: pluginConfig.hostname,
			});
			items.forEach((item) => stream.write(item));
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
