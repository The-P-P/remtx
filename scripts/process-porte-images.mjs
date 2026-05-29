import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dir = join(root, "public", "veiculos", "portes");

const portes = ["picape", "suv", "hatch", "sedan"];

for (const name of portes) {
  const input = join(dir, `${name}-src.png`);
  const output = join(dir, `${name}.png`);

  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0;
      continue;
    }

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(output);

  console.log(`OK ${name}.png`);
}
