const fs = require("fs/promises");
const path = require("path");
const XLSX = require("xlsx");
const { assertTextFile, exists } = require("../shared/fs-utils");
const { decodeSeparator } = require("../shared/common-utils");

function splitCsvLine(line, separator) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === separator && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function detectCsvSeparator(lines) {
  const candidates = [",", ";", "\t", "|", ":", "^", "~"];
  const sample = lines.find((line) => line.trim() !== "");

  if (!sample) {
    return ",";
  }

  let best = ",";
  let bestScore = -1;

  for (const candidate of candidates) {
    const cols = splitCsvLine(sample, candidate).length;
    if (cols > bestScore) {
      best = candidate;
      bestScore = cols;
    }
  }

  return best;
}

function parseCsvContent(content, separator) {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.length > 0);
  const usedSeparator = separator || detectCsvSeparator(lines);
  const rows = lines.map((line) => splitCsvLine(line, usedSeparator));
  return { rows, usedSeparator };
}

async function readCsvFile(filePath, separatorRaw) {
  const absolute = await assertTextFile(filePath);
  const separator = decodeSeparator(separatorRaw);
  const content = await fs.readFile(absolute, "utf8");
  const { rows, usedSeparator } = parseCsvContent(content, separator);

  console.log(
    JSON.stringify(
      {
        type: "csv",
        file: absolute,
        separator: usedSeparator === "\t" ? "\\t" : usedSeparator,
        rowCount: rows.length,
        columnCount: rows[0] ? rows[0].length : 0,
        rows,
      },
      null,
      2
    )
  );
}

async function readExcelFile(filePath, sheetName) {
  const absolute = path.resolve(filePath);
  if (!(await exists(absolute))) {
    throw new Error(`Path does not exist: ${absolute}`);
  }

  const workbook = XLSX.readFile(absolute);
  const selectedSheet = sheetName || workbook.SheetNames[0];

  if (!selectedSheet) {
    throw new Error(`Excel file has no sheets: ${absolute}`);
  }

  const sheet = workbook.Sheets[selectedSheet];
  if (!sheet) {
    throw new Error(`Sheet not found: ${selectedSheet}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
  console.log(
    JSON.stringify(
      {
        type: "excel",
        file: absolute,
        sheet: selectedSheet,
        availableSheets: workbook.SheetNames,
        rowCount: rows.length,
        columnCount: rows[0] ? rows[0].length : 0,
        rows,
      },
      null,
      2
    )
  );
}

async function handleRead(args) {
  const [type, target, extra] = args;

  if (!type || !target || !["csv", "excel"].includes(type)) {
    throw new Error("Usage: mycom read <csv|excel> <path> [separator|sheetName]");
  }

  if (type === "csv") {
    await readCsvFile(target, extra);
    return;
  }

  await readExcelFile(target, extra);
}

module.exports = {
  handleRead,
};

