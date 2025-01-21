FROM python:3.12.8-slim-bookworm

WORKDIR /app/

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8000

CMD python manage.py runserver