import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import QuizList from './components/QuizList';
import ViewScore from './components/ViewScore';
import Layout from './components/Layout';
import CoursePage from './components/CoursePage';
import QuizPage from './components/QuizPage';
import QuizResultPage from './components/QuizResultPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="Home" element={<Home />} />
        <Route path="Login" element={<Login />} />
        <Route path="Register" element={<Register />} />
        <Route path="Quizzes" element={<QuizList />} />
        <Route path="Score" element={<ViewScore />} />
        <Route path="/course/:courseCode" element={<CoursePage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/quiz/:quizId/result" element={<QuizResultPage />} />
      </Route>
    </Routes>
  );
}

export default App;
