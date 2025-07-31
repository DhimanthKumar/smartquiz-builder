from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from ..models import Quiz, QuizAttempt
from ..serializers import QuizDetailSerializer, SubmitQuizSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def take_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id, is_published=True)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found or not published.'}, status=status.HTTP_404_NOT_FOUND)

    # Optional: Prevent taking if student already submitted
    if QuizAttempt.objects.filter(student=request.user, quiz=quiz, completed=True).exists():
        return Response({'error': 'You have already completed this quiz.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = QuizDetailSerializer(quiz)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request):
    quiz_id = request.data.get('quiz_id')
    if not quiz_id:
        return Response({'error': 'quiz_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        quiz = Quiz.objects.get(pk=quiz_id)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user already submitted the quiz
    try:
        attempt = QuizAttempt.objects.get(student=request.user, quiz=quiz)
        if attempt.completed:
            return Response({'error': 'You have already submitted this quiz.'}, status=status.HTTP_403_FORBIDDEN)
    except QuizAttempt.DoesNotExist:
        pass  # No attempt yet; proceed

    # Proceed to serialize and save submission
    serializer = SubmitQuizSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        attempt = serializer.save()
        return Response({
            'message': 'Quiz submitted successfully.',
            'score': attempt.score
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
