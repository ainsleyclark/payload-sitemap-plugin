import type { PayloadHandler, PayloadRequest, Where } from 'payload'
import type { ErrorLevel } from 'sitemap/dist/lib/types.js'

import { SitemapStream, streamToPromise } from 'sitemap'

import type { ChangeFrequency, SitemapPluginConfig, SitemapPriority } from '../types.js'

type SitemapRecord = {
  changeFreq?: ChangeFrequency
  lastModified?: Date
  priority?: SitemapPriority
  url: string
}

export const sitemapXML = (pluginConfig: SitemapPluginConfig): PayloadHandler => {
  return async (req: PayloadRequest): Promise<Response> => {
    const { payload } = req;
    const logger = payload.logger;

    if (pluginConfig.disabled) {
      return new Response('Sitemap is disabled', { status: 404 })
    }

    /**
     * If the sitemap is in the cache and valid, return it straight away.
     */
    const cachedSitemap = await getCachedSitemap(req, pluginConfig);
    if (cachedSitemap) {
      return new Response(cachedSitemap, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const out: SitemapRecord[] = []

    /**
     * Add the homepage to the routes if it's set to true
     * within the plugin config.
     */
    if (pluginConfig.includeHomepage !== false) {
      out.push({
        changeFreq: 'weekly',
        priority: 1.0,
        url: pluginConfig.hostname,
      })
    }

    /**
     * Add custom routes that have been defined by the user.
     */
    if (pluginConfig.customRoutes && pluginConfig.customRoutes.length > 0) {
      for (const route of pluginConfig.customRoutes) {
        out.push({
          changeFreq: route.changeFreq,
          lastModified: route.lastMod ? route.lastMod : undefined,
          priority: route.priority,
          url: route.loc
        })
      }
    }

    /**
     * Add all the records defined in the collections.
     */
    for (const slug in pluginConfig.collections) {
      const collectionConfig = pluginConfig.collections[slug]
      if (!collectionConfig) {
        continue
      }

      const includeDrafts = collectionConfig.includeDrafts ?? pluginConfig.includeDrafts ?? false

      const whereQuery: Where = {
        excludeFromSitemap: {
          not_equals: true,
        },
      }

      if (!includeDrafts) {
        whereQuery._status = {
          equals: 'published',
        }
      }

      const items = await payload.find({
        collection: slug,
        pagination: false,
        req,
        where: whereQuery,
      })

      if (items.docs) {
        for (const doc of items.docs) {
          // Get last modified date
          let lastModified = undefined
          if (collectionConfig.lastModField && doc[collectionConfig.lastModField]) {
            lastModified = new Date(doc[collectionConfig.lastModField])
          } else if (doc.updatedAt) {
            lastModified = new Date(doc.updatedAt)
          }

          // Call the user defined generate URL function.
          const url = await pluginConfig.generateURL({
            doc,
            locale: req.locale ?? undefined,
            req,
          })

          out.push({
            changeFreq: collectionConfig.changeFreq,
            lastModified,
            priority:
              doc.sitemapPriority ||
              collectionConfig.priority ||
              pluginConfig.defaultPriority ||
              0.5,
            url,
          })
        }
      }
    }

    /**
     * Generate the sitemap and return the response to the writer.
     */
    try {
      const stream = new SitemapStream({
        errorHandler: (error: Error, level: ErrorLevel) => {
          logger.error(`Error generating sitemap:  ${error}, level: ${level}`)
        },
        hostname: pluginConfig.hostname
      });
      out.forEach((item) => stream.write(item));
      stream.end();

      const xmlData = await streamToPromise(stream);

      // Save the generated sitemap to cache
      await saveSitemapToCache(req, xmlData.toString());

      return new Response(xmlData.toString(), {
        headers: { 'Content-Type': 'application/xml' },
      });
    } catch (error) {
      logger.error('Sitemap generation failed', error);
      return new Response('Error generating sitemap', { status: 500 });
    }
  }
}
