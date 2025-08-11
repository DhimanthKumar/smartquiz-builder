import {
  Box, Button, Stack, useToast, HStack, Divider
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import QuestionEditor from "./QuestionEditor";
import AutoGenerateSection from "./AutoGenerateSection";
import QuizInfoForm from "./QuizInfoForm";
import { generateFullQuizUsingPuter, generateOptionsUsingPuter } from "./quizAiFunctions";

const CreateQuiz = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [generatingFullQuiz, setGeneratingFullQuiz] = useState(false);
  const [generatingOptions, setGeneratingOptions] = useState({});

  const [quizInfo, setQuizInfo] = useState({
    title: "",
    duration_minutes: "",
    num_questions: 1,
    course_id: "",
  });

  const [autoGenSettings, setAutoGenSettings] = useState({
    description: "",
    difficulty: "medium",
  });

  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correct_option: 0 },
  ]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/teacher/courses", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    })
    .then(res => setCourses(res.data.courses || []))
    .catch(() => toast({ title: "Error fetching courses", status: "error" }))
    .finally(() => setLoadingCourses(false));
  }, [toast]);

  const handleQuestionUpdate = useCallback((index, updatedQuestion) => {
    setQuestions(prev => {
      const newQ = [...prev];
      newQ[index] = updatedQuestion;
      return newQ;
    });
  }, []);

  const generateOptionsForQuestion = useCallback(async (questionIndex) => {
    const question = questions[questionIndex];
    if (!question.text.trim()) {
      toast({ title: "Question text required", status: "warning" });
      return;
    }
    setGeneratingOptions(prev => ({ ...prev, [questionIndex]: true }));
    try {
      const result = await generateOptionsUsingPuter(question.text);
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          options: result.options,
          correct_option: result.correctIndex,
        };
        return updated;
      });
    } catch {
      toast({ title: "Failed to generate options", status: "error" });
    } finally {
      setGeneratingOptions(prev => ({ ...prev, [questionIndex]: false }));
    }
  }, [questions, toast]);

  const generateFullQuiz = async () => {
    if (!autoGenSettings.description.trim()) {
      toast({ title: "Quiz description required", status: "warning" });
      return;
    }
    setGeneratingFullQuiz(true);
    try {
      const selectedCourse = courses.find(c => c.id.toString() === quizInfo.course_id);
      const courseName = selectedCourse ? `${selectedCourse.name} (${selectedCourse.code})` : "";
      const generated = await generateFullQuizUsingPuter(
        autoGenSettings.description, autoGenSettings.difficulty,
        parseInt(quizInfo.num_questions), courseName
      );
      setQuestions(generated);
    } catch {
      toast({ title: "Failed to generate quiz", status: "error" });
    } finally {
      setGeneratingFullQuiz(false);
    }
  };
const handleSubmit = async () => {
  const payload = {
    ...quizInfo,
    num_questions: parseInt(quizInfo.num_questions),
    duration_minutes: parseInt(quizInfo.duration_minutes),
    questions,
  };

  try {
    await axios.post("http://127.0.0.1:8000/api/create_quiz", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    toast({
      title: "Quiz created successfully!",
      status: "success",
      duration: 3000,
    });

    // Reset form
    setStep(1);
    setQuizInfo({
      title: "",
      duration_minutes: "",
      num_questions: 1,
      course_id: "",
    });
    setAutoGenSettings({
      description: "",
      difficulty: "medium",
    });
    setQuestions([{ text: "", options: ["", "", "", ""], correct_option: 0 }]);
  } catch (error) {
    toast({
      title: "Failed to create quiz.",
      description: error.response?.data?.detail || "Unknown error.",
      status: "error",
      duration: 4000,
    });
  }
};
  return (
    <Box maxW="800px" mx="auto" mt={10} p={5} border="1px solid #ccc" borderRadius="lg">
      {step === 1 && (
        <QuizInfoForm
          quizInfo={quizInfo}
          setQuizInfo={setQuizInfo}
          courses={courses}
          loadingCourses={loadingCourses}
          onNext={() => {
            setQuestions(Array.from({ length: parseInt(quizInfo.num_questions) },
              () => ({ text: "", options: ["", "", "", ""], correct_option: 0 })
            ));
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Stack spacing={6}>
          <AutoGenerateSection
            autoGenSettings={autoGenSettings}
            setAutoGenSettings={setAutoGenSettings}
            quizInfo={quizInfo}
            isLoading={generatingFullQuiz}
            onGenerate={generateFullQuiz}
          />
          <Divider />
          {questions.map((q, idx) => (
            <QuestionEditor
              key={idx}
              index={idx}
              initialQuestion={q}
              onQuestionUpdate={handleQuestionUpdate}
              onGenerateOptions={() => generateOptionsForQuestion(idx)}
              generatingOptions={generatingOptions[idx] || false}
            />
          ))}
          <HStack justify="space-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button colorScheme="green" onClick={handleSubmit}>
              Create Quiz
            </Button>
          </HStack>
        </Stack>
      )}
    </Box>
  );
};

export default CreateQuiz;
