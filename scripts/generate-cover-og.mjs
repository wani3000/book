import sharp from "sharp";

const width = 1733;
const height = 908;
const coverHeight = 700;
const coverWidth = 330;
const coverTop = 104;
const covers = [
  { input: "public/ebook-cover.png", left: 60 },
  { input: "public/career-cover.png", left: 480 },
  { input: "public/jane-cover.png", left: 900 },
  { input: "public/consciousness-cover.png", left: 1320 },
];

const composites = await Promise.all(
  covers.map(async ({ input, left }) => {
    const buffer = await sharp(input)
      .resize({ width: coverWidth, height: coverHeight, fit: "inside" })
      .png()
      .toBuffer();
    const metadata = await sharp(buffer).metadata();
    return {
      input: buffer,
      left: left + Math.round((coverWidth - (metadata.width ?? 0)) / 2),
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
