echo -ne "\033]0;hub/gitww\007"
cd /usr/local/hub/gitww/backend-fastapi
# docker compose up -d
poetry install
poetry run uvicorn app.main:app --host 0.0.0.0 --port 3463 --reload
