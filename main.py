from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import git
import subprocess
from datetime import datetime

app = FastAPI()

class CommitModification(BaseModel):
    commit_sha: str
    new_author_name: str
    new_author_email: str
    new_committer_name: str
    new_committer_email: str
    new_date: str

def list_commits(repo_path):
    try:
        repo = git.Repo(repo_path)
        commits = list(repo.iter_commits('master'))
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

def modify_commit(repo_path, commit_sha, new_author_name, new_author_email, new_committer_name, new_committer_email, new_date):
    try:
        rebase_cmd = f"""
        git filter-branch -f --env-filter '
        if [ $GIT_COMMIT = "{commit_sha}" ]
        then
            export GIT_AUTHOR_NAME="{new_author_name}"
            export GIT_AUTHOR_EMAIL="{new_author_email}"
            export GIT_COMMITTER_NAME="{new_committer_name}"
            export GIT_COMMITTER_EMAIL="{new_committer_email}"
            export GIT_AUTHOR_DATE="{new_date}"
            export GIT_COMMITTER_DATE="{new_date}"
        fi
        ' HEAD
        """
        subprocess.run(rebase_cmd, cwd=repo_path, shell=True, check=True)
        return f"Modified commit {commit_sha} successfully."
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error modifying commit: {e}")

@app.get("/commits/")
def get_commits(repo_path: str):
    return list_commits(repo_path)

@app.post("/modify-commit/")
def post_modify_commit(repo_path: str, modification: CommitModification):
    return modify_commit(
        repo_path,
        modification.commit_sha,
        modification.new_author_name,
        modification.new_author_email,
        modification.new_committer_name,
        modification.new_committer_email,
        modification.new_date
    )
