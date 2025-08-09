import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import StudentQuizList from './components/student/StudentQuizList';
import QuizPage from './components/QuizPage';
import QuizResultPage from './components/QuizResultPage';
import CoursePage from './components/CoursePage';
import ViewScore from './components/ViewScore';

// Teacher Components
import TeacherDashboard from './components/teacher/TeacherDashboard';
import CreateQuiz from './components/teacher/CreateQuiz';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useContext(AuthContext);
  
  // Show loading while authentication is being checked
  if (isLoading) {
    return <div>Loading...</div>; // You can replace with a proper loading component
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.typeofrole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { user, isLoading } = useContext(AuthContext);

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // You can replace with a proper loading component
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Student Routes */}
        <Route 
          path="student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="student/quizzes" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentQuizList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="course/:courseCode" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CoursePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="quiz/:quizId" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <QuizPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="quiz/:quizId/result" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <QuizResultPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="student/scores" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ViewScore />
            </ProtectedRoute>
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="teacher" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="teacher/create-quiz" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <CreateQuiz />
            </ProtectedRoute>
          } 
        />
        

        {/* Legacy routes for backward compatibility */}
        <Route path="Home" element={<Home />} />
        <Route path="Login" element={<Login />} />
        <Route path="Register" element={<Register />} />
        
        <Route path="Score" element={
          user?.typeofrole === 'student' ? 
          <Navigate to="/student/scores" replace /> : 
          <Navigate to="/teacher" replace />
        } />
      </Route>
    </Routes>
  );
}

export default App;