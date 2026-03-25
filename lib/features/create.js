const fs = require("fs/promises");
const path = require("path");
const { exists } = require("../shared/fs-utils");

async function createFile(filePath) {
  const absolute = path.resolve(filePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });

  if (await exists(absolute)) {
    throw new Error(`Path already exists: ${absolute}`);
  }

  await fs.writeFile(absolute, "", { flag: "wx" });
  console.log(`Created file: ${absolute}`);
}

async function createFolder(folderPath) {
  const absolute = path.resolve(folderPath);

  if (await exists(absolute)) {
    throw new Error(`Path already exists: ${absolute}`);
  }

  await fs.mkdir(absolute, { recursive: true });
  console.log(`Created folder: ${absolute}`);
}

async function handleCreate(args) {
  const [type, target] = args;

  if (!type || !target || !["file", "folder"].includes(type)) {
    throw new Error("Usage: mycom create <file|folder> <path>");
  }

  if (type === "file") {
    await createFile(target);
    return;
  }

  await createFolder(target);
}

module.exports = {
  handleCreate,
};

