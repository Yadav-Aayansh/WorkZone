from .base import NotFoundError, ConflictError, ValidationError, AuthenticationError

class ClientAlreadyExistsError(ConflictError):
    pass

class ClientNotFoundError(NotFoundError):
    pass

class InvalidClientCredentialsError(AuthenticationError):
    pass

class TenantAlreadyExistError(ConflictError):
    pass