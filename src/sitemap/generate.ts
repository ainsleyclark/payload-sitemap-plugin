import type { PayloadRequest, Where } from 'payload';

import type { ChangeFrequency, SitemapPluginConfig, SitemapPriority } from '../types.js';

export type SitemapRecord = {
  changeFreq?: ChangeFrequency
  lastModified?: Date
  priority?: SitemapPriority
  url: string
}

export const generate = async (req: PayloadRequest, pluginConfig: SitemapPluginConfig): Promise<SitemapRecord[]> => {
  const { payload } = req;
  const records: SitemapRecord[] = []

  /**
   * Add the homepage to the routes if it's set to true
   * within the plugin config.
   */
  if (pluginConfig.includeHomepage !== false) {
    records.push({
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
      records.push({
        changeFreq: route.changeFreq,
        lastModified: route.lastMod ? route.lastMod : undefined,
        priority: route.priority,
        url: route.loc,
      })
    }
  }

  /**
   * Add all the records defined in the collections.
   */
  for (const slug in pluginConfig.collections) {
    const collConfig = pluginConfig.collections[slug];
    if (!collConfig) {
      continue
    }

    let collectionConfig: NonNullable<typeof pluginConfig.collections[typeof slug]> & {
      changeFreq?: ChangeFrequency;
      includeDrafts?: boolean;
      lastModField?: string;
      priority?: SitemapPriority;
    };

    if (typeof collConfig === 'boolean') {
      if (!collConfig) { // Skip the collection if it's false
        continue
      }

      collectionConfig = {
        changeFreq: 'weekly',
        includeDrafts: pluginConfig.includeDrafts ?? false,
        lastModField: 'updatedAt',
        priority: pluginConfig.defaultPriority ?? 0.5,
      }
    } else {
      collectionConfig = collConfig;
    }

    const includeDrafts = collectionConfig.includeDrafts ?? pluginConfig.includeDrafts ?? false;

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

        records.push({
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

  return records;
}