from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# ------------------------------------------
# Custom User Model
# ------------------------------------------

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from .managers import CustomUserManager
class User(AbstractUser):
    objects = CustomUserManager()
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # Fix conflict by overriding and specifying unique related names
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# ------------------------------------------
# Course Model
# ------------------------------------------

class Course(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    teachers = models.ManyToManyField(User, limit_choices_to={'role': 'teacher'}, related_name='teaching_courses')
    students = models.ManyToManyField(User, limit_choices_to={'role': 'student'}, related_name='enrolled_courses', blank=True)

    def __str__(self):
        return self.code


# ------------------------------------------
# Quiz & Question Models
# ------------------------------------------

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField()
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.course.code})"

    def is_active(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()

    def __str__(self):
        return self.text[:50]


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"


# ------------------------------------------
# Attempt & Scoring Models
# ------------------------------------------

class QuizAttempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'quiz')

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title}"


class StudentAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True, blank=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.attempt.student.username} - {self.question.text[:30]}"
