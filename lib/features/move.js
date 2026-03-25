const fs = require("fs/promises");
const path = require("path");
const { exists } = require("../shared/fs-utils");

async function handleMove(args) {
  const [sourcePath, destinationPath] = args;

  if (!sourcePath || !destinationPath) {
    throw new Error("Usage: mycom move <source> <destination>");
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

  await fs.rename(source, destination);
  console.log(`Moved: ${source} -> ${destination}`);
}

module.exports = {
  handleMove,
};

