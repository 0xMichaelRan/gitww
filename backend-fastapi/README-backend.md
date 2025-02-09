# gitww (Git Witchcraft and Wizardry)

Welcome to the git-ww repository. 

This project is meant to cast some magic using git. 

## Setup

```
poetry new gitww-backend-fastapi
cd gitww-backend-fastapi
poetry add fastapi uvicorn GitPython fastapi-cors
vi app/main.py
poetry run uvicorn app.main:app --host 0.0.0.0 --port 3463 --reload
```

## Testing

```
curl -X GET "http://localhost:3463/commits/?repo_path=/usr/local/hub/gitww/backend-fastapi/fake_repo"
```
