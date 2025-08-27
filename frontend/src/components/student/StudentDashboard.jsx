import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AuthContext";
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
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaBook, FaQuestionCircle, FaTrophy, FaClock } from 'react-icons/fa';

function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch enrolled courses
        const coursesResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        setCourses(coursesResponse.data);

        // Fetch recent quiz attempts (you may need to create this endpoint)
        try {
          const quizzesResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/student/recent-quizzes`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          });
          setRecentQuizzes(quizzesResponse.data || []);
        } catch (err) {
          console.log("Recent quizzes endpoint not available");
          setRecentQuizzes([]);
        }

        // Fetch student statistics
        try {
          const statsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/student/stats`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          });
          setStats(statsResponse.data);
        } catch (err) {
          console.log("Stats endpoint not available");
          setStats({
            totalQuizzes: coursesResponse.data.length * 3, // Estimated
            completedQuizzes: 0,
            averageScore: 0,
            totalCourses: coursesResponse.data.length
          });
        }
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.typeofrole === "student") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCourseRedirect = (courseCode) => {
    navigate(`/course/${courseCode}`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box p={8} maxW="7xl" mx="auto">
      {/* Welcome Header */}
      <VStack spacing={2} mb={8} textAlign="center">
        <Heading size="xl" color="teal.500">
          Welcome back, {user?.username}!
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Ready to continue your learning journey?
        </Text>
      </VStack>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <Card bg={statBg}>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Icon as={FaBook} w={6} h={6} color="blue.500" />
              <Stat>
                <StatNumber fontSize="2xl">{stats.totalCourses}</StatNumber>
                <StatLabel>Enrolled Courses</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={statBg}>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Icon as={FaQuestionCircle} w={6} h={6} color="purple.500" />
              <Stat>
                <StatNumber fontSize="2xl">{stats.completedQuizzes}</StatNumber>
                <StatLabel>Quizzes Completed</StatLabel>
                <StatHelpText>of {stats.totalQuizzes} available</StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={statBg}>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Icon as={FaTrophy} w={6} h={6} color="yellow.500" />
              <Stat>
                <StatNumber fontSize="2xl">{stats.averageScore}%</StatNumber>
                <StatLabel>Average Score</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={statBg}>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Icon as={FaClock} w={6} h={6} color="green.500" />
              <Stat>
                <StatNumber fontSize="2xl">
                  {stats.totalQuizzes - stats.completedQuizzes}
                </StatNumber>
                <StatLabel>Pending Quizzes</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Progress Overview */}
      {stats.totalQuizzes > 0 && (
        <Card bg={cardBg} mb={8}>
          <CardBody>
            <VStack spacing={4}>
              <Heading size="md">Overall Progress</Heading>
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text>Quiz Completion</Text>
                  <Text>{Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100)}%</Text>
                </Flex>
                <Progress 
                  value={(stats.completedQuizzes / stats.totalQuizzes) * 100} 
                  colorScheme="teal" 
                  size="lg"
                  rounded="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Course Cards */}
      <Box mb={8}>
        <Heading size="lg" mb={6} color="teal.600">
          Your Enrolled Courses
        </Heading>
        {courses.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {courses.map((course, idx) => (
              <Card
                key={idx}
                bg={cardBg}
                boxShadow="lg"
                _hover={{ 
                  transform: 'translateY(-4px)', 
                  boxShadow: 'xl',
                  borderColor: 'teal.300'
                }}
                transition="all 0.3s"
                borderWidth="1px"
                borderColor="transparent"
              >
                <CardHeader pb={2}>
                  <VStack spacing={2} align="start">
                    <HStack justify="space-between" w="full">
                      <Heading size="md" color="teal.600">
                        {course.name}
                      </Heading>
                      <Badge colorScheme="teal" variant="subtle">
                        {course.code}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardHeader>
                <CardBody pt={2}>
                  <VStack spacing={4} align="stretch">
                    <Text color="gray.600" fontSize="sm">
                      Click to view available quizzes and start learning!
                    </Text>
                    <Button
                      colorScheme="teal"
                      size="md"
                      onClick={() => handleCourseRedirect(course.code)}
                      leftIcon={<Icon as={FaBook} />}
                    >
                      Enter Course
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card bg={cardBg} textAlign="center" p={8}>
            <CardBody>
              <VStack spacing={4}>
                <Icon as={FaBook} w={12} h={12} color="gray.400" />
                <Text fontSize="lg" color="gray.600">
                  You are not enrolled in any courses yet.
                </Text>
                <Text color="gray.500">
                  Contact your instructor to get enrolled in courses.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Quick Actions */}
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md" color="teal.600">Quick Actions</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Button
              leftIcon={<Icon as={FaQuestionCircle} />}
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate('/student/quizzes')}
            >
              Browse All Quizzes
            </Button>
            <Button
              leftIcon={<Icon as={FaTrophy} />}
              colorScheme="green"
              variant="outline"
              onClick={() => navigate('/student/scores')}
            >
              View My Scores
            </Button>
            <Button
              leftIcon={<Icon as={FaBook} />}
              colorScheme="purple"
              variant="outline"
              onClick={() => navigate('/student')}
            >
              My Courses
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
}

export default StudentDashboard;