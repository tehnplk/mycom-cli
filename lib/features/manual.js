function printHelp() {
  console.log(`mycom CLI

Usage:
  mycom <command> [args]
  mycom --help
  mycom --skill

Global options:
  --help, -h     Show command manual
  --skill        Show skill-style manual for agents

Commands:
  pwd
  create file <path>
  create folder <path>
  copy <source> <destination>
  move <source> <destination>
  rename <path> <newName>
  delete <path>

  text create <path> [content]
  text write <path> <content>
  text edit <path> <search> <replace>
  text clear <path>
  text line insert <path> <lineNumber> <content>
  text line update <path> <lineNumber> <content>
  text line delete <path> <lineNumber>
  text delete <path>

  read csv <path> [separator|auto]
  read excel <path> [sheetName]

  docx create <path.docx> [content]
  docx read <path.docx>
  docx edit <path.docx> <content>
  docx append <path.docx> <content>
  docx replace <path.docx> <search> <replace>
  docx table <path.docx> <row1col1|row1col2;row2col1|row2col2>

  find <file|folder|all> <keyword> [startPath]

Quick examples:
  mycom create folder ./work
  mycom text write ./work/a.txt "hello"
  mycom docx create ./work/report.docx "summary"
  mycom docx read ./work/report.docx
  mycom docx table ./work/report.docx "Name|Score;Ann|90;Bob|88"
  mycom read csv ./data/users.csv auto
  mycom find all report ./
`);
}

function printSkillManual() {
  console.log(`SKILL: mycom.filesystem
VERSION: 1.0

DESCRIPTION:
  Filesystem automation skill for local file and folder operations.
  Supports text editing, csv/excel reading, docx editing, and recursive search.

WHEN TO USE:
  - Create, move, copy, rename, or delete local files/folders
  - Edit text files safely (including line-level changes)
  - Read tabular data from CSV or Excel
  - Create or modify .docx documents
  - Search paths by keyword

INPUT CONTRACT:
  command: mycom <command> [args]
  path args: relative or absolute local filesystem paths
  output: plain text or JSON (for read/find commands)

CAPABILITIES:
  filesystem.basic:
    create file|folder, copy, move, rename, delete, pwd
  filesystem.text:
    text create|write|edit|clear|line insert|line update|line delete|delete
  filesystem.data:
    read csv (auto/custom separator), read excel [sheetName]
  filesystem.docx:
    docx create|read|edit|append|replace|table
  filesystem.search:
    find file|folder|all <keyword> [startPath]

SAFETY RULES:
  - Prefer explicit paths for destructive operations
  - Validate file types before text operations
  - Skip inaccessible directories during recursive find
  - Excel read can be disabled by MYCOM_DISABLE_EXCEL=1

LIMITATIONS:
  - find matches name/path keywords, not file content
  - docx editing preserves text content, not original formatting fidelity
  - docx table input uses ; for rows and | for columns

EXAMPLES:
  mycom text write ./notes/todo.txt "buy milk"
  mycom text line update ./notes/todo.txt 1 "buy milk and eggs"
  mycom docx create ./docs/report.docx "weekly report"
  mycom docx read ./docs/report.docx
  mycom docx table ./docs/report.docx "Item|Qty;Pen|2;Book|1"
  mycom read csv ./data/users.csv auto
  mycom find all invoice ./
`);
}

module.exports = {
  printHelp,
  printSkillManual,
};

