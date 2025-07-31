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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
const generateOptionsUsingPuter = async (questionText) => {
  const prompt = `Generate 4 plausible multiple-choice options for the following quiz question:\n"${questionText}".\nReturn the options as a comma-separated list.`;

  try {
    const response = await puter.ai.chat(prompt);
    if (response && response.message.content) {
      // Split by comma, trim spaces, ensure exactly 4 options
      const rawOptions = response.message.content.split(',').map(opt => opt.trim()).slice(0, 4);
      while (rawOptions.length < 4) rawOptions.push("");
      return rawOptions;
    } else {
      throw new Error("No content in response.");
    }
  } catch (error) {
    console.error("Error generating options:", error);
    throw error;
  }
};

const CreateQuizPage = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [quizInfo, setQuizInfo] = useState({
    title: "",
    duration_minutes: "",
    num_questions: 1,
    course_id: "",
  });

  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correct_option: 0 },
  ]);

  // 🔄 Fetch teacher courses on mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/teacher/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setCourses(res.data.courses);
        setLoadingCourses(false);
      })
      .catch((err) => {
        toast({
          title: "Error fetching courses.",
          status: "error",
          duration: 3000,
        });
        setLoadingCourses(false);
      });
  }, []);

  const handleInfoChange = (e) => {
    setQuizInfo({ ...quizInfo, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "text") updated[index].text = value;
    else if (field === "correct_option") updated[index].correct_option = parseInt(value);
    else updated[index].options[parseInt(field)] = value;
    setQuestions(updated);
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

  const handleSubmit = () => {
    const payload = {
      ...quizInfo,
      num_questions: parseInt(quizInfo.num_questions),
      duration_minutes: parseInt(quizInfo.duration_minutes),
      questions,
    };

    axios
      .post("http://127.0.0.1:8000/api/create_quiz", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        toast({
          title: "Quiz created!",
          status: "success",
          duration: 3000,
        });
        setStep(1);
        setQuizInfo({
          title: "",
          duration_minutes: "",
          num_questions: 1,
          course_id: "",
        });
        setQuestions([]);
      })
      .catch((err) => {
        toast({
          title: "Failed to create quiz.",
          description: err.response?.data?.detail || "Unknown error.",
          status: "error",
          duration: 4000,
        });
      });
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
                />
              </FormControl>
                <Button
  size="sm"
  mt={2}
  onClick={async () => {
    try {
      const newOptions = await generateOptionsUsingPuter(q.text);
      const updated = [...questions];
      updated[idx].options = newOptions;
      setQuestions(updated);
      toast({
        title: "Options generated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Failed to generate options",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }}
  isDisabled={!q.text.trim()}
>
  Generate Options
</Button>

              <Text mt={3} fontWeight="semibold">
                Options:
              </Text>
              {q.options.map((opt, optIdx) => (
                <Input
                  key={optIdx}
                  mt={2}
                  placeholder={`Option ${optIdx + 1}`}
                  value={opt}
                  onChange={(e) => handleQuestionChange(idx, optIdx.toString(), e.target.value)}
                />
              ))}

              <FormControl mt={3}>
                <FormLabel>Correct Option</FormLabel>
                <RadioGroup
                  value={q.correct_option.toString()}
                  onChange={(val) => handleQuestionChange(idx, "correct_option", val)}
                >
                  <Stack direction="row">
                    {q.options.map((_, i) => (
                      <Radio key={i} value={i.toString()}>
                        {`Option ${i + 1}`}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Box>
          ))}

          <Button colorScheme="green" onClick={handleSubmit}>
            Submit Quiz
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default CreateQuizPage;
