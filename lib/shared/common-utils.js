function normalizeContent(parts) {
  return parts.join(" ");
}

function decodeSeparator(raw) {
  if (!raw || raw === "auto") {
    return null;
  }

  if (raw === "\\t") {
    return "\t";
  }

  return raw;
}

function parseLineNumber(rawValue) {
  const lineNumber = Number(rawValue);
  if (!Number.isInteger(lineNumber) || lineNumber < 1) {
    throw new Error("lineNumber must be a positive integer");
  }

  return lineNumber;
}

module.exports = {
  normalizeContent,
  decodeSeparator,
  parseLineNumber,
};

