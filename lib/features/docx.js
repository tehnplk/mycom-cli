const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");
const { Document, Packer, Paragraph, Table, TableCell, TableRow } = require("docx");
const { exists } = require("../shared/fs-utils");
const { normalizeContent } = require("../shared/common-utils");

function ensureDocxPath(filePath) {
  const absolute = path.resolve(filePath);
  if (path.extname(absolute).toLowerCase() !== ".docx") {
    throw new Error(`Path must end with .docx: ${absolute}`);
  }
  return absolute;
}

function textToParagraphs(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length === 0) {
    return [new Paragraph("")];
  }

  return lines.map((line) => new Paragraph(line));
}

async function writeDocx(absolutePath, text) {
  const paragraphs = textToParagraphs(text);
  await writeDocxChildren(absolutePath, paragraphs);
}

async function writeDocxChildren(absolutePath, children) {
  const doc = new Document({
    sections: [{ children }],
  });
  const buffer = await Packer.toBuffer(doc);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);
}

async function readDocxText(absolutePath) {
  const result = await mammoth.extractRawText({ path: absolutePath });
  return result.value.replace(/\r\n/g, "\n").trimEnd();
}

async function createDocx(filePath, content) {
  const absolute = ensureDocxPath(filePath);
  if (await exists(absolute)) {
    throw new Error(`Path already exists: ${absolute}`);
  }

  await writeDocx(absolute, content);
  console.log(`Created docx file: ${absolute}`);
}

async function editDocx(filePath, content) {
  const absolute = ensureDocxPath(filePath);
  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  await writeDocx(absolute, content);
  console.log(`Edited docx file: ${absolute}`);
}

async function appendDocx(filePath, content) {
  const absolute = ensureDocxPath(filePath);
  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  const current = await readDocxText(absolute);
  const combined = current ? `${current}\n${content}` : content;
  await writeDocx(absolute, combined);
  console.log(`Appended docx file: ${absolute}`);
}

async function replaceDocx(filePath, searchText, replaceText) {
  const absolute = ensureDocxPath(filePath);
  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  const current = await readDocxText(absolute);
  if (!current.includes(searchText)) {
    throw new Error(`Text not found in docx: ${searchText}`);
  }

  const replaced = current.split(searchText).join(replaceText);
  await writeDocx(absolute, replaced);
  console.log(`Replaced text in docx file: ${absolute}`);
}

async function showDocx(filePath) {
  const absolute = ensureDocxPath(filePath);
  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  const text = await readDocxText(absolute);
  console.log(text);
}

function parseTableSpec(tableSpec) {
  const rows = tableSpec
    .split(";")
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
    .map((row) => row.split("|").map((cell) => cell.trim()));

  if (rows.length === 0) {
    throw new Error("Table spec is empty. Example: \"Name|Age;Alice|30;Bob|25\"");
  }

  const maxCols = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => {
    if (row.length === maxCols) {
      return row;
    }
    return [...row, ...new Array(maxCols - row.length).fill("")];
  });
}

function createTable(tableRows) {
  return new Table({
    rows: tableRows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [new Paragraph(String(cell))],
              })
          ),
        })
    ),
  });
}

async function appendTableDocx(filePath, tableSpec) {
  const absolute = ensureDocxPath(filePath);
  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  const existingText = await readDocxText(absolute);
  const tableRows = parseTableSpec(tableSpec);
  const children = textToParagraphs(existingText);

  if (existingText.trim().length > 0) {
    children.push(new Paragraph(""));
  }

  children.push(createTable(tableRows));
  await writeDocxChildren(absolute, children);
  console.log(`Appended table to docx file: ${absolute}`);
}

async function handleDocx(args) {
  const [action, target, ...docxArgs] = args;

  if (!action || !target) {
    throw new Error("Usage: mycom docx <create|read|edit|append|replace|table> <path.docx> ...");
  }

  if (action === "create") {
    await createDocx(target, normalizeContent(docxArgs));
    return;
  }

  if (action === "edit") {
    if (docxArgs.length === 0) {
      throw new Error("Usage: mycom docx edit <path.docx> <content>");
    }
    await editDocx(target, normalizeContent(docxArgs));
    return;
  }

  if (action === "read") {
    if (docxArgs.length > 0) {
      throw new Error("Usage: mycom docx read <path.docx>");
    }
    await showDocx(target);
    return;
  }

  if (action === "append") {
    if (docxArgs.length === 0) {
      throw new Error("Usage: mycom docx append <path.docx> <content>");
    }
    await appendDocx(target, normalizeContent(docxArgs));
    return;
  }

  if (action === "replace") {
    const [searchText, replaceText, ...extra] = docxArgs;
    if (!searchText || replaceText === undefined || extra.length > 0) {
      throw new Error("Usage: mycom docx replace <path.docx> <search> <replace>");
    }
    await replaceDocx(target, searchText, replaceText);
    return;
  }

  if (action === "table") {
    if (docxArgs.length === 0) {
      throw new Error("Usage: mycom docx table <path.docx> <row1|row1col2;row2col1|row2col2>");
    }
    await appendTableDocx(target, normalizeContent(docxArgs));
    return;
  }

  throw new Error(`Unknown docx action: ${action}`);
}

module.exports = {
  handleDocx,
};
