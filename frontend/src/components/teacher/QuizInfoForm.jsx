import { Stack, Text, FormControl, FormLabel, Select, Input, Button } from "@chakra-ui/react";
import React from "react";

const QuizInfoForm = ({ quizInfo, setQuizInfo, courses, loadingCourses, onNext }) => {
  const handleChange = (e) => {
    setQuizInfo({ ...quizInfo, [e.target.name]: e.target.value });
  };

  return (
    <Stack spacing={4}>
      <Text fontSize="2xl" fontWeight="bold">
        Create New Quiz
      </Text>

      <FormControl isRequired>
        <FormLabel>Course</FormLabel>
        <Select
          name="course_id"
          placeholder="Select course"
          onChange={handleChange}
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
        <Input name="title" value={quizInfo.title} onChange={handleChange} />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Duration (minutes)</FormLabel>
        <Input
          name="duration_minutes"
          type="number"
          value={quizInfo.duration_minutes}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Number of Questions</FormLabel>
        <Input
          name="num_questions"
          type="number"
          value={quizInfo.num_questions}
          onChange={handleChange}
        />
      </FormControl>

      <Button colorScheme="blue" onClick={onNext} isDisabled={!quizInfo.course_id}>
        Next
      </Button>
    </Stack>
  );
};

export default QuizInfoForm;
