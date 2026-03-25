function printHelp() {
  console.log(`mycom CLI

Usage:
  mycom --help
  mycom --skill
  mycom pwd
  mycom create file <path>
  mycom create folder <path>
  mycom read csv <path> [separator|auto]
  mycom read excel <path> [sheetName]
  mycom find <file|folder|all> <keyword> [startPath]
  mycom text create <path> [content]
  mycom text write <path> <content>
  mycom text edit <path> <search> <replace>
  mycom text clear <path>
  mycom text line insert <path> <lineNumber> <content>
  mycom text line update <path> <lineNumber> <content>
  mycom text line delete <path> <lineNumber>
  mycom text delete <path>
  mycom copy <source> <destination>
  mycom move <source> <destination>
  mycom delete <path>
  mycom rename <path> <newName>

Examples:
  mycom pwd
  mycom create file notes/todo.txt
  mycom create folder src/components
  mycom read csv data/users.csv auto
  mycom read csv data/users.csv ";"
  mycom read excel data/report.xlsx Sheet1
  mycom find file test ./
  mycom find folder temp ./
  mycom find all readme ./
  mycom text create notes/readme.md "# Hello"
  mycom text edit notes/readme.md Hello World
  mycom text clear notes/readme.md
  mycom text line insert notes/readme.md 1 "# Title"
  mycom text line update notes/readme.md 2 "new text"
  mycom text line delete notes/readme.md 3
  mycom text delete notes/readme.md
  mycom copy notes/todo.txt archive/todo.txt
  mycom move notes/todo.txt archive/todo.txt
  mycom delete src/components
  mycom rename archive/todo.txt done.txt
`);
}

function printSkillManual() {
  console.log(`mycom Skill Manual

Core skills:
  - File/Folder: create, copy, move, rename, delete
  - Text File: create, write, edit, clear, line insert/update/delete, delete
  - Data Read: read csv (auto/custom separator), read excel (.xlsx)
  - Search: find file, folder, or both by keyword
  - Utility: pwd

Quick examples:
  mycom create folder ./work
  mycom create file ./work/app.py
  mycom text write ./work/app.py "print('hello')"
  mycom text line insert ./work/app.py 1 "#!/usr/bin/env python3"
  mycom read csv ./data/users.csv auto
  mycom read excel ./data/report.xlsx Sheet1
  mycom find all app ./

Tips:
  mycom --help        show full command usage
  mycom <command> --help   show usage (global help)
`);
}

module.exports = {
  printHelp,
  printSkillManual,
};

