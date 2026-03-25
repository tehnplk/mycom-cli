# mycom-cli

CLI app ด้วย Node.js สำหรับจัดการไฟล์และโฟลเดอร์

## ติดตั้ง

```bash
npm install
```

## ใช้งาน

เรียกตรงด้วย Node:

```bash
node ./bin/mycom.js --help
node ./bin/mycom.js --skill
```

หรือเชื่อมเป็น global command:

```bash
npm link
mycom --help
mycom --skill
```

## คำสั่งที่รองรับ

```bash
mycom create file <path>
mycom create folder <path>
mycom read csv <path> [separator|auto]
mycom read excel <path> [sheetName]
mycom find <file|folder|all> <keyword> [startPath]
mycom pwd
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
```

## ตัวอย่าง

```bash
mycom create folder docs
mycom create file docs/readme.txt
mycom pwd
mycom read csv data/users.csv auto
mycom read csv data/users.csv ";"
mycom read excel data/report.xlsx Sheet1
mycom find file test ./
mycom find folder temp ./
mycom find all readme ./
mycom text create docs/note.txt hello
mycom text write docs/note.txt hello world
mycom text edit docs/note.txt world codex
mycom text clear docs/note.txt
mycom text line insert docs/note.txt 1 first line
mycom text line update docs/note.txt 1 updated line
mycom text line delete docs/note.txt 1
mycom text delete docs/note.txt
mycom copy docs/readme.txt archive/readme.txt
mycom move docs/readme.txt archive/readme.txt
mycom rename archive/readme.txt done.txt
mycom delete archive/done.txt
mycom delete archive
```
