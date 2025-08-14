#!/bin/bash
# Exit immediately if a command fails
# set -e

# Apply database migrations
pipenv run python manage.py makemigrations
pipenv run python manage.py migrate

# Start Django server
pipenv run python manage.py runserver 0.0.0.0:8000
