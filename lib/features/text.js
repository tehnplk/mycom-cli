const fs = require("fs/promises");
const path = require("path");
const { exists, assertTextFile } = require("../shared/fs-utils");
const { normalizeContent, parseLineNumber } = require("../shared/common-utils");

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

async function clearTextFile(filePath) {
  const absolute = await assertTextFile(filePath);
  await fs.truncate(absolute, 0);
  console.log(`Cleared text file: ${absolute}`);
}

async function readTextLines(filePath) {
  const absolute = await assertTextFile(filePath);
  const content = await fs.readFile(absolute, "utf8");
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized === "" ? [] : normalized.split("\n");
  return { absolute, lines };
}

async function writeTextLines(filePath, lines) {
  await fs.writeFile(filePath, lines.join("\n"), { encoding: "utf8" });
}

async function insertLine(filePath, lineNumber, content) {
  const { absolute, lines } = await readTextLines(filePath);

  if (lineNumber > lines.length + 1) {
    throw new Error(`lineNumber is out of range. Max insert position: ${lines.length + 1}`);
  }

  lines.splice(lineNumber - 1, 0, content);
  await writeTextLines(absolute, lines);
  console.log(`Inserted line ${lineNumber}: ${absolute}`);
}

async function updateLine(filePath, lineNumber, content) {
  const { absolute, lines } = await readTextLines(filePath);

  if (lineNumber > lines.length) {
    throw new Error(`lineNumber is out of range. Max line: ${lines.length}`);
  }

  lines[lineNumber - 1] = content;
  await writeTextLines(absolute, lines);
  console.log(`Updated line ${lineNumber}: ${absolute}`);
}

async function deleteLine(filePath, lineNumber) {
  const { absolute, lines } = await readTextLines(filePath);

  if (lineNumber > lines.length) {
    throw new Error(`lineNumber is out of range. Max line: ${lines.length}`);
  }

  lines.splice(lineNumber - 1, 1);
  await writeTextLines(absolute, lines);
  console.log(`Deleted line ${lineNumber}: ${absolute}`);
}

async function handleText(args) {
  const [action, target, ...textArgs] = args;

  if (!action || !target) {
    throw new Error("Usage: mycom text <create|write|edit|clear|line|delete> <path> ...");
  }

  if (action === "create") {
    await createTextFile(target, normalizeContent(textArgs));
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

  if (action === "clear") {
    await clearTextFile(target);
    return;
  }

  if (action === "delete") {
    await deleteTextFile(target);
    return;
  }

  if (action === "line") {
    const lineAction = target;
    const [lineTarget, lineNumberRaw, ...lineContentParts] = textArgs;

    if (!lineAction || !lineTarget || !lineNumberRaw) {
      throw new Error("Usage: mycom text line <insert|update|delete> <path> <lineNumber> [content]");
    }

    const lineNumber = parseLineNumber(lineNumberRaw);

    if (lineAction === "insert") {
      if (lineContentParts.length === 0) {
        throw new Error("Usage: mycom text line insert <path> <lineNumber> <content>");
      }

      await insertLine(lineTarget, lineNumber, normalizeContent(lineContentParts));
      return;
    }

    if (lineAction === "update") {
      if (lineContentParts.length === 0) {
        throw new Error("Usage: mycom text line update <path> <lineNumber> <content>");
      }

      await updateLine(lineTarget, lineNumber, normalizeContent(lineContentParts));
      return;
    }

    if (lineAction === "delete") {
      if (lineContentParts.length > 0) {
        throw new Error("Usage: mycom text line delete <path> <lineNumber>");
      }

      await deleteLine(lineTarget, lineNumber);
      return;
    }

    throw new Error(`Unknown line action: ${lineAction}`);
  }

  throw new Error(`Unknown text action: ${action}`);
}

module.exports = {
  handleText,
};

