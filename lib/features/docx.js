const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");
const { Document, Packer, Paragraph } = require("docx");
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
  const doc = new Document({
    sections: [{ children: paragraphs }],
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

async function handleDocx(args) {
  const [action, target, ...docxArgs] = args;

  if (!action || !target) {
    throw new Error("Usage: mycom docx <create|edit|append|replace> <path.docx> ...");
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

  throw new Error(`Unknown docx action: ${action}`);
}

module.exports = {
  handleDocx,
};

