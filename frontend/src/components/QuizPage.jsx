import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Button,
  useToast,
} from "@chakra-ui/react";

function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const toast = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/quiz/${quizId}/take`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        setQuiz(response.data);
      } catch (error) {
        if (error.response?.data?.error === "You have already completed this quiz.") {
          toast({
            title: "Quiz Already Taken",
            description: "Redirecting to your results...",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          navigate(`/quiz/${quizId}/result`);
        } else {
          toast({
            title: "Error loading quiz",
            description: "Something went wrong. Please try again.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, toast, navigate]);

  const handleOptionChange = (questionId, selectedOptionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOptionId,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        quiz_id: parseInt(quiz.id),
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          question_id: parseInt(questionId),
          selected_option_id: parseInt(optionId),
        })),
      };

      await axios.post(`http://127.0.0.1:8000/api/quiz/submit`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      toast({
        title: "Quiz Submitted",
        description: "Your answers were submitted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(`/quiz/${quizId}/result`);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner size="xl" mt={10} />;

  if (!quiz) return <Text mt={10}>Quiz not found.</Text>;

  return (
    <Box p={6}>
      <Heading mb={4}>{quiz.title}</Heading>
      <Text fontSize="lg" mb={6}>
        Duration: {quiz.duration_minutes} minutes
      </Text>

      <VStack spacing={8} align="stretch">
        {quiz.questions.map((question, index) => (
          <Box key={question.id} p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="semibold" mb={2}>
              Q{index + 1}. {question.text}
            </Text>

            <RadioGroup
              onChange={(value) => handleOptionChange(question.id, value)}
              value={answers[question.id] || ""}
            >
              <Stack direction="column">
                {question.options.map((option) => (
                  <Radio key={option.id} value={option.id.toString()}>
                    {option.text}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
        ))}
      </VStack>

      <Button
        mt={8}
        colorScheme="teal"
        size="lg"
        onClick={handleSubmit}
        isDisabled={Object.keys(answers).length < quiz.questions.length}
      >
        Submit Quiz
      </Button>
    </Box>
  );
}

export default QuizPage;
