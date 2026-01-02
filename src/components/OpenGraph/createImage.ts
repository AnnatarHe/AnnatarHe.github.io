import fs from "fs/promises";
import path from 'node:path';
import type React from "react";
import satori from "satori";
import sharp from "sharp";

const FONTS_DIR = './src/assets/fonts';

export async function SVG(component: React.ReactNode) {
  const [latoRegular, latoBold, lxgwWenKai] = await Promise.all([
    fs.readFile(path.resolve(FONTS_DIR, 'Lato-Regular.ttf')),
    fs.readFile(path.resolve(FONTS_DIR, 'Lato-Bold.ttf')),
    fs.readFile(path.resolve(FONTS_DIR, 'LXGWWenKai-Regular.ttf')),
  ]);

  return await satori(component, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Lato',
        data: latoRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Lato',
        data: latoBold,
        weight: 700,
        style: 'normal',
      },
      {
        name: 'LXGWWenKai',
        data: lxgwWenKai,
        weight: 400,
        style: 'normal',
      },
    ],
  });
}

export async function PNG(component: React.ReactNode) {
  return await sharp(Buffer.from(await SVG(component)))
    .png()
    .toBuffer();
}
