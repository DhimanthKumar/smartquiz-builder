import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Spinner,
  SimpleGrid,
  Text,
  Flex,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  useToast,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { 
  FaPlus, 
  FaEdit, 
  FaChartBar, 
  FaUsers, 
  FaQuestionCircle,
  FaBookOpen,
  FaClock
} from 'react-icons/fa';

function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalQuizzes: 0,
    totalStudents: 0,
    recentSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("gray.50", "gray.700");
  const bgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Fetch teacher courses
        const coursesResponse = await axios.get("http://127.0.0.1:8000/api/teacher/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        
        const coursesData = coursesResponse.data.courses || coursesResponse.data || [];
        setCourses(coursesData);

        // Calculate basic stats from available data
        const calculatedStats = {
          totalCourses: coursesData.length,
          totalQuizzes: 0, // Will be updated if we can fetch quiz data
          totalStudents: coursesData.reduce((total, course) => total + (course.enrolled_students || 0), 0),
          recentSubmissions: 0
        };

        setStats(calculatedStats);

      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "Please try again later.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.typeofrole === 'teacher' || user.typeofrole === 'admin')) {
      fetchTeacherData();
    } else {
      setLoading(false);
    }
  }, [user, toast]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} minH="80vh" p={8}>
      <VStack spacing={8} maxW="7xl" mx="auto">
        {/* Welcome Header */}
        <VStack spacing={2} textAlign="center">
          <Heading size="xl" color="teal.500">
            Teacher Dashboard
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Welcome back, {user?.username}! Manage your courses and quizzes here.
          </Text>
        </VStack>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
          <Card bg={statBg}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Icon as={FaBookOpen} w={6} h={6} color="blue.500" />
                <Stat>
                  <StatNumber fontSize="2xl">{stats.totalCourses}</StatNumber>
                  <StatLabel>My Courses</StatLabel>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={statBg}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Icon as={FaQuestionCircle} w={6} h={6} color="purple.500" />
                <Stat>
                  <StatNumber fontSize="2xl">{stats.totalQuizzes}</StatNumber>
                  <StatLabel>Quizzes Created</StatLabel>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={statBg}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Icon as={FaUsers} w={6} h={6} color="green.500" />
                <Stat>
                  <StatNumber fontSize="2xl">{stats.totalStudents}</StatNumber>
                  <StatLabel>Total Students</StatLabel>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={statBg}>
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Icon as={FaChartBar} w={6} h={6} color="orange.500" />
                <Stat>
                  <StatNumber fontSize="2xl">{stats.recentSubmissions}</StatNumber>
                  <StatLabel>Recent Submissions</StatLabel>
                  <StatHelpText>This week</StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card bg={cardBg} w="full">
          <CardHeader>
            <Heading size="md" color="teal.600">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Button
                leftIcon={<Icon as={FaPlus} />}
                colorScheme="teal"
                size="lg"
                onClick={() => navigate('/teacher/create-quiz')}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Create New Quiz
              </Button>
              <Button
                leftIcon={<Icon as={FaQuestionCircle} />}
                colorScheme="blue"
                variant="outline"
                size="lg"
                onClick={() => navigate('/student/quizzes')}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Browse All Quizzes
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* My Courses */}
        <Card bg={cardBg} w="full">
          <CardHeader>
            <Heading size="md" color="teal.600">My Courses</Heading>
          </CardHeader>
          <CardBody>
            {courses.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    bg={statBg}
                    _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <CardBody>
                      <VStack spacing={2} align="start">
                        <Heading size="sm" color="teal.600">
                          {course.name}
                        </Heading>
                        <Badge colorScheme="teal" variant="subtle">
                          {course.code}
                        </Badge>
                        <Text fontSize="sm" color="gray.600">
                          {course.enrolled_students || 0} students enrolled
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <VStack spacing={4} py={8} textAlign="center">
                <Icon as={FaBookOpen} w={12} h={12} color="gray.400" />
                <Text color="gray.600">No courses assigned yet.</Text>
                <Text fontSize="sm" color="gray.500">
                  Contact your administrator to get assigned to courses.
                </Text>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Getting Started Guide */}
        <Card bg={cardBg} w="full">
          <CardHeader>
            <Heading size="md" color="teal.600">Getting Started</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="start">
              <Text>
                📚 <Text as="span" fontWeight="semibold">Step 1:</Text> Get assigned to courses by your administrator
              </Text>
              <Text>
                ✏️ <Text as="span" fontWeight="semibold">Step 2:</Text> Create quizzes for your courses using our AI-powered question generator
              </Text>
              <Text>
                👥 <Text as="span" fontWeight="semibold">Step 3:</Text> Students can then take your quizzes and view their results
              </Text>
              <Text>
                📊 <Text as="span" fontWeight="semibold">Step 4:</Text> Monitor student progress and performance
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

export default TeacherDashboard;