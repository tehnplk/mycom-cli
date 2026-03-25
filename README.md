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
```

หรือเชื่อมเป็น global command:

```bash
npm link
mycom --help
```

## คำสั่งที่รองรับ

```bash
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
```

## ตัวอย่าง

```bash
mycom create folder docs
mycom create file docs/readme.txt
mycom text create docs/note.txt hello
mycom text write docs/note.txt hello world
mycom text edit docs/note.txt world codex
mycom text delete docs/note.txt
mycom copy docs/readme.txt archive/readme.txt
mycom move docs/readme.txt archive/readme.txt
mycom rename archive/readme.txt done.txt
mycom delete archive/done.txt
mycom delete archive
```
