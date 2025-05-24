FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# This command will run when the container starts
# It first ensures the database is initialized if it doesn't exist
# then starts the Flask application.
CMD sh -c "python init_db.py && flask run --host=0.0.0.0" 