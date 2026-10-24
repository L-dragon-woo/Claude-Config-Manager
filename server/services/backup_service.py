import json
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, List

class BackupService:
    """프로젝트 파일 백업 서비스"""

    def __init__(self, backup_dir: str = ".backups"):
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)
        self.metadata_file = self.backup_dir / "metadata.json"
        self.backups: dict = self._load_metadata()

    def _load_metadata(self) -> dict:
        """백업 메타데이터를 로드합니다."""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_metadata(self):
        """백업 메타데이터를 저장합니다."""
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.backups, f, indent=2)

    def create_backup(self, source_dir: str, description: str = "") -> Optional[dict]:
        """
        디렉토리의 백업을 생성합니다.

        Args:
            source_dir: 백업할 디렉토리 경로
            description: 백업 설명

        Returns:
            백업 정보 또는 None
        """
        try:
            source_path = Path(source_dir)
            if not source_path.exists():
                return {"error": f"디렉토리를 찾을 수 없습니다: {source_dir}"}

            # 백업 ID 생성
            backup_id = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = self.backup_dir / backup_id

            # 디렉토리 복사
            shutil.copytree(source_path, backup_path)

            # 메타데이터 저장
            self.backups[backup_id] = {
                "id": backup_id,
                "description": description,
                "created_at": datetime.now().isoformat(),
                "source_dir": str(source_dir),
                "size": self._get_dir_size(backup_path)
            }
            self._save_metadata()

            return {
                "status": "success",
                "backup_id": backup_id,
                "created_at": self.backups[backup_id]["created_at"],
                "message": f"백업 생성됨: {backup_id}"
            }

        except Exception as e:
            return {"error": f"백업 생성 실패: {str(e)}"}

    def list_backups(self) -> dict:
        """모든 백업 목록을 반환합니다."""
        backups = []
        for backup_id, info in self.backups.items():
            backups.append({
                "id": backup_id,
                "description": info.get("description", ""),
                "created_at": info.get("created_at"),
                "size": info.get("size", 0),
                "source_dir": info.get("source_dir")
            })

        # 생성 시간 기준으로 정렬 (최신순)
        backups.sort(key=lambda x: x["created_at"], reverse=True)

        return {
            "status": "success",
            "backups": backups,
            "count": len(backups)
        }

    def restore_backup(self, backup_id: str, target_dir: str) -> Optional[dict]:
        """
        백업을 복원합니다.

        Args:
            backup_id: 백업 ID
            target_dir: 복원할 디렉토리 경로

        Returns:
            복원 결과 또는 None
        """
        try:
            if backup_id not in self.backups:
                return {"error": f"백업을 찾을 수 없습니다: {backup_id}"}

            backup_path = self.backup_dir / backup_id
            if not backup_path.exists():
                return {"error": f"백업 파일을 찾을 수 없습니다"}

            target_path = Path(target_dir)

            # 기존 디렉토리 백업
            if target_path.exists():
                backup_old = target_path.with_suffix(".old")
                if backup_old.exists():
                    shutil.rmtree(backup_old)
                shutil.move(str(target_path), str(backup_old))

            # 복원
            shutil.copytree(backup_path, target_path)

            return {
                "status": "success",
                "backup_id": backup_id,
                "target_dir": target_dir,
                "message": f"백업 복원됨: {backup_id}"
            }

        except Exception as e:
            return {"error": f"복원 실패: {str(e)}"}

    def delete_backup(self, backup_id: str) -> Optional[dict]:
        """
        백업을 삭제합니다.

        Args:
            backup_id: 백업 ID

        Returns:
            삭제 결과 또는 None
        """
        try:
            if backup_id not in self.backups:
                return {"error": f"백업을 찾을 수 없습니다: {backup_id}"}

            backup_path = self.backup_dir / backup_id
            if backup_path.exists():
                shutil.rmtree(backup_path)

            del self.backups[backup_id]
            self._save_metadata()

            return {
                "status": "success",
                "backup_id": backup_id,
                "message": f"백업 삭제됨: {backup_id}"
            }

        except Exception as e:
            return {"error": f"삭제 실패: {str(e)}"}

    def get_backup_info(self, backup_id: str) -> Optional[dict]:
        """백업 정보를 조회합니다."""
        if backup_id not in self.backups:
            return {"error": f"백업을 찾을 수 없습니다: {backup_id}"}

        info = self.backups[backup_id]
        return {
            "status": "success",
            "backup": info
        }

    def _get_dir_size(self, path: Path) -> int:
        """디렉토리 크기를 계산합니다 (바이트)."""
        total = 0
        for entry in path.rglob('*'):
            if entry.is_file():
                total += entry.stat().st_size
        return total


# 전역 백업 서비스
backup_service = BackupService()
