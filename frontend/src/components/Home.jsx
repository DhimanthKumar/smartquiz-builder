import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Spinner,
  Stack,
  Text,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import CreateQuizPage from "./CreateQuiz";
function Home() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (user?.typeofrole !== "student") {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const handleRedirect = (courseCode) => {
    navigate(`/course/${courseCode}`);
  };

  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box p={8}>
      <Heading mb={4}>Welcome to the Quiz App</Heading>
      <Text fontSize="lg" mb={6}>
        Start your quiz journey here!
      </Text>

      {loading && (
        <Flex justify="center" align="center" mt={8}>
          <Spinner size="xl" />
        </Flex>
      )}

      {!loading && user?.typeofrole === "student" && (
        <Box>
          <Heading size="md" mb={4}>
            Your Enrolled Courses
          </Heading>
          {courses.length > 0 ? (
            <Flex wrap="wrap" gap={6}>
              {courses.map((course, idx) => (
                <Box
                  key={idx}
                  bg={cardBg}
                  borderRadius="md"
                  boxShadow="md"
                  p={5}
                  width="250px"
                >
                  <Text fontWeight="bold" fontSize="lg">
                    {course.name}
                  </Text>
                  <Text color="gray.500">Code: {course.code}</Text>
                  <Button
                    colorScheme="blue"
                    mt={4}
                    onClick={() => handleRedirect(course.code)}
                  >
                    Go to Course
                  </Button>
                </Box>
              ))}
            </Flex>
          ) : (
            <Text mt={4}>You are not enrolled in any courses yet.</Text>
          )}
        </Box>
      )}

      {!loading && user?.typeofrole !== "student" && (
        <CreateQuizPage/>
      )}
    </Box>
  );
}

export default Home;
