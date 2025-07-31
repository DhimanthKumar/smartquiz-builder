# views/quiz_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import Course, Quiz
from ..serializers import QuizDetailSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quizzes_for_course_by_code(request, course_code):
    try:
        course = Course.objects.get(code=course_code)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

    quizzes = Quiz.objects.filter(course=course)
    serializer = QuizDetailSerializer(quizzes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
