import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Stack,
  Text,
  Textarea,
  Select,
  useToast,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

const generateOptionsUsingPuter = async (questionText) => {
  const prompt = `Generate 4 plausible multiple-choice options for the following quiz question. Make sure one option is clearly correct and three are plausible but incorrect the order of option should be entirely random. Format your response as exactly 4 lines :

Question: "${questionText}"

Option 1: [First option]
Option 2: [Second option] 
Option 3: [Third option]
Option 4: [Fourth option]

Then on a new line, indicate which option number (1, 2, 3, or 4) is correct by writing:
Correct: [number]

Please provide realistic and educational options.`;

  try {
    const response = await puter.ai.chat(prompt);
    if (response && response.message.content) {
      const content = response.message.content;
      
      // Extract options using regex for "Option X:" format
      const optionMatches = content.match(/Option \d+:\s*(.+)/g);
      const correctMatch = content.match(/Correct:\s*(\d+)/i);
      
      if (optionMatches && optionMatches.length >= 4 && correctMatch) {
        const options = optionMatches.slice(0, 4).map(match => 
          match.replace(/Option \d+:\s*/, '').trim()
        );
        
        const correctOptionNumber = parseInt(correctMatch[1]);
        const correctIndex = correctOptionNumber - 1; // Convert to 0-based index
        
        return {
          options,
          correctIndex: Math.max(0, Math.min(3, correctIndex)) // Ensure valid index (0-3)
        };
      } else {
        // Fallback: try to extract any 4 lines that look like options
        const lines = content.split('\n').filter(line => line.trim() && !line.toLowerCase().includes('question:'));
        if (lines.length >= 4) {
          const options = lines.slice(0, 4).map(line => line.replace(/^[A-D]\)|\d+\.|\-|\*/, '').trim());
          return {
            options,
            correctIndex: 0 // Default to first option if can't determine correct answer
          };
        }
        throw new Error("Could not parse AI response format");
      }
    } else {
      throw new Error("No content in response.");
    }
  } catch (error) {
    console.error("Error generating options:", error);
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries}`);
      return generateOptionsWithRetry(prompt, retries - 1);
    }
    throw error;
  }
}

const CreateQuiz = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [generatingOptions, setGeneratingOptions] = useState({});

  const [quizInfo, setQuizInfo] = useState({
    title: "",
    duration_minutes: "",
    num_questions: 1,
    course_id: "",
  });

  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correct_option: 0 },
  ]);

  // Fetch teacher courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/teacher/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        toast({
          title: "Error fetching courses.",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [toast]);

  const handleInfoChange = (e) => {
    setQuizInfo({ ...quizInfo, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "text") {
      updated[index].text = value;
    } else if (field === "correct_option") {
      updated[index].correct_option = parseInt(value);
    } else {
      const optionIndex = parseInt(field);
      updated[index].options[optionIndex] = value;
    }
    setQuestions(updated);
  };

  const generateOptionsForQuestion = async (questionIndex) => {
    const question = questions[questionIndex];
    if (!question.text.trim()) {
      toast({
        title: "Question text required",
        description: "Please enter the question text before generating options.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setGeneratingOptions(prev => ({ ...prev, [questionIndex]: true }));

    try {
      const result = await generateOptionsUsingPuter(question.text);
      const updated = [...questions];
      updated[questionIndex].options = result.options;
      updated[questionIndex].correct_option = result.correctIndex;
      setQuestions(updated);

      toast({
        title: "Options generated successfully!",
        description: `Correct answer automatically set to option ${result.correctIndex + 1}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to generate options",
        description: "Please try again or enter options manually.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setGeneratingOptions(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handleStepNext = () => {
    const count = parseInt(quizInfo.num_questions);
    setQuestions(
      Array.from({ length: count }, () => ({
        text: "",
        options: ["", "", "", ""],
        correct_option: 0,
      }))
    );
    setStep(2);
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
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Create New Quiz
          </Text>

          <FormControl isRequired>
            <FormLabel>Course</FormLabel>
            <Select
              name="course_id"
              placeholder="Select course"
              onChange={handleInfoChange}
              value={quizInfo.course_id}
              isDisabled={loadingCourses}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Quiz Title</FormLabel>
            <Input name="title" value={quizInfo.title} onChange={handleInfoChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Duration (minutes)</FormLabel>
            <Input
              name="duration_minutes"
              type="number"
              value={quizInfo.duration_minutes}
              onChange={handleInfoChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Number of Questions</FormLabel>
            <Input
              name="num_questions"
              type="number"
              value={quizInfo.num_questions}
              onChange={handleInfoChange}
            />
          </FormControl>

          <Button colorScheme="blue" onClick={handleStepNext} isDisabled={!quizInfo.course_id}>
            Next
          </Button>
        </Stack>
      )}

      {step === 2 && (
        <Stack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold">
            Enter Questions
          </Text>

          {questions.map((q, idx) => (
            <Box key={idx} borderWidth={1} p={4} borderRadius="md">
              <FormControl isRequired>
                <FormLabel>Question {idx + 1}</FormLabel>
                <Textarea
                  value={q.text}
                  onChange={(e) => handleQuestionChange(idx, "text", e.target.value)}
                  placeholder="Enter your question here..."
                />
              </FormControl>

              <VStack spacing={2} align="stretch" mt={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Options:</Text>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => generateOptionsForQuestion(idx)}
                    isLoading={generatingOptions[idx]}
                    loadingText="Generating..."
                    isDisabled={!q.text.trim()}
                  >
                    🤖 Generate Options with AI
                  </Button>
                </HStack>

                {generatingOptions[idx] && (
                  <Box p={3} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                    <HStack spacing={2}>
                      <Spinner size="sm" color="purple.500" />
                      <Text fontSize="sm" color="purple.600">
                        AI is generating options and will automatically select the correct answer...
                      </Text>
                    </HStack>
                  </Box>
                )}

                {q.options.map((opt, optIdx) => (
                  <Input
                    key={optIdx}
                    placeholder={`Option ${optIdx + 1}`}
                    value={opt}
                    onChange={(e) => handleQuestionChange(idx, optIdx.toString(), e.target.value)}
                  />
                ))}
              </VStack>

              <FormControl mt={4}>
                <FormLabel>Correct Option</FormLabel>
                <RadioGroup
                  value={q.correct_option.toString()}
                  onChange={(val) => handleQuestionChange(idx, "correct_option", val)}
                >
                  <Stack direction="row">
                    {q.options.map((option, i) => (
                      <Radio key={i} value={i.toString()} isDisabled={!option.trim()}>
                        Option {i + 1}
                        {option.trim() && (
                          <Text fontSize="xs" color="gray.500" ml={1}>
                            ({option.substring(0, 20)}{option.length > 20 ? '...' : ''})
                          </Text>
                        )}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Box>
          ))}

          <HStack justify="space-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
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