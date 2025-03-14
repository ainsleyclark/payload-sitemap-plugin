import type { CollectionSlug } from 'payload'

export type SitemapPluginConfig = {
  /**
   * Cache settings for the sitemap.
   */
  cache?: {
    /**
     * Cache duration in seconds.
     *
     * @default 3600 (1 hour)
     */
    duration?: number

    /**
     * Enable caching of the generated sitemap.
     *
     * @default true
     */
    enabled?: boolean
  }

  /**
   * Automatically
   */
  collections: {
    [key in CollectionSlug]?: {
      /**
       * How frequently pages in this collection are expected to change.
       * Can be overridden per document.
       */
      changeFreq?: ChangeFrequency

      /**
       * Custom function to generate URLs for documents in this collection.
       * If not provided, a default URL structure will be used.
       */
      generateURL?: (doc: any) => string

      /**
       * If set to `true`, drafts from this collection will be included in the sitemap.
       * Overrides the global `includeDrafts` setting.
       *
       * @default false
       */
      includeDrafts?: boolean

      /**
       * Allows specifying a custom field for determining the last modified date (`lastmod`).
       */
      lastModField?: string

      /**
       * Default priority for items in this collection.
       * Values are restricted between 0.0 and 1.0.
       */
      priority?: SitemapPriority

      /**
       * Field to use as the document slug in the URL if no generateURL function is provided.
       *
       * @default 'slug'
       */
      slugField?: string
    }
  }

  /**
   * A collection of custom routes to be included in the sitemap.
   */
  customRoutes?: CustomSitemapRoute[]

  /**
   * Sets the default priority for items in this collection.
   * Values should be between 0.0 (lowest priority) and 1.0 (highest priority).
   * This can be overridden per document.
   *
   * @default 0.5
   */
  defaultPriority?: number

  /**
   * Disables the sitemap plugin when set to `true`.
   *
   * Will still add the fields so that the database schema is
   * consistent which is important for migrations.
   *
   * @default false
   */
  disabled?: boolean

  /**
   * The base URL used for generating absolute sitemap URLs.
   * This is required.
   */
  hostname: string

  /**
   * If set to `true`, drafts will be included in the sitemap.
   *
   * @default false
   */
  includeDrafts?: boolean

  /**
   * If set to `true`, a default `/` entry will be included in the sitemap
   * if it is not already present in custom routes.
   *
   * @default true
   */
  includeHomepage?: boolean
}

export type CustomSitemapRoute = {
  /**
   * How frequently the page is expected to change.
   */
  changeFreq?: ChangeFrequency

  /**
   * The last modified date of the page.
   */
  lastMod?: string

  /**
   * The absolute or relative URL to include in the sitemap.
   */
  loc: string

  /**
   * The priority of the page in the sitemap (0.0 - 1.0).
   */
  priority?: SitemapPriority
}

/**
 * Defines how frequently a page is expected to change.
 */
export type ChangeFrequency = 'always' | 'daily' | 'hourly' | 'monthly' | 'never' | 'weekly' | 'yearly'

/**
 * Restricts priority values between 0.0 and 1.0.
 */
export type SitemapPriority = 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0
