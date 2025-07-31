# myapp/views/user_admin.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status
from ..models import User
# User = get_user_model()

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_by_username(request, username):
    if not request.user.is_superuser:
        return Response({"detail": "Permission denied. Only superusers can delete users."}, status=status.HTTP_403_FORBIDDEN)
    print(f"Attempting to delete user: {username} by {request.user.username}")
    try:
        user_to_delete = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"detail": f"User '{username}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

    # Prevent superusers from deleting themselves
    if user_to_delete == request.user:
        return Response({"detail": "You cannot delete yourself."}, status=status.HTTP_400_BAD_REQUEST)

    user_to_delete.delete()
    return Response({"detail": f"User '{username}' has been deleted."}, status=status.HTTP_200_OK)
