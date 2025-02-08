from fastapi import APIRouter, HTTPException
from ..models.commit import CommitModification
import git
from datetime import datetime
import subprocess
from ..api.recent_repos import save_recent_repo

router = APIRouter(prefix="/commits", tags=["commits"])

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
        subprocess.run(rebase_cmd, cwd=modification.repo_path, shell=True, check=True)
        return list_commits(modification.repo_path)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error modifying commit: {e}")

@router.get("/")
async def get_commits(repo_path: str):
    if not repo_path:
        raise HTTPException(status_code=400, detail="repo_path parameter is required")
    save_recent_repo(repo_path)
    return list_commits(repo_path)

@router.post("/modify")
async def post_modify_commit(modification: CommitModification):
    return modify_commit(modification) 