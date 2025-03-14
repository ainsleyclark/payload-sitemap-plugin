import type { GlobalConfig } from 'payload'

export const SitemapGlobal: GlobalConfig = {

  slug: 'sitemap',
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'lastGenerated',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
  ],
}
