from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import git
import subprocess
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

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
        commits = list(repo.iter_commits('main'))
        commit_list = []
        for commit in commits:
            commit_list.append({
                "sha": commit.hexsha,
                "author": f"{commit.author.name} <{commit.author.email}>",
                "date": datetime.fromtimestamp(commit.committed_date).isoformat(),
                "committer": f"{commit.committer.name} <{commit.committer.email}>",
                "message": commit.message.strip()
            })
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
        subprocess.run(rebase_cmd, cwd=modification.repo_path, shell=True, check=True)
        return f"Modified commit {modification.commit_sha} successfully."
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error modifying commit: {e}")

@app.get("/commits/")
def get_commits(repo_path: str = "~/hub/gitww-backend-fastapi/fake_repo"):
    return list_commits(repo_path)

@app.post("/modify-commit/")
def post_modify_commit(modification: CommitModification):
    return modify_commit(modification)
