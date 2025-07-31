# 🧠 Quiz App – AI-Powered Explanations & Dynamic Quiz Creation

An integrated platform built using **Django** (Backend) and **React** (Frontend) where:

- 👩‍🏫 Teachers can dynamically create quizzes with intelligent options.
- 👨‍🎓 Students receive **AI-generated explanations** for incorrect answers.
- 🔐 JWT-based authentication & secure role-based access.


---

## 🚀 Features

### ✅ Student
- Take course-specific quizzes.
- Get **real-time AI-generated** feedback on incorrect answers.

### ✅ Teacher
- Create quizzes with:
  - Title, duration, number of questions.
  - Dynamic option generation per question using AI.
- Assign quizzes only to the courses they teach.

---

## 🔌 APIs Used

| Endpoint | Description |
|----------|-------------|
| `POST /api/quiz/create/` | Create a new quiz with title, duration, questions, and options |
| `GET /teacher/courses/` | Fetch all courses a teacher is assigned to |
| `POST /quiz/submit/` | Student submits quiz and receives results & explanations |
| `POST /ai/explanation/` | Fetch GPT explanation based on wrong answer |

---

## 🧱 Tech Stack

### Frontend
- React.js
- Axios
- Chakra UI

### Backend
- Django & Django REST Framework
- JWT Authentication
- PostgreSQL / SQLite

---


---

## 📦 Setup Instructions

### 🔧 Backend (Django)

```bash
git clone https://github.com/your-username/quiz-app.git
cd quiz-app/backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
