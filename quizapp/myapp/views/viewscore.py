from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import Quiz, QuizAttempt, StudentAnswer, Option

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_score(request, quiz_id):
    user = request.user

    # Ensure student has attempted the quiz
    try:
        attempt = QuizAttempt.objects.get(student=user, quiz__id=quiz_id)
    except QuizAttempt.DoesNotExist:
        return Response({"error": "Quiz not attempted or does not exist."}, status=status.HTTP_404_NOT_FOUND)

    data = {
        "quiz_title": attempt.quiz.title,
        "score": attempt.score,
        "completed": attempt.completed,
        "questions": []
    }

    for answer in attempt.answers.select_related('question', 'selected_option').all():
        question_data = {
            "question_id": answer.question.id,
            "question_text": answer.question.text,
            "selected_option_id": answer.selected_option.id if answer.selected_option else None,
            "selected_option_text": answer.selected_option.text if answer.selected_option else None,
            "is_correct": answer.is_correct,
            "options": []
        }

        # Get all options for the question
        for opt in answer.question.options.all():
            question_data["options"].append({
                "option_id": opt.id,
                "text": opt.text,
                "is_correct": opt.is_correct
            })

        data["questions"].append(question_data)

    return Response(data, status=status.HTTP_200_OK)
