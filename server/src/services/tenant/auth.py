from src.repository.tenant import UserRepository
from src.schemas.platform import AcceptInviteRequest
from src.services.platform import InvitationService
from src.exceptions.base import ConflictError
from src.utils.hashing import hash_password
from src.models.tenant import Role
from src.core.security import create_tokens, decode_token

class TenantAuthService:
    def __init__(self, user_repo: UserRepository, invitation_service: InvitationService):
        self.user_repo = user_repo
        self.invitation_service = invitation_service

    async def accept_invitation(self, data: AcceptInviteRequest):
        # Decode and validate invitation token
        try:
            token_payload = decode_token(data.token, exp_aud="*", exp_type="access")
            if token_payload.get("type") != "invitation":
                raise ValueError("Invalid invitation token!")
        except Exception as e:
            raise ConflictError("Invalid or expired invitation token!")
        
        # Get invitation from database
        invitation = await self.invitation_service.get_invitation_by_token(data.token)
        
        # Check if user already exists
        existing_user = await self.user_repo.get_user_by_email(invitation.email)
        if existing_user:
            raise ConflictError(f"User with email {invitation.email} already exists!")
        
        # Create user with hashed password
        hashed_password = hash_password(data.password)
        role = Role[invitation.role.value.upper()]
        
        user = await self.user_repo.create_user(
            name=data.name,
            email=invitation.email,
            hashed_password=hashed_password,
            role=role
        )
        
        # Mark invitation as accepted
        await self.invitation_service.mark_invitation_accepted(str(invitation.id))
        
        # Get tenant_id from token payload
        tenant_id = token_payload.get("tenant_id")
        
        # Create access and refresh tokens
        tokens = create_tokens({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "aud": tenant_id
        })
        
        return {**tokens, "role": user.role.value}
