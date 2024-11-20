from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import git
import subprocess
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


class CommitModification(BaseModel):
    repo_path: str
    commit_sha: str
    new_author_name: str
    new_author_email: str
    new_committer_name: str
    new_committer_email: str
    new_date: str
    new_message: str


def list_commits(repo_path):
    try:
        repo = git.Repo(repo_path)
        commits = list(repo.iter_commits("main"))
        commit_list = []
        for commit in commits:
            commit_list.append(
                {
                    "sha": commit.hexsha,
                    "author_name": commit.author.name,
                    "author_email": commit.author.email,
                    "committer_name": commit.committer.name,
                    "committer_email": commit.committer.email,
                    "date": datetime.fromtimestamp(commit.committed_date).isoformat(),
                    "message": commit.message.strip(),
                }
            )
        return commit_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing commits: {e}")


def modify_commit(modification: CommitModification):
    try:
        rebase_cmd = f"""
        git filter-branch -f --env-filter '
        if [ $GIT_COMMIT = "{modification.commit_sha}" ]
        then
            export GIT_AUTHOR_NAME="{modification.new_author_name}"
            export GIT_AUTHOR_EMAIL="{modification.new_author_email}"
            export GIT_COMMITTER_NAME="{modification.new_committer_name}"
            export GIT_COMMITTER_EMAIL="{modification.new_committer_email}"
            export GIT_AUTHOR_DATE="{modification.new_date}"
            export GIT_COMMITTER_DATE="{modification.new_date}"
            export GIT_COMMIT_MESSAGE="{modification.new_message}"
        fi
        ' HEAD
        """
        print("Executing command:", rebase_cmd)  # Debug statement
        subprocess.run(rebase_cmd, cwd=modification.repo_path, shell=True, check=True)
        updated_commits = list_commits(modification.repo_path)
        print("Updated commits:", updated_commits)  # Debug statement
        return updated_commits
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error modifying commit: {e}")


@app.get("/commits/")
def get_commits(repo_path: str = None):
    repo_path = os.getenv("REPO_PATH")
    if not repo_path:
        raise HTTPException(
            status_code=500, detail="REPO_PATH environment variable is not set."
        )
    return list_commits(repo_path)


@app.post("/modify-commit/")
def post_modify_commit(modification: CommitModification):
    return modify_commit(modification)
