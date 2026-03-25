const fs = require("fs/promises");
const path = require("path");
const { exists } = require("../shared/fs-utils");

async function handleRename(args) {
  const [targetPath, newName] = args;

  if (!targetPath || !newName) {
    throw new Error("Usage: mycom rename <path> <newName>");
  }

  const absolute = path.resolve(targetPath);

  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  if (newName.includes(path.sep) || newName.includes("/") || newName.includes("\\")) {
    throw new Error("newName must be a name only, not a path");
  }

  const destination = path.join(path.dirname(absolute), newName);

  if (await exists(destination)) {
    throw new Error(`Target name already exists: ${destination}`);
  }

  await fs.rename(absolute, destination);
  console.log(`Renamed: ${absolute} -> ${destination}`);
}

module.exports = {
  handleRename,
};

