from src.repository.platform import InvitationRepository, ClientRepository
from src.schemas.platform import InviteRequest
from src.exceptions.platform import ClientNotFoundError
from src.exceptions.base import ConflictError, NotFoundError, ValidationError
from src.models.platform import InvitationStatus, InvitationRole
from src.core.security import create_access_token
from src.utils.datetime import get_indian_time
from datetime import timedelta

class InvitationService:
    def __init__(self, invitation_repo: InvitationRepository, client_repo: ClientRepository):
        self.invitation_repo = invitation_repo
        self.client_repo = client_repo

    async def create_invitation(self, client_id: str, data: InviteRequest):
        # Check if client exists
        client = await self.client_repo.get_client_by_id(client_id)
        if not client:
            raise ClientNotFoundError(f"Client {client_id} does not exist!")
        
        # Check if client has completed onboarding
        if not client.tenant_id:
            raise ValidationError("Please complete onboarding before inviting users!")
        
        # Check if pending invitation already exists for this email
        existing_invitation = await self.invitation_repo.get_pending_invitation_by_email(
            data.email, client_id
        )
        if existing_invitation:
            raise ConflictError(f"Pending invitation already exists for {data.email}!")
        
        # Generate invitation token (valid for 7 days)
        token_payload = {
            "email": data.email,
            "role": data.role.value,
            "client_id": str(client_id),
            "tenant_id": client.tenant_id,
            "type": "invitation"
        }
        # Use 7 days expiry for invitation token
        invitation_token = create_access_token(token_payload, expires_minutes=7*24*60)
        
        expires_at = get_indian_time() + timedelta(days=7)
        
        invitation = await self.invitation_repo.create_invitation(
            client_id=client_id,
            email=data.email,
            role=data.role,
            token=invitation_token,
            expires_at=expires_at
        )
        
        # TODO: Send email with invitation link
        # invitation_link = f"{Config.FRONTEND_URL}/accept-invite?token={invitation_token}"
        
        return {
            "id": str(invitation.id),
            "email": invitation.email,
            "role": invitation.role.value,
            "status": invitation.status.value,
            "expires_at": invitation.expires_at,
            "created_at": invitation.created_at
        }

    async def get_invitation_by_token(self, token: str):
        invitation = await self.invitation_repo.get_invitation_by_token(token)
        if not invitation:
            raise NotFoundError("Invitation not found!")
        
        # Check if invitation is expired
        if invitation.expires_at < get_indian_time():
            if invitation.status == InvitationStatus.PENDING:
                await self.invitation_repo.update_invitation_status(
                    str(invitation.id), InvitationStatus.EXPIRED
                )
            raise ValidationError("Invitation has expired!")
        
        # Check if invitation is already accepted
        if invitation.status == InvitationStatus.ACCEPTED:
            raise ValidationError("Invitation has already been accepted!")
        
        return invitation

    async def mark_invitation_accepted(self, invitation_id: str):
        return await self.invitation_repo.update_invitation_status(
            invitation_id, InvitationStatus.ACCEPTED
        )
