const fs = require("fs/promises");
const path = require("path");
const { exists } = require("../shared/fs-utils");

function matchesFindType(type, isDirectory) {
  if (type === "all") {
    return true;
  }

  if (type === "file") {
    return !isDirectory;
  }

  return isDirectory;
}

async function walkAndFind(currentPath, keywordLower, type, results) {
  let entries;

  try {
    entries = await fs.readdir(currentPath, { withFileTypes: true });
  } catch (error) {
    if (error.code === "EACCES" || error.code === "EPERM") {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const isDirectory = entry.isDirectory();

    if (entry.name.toLowerCase().includes(keywordLower) && matchesFindType(type, isDirectory)) {
      results.push(fullPath);
    }

    if (isDirectory) {
      await walkAndFind(fullPath, keywordLower, type, results);
    }
  }
}

async function handleFind(args) {
  const [type, keyword, startPath = "."] = args;

  if (!type || !keyword || !["file", "folder", "all"].includes(type)) {
    throw new Error("Usage: mycom find <file|folder|all> <keyword> [startPath]");
  }

  const absoluteStart = path.resolve(startPath);

  if (!(await exists(absoluteStart))) {
    throw new Error(`Path does not exist: ${absoluteStart}`);
  }

  const stats = await fs.stat(absoluteStart);
  if (!stats.isDirectory()) {
    throw new Error(`startPath must be a directory: ${absoluteStart}`);
  }

  const results = [];
  await walkAndFind(absoluteStart, keyword.toLowerCase(), type, results);

  console.log(
    JSON.stringify(
      {
        type,
        keyword,
        startPath: absoluteStart,
        count: results.length,
        results,
      },
      null,
      2
    )
  );
}

module.exports = {
  handleFind,
};

