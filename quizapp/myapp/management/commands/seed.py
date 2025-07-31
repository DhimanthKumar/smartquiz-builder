from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
import random
from myapp.models import User, Course, Quiz, Question, Option, QuizAttempt, StudentAnswer

fake = Faker()

class Command(BaseCommand):
    help = "Seed the database with fake data"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Seeding started..."))

        # Clear existing data
        Option.objects.all().delete()
        Question.objects.all().delete()
        StudentAnswer.objects.all().delete()
        QuizAttempt.objects.all().delete()
        Quiz.objects.all().delete()
        Course.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        # Create teachers
        teachers = []
        for _ in range(5):
            teacher = User.objects.create_user(
                username=fake.unique.user_name(),
                email=fake.email(),
                password="password",
                role='teacher'
            )
            teachers.append(teacher)

        # Create students
        students = []
        for _ in range(10):
            student = User.objects.create_user(
                username=fake.unique.user_name(),
                email=fake.email(),
                password="password",
                role='student'
            )
            students.append(student)

        # Create courses
        courses = []
        for i in range(3):
            course = Course.objects.create(
                name=fake.word().capitalize() + " Course",
                code=f"COURSE{i+1}"
            )
            course.teachers.set(random.sample(teachers, k=2))
            course.students.set(random.sample(students, k=6))
            courses.append(course)

        # Create quizzes
        for course in courses:
            for _ in range(2):  # 2 quizzes per course
                quiz = Quiz.objects.create(
                    title=fake.sentence(nb_words=4),
                    course=course,
                    created_by=random.choice(course.teachers.all()),
                    start_time=timezone.now(),
                    end_time=timezone.now() + timezone.timedelta(days=2),
                    duration_minutes=random.randint(10, 60),
                    is_published=True
                )

                # Create questions
                for _ in range(5):  # 5 questions per quiz
                    question = Question.objects.create(
                        quiz=quiz,
                        text=fake.sentence(nb_words=8)
                    )

                    correct_index = random.randint(0, 3)
                    for i in range(4):  # 4 options
                        Option.objects.create(
                            question=question,
                            text=fake.word().capitalize(),
                            is_correct=(i == correct_index)
                        )

        # Create attempts
        for student in students:
            for quiz in Quiz.objects.order_by('?')[:3]:  # 3 random quizzes per student
                attempt = QuizAttempt.objects.create(
                    student=student,
                    quiz=quiz,
                    completed=True,
                    score=0
                )

                total_correct = 0
                for question in quiz.questions.all():
                    selected = random.choice(question.options.all())
                    StudentAnswer.objects.create(
                        attempt=attempt,
                        question=question,
                        selected_option=selected,
                        is_correct=selected.is_correct
                    )
                    if selected.is_correct:
                        total_correct += 1

                attempt.score = total_correct
                attempt.save()

        self.stdout.write(self.style.SUCCESS("✅ Seeding completed successfully!"))
