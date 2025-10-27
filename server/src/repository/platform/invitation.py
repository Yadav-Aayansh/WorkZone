from sqlalchemy.ext.asyncio import AsyncSession
from src.models.platform import Invitation, InvitationStatus
from sqlalchemy import select, and_
from datetime import datetime

class InvitationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invitation(self, client_id: str, email: str, role: str, token: str, expires_at: datetime) -> Invitation:
        try:
            new_invitation = Invitation(
                client_id=client_id,
                email=email,
                role=role,
                token=token,
                expires_at=expires_at,
                status=InvitationStatus.PENDING
            )
            self.db.add(new_invitation)
            await self.db.commit()
            await self.db.refresh(new_invitation)
            return new_invitation
        except Exception:
            await self.db.rollback()
            raise

    async def get_invitation_by_token(self, token: str) -> Invitation | None:
        result = await self.db.execute(select(Invitation).where(Invitation.token == token))
        return result.scalar_one_or_none()

    async def get_pending_invitation_by_email(self, email: str, client_id: str) -> Invitation | None:
        result = await self.db.execute(
            select(Invitation).where(
                and_(
                    Invitation.email == email,
                    Invitation.client_id == client_id,
                    Invitation.status == InvitationStatus.PENDING
                )
            )
        )
        return result.scalar_one_or_none()

    async def update_invitation_status(self, invitation_id: str, status: InvitationStatus) -> Invitation:
        try:
            result = await self.db.execute(select(Invitation).where(Invitation.id == invitation_id))
            invitation = result.scalar_one_or_none()
            if invitation:
                invitation.status = status
                await self.db.commit()
                await self.db.refresh(invitation)
            return invitation
        except Exception:
            await self.db.rollback()
            raise
