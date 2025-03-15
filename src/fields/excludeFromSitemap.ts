import type { Field } from 'payload'

export const ExcludeFromSitemap: Field = {
  name: 'excludeFromSitemap',
  type: 'checkbox',
  admin: {
    position: 'sidebar',
  },
  label: 'Exclude From Sitemap'
}