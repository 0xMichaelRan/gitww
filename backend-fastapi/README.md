# gitww (Git Witchcraft and Wizardry)

Welcome to the git-ww repository. 

This project is meant to cast some magic using git. 

## Setup

```
poetry new gitww-backend-fastapi
cd gitww-backend-fastapi
poetry add fastapi uvicorn GitPython
vi main.py
poetry run uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing

```
curl -X GET "http://localhost:8000/commits/?repo_path=~/hub/gitww-monorepo/backend-fastapi/fake_repo"
```
