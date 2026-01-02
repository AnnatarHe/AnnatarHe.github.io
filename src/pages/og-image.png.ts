import type { APIRoute } from 'astro';
import OG from '../components/OpenGraph/OG';
import { PNG } from '../components/OpenGraph/createImage';

export const GET: APIRoute = async () => {
  const png = await PNG(
    OG({
      title: "AnnatarHe's Blog",
      tags: ['tech', 'life', 'thoughts'],
    })
  );

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
