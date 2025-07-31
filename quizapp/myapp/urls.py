from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
# from .views import protected_view
from  myapp.views.createuser import register_student, CreateTeacherView
from myapp.views.deleteuser import delete_user_by_username
from myapp.views.createquiz import create_quiz
from myapp.views.viewscore import view_score
from myapp.views.profile import get_profile
from myapp.views.takequizs import take_quiz, submit_quiz
from myapp.views.student_courses import get_student_courses
from myapp.views.allquiz import get_quizzes_for_course_by_code
from myapp.views.teacherscourses import get_teacher_courses     
urlpatterns = [
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    # path('protected', protected_view, name='protected'),
    path('register/student', register_student, name='register_student'),
    path('register/teacher', CreateTeacherView.as_view(), name='register_teacher'),
    path('deleteuser/<str:username>' , delete_user_by_username , name='delete_user_by_username'),
    path('create_quiz' , create_quiz, name='create_quiz'),
    path('quiz/<int:quiz_id>/take', take_quiz, name='take-quiz'),
    path('quiz/submit', submit_quiz, name='submit-quiz'),
    path('quiz/<int:quiz_id>/viewscore', view_score, name='view-score'),
    path('profile', get_profile, name='get_profile'),
    path('courses', get_student_courses, name='get_student_courses'),
    path('quizzes/<str:course_code>', get_quizzes_for_course_by_code, name='quizzes_for_course'),
    path('teacher/courses', get_teacher_courses, name='get_teacher_courses'),

]
