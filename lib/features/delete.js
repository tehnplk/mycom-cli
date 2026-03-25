const fs = require("fs/promises");
const path = require("path");
const { exists } = require("../shared/fs-utils");

async function handleDelete(args) {
  const [targetPath] = args;

  if (!targetPath) {
    throw new Error("Usage: mycom delete <path>");
  }

  const absolute = path.resolve(targetPath);

  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  await fs.rm(absolute, { recursive: true, force: false });
  console.log(`Deleted: ${absolute}`);
}

module.exports = {
  handleDelete,
};

