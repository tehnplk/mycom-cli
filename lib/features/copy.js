const fs = require("fs/promises");
const path = require("path");
const { exists } = require("../shared/fs-utils");

async function handleCopy(args) {
  const [sourcePath, destinationPath] = args;

  if (!sourcePath || !destinationPath) {
    throw new Error("Usage: mycom copy <source> <destination>");
  }

  const source = path.resolve(sourcePath);
  const destination = path.resolve(destinationPath);

  if (!(await exists(source))) {
    throw new Error(`Source does not exist: ${source}`);
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });

  if (await exists(destination)) {
    throw new Error(`Destination already exists: ${destination}`);
  }

  await fs.cp(source, destination, { recursive: true, errorOnExist: true });
  console.log(`Copied: ${source} -> ${destination}`);
}

module.exports = {
  handleCopy,
};

