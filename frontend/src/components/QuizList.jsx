import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Stack,
  Button,
  useToast,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";

function QuizList() {
  const { user } = useContext(AuthContext);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      // Only students should access this component
      if (user?.typeofrole !== "student") {
        setLoading(false);
        return;
      }

      try {
        // Fetch all quizzes from enrolled courses
        const allQuizzes = [];
        
        if (user.coursesEnrolled && user.coursesEnrolled.length > 0) {
          for (const courseCode of user.coursesEnrolled) {
            try {
              const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/${courseCode}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                  },
                }
              );
              const courseName = courseCode; // You might want to get actual course names
              allQuizzes.push(...response.data.map(quiz => ({
                ...quiz,
                courseCode,
                courseName
              })));
            } catch (error) {
              console.error(`Failed to fetch quizzes for ${courseCode}:`, error);
            }
          }
        }

        setAllQuizzes(allQuizzes);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        toast({
          title: "Failed to load quizzes",
          description: "Please try again later.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, [user, toast]);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Available Quizzes</Heading>
      
      {allQuizzes.length > 0 ? (
        <Stack spacing={4}>
          {allQuizzes.map((quiz) => (
            <Box
              key={quiz.id}
              bg={cardBg}
              borderRadius="md"
              boxShadow="md"
              p={5}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold" fontSize="lg" mb={2}>
                    {quiz.title}
                  </Text>
                  <Text color="gray.500" fontSize="sm" mb={1}>
                    Course: {quiz.courseName} ({quiz.courseCode})
                  </Text>
                  <Text fontSize="sm">
                    <strong>Duration:</strong> {quiz.duration_minutes} minutes | {" "}
                    <strong>Questions:</strong> {quiz.questions?.length || 0}
                  </Text>
                </Box>
                <Button
                  colorScheme="teal"
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  Start Quiz
                </Button>
              </Flex>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box textAlign="center" mt={10}>
          <Text fontSize="lg" color="gray.600" mb={4}>
            {user?.coursesEnrolled?.length === 0 
              ? "You are not enrolled in any courses yet."
              : "No quizzes available at the moment."
            }
          </Text>
          {user?.coursesEnrolled?.length === 0 && (
            <Text fontSize="sm" color="gray.500">
              Contact your instructor to get enrolled in courses.
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

export default QuizList;