from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import git
import subprocess

router = APIRouter(prefix="/bulk-edit", tags=["bulk-edit"])

class BulkEditRequest(BaseModel):
    repo_path: str
    command: str

@router.post("/change-committer")
async def change_committer(request: BulkEditRequest):
    """
    Change committer for all commits using git rebase.
    """
    try:
        subprocess.run(request.command, cwd=request.repo_path, shell=True, check=True)
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error changing committer: {e}")

@router.post("/change-author")
async def change_author(request: BulkEditRequest):
    """
    Change author for all commits using git rebase.
    """
    try:
        subprocess.run(request.command, cwd=request.repo_path, shell=True, check=True)
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error changing author: {e}")
