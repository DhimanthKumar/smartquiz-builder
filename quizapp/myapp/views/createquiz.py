from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from myapp.models import User, Course, Quiz, Question, Option


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request):
    '''{
  "course_id": 3,
  "title": "Python Basics Quiz",
  "num_questions": 2,
  "duration_minutes": 20,
  "questions": [
    {
      "text": "What is the output of 2 + 2?",
      "options": ["3", "4", "5", "22"],
      "correct_option": 1
    },
    {
      "text": "Which keyword is used for function in Python?",
      "options": ["func", "def", "function", "lambda"],
      "correct_option": 1
    }
  ]
}
'''
    user = request.user

    if user.role != 'teacher':
        return Response({'detail': 'Only teachers can create quizzes.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    course_id = data.get('course_id')
    title = data.get('title')
    num_questions = data.get('num_questions')
    duration_minutes = data.get('duration_minutes')
    questions_data = data.get('questions', [])

    if not (course_id and title and num_questions and duration_minutes and questions_data):
        return Response({'detail': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(questions_data) != int(num_questions):
        return Response({'detail': 'Number of questions mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

    if user not in course.teachers.all():
        return Response({'detail': 'You are not assigned as a teacher to this course.'}, status=status.HTTP_403_FORBIDDEN)

    quiz = Quiz.objects.create(
        title=title,
        course=course,
        created_by=user,
        start_time=timezone.now(),
        end_time=timezone.now() + timezone.timedelta(minutes=int(duration_minutes)),
        duration_minutes=duration_minutes,
        is_published=True
    )

    for q_data in questions_data:
        q_text = q_data.get('text')
        options = q_data.get('options', [])
        correct_index = q_data.get('correct_option')  # 0-based index

        if not (q_text and options and isinstance(correct_index, int)) or correct_index >= len(options):
            return Response({'detail': 'Invalid question or options format.'}, status=status.HTTP_400_BAD_REQUEST)

        question = Question.objects.create(quiz=quiz, text=q_text)

        for idx, opt_text in enumerate(options):
            Option.objects.create(
                question=question,
                text=opt_text,
                is_correct=(idx == correct_index)
            )

    return Response({'detail': 'Quiz created successfully.', 'quiz_id': quiz.id}, status=status.HTTP_201_CREATED)
