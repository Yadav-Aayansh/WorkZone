from .base import ConflictError, AuthenticationError, NotFoundError

class UserAlreadyExistsError(ConflictError):
    pass

class InvitationRequiredError(AuthenticationError):
    pass

class UserNotFoundError(NotFoundError):
    pass

class InvalidUserCredentialsError(AuthenticationError):
    pass