FROM python:3.11-slim

WORKDIR /quizapp

RUN pip install pipenv

COPY Pipfile Pipfile.lock ./

RUN pipenv install --deploy --ignore-pipfile

COPY . .
RUN chmod 755  /quizapp/entrypoint.sh

# CMD ["pipenv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["./entrypoint.sh"]

