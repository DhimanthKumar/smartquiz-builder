from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import Course  # adjust path if needed
from ..serializers import CourseSerializer  # create if not present


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_courses(request):
    user = request.user

    if user.role != 'student':
        return Response(
            {"detail": "Only students can access their enrolled courses."},
            status=status.HTTP_403_FORBIDDEN
        )

    enrolled_courses = user.enrolled_courses.all()
    serialized = CourseSerializer(enrolled_courses, many=True)
    return Response(serialized.data, status=status.HTTP_200_OK)
