# HireMindAI
AI Smart Interview Platform

An intelligent **full-stack web application** that simulates real interview experiences using AI.  
This platform helps users practice **HR and Technical interviews** based on their role, experience, and resume.

---

## 🌐 Live Demo

👉 https://hiremindai1-client.onrender.com/

## 🌟 Features

- 🎯 Role-based interview generation  
- 📄 Resume analysis for personalized questions  
- 🧠 Two interview modes:
  - HR Interview
  - Technical Interview  
- 🎤 Voice-based interaction (AI asks + user responds)  
- 💬 Real-time AI feedback on answers  
- ⏱️ Timer-based question system  
- 💰 Credit-based usage system  
- 🔐 JWT Authentication (Login / Signup / Protected routes)  
- 📊 Detailed interview report after completion  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Framer Motion  

### Backend
- Node.js  
- Express.js  
- MongoDB (MERN Stack)  

### Other Tools & APIs
- Web Speech API (Speech-to-Text & Text-to-Speech)  
- Axios  
- JWT Authentication  

---

## ⚙️ How It Works

1. User logs in by Google
2. Selects:
   - Role  
   - Experience level  
   - Interview type (HR / Technical)  
3. (Optional) Uploads resume  
4. System analyzes resume and generates questions  
5. AI asks questions using voice  
6. User answers via:
   - 🎤 Voice (desktop supported)
   - ⌨️ Text input  
7. AI evaluates answers and provides feedback  
8. Final report is generated  

---

## 🌐 Deployment

- Deployed on **Render**

---

## ⚠️ Known Limitations

- Speech recognition may not work on all mobile devices (especially iOS)  
- Best performance on desktop browsers (Chrome recommended)  

---

## 🚀 Future Improvements

- Integrate advanced AI models (e.g., Whisper)  
- Improve mobile voice support  
- Add analytics dashboard  
- Expand interview domains  

---
## .env Setup
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- CLIENT_URL=http://localhost:5173

### Contributing
Contributions are welcome!
Feel free to fork the repository and submit a pull request.

### ⭐ Support
If you like this project, give it a ⭐ on GitHub!


## 📂 Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name`

