import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Stack,
  useToast,
  Button,
} from "@chakra-ui/react";

function CoursePage() {
  const { courseCode } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate(); // ✅ Add navigate hook

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/${courseCode}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast({
          title: "Failed to load quizzes",
          description: "Check if the course exists or try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseCode, toast]);

  return (
    <Box p={8}>
      <Heading mb={6}>Quizzes for Course: {courseCode}</Heading>

      {loading ? (
        <Spinner size="xl" />
      ) : quizzes.length === 0 ? (
        <Text>No quizzes available for this course.</Text>
      ) : (
        <Stack spacing={4}>
          {quizzes.map((quiz, index) => (
            <Box
              key={quiz.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              boxShadow="sm"
              bg="gray.50"
            >
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                Quiz {index + 1}: {quiz.title}
              </Text>

              <Text>
                <strong>Duration:</strong> {quiz.duration_minutes} minutes
              </Text>

              <Text>
                <strong>Number of Questions:</strong> {quiz.questions.length}
              </Text>

              <Button
                mt={3}
                colorScheme="teal"
                size="sm"
                onClick={() => navigate(`/quiz/${quiz.id}`)} // ✅ Navigate
              >
                Start Quiz
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default CoursePage;
