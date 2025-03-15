import type { PayloadHandler, PayloadRequest, Where } from 'payload'

import type { ChangeFrequency, SitemapPluginConfig, SitemapPriority } from '../types.js'

type SitemapRecord = {
  changeFreq?: ChangeFrequency
  lastModified?: Date
  priority?: SitemapPriority
  url: string
}

export const sitemapXML = (pluginConfig: SitemapPluginConfig): PayloadHandler => {
  return async (req: PayloadRequest): Promise<Response> => {
    const { payload } = req

    if (pluginConfig.disabled) {
      return new Response('Sitemap is disabled', { status: 404 })
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
          lastModified: route.lastMod ? new Date(route.lastMod) : undefined,
          priority: route.priority,
          url: `${pluginConfig.hostname}${route.loc}`,
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
            url: `${pluginConfig.hostname}${url}`,
          })
        }
      }
    }

    return new Response()
  }
}
