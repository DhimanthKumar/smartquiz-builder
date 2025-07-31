# views/profile.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..serializers import UserProfileSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)
