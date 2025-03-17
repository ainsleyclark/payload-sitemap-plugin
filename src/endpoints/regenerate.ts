import type { PayloadHandler, PayloadRequest } from 'payload';
import { generate } from '../sitemap/generate.js';
import type { SitemapPluginConfig } from '../types.js';

export const regenerate = (config: SitemapPluginConfig): PayloadHandler => {
	return async (req: PayloadRequest): Promise<Response> => {
		const { payload } = req;
		const logger = payload.logger;

		try {
			await generate({
				config,
				req,
				useCache: false,
			});
			logger.info('Sitemap cache cleared');
			return new Response(`Successfully cleared sitemap cache`, { status: 200 });
		} catch (err) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return new Response(`Error clearing sitemap cache: ${err}`, { status: 500 });
		}
	};
};
