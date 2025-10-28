from .base import ConflictError, AuthenticationError

class UserAlreadyExistsError(ConflictError):
    pass

class InvitationRequiredError(AuthenticationError):
    pass