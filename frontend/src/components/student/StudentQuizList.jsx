import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Icon,
  Flex,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FaPlay, FaCheck, FaClock, FaSearch, FaFilter } from 'react-icons/fa';

function StudentQuizList() {
  const { user } = useContext(AuthContext);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const bgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        // Fetch all quizzes from enrolled courses
        const promises = user.coursesEnrolled.map(async (courseCode) => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}0/api/quizzes/${courseCode}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
              }
            );
            return response.data.map(quiz => ({
              ...quiz,
              courseCode,
              courseName: courseCode // You might want to get actual course names
            }));
          } catch (error) {
            console.error(`Failed to fetch quizzes for ${courseCode}:`, error);
            return [];
          }
        });

        const results = await Promise.all(promises);
        const flatQuizzes = results.flat();
        setAllQuizzes(flatQuizzes);
        setFilteredQuizzes(flatQuizzes);
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

    if (user?.coursesEnrolled?.length > 0) {
      fetchAllQuizzes();
    } else {
      setLoading(false);
    }
  }, [user, toast]);

  // Filter and search logic
  useEffect(() => {
    let filtered = allQuizzes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      // Note: You'll need to track completion status in your backend
      // For now, this is a placeholder implementation
      filtered = filtered.filter(quiz => {
        if (filterStatus === "completed") {
          return quiz.completed; // Add this field from backend
        } else if (filterStatus === "pending") {
          return !quiz.completed;
        }
        return true;
      });
    }

    setFilteredQuizzes(filtered);
  }, [allQuizzes, searchTerm, filterStatus]);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const getQuizStatusBadge = (quiz) => {
    if (quiz.completed) {
      return <Badge colorScheme="green" leftIcon={<FaCheck />}>Completed</Badge>;
    }
    return <Badge colorScheme="blue" leftIcon={<FaClock />}>Available</Badge>;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} minH="80vh" p={8}>
      <VStack spacing={6} maxW="7xl" mx="auto">
        {/* Header */}
        <VStack spacing={2} textAlign="center">
          <Heading size="xl" color="teal.500">
            Available Quizzes
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Test your knowledge and track your progress
          </Text>
        </VStack>

        {/* Search and Filter Controls */}
        <Card bg={cardBg} w="full">
          <CardBody>
            <HStack spacing={4} wrap={{ base: "wrap", md: "nowrap" }}>
              <InputGroup flex="1" minW="250px">
                <InputLeftElement>
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search quizzes or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <HStack spacing={2}>
                <Icon as={FaFilter} color="gray.500" />
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  w="150px"
                >
                  <option value="all">All Quizzes</option>
                  <option value="pending">Available</option>
                  <option value="completed">Completed</option>
                </Select>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Quiz Grid */}
        {filteredQuizzes.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {filteredQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
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
                      <Heading size="md" color="teal.600" noOfLines={2}>
                        {quiz.title}
                      </Heading>
                      {getQuizStatusBadge(quiz)}
                    </HStack>
                    <Badge colorScheme="gray" variant="subtle">
                      {quiz.courseCode}
                    </Badge>
                  </VStack>
                </CardHeader>

                <CardBody pt={2}>
                  <VStack spacing={4} align="stretch">
                    <VStack spacing={2} align="start">
                      <HStack>
                        <Icon as={FaClock} color="gray.500" w={4} h={4} />
                        <Text fontSize="sm" color="gray.600">
                          <Text as="span" fontWeight="semibold">Duration:</Text> {quiz.duration_minutes} minutes
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaQuestionCircle} color="gray.500" w={4} h={4} />
                        <Text fontSize="sm" color="gray.600">
                          <Text as="span" fontWeight="semibold">Questions:</Text> {quiz.questions?.length || 0}
                        </Text>
                      </HStack>
                    </VStack>

                    <Button
                      colorScheme="teal"
                      size="md"
                      onClick={() => handleStartQuiz(quiz.id)}
                      leftIcon={<Icon as={quiz.completed ? FaCheck : FaPlay} />}
                      isDisabled={quiz.completed}
                    >
                      {quiz.completed ? 'View Results' : 'Start Quiz'}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card bg={cardBg} textAlign="center" p={8} w="full">
            <CardBody>
              <VStack spacing={4}>
                <Icon as={FaQuestionCircle} w={12} h={12} color="gray.400" />
                <Heading size="md" color="gray.600">
                  {searchTerm || filterStatus !== "all" ? "No quizzes found" : "No quizzes available"}
                </Heading>
                <Text color="gray.500">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : user?.coursesEnrolled?.length === 0
                    ? "You need to be enrolled in courses to see quizzes."
                    : "Your instructors haven't created any quizzes yet."
                  }
                </Text>
                {(searchTerm || filterStatus !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Quick Stats */}
        {filteredQuizzes.length > 0 && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Showing {filteredQuizzes.length} of {allQuizzes.length} quizzes
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default StudentQuizList;