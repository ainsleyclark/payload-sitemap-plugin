import type { Payload, RequiredDataFromCollection } from 'payload';
import { devUser } from './helpers/credentials.js';
import type { Post } from './payload-types.js';

const posts: RequiredDataFromCollection<Post>[] = [
	{ slug: 'title-1', excludeFromSitemap: false, title: 'Title 1' },
	{ slug: 'title-2', excludeFromSitemap: false, title: 'Title 2' },
	{ slug: 'title-3', excludeFromSitemap: true, title: 'Title 3' },
];

export const seed = async (payload: Payload) => {
	const { totalDocs: userTotal } = await payload.count({
		collection: 'users',
		where: {
			email: {
				equals: devUser.email,
			},
		},
	});

	if (!userTotal) {
		await payload.create({
			collection: 'users',
			data: devUser,
		});
	}

	const { totalDocs: postsTotal } = await payload.count({
		collection: 'posts',
	});

	if (!postsTotal) {
		for (const post of posts) {
			await payload.create({
				collection: 'posts',
				data: post,
			});
		}
	}
};
