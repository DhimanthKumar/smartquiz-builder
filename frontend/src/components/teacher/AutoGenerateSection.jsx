import {
  Box, VStack, HStack, Text, Button, Collapse, FormControl,
  FormLabel, Textarea, Select, Input, Alert, AlertIcon,
  AlertTitle, AlertDescription
} from "@chakra-ui/react";
import React from "react";

const AutoGenerateSection = ({ autoGenSettings, setAutoGenSettings, quizInfo, isLoading, onGenerate }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customDifficulty, setCustomDifficulty] = React.useState("");

  const handleDifficultyChange = (e) => {
    const value = e.target.value;
    if (value !== "custom") {
      setAutoGenSettings({ ...autoGenSettings, difficulty: value });
      setCustomDifficulty("");
    } else {
      // Temporarily clear difficulty until user types
      setAutoGenSettings({ ...autoGenSettings, difficulty: "" });
    }
  };

  const isCustom = !["easy", "medium", "hard"].includes(autoGenSettings.difficulty);

  return (
    <Box borderWidth={2} borderColor="blue.200" p={4} borderRadius="lg" bg="blue.50">
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" color="blue.700">
            🚀 Auto-Generate Entire Quiz
          </Text>
          <Text fontSize="sm" color="blue.600">
            Let AI create all {quizInfo.num_questions} questions at once
          </Text>
        </VStack>
        <Button
          colorScheme="blue"
          variant={isOpen ? "solid" : "outline"}
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
        >
          {isOpen ? "Hide Options" : "Show Options"}
        </Button>
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={4} align="stretch" mt={4} p={4} bg="white" borderRadius="md">
          <Alert status="info" size="sm">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Auto-Generate Feature</AlertTitle>
              <AlertDescription fontSize="xs">
                Describe your quiz topic and choose difficulty. AI will generate all questions with options and correct answers.
              </AlertDescription>
            </Box>
          </Alert>

          <FormControl isRequired>
            <FormLabel fontSize="sm">Quiz Description/Topic</FormLabel>
            <Textarea
              name="description"
              value={autoGenSettings.description}
              onChange={(e) => setAutoGenSettings({ ...autoGenSettings, description: e.target.value })}
              placeholder="E.g., 'JavaScript basics', 'World War II events'..."
              size="sm"
              rows={3}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm">Difficulty Level</FormLabel>
            <Select
              name="difficulty"
              value={
                ["easy", "medium", "hard"].includes(autoGenSettings.difficulty)
                  ? autoGenSettings.difficulty
                  : "custom"
              }
              onChange={handleDifficultyChange}
              size="sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="custom">Custom...</option>
            </Select>

            {isCustom && (
              <Input
                mt={2}
                placeholder="Enter custom difficulty"
                size="sm"
                value={customDifficulty}
                onChange={(e) => {
                  setCustomDifficulty(e.target.value);
                  setAutoGenSettings({ ...autoGenSettings, difficulty: e.target.value });
                }}
              />
            )}
          </FormControl>

          <Button
            colorScheme="green"
            onClick={onGenerate}
            isLoading={isLoading}
            loadingText="Generating Quiz..."
            isDisabled={!autoGenSettings.description.trim()}
            size="sm"
            flex={1}
          >
            🤖 Generate {quizInfo.num_questions} Questions
          </Button>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default AutoGenerateSection;
