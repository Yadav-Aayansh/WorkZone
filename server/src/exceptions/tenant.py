from .base import ConflictError, AuthenticationError, NotFoundError, AuthorizationError

class UserAlreadyExistsError(ConflictError):
    pass

class InvitationRequiredError(AuthenticationError):
    pass

class UserNotFoundError(NotFoundError):
    pass

class InvalidUserCredentialsError(AuthenticationError):
    pass

class JobNotFoundError(NotFoundError):
    pass

class UnauthorizedAccessError(AuthorizationError):
    pass

class ApplicationNotFoundError(NotFoundError):
    pass
