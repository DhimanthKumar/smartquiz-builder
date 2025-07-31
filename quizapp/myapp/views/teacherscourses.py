from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from myapp.models import Course


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_courses(request):
    user = request.user
    
    if user.role != 'teacher':
        return Response({'detail': 'Only teachers can access this.'}, status=status.HTTP_403_FORBIDDEN)

    courses = Course.objects.filter(teachers=user).values('id', 'code', 'name')

    return Response({'courses': list(courses)}, status=status.HTTP_200_OK)
