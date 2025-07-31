from rest_framework import serializers
from .models import User , Course, Quiz, Question, Option, QuizAttempt, StudentAnswer
from django.utils import timezone

class StudentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        print(password)
        user = User.objects.create_user(
    username=validated_data['username'],
    # email=validated_data['email'],
    password=password,
    role='student'  # or teacher
)       
        print(user.password)
        return user



class TeacherCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data, role='teacher')
        user.set_password(password)
        user.save()
        return user

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']  # Do NOT include `is_correct`

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'options']

class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'duration_minutes', 'questions']
class StudentAnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option_id = serializers.IntegerField()

class SubmitQuizSerializer(serializers.Serializer):
    quiz_id = serializers.IntegerField()
    answers = StudentAnswerInputSerializer(many=True)

    def validate(self, data):
        user = self.context['request'].user
        quiz_id = data['quiz_id']
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            raise serializers.ValidationError("Quiz not found.")

        if user.role != 'student':
            raise serializers.ValidationError("Only students can submit quizzes.")

        if not quiz.is_published:
            raise serializers.ValidationError("Quiz is not yet available.")

        # Optional: Time check
        now = timezone.now()
        if now > quiz.end_time:
            pass  # Allow late submission

        data['quiz'] = quiz
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        quiz = validated_data['quiz']
        answers = validated_data['answers']

        attempt, _ = QuizAttempt.objects.get_or_create(student=user, quiz=quiz)

        correct_count = 0
        total = 0

        for ans in answers:
            try:
                question = Question.objects.get(id=ans['question_id'], quiz=quiz)
                selected_option = Option.objects.get(id=ans['selected_option_id'], question=question)
            except (Question.DoesNotExist, Option.DoesNotExist):
                continue

            is_correct = selected_option.is_correct
            StudentAnswer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={
                    'selected_option': selected_option,
                    'is_correct': is_correct
                }
            )
            total += 1
            if is_correct:
                correct_count += 1

        score = round((correct_count / total) * 100, 2) if total else 0
        attempt.score = score
        attempt.completed = True
        attempt.save()
        return attempt
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['name', 'code']

class UserProfileSerializer(serializers.ModelSerializer):
    enrolled_courses = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'enrolled_courses']

    def get_enrolled_courses(self, obj):
        if obj.role == 'student':
            return CourseSerializer(obj.enrolled_courses.all(), many=True).data
        return None
class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
class CourseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    teachers = UserBasicSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'name', 'code' , 'teachers']
