from .base import NotFoundError, ConflictError, ValidationError, AuthenticationError

class ClientAlreadyExistsError(ConflictError):
    pass

class TenantAlreadyExistsError(ConflictError):
    pass

class ClientNotFoundError(NotFoundError):
    pass

class InvalidClientCredentialsError(AuthenticationError):
    pass

class TenantNotFoundError(NotFoundError):
    pass