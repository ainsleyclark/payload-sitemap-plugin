<p align="center">
  <img src="./res/payload-logo.jpg" height="86">
</p>

<p align="center">
    <a href="https://ainsley.dev">
        <h2 align="center">Payload Sitemap Plugin</h2>
		<p align="center">GoLang client library & SDK for Payload CMS</p>
    </a>
</p>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Payload CMS Version](https://img.shields.io/badge/Payload%20CMS-3.28.1-2B2D42)](https://payloadcms.com)
[![ainsley.dev](https://img.shields.io/badge/-ainsley.dev-black?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH5wEYDzUGL1b35AAABA1JREFUWMPtlttvFVUUxn977ZnZu+W0tLalqRovBAUvQag0xNQbpSIosSSIJC198YknJfHJxDf9A/DBJ0x8MbFACjVqvCASq6FYFLFBvJAaAomkFCmhHGpLO+PDzOmZzpn2nKP4pCs5ycmevb7vW99as/fA//FfD1XO5p1nzuA3NWJHx5T8cVkRBPHHQfRjd0tzyZhOOQIy27bAxET9zCuvvhY0r2kC/OiRABeAN4BL/4oDr9+3lGszPs7UVNfUE23v3Nj5koszR/8N4EXg3XJckFIFuCLUuU7GWNNtTg25cu4syJx0F+gGMuU4UJKAt1Yux1UKV6TVat1qs+OYwQESMwDQCjwKsOv4iZsnwGihwbiuEek2WjJGhMrvv0UujYKa08VFkQvuTXNgz6oVeCIo1CqrZYMRwTiaytERKn44kRQAsAFYDbBrsLgLRQU0GI919TXKiHQaUQ1GBCuCCQKqjg/MqInrM4lZrgc6A1CljHhRAZ4Ip65m77FaOmbJdehC5vzZr1RAf/T6x6NDwb3/uAVfP74GnwCjZasRuXuWXASj9XQme+3t6erqPcB0IvUuYCsUH8YFBRhRNBqvyYpsn0MeOnG6wvc/9x33MPBjSvp24Na/7cDP7Y/gKIURecZoeTBObkSwWg7UNjaOeFfGLgK9KRAPAM8Wc2FeAUaEWtddbEV2WBFtREXkCqvlghE5yOQkvucBHAR+T0BooAtYXLYDI5sewxWFJ/Kk1bI2UTlW5DMFp03+JPwJ+DQFai2wbiEXUgVUas0trmuslm4jUmGi/tuwDVmrpafBuNPVrs7N/wzQA2QTUJbwYLIlOxB0tOGJ4IhqsSJts+T54Rv0lBz1RFh9ZJA385fOAHAshaMNaAF4OcWFQgeUwhMlrlJdnqjaOLkR8Y2WvbWec9VIQeo4sJf8FZ2LmmgWJO1cmm8I7wc2a6XwosGL+v+rFfnYUYplh47Obo5dvZ8Av6TgbSZ8KxYWEGxZn/u7Dbg9t8HNnwF9S2qqzqVUn4vzQF/K+m3AC1A4jGlId0QC8l0BXKVGrahe//okNR99WZAUc6EXuJiC+zxw57wOxKp/DliRAvCFKDUkxS+YIeBwyvryCHuOC0kH6oBOCj/V/gTeA6aK0oefZj3ARGJdRdh1BQ7Eqm8HHk4B/Q7oB1B9acWFEWtDf5STjGbgqbgLcQcqCQ8NL5EUAPuBsRKqz8UVYB+F97QXcSyatSXoWJ8zvB04AFQlkoaBp4HhhaqPR1TdUsLjeVni8TjhVX0odCAkd4AdKeQAHxIwXEb1Odt+Az5IeVQVcTmhgDBWAhtTNl8G9qGAwKfU2N3SnJvi/RFGMjYCD8UFdACNKRsHgZMA6v0j5ZpAlPtNyvqSiJO/AKik60y0ALlUAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTAxLTI0VDE1OjUzOjA2KzAwOjAwm5vntAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMS0yNFQxNTo1MzowNiswMDowMOrGXwgAAABXelRYdFJhdyBwcm9maWxlIHR5cGUgaXB0YwAAeJzj8gwIcVYoKMpPy8xJ5VIAAyMLLmMLEyMTS5MUAxMgRIA0w2QDI7NUIMvY1MjEzMQcxAfLgEigSi4A6hcRdPJCNZUAAAAASUVORK5CYII=)](https://ainsley.dev)
[![Twitter Handle](https://img.shields.io/twitter/follow/ainsleydev)](https://twitter.com/ainsleydev)

</div>

## Introduction




## Installation

```bash
pnpm i payload-sitemap-plugin 
```


## Quick Start

```ts
import { sitemapPlugin } from 'payload-sitemap-plugin';

export default buildConfig({
	plugins: [
		sitemapPlugin({
			hostname: 'https://example.com',
			cache: true,
			defaultPriority: 0.5,
			includeDrafts: true,
			includeHomepage: true,
			collections: {
				posts: {
					priority: 0.8,
					changeFreq: 'weekly',
					includeDrafts: false
				},
				pages: true
			},
			generateURL: ({ doc }) => `/${doc.slug}`,
			customRoutes: [
				{
					loc: '/about',
					priority: 0.7,
					lastMod: new Date('2024-01-01')
				}
			]
		})
	]
});

```

## Robots.txt

To make sure search engines are able to find the sitemap XML create a `robots.txt` file in the front-end of your website
and add the following line:

```
Sitemap: https://your-payload-domain.com/api/sitemap/index.xml
```

Read more about the `robots.txt` file [here](https://developers.google.com/search/docs/advanced/robots/create-robots-txt).

## Config

| Option                            | Type                   | Default         | Description                                                                                                                                           |
|-----------------------------------|------------------------|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `hostname`                        | `string`               | Required        | Base URL for absolute links. This is required for generating fully qualified URLs in the sitemap.                                                     |
| `cache`                           | `boolean               | object`         | `false`                                                                                                                                               | Cache configuration for the sitemap. Can be a boolean (enable/disable) or an object with duration and enabled flags.                                             |
| `cache.duration`                  | `number`               | `86400` (1 day) | Cache duration in seconds for storing the generated sitemap.                                                                                          |
| `cache.enabled`                   | `boolean`              | `false`         | If `true`, caching of the generated sitemap will be enabled.                                                                                          |
| `collections`                     | `object`               | `{}`            | Collection-specific configuration for the sitemap. Each key corresponds to a collection slug, and custom options can be provided for that collection. |
| `collections.[key]`               | `object                | boolean`        | -                                                                                                                                                     | Settings for a specific collection in the sitemap. If set to `true`, it includes all documents in that collection with default settings.                           |
| `collections.[key].changeFreq`    | `ChangeFrequency`      | -               | Frequency at which pages in this collection are expected to change. Can be overridden for each document.                                              |
| `collections.[key].includeDrafts` | `boolean`              | `false`         | If `true`, drafts for this collection will be included in the sitemap.                                                                                |
| `collections.[key].lastModField`  | `string`               | -               | Custom field to determine the last modified date (`lastmod`) for documents in the collection.                                                         |
| `collections.[key].priority`      | `SitemapPriority`      | -               | Default priority for documents in this collection. Can be between 0.0 and 1.0.                                                                        |
| `customRoutes`                    | `CustomSitemapRoute[]` | -               | Custom routes to include in the sitemap with their own configuration (change frequency, last modified date, priority).                                |
| `defaultPriority`                 | `SitemapPriority`      | `0.5`           | Default priority for all documents in the sitemap. Values range from 0.0 (lowest) to 1.0 (highest).                                                   |
| `disabled`                        | `boolean`              | `false`         | If set to `true`, disables the sitemap plugin while maintaining database consistency for migrations.                                                  |
| `generateURL`                     | `GenerateSitemapURL`   | -               | Custom function to generate URLs for documents in this collection. If not provided, a default URL structure will be used.                             |
| `includeDrafts`                   | `boolean`              | `false`         | If `true`, includes drafts in the sitemap. This is overridden by individual collection settings.                                                      |
| `includeHomepage`                 | `boolean`              | `true`          | If `true`, includes a default `/` entry in the sitemap if it isn't already included in custom routes.                                                 |


## Caching

If caching is enabled, a `sitemap` global is used to store the results of sitemap generation once it has been created.
This global contains a JSON representation of the sitemap, and when it was last modified.

The user is responsible for re-generating sitemaps. Refer to the regenerate endpoint below for instructions on how to
manually trigger sitemap regeneration.

Visit the [documentation](https://payloadcms.com/docs/jobs-queue/queues#executing-jobs) for more details.

## Endpoints

| Endpoint                          | Description                         | Method |
|-----------------------------------|-------------------------------------|--------|
| `/api/plugin-sitemap/sitemap.xml` | The generated sitemap XML file.     | `GET`  |
| `/api/plugin-sitemap/regenerate`  | Endpoint to regenerate the sitemap. | `POST` |

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvement, please open an
issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Trademark

ainsley.dev and the ainsley.dev logo are either registered trademarks or trademarks of ainsley.dev
LTD in the United Kingdom and/or other countries. All other trademarks are the property of their
respective owners.
