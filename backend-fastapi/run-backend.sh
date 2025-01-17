echo -ne "\033]0;gitww-backend\007"
cd ~/hub/gitww-monorepo/backend-fastapi
poetry run uvicorn main:app --host 0.0.0.0 --port 8000
