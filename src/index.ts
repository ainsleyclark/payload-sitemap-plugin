import type { Config } from 'payload'

import type { SitemapPluginConfig } from './types.js'

import { ExcludeFromSitemap } from './fields/excludeFromSitemap.js'
import { SitemapGlobal } from './globals/sitemap.js'
import { sitemapXML } from './sitemap/endpoint.js'

export const payloadSitemapPlugin =
  (pluginConfig: SitemapPluginConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    if (!config.globals) {
      config.globals = [];
    }
    config.globals.push(SitemapGlobal);

    if (pluginConfig.collections) {
      for (const collectionSlug in pluginConfig.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug,
        )

        if (collection) {
          collection.fields.push(ExcludeFromSitemap)
        }
      }
    }

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginConfig.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    config.endpoints.push({
      handler: sitemapXML(pluginConfig),
      method: 'get',
      path: '/plugin-sitemap/sitemap.xml',
    })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }
    }

    return config
  }
