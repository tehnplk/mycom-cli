const fs = require("fs/promises");
const path = require("path");

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function assertTextFile(filePath) {
  const absolute = path.resolve(filePath);
  const stats = await fs.stat(absolute);

  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${absolute}`);
  }

  const handle = await fs.open(absolute, "r");
  const buffer = Buffer.alloc(8192);

  try {
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const sample = buffer.subarray(0, bytesRead);

    if (sample.includes(0)) {
      throw new Error(`Binary file is not supported: ${absolute}`);
    }

    try {
      new TextDecoder("utf-8", { fatal: true }).decode(sample);
    } catch {
      throw new Error(`Non-text file is not supported: ${absolute}`);
    }
  } finally {
    await handle.close();
  }

  return absolute;
}

module.exports = {
  exists,
  assertTextFile,
};

