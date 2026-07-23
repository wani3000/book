import sharp from "sharp";

const width = 1733;
const height = 908;
const coverHeight = 730;
const coverTop = 89;
const covers = [
  { input: "public/ebook-cover.png", left: 92 },
  { input: "public/career-cover.png", left: 644 },
  { input: "public/jane-cover.png", left: 1192 },
];

const composites = await Promise.all(
  covers.map(async ({ input, left }) => {
    const buffer = await sharp(input)
      .resize({ height: coverHeight, fit: "inside" })
      .png()
      .toBuffer();
    const metadata = await sharp(buffer).metadata();
    return {
      input: buffer,
      left: left + Math.round((449 - (metadata.width ?? 0)) / 2),
      top: coverTop,
    };
  }),
);

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 245, g: 242, b: 232, alpha: 1 },
  },
})
  .composite(composites)
  .png()
  .toFile("public/og-collection.png");
