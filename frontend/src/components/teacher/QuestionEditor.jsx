import { Box, Input, Textarea, VStack, HStack, Button, Radio } from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { generateOptionsUsingPuter } from "./quizAiFunctions";

const QuestionEditor = ({ index, initialQuestion, onQuestionUpdate }) => {
  // ✅ Ensure safe defaults to avoid "undefined" errors
  const safeQuestion = initialQuestion || { 
    text: "", 
    options: ["", "", "", ""], 
    correct_option: 0 
  };

  const [text, setText] = useState(safeQuestion.text);
  const [options, setOptions] = useState(safeQuestion.options);
  const [correctOption, setCorrectOption] = useState(safeQuestion.correct_option);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const saveTimeout = useRef(null);
  useEffect(() => {
  setText(initialQuestion?.text ?? "");
  setOptions(initialQuestion?.options ?? ["", "", "", ""]);
  setCorrectOption(initialQuestion?.correct_option ?? 0);
}, [initialQuestion]);
  // ✅ Debounce parent update to avoid lag when typing
  useEffect(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      onQuestionUpdate(index, { text, options, correct_option: correctOption });
    }, 300);
    return () => clearTimeout(saveTimeout.current);
  }, [text, options, correctOption, index, onQuestionUpdate]);

  const handleOptionChange = (i, value) => {
    setOptions(prev => prev.map((opt, idx) => (idx === i ? value : opt)));
  };

  const handleGenerateOptions = async () => {
    if (!text.trim()) return;
    setLoadingOptions(true);
    try {
      const result = await generateOptionsUsingPuter(text);
      setOptions(result.options);
      setCorrectOption(result.correctIndex);
    } finally {
      setLoadingOptions(false);
    }
  };

  return (
    <Box p={4} border="1px solid #ddd" borderRadius="md">
      <VStack align="stretch" spacing={2}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Question ${index + 1}`}
          size="sm"
        />
        {options.map((opt, i) => (
          <HStack key={i}>
            <Radio
              isChecked={correctOption === i}
              onChange={() => setCorrectOption(i)}
            />
            <Input
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              size="sm"
            />
          </HStack>
        ))}
        <Button
          size="xs"
          onClick={handleGenerateOptions}
          isLoading={loadingOptions}
        >
          Generate Options
        </Button>
      </VStack>
    </Box>
  );
};

export default React.memo(QuestionEditor);
