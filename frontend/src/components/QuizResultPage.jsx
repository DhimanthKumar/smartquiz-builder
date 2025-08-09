import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Text,
  Spinner,
  Heading,
  VStack,
  Stack,
  Badge,
  Flex,
  Circle,
  Button,
  Collapse,
  useToast,
} from "@chakra-ui/react";

function Explanation({ questionText, optionText }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  // Retry wrapper function
  const fetchExplanation = (retry = 1) => {
    if (open) {
      setOpen(false);
      return;
    }

    if (explanation) {
      setOpen(true);
      return;
    }

    setLoading(true);

    const prompt = `Explain in about 50 words why the answer "${optionText}" to the question "${questionText}" is wrong.`;
    // console.log(prompt);

    puter.ai.chat(prompt)
      .then((response) => {
        if (response && response.message.content && response.message.content.length > 0) {
          setExplanation(response.message.content);
        } else {
          setExplanation("No explanation available.");
        }
        console.log("Explanation:", response.message.content);
        setLoading(false);
        setOpen(true);
      })
      .catch(() => {
        if (retry > 0) {
          console.log(`Retrying... attempts left: ${retry}`);
          // Retry once more
          fetchExplanation(retry - 1);
        } else {
          toast({
            title: "Failed to get explanation",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
        }
      });
  };

  return (
    <Box mt={2}>
      <Button size="sm" onClick={fetchExplanation} isLoading={loading}>
        Explain why wrong
      </Button>
      <Collapse in={open} animateOpacity>
        <Box mt={2} p={3} bg="gray.100" borderRadius="md" fontStyle="italic">
          {explanation}
        </Box>
      </Collapse>
    </Box>
  );
}

function QuizResultPage() {
  const { quizId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/quiz/${quizId}/viewscore`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        setResult(res.data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Failed to load quiz results",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [quizId, toast]);

  if (loading) return <Spinner size="xl" mt={10} />;

  if (!result) return <Text mt={10}>No result data found.</Text>;

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading mb={4}>{result.quiz_title}</Heading>
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Your Score: {result.score}
      </Text>

      <VStack spacing={6} align="stretch">
        {result.questions.map((q, idx) => (
          <Box
            key={q.question_id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            bg="gray.50"
          >
            <Text fontWeight="semibold" mb={3}>
              Q{idx + 1}. {q.question_text}
            </Text>

            <Stack spacing={2}>
              {q.options.map((opt) => {
                const isSelected = opt.option_id === q.selected_option_id;
                const isCorrect = opt.is_correct;

                return (
                  <Box key={opt.option_id}>
                    <Flex
                      p={2}
                      borderRadius="md"
                      bg={
                        isSelected
                          ? isCorrect
                            ? "green.300"
                            : "red.300"
                          : isCorrect
                          ? "green.100"
                          : "transparent"
                      }
                      border={isSelected ? "2px solid" : "1px solid"}
                      borderColor={
                        isSelected
                          ? isCorrect
                            ? "green.600"
                            : "red.600"
                          : "gray.300"
                      }
                      align="center"
                    >
                      <Circle
                        size="24px"
                        mr={3}
                        bg="gray.200"
                        fontSize="sm"
                        color="gray.700"
                      >
                        {String.fromCharCode(65 + q.options.indexOf(opt))}
                      </Circle>
                      <Text flex="1">{opt.text}</Text>
                      {isSelected && (
                        <Badge
                          colorScheme={isCorrect ? "green" : "red"}
                          fontSize="0.8em"
                          ml={2}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      )}
                    </Flex>

                    {/* Show explanation button only if selected answer is wrong */}
                    {isSelected && !isCorrect && (
                      <Explanation
                        questionText={q.question_text}
                        optionText={opt.text}
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default QuizResultPage;
