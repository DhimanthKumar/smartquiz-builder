import { useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FaGraduationCap, FaChalkboardTeacher, FaClipboardList, FaTrophy } from 'react-icons/fa';

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    // Auto-redirect authenticated users to their respective dashboards
    if (user) {
      if (user.typeofrole === 'student') {
        navigate('/student');
      } else if (user.typeofrole === 'teacher' || user.typeofrole === 'admin') {
        navigate('/teacher');
      }
    }
  }, [user, navigate]);

  // If user is logged in, this component won't render due to redirect
  // This is mainly for non-authenticated users
  if (user) {
    return null; // Component will redirect before rendering
  }

  const features = [
    {
      icon: FaGraduationCap,
      title: "For Students",
      description: "Take quizzes, track your progress, and improve your knowledge",
      color: "blue"
    },
    {
      icon: FaChalkboardTeacher,
      title: "For Teachers",
      description: "Create engaging quizzes and monitor student performance",
      color: "green"
    },
    {
      icon: FaClipboardList,
      title: "Smart Quiz Builder",
      description: "AI-powered quiz generation with automatic option creation",
      color: "purple"
    },
    {
      icon: FaTrophy,
      title: "Performance Tracking",
      description: "Detailed analytics and scoring with explanations",
      color: "orange"
    }
  ];

  return (
    <Box bg={bg} minH="80vh">
      <Container maxW="6xl" py={16}>
        {/* Hero Section */}
        <VStack spacing={8} textAlign="center" mb={16}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, teal.400, blue.400)"
            bgClip="text"
            fontWeight="extrabold"
          >
            Welcome to QuizMaster
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            The modern quiz platform that makes learning interactive and engaging. 
            Whether you're a student looking to test your knowledge or a teacher 
            creating assessments, we've got you covered.
          </Text>
          
          <HStack spacing={4} pt={4}>
            <Button
              size="lg"
              colorScheme="teal"
              onClick={() => navigate('/login')}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="teal"
              onClick={() => navigate('/register')}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Create Account
            </Button>
          </HStack>
        </VStack>

        {/* Features Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {features.map((feature, index) => (
            <Card
              key={index}
              bg={cardBg}
              boxShadow="lg"
              _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
              transition="all 0.3s"
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <CardBody textAlign="center" py={8}>
                <VStack spacing={4}>
                  <Box
                    p={3}
                    rounded="full"
                    bg={`${feature.color}.100`}
                    color={`${feature.color}.500`}
                  >
                    <Icon as={feature.icon} w={8} h={8} />
                  </Box>
                  <Heading size="md" color={`${feature.color}.500`}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.600" textAlign="center">
                    {feature.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Call to Action */}
        <Box textAlign="center" mt={16} p={8} bg={cardBg} rounded="lg" boxShadow="lg">
          <Heading size="lg" mb={4}>
            Ready to Transform Your Learning Experience?
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Join thousands of students and teachers who are already using QuizMaster
          </Text>
          <Button
            size="lg"
            colorScheme="teal"
            onClick={() => navigate('/register')}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Sign Up Now - It's Free!
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;