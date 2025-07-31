from django.contrib import admin
from .models import User, Course, Quiz, Question, Option, QuizAttempt, StudentAnswer
admin.site.register(User)
admin.site.register(Course)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Option)
admin.site.register(QuizAttempt)
admin.site.register(StudentAnswer)
# Register your models here.
