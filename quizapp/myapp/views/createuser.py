from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from  ..serializers import StudentRegistrationSerializer, TeacherCreationSerializer
from rest_framework.views import APIView
from .permissions import protected_view
# Open to all
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_student(request):
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Student registered successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Only staff can access
class CreateTeacherView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = TeacherCreationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Teacher created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
