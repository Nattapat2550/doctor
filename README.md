# Doctor Web Application

**Doctor** 
## วัตถุประสงค์
  #### ในปัจจุบันปัญหาสุขภาพจิตเป็นเรื่องใกล้ตัวและมีความสำคัญอย่างยิ่งแต่การเข้าถึงบริการจาก จิตแพทย์หรือนักจิตวิทยายังมีอุปสรรคหลายด้านไม่ว่าจะเป็นความรู้สึกอับอายค่าใช้จ่ายที่สูงและการรอ คิวที่ยาวนาน Nene จึงถูกสร้างขึ้นเพื่อเป็นเครื่องมือช่วยเหลือเบื้องต้นที่สามารถเข้าถึงได้ง่ายทุกที่ทุกเวลา โดยมีเป้าหมายเพื่อลดช่องว่างในการเข้าถึงบริการด้านสุขภาพจิตและเป็นเพื่อนคู่คิดที่พร้อมรับฟังปัญหาและ ให้คำแนะนำเบื้องต้นอย่างเป็นส่วนตัวและปลอดภัย

---

## โครงสร้างโปรเจกต์
```bash
doctor/
│
├─ backend/
│  ├─ middleware/
│  │  └─ auth.js # Authentication middleware
│  ├─ models/
│  │  ├─ Channel.js # Channel model
│  │  └─ Chat.js # Chat model
│  ├─ routes/
│  │  ├─ channelRoutes.js # Channel API routes
│  │  └─ chatRoutes.js # Chat API routes
│  ├─ controllers/ # Business logic functions
│  ├─ .env # Environment Variables
│  └─ server.js # Main server file
│
└─ frontend/
  ├─ image/ # Static images
  ├─ scripts/
  │  ├─ channels.js # Channel management
  │  ├─ chats.js # Chat functionality
  │  ├─ helpers.js # Utility functions
  │  ├─ image.js # Image handling
  │  ├─ main.js # Main application logic
  │  └─ init.js # Initialization
  ├─ index.html # Main HTML file
  └─ style.css # Stylesheet
```

---


## คุณสมบัติ

-  AI psychiatrist ในสไตล์ Sigmund Freud
-  สนทนาแบบ real-time
-  จัดการห้องแชทแบบหลายห้อง
-  รองรับการส่งรูปภาพและการวิเคราะห์
-  การยืนยันตัวตนแบบ token-based
-  Responsive design

---


## AI Features

-  แอปพลิเคชันใช้ Google Gemini AI สำหรับ:
-  การวิเคราะห์ข้อความและให้คำปรึกษาด้านสุขภาพจิต

---


## .env
```bash
  HOST=0.0.0.0
  PORT=3222
  FRONTEND_URL=http://localhost:3221
  MONGO_URI=mongodb+srv://adminuser:admin1234@cluster0.lsxt1rb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  GEMINI_API_KEY=AIzaSyC3vUL04Bdr2acB3zgDJiz1h6A3IddV9H4
```

---


## 🚀 การติดตั้งและรันโปรเจค

### Prerequisites
- Node.js 16+
- MongoDB
- Gemini API Key


### 1. ติดตั้ง Dependencies
```bash
Backend
cd backend
npm install

Frontend
cd frontend
npm install
```
### 2. รันโปรเจกต์
```bash
Backend
cd backend
npm start

Frontend
cd frontend
npm start
```
