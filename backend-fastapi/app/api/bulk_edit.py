from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import git
import subprocess

router = APIRouter(prefix="/bulk-edit", tags=["bulk-edit"])

class BulkEditRequest(BaseModel):
    repo_path: str
    commit_shas: List[str]  # List of commit SHAs to edit
    new_name: str
    new_email: str

@router.post("/change-committer")
async def change_committer(request: BulkEditRequest):
    """
    Change committer name/email for a list of commits.
    """
    try:
        # This example uses git filter-branch for each commit SHA
        for sha in request.commit_shas:
            cmd = f'''
            git filter-branch -f --env-filter '
            if [ $GIT_COMMIT = "{sha}" ]; then
                export GIT_COMMITTER_NAME="{request.new_name}"
                export GIT_COMMITTER_EMAIL="{request.new_email}"
            fi
            ' HEAD
            '''
            subprocess.run(cmd, cwd=request.repo_path, shell=True, check=True)
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error changing committer: {e}")

@router.post("/change-author")
async def change_author(request: BulkEditRequest):
    """
    Change author name/email for a list of commits.
    """
    try:
        for sha in request.commit_shas:
            cmd = f'''
            git filter-branch -f --env-filter '
            if [ $GIT_COMMIT = "{sha}" ]; then
                export GIT_AUTHOR_NAME="{request.new_name}"
                export GIT_AUTHOR_EMAIL="{request.new_email}"
            fi
            ' HEAD
            '''
            subprocess.run(cmd, cwd=request.repo_path, shell=True, check=True)
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error changing author: {e}")
