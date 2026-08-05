import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import OG from '../../components/OpenGraph/OG';
import { PNG } from '../../components/OpenGraph/createImage';

export const getStaticPaths: GetStaticPaths = async () => {
  // Match the post route: no draft pages in production, so no draft OG images.
  const posts = await getCollection('posts', (post) =>
    import.meta.env.PROD ? !post.data.draft : true
  );
  return posts.map((post) => {
    // Parse tags from space-separated string
    const tags = post.data.tags?.split(' ').filter((tag: string) => tag.trim()) || [];
    // Get date from frontmatter or parse from slug
    const date = post.data.date || new Date(post.id.slice(0, 10));

    return {
      params: { slug: post.id },
      props: {
        title: post.data.title,
        date,
        tags,
      },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, date, tags } = props as {
    title: string;
    date: Date;
    tags: string[];
  };

  const png = await PNG(
    OG({
      title,
      date,
      tags,
    })
  );

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
