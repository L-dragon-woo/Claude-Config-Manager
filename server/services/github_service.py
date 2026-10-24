import os
import base64
from typing import Optional
import httpx

class GitHubService:
    """GitHub API 통합 서비스"""

    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN", "")
        self.repo = os.getenv("GITHUB_REPO", "")
        self.owner = self.repo.split("/")[0] if "/" in self.repo else ""
        self.repo_name = self.repo.split("/")[1] if "/" in self.repo else ""
        self.api_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }

    def is_configured(self) -> bool:
        """GitHub 토큰과 저장소가 설정되었는지 확인합니다."""
        return bool(self.token) and bool(self.repo) and bool(self.owner) and bool(self.repo_name)

    async def auto_commit(self, message: str, files: dict) -> Optional[dict]:
        """
        자동 커밋을 생성합니다.

        Args:
            message: 커밋 메시지
            files: 파일 경로와 내용 매핑 {"path/to/file": "content"}

        Returns:
            커밋 정보 또는 None
        """
        if not self.is_configured():
            return {"error": "GitHub이 설정되지 않았습니다"}

        try:
            # 현재 브랜치 정보 조회
            branch_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}/branches/main"

            async with httpx.AsyncClient() as client:
                branch_resp = await client.get(branch_url, headers=self.headers)
                if branch_resp.status_code != 200:
                    return {"error": "브랜치 조회 실패"}

                latest_commit_sha = branch_resp.json()["commit"]["sha"]

                # 트리 생성 (변경된 파일들)
                tree_items = []
                for file_path, content in files.items():
                    tree_items.append({
                        "path": file_path,
                        "mode": "100644",
                        "type": "blob",
                        "content": content
                    })

                tree_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}/git/trees"
                tree_resp = await client.post(
                    tree_url,
                    json={"base_tree": latest_commit_sha, "tree": tree_items},
                    headers=self.headers
                )
                if tree_resp.status_code != 201:
                    return {"error": "트리 생성 실패"}

                tree_sha = tree_resp.json()["sha"]

                # 커밋 생성
                commit_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}/git/commits"
                commit_resp = await client.post(
                    commit_url,
                    json={
                        "message": message,
                        "tree": tree_sha,
                        "parents": [latest_commit_sha]
                    },
                    headers=self.headers
                )
                if commit_resp.status_code != 201:
                    return {"error": "커밋 생성 실패"}

                commit_sha = commit_resp.json()["sha"]

                # refs 업데이트
                ref_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}/git/refs/heads/main"
                ref_resp = await client.patch(
                    ref_url,
                    json={"sha": commit_sha},
                    headers=self.headers
                )
                if ref_resp.status_code != 200:
                    return {"error": "refs 업데이트 실패"}

                return {
                    "status": "success",
                    "commit_sha": commit_sha,
                    "message": message
                }

        except Exception as e:
            return {"error": f"커밋 생성 실패: {str(e)}"}

    async def create_pull_request(self, title: str, description: str,
                                  branch: str = "feature/auto") -> Optional[dict]:
        """
        자동 PR을 생성합니다.

        Args:
            title: PR 제목
            description: PR 설명
            branch: 생성할 브랜치 이름

        Returns:
            PR 정보 또는 None
        """
        if not self.is_configured():
            return {"error": "GitHub이 설정되지 않았습니다"}

        try:
            async with httpx.AsyncClient() as client:
                # PR 생성
                pr_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}/pulls"
                pr_resp = await client.post(
                    pr_url,
                    json={
                        "title": title,
                        "body": description,
                        "head": branch,
                        "base": "main"
                    },
                    headers=self.headers
                )

                if pr_resp.status_code not in [201, 200]:
                    return {"error": "PR 생성 실패"}

                pr_data = pr_resp.json()
                return {
                    "status": "success",
                    "pr_number": pr_data.get("number"),
                    "pr_url": pr_data.get("html_url"),
                    "title": title
                }

        except Exception as e:
            return {"error": f"PR 생성 실패: {str(e)}"}

    async def merge_pull_request(self, pr_number: int, commit_title: str = "Auto-merge") -> Optional[dict]:
        """
        PR을 자동 머지합니다.

        Args:
            pr_number: PR 번호
            commit_title: 머지 커밋 제목

        Returns:
            머지 결과 또는 None
        """
        if not self.is_configured():
            return {"error": "GitHub이 설정되지 않았습니다"}

        try:
            async with httpx.AsyncClient() as client:
                merge_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}/pulls/{pr_number}/merge"
                merge_resp = await client.put(
                    merge_url,
                    json={"commit_title": commit_title, "merge_method": "squash"},
                    headers=self.headers
                )

                if merge_resp.status_code not in [200, 201]:
                    return {"error": "머지 실패"}

                return {
                    "status": "success",
                    "pr_number": pr_number,
                    "message": "PR이 성공적으로 머지되었습니다"
                }

        except Exception as e:
            return {"error": f"머지 실패: {str(e)}"}

    async def get_repo_info(self) -> Optional[dict]:
        """저장소 정보를 조회합니다."""
        if not self.is_configured():
            return {"error": "GitHub이 설정되지 않았습니다"}

        try:
            async with httpx.AsyncClient() as client:
                repo_url = f"{self.api_url}/repos/{self.owner}/{self.repo_name}"
                resp = await client.get(repo_url, headers=self.headers)

                if resp.status_code != 200:
                    return {"error": "저장소 조회 실패"}

                data = resp.json()
                return {
                    "status": "success",
                    "name": data.get("name"),
                    "url": data.get("html_url"),
                    "stars": data.get("stargazers_count"),
                    "language": data.get("language"),
                    "description": data.get("description")
                }

        except Exception as e:
            return {"error": f"저장소 조회 실패: {str(e)}"}


# 전역 GitHub 서비스
github_service = GitHubService()
