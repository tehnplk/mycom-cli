#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");

function printHelp() {
  console.log(`mycom CLI

Usage:
  mycom create file <path>
  mycom create folder <path>
  mycom text create <path> [content]
  mycom text write <path> <content>
  mycom text edit <path> <search> <replace>
  mycom text delete <path>
  mycom copy <source> <destination>
  mycom move <source> <destination>
  mycom delete <path>
  mycom rename <path> <newName>

Examples:
  mycom create file notes/todo.txt
  mycom create folder src/components
  mycom text create notes/readme.md "# Hello"
  mycom text edit notes/readme.md Hello World
  mycom text delete notes/readme.md
  mycom copy notes/todo.txt archive/todo.txt
  mycom move notes/todo.txt archive/todo.txt
  mycom delete src/components
  mycom rename archive/todo.txt done.txt
`);
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function normalizeContent(parts) {
  return parts.join(" ");
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
      // Validate as UTF-8 text. Binary-like content will usually fail this.
      new TextDecoder("utf-8", { fatal: true }).decode(sample);
    } catch {
      throw new Error(`Non-text file is not supported: ${absolute}`);
    }
  } finally {
    await handle.close();
  }

  return absolute;
}

async function createFile(filePath) {
  const absolute = path.resolve(filePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });

  if (await exists(absolute)) {
    throw new Error(`Path already exists: ${absolute}`);
  }

  await fs.writeFile(absolute, "", { flag: "wx" });
  console.log(`Created file: ${absolute}`);
}

async function createTextFile(filePath, content = "") {
  const absolute = path.resolve(filePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });

  if (await exists(absolute)) {
    throw new Error(`Path already exists: ${absolute}`);
  }

  await fs.writeFile(absolute, content, { encoding: "utf8", flag: "wx" });
  console.log(`Created text file: ${absolute}`);
}

async function writeTextFile(filePath, content) {
  const absolute = path.resolve(filePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });

  if (await exists(absolute)) {
    await assertTextFile(absolute);
  }

  await fs.writeFile(absolute, content, { encoding: "utf8" });
  console.log(`Wrote text file: ${absolute}`);
}

async function editTextFile(filePath, searchText, replaceText) {
  const absolute = await assertTextFile(filePath);
  const original = await fs.readFile(absolute, "utf8");

  if (!original.includes(searchText)) {
    throw new Error(`Text not found in file: ${searchText}`);
  }

  const edited = original.split(searchText).join(replaceText);
  await fs.writeFile(absolute, edited, { encoding: "utf8" });
  console.log(`Edited text file: ${absolute}`);
}

async function deleteTextFile(filePath) {
  const absolute = await assertTextFile(filePath);
  await fs.rm(absolute, { force: false });
  console.log(`Deleted text file: ${absolute}`);
}

async function createFolder(folderPath) {
  const absolute = path.resolve(folderPath);

  if (await exists(absolute)) {
    throw new Error(`Path already exists: ${absolute}`);
  }

  await fs.mkdir(absolute, { recursive: true });
  console.log(`Created folder: ${absolute}`);
}

async function movePath(sourcePath, destinationPath) {
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

async function copyPath(sourcePath, destinationPath) {
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

async function deletePath(targetPath) {
  const absolute = path.resolve(targetPath);

  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  await fs.rm(absolute, { recursive: true, force: false });
  console.log(`Deleted: ${absolute}`);
}

async function renamePath(targetPath, newName) {
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

async function main() {
  const [, , command, ...args] = process.argv;

  if (!command || command === "-h" || command === "--help") {
    printHelp();
    return;
  }

  switch (command) {
    case "create": {
      const [type, target] = args;

      if (!type || !target || !["file", "folder"].includes(type)) {
        throw new Error("Usage: mycom create <file|folder> <path>");
      }

      if (type === "file") {
        await createFile(target);
      } else {
        await createFolder(target);
      }

      return;
    }

    case "move": {
      const [source, destination] = args;

      if (!source || !destination) {
        throw new Error("Usage: mycom move <source> <destination>");
      }

      await movePath(source, destination);
      return;
    }

    case "text": {
      const [action, target, ...textArgs] = args;

      if (!action || !target) {
        throw new Error("Usage: mycom text <create|write|edit|delete> <path> ...");
      }

      if (action === "create") {
        const content = normalizeContent(textArgs);
        await createTextFile(target, content);
        return;
      }

      if (action === "write") {
        if (textArgs.length === 0) {
          throw new Error("Usage: mycom text write <path> <content>");
        }

        await writeTextFile(target, normalizeContent(textArgs));
        return;
      }

      if (action === "edit") {
        const [searchText, replaceText, ...extra] = textArgs;

        if (!searchText || replaceText === undefined || extra.length > 0) {
          throw new Error("Usage: mycom text edit <path> <search> <replace>");
        }

        await editTextFile(target, searchText, replaceText);
        return;
      }

      if (action === "delete") {
        await deleteTextFile(target);
        return;
      }

      throw new Error(`Unknown text action: ${action}`);
    }

    case "copy": {
      const [source, destination] = args;

      if (!source || !destination) {
        throw new Error("Usage: mycom copy <source> <destination>");
      }

      await copyPath(source, destination);
      return;
    }

    case "delete": {
      const [target] = args;

      if (!target) {
        throw new Error("Usage: mycom delete <path>");
      }

      await deletePath(target);
      return;
    }

    case "rename": {
      const [target, newName] = args;

      if (!target || !newName) {
        throw new Error("Usage: mycom rename <path> <newName>");
      }

      await renamePath(target, newName);
      return;
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
