from .base import NotFoundError, ConflictError, ValidationError, AuthenticationError, PaymentError

class ClientAlreadyExistsError(ConflictError):
    pass

class TenantAlreadyExistsError(ConflictError):
    pass

class ClientNotFoundError(NotFoundError):
    pass

class SettingNotFoundError(NotFoundError):
    pass

class SettingAlreadyExistsError(ConflictError):
    pass

class InvalidLeaveError(ValidationError):
    pass

class InvalidClientCredentialsError(AuthenticationError):
    pass

class TenantNotFoundError(NotFoundError):
    pass

class InvalidPaymentSignature(PaymentError):
    pass

class PolicyAlreadyExistsError(ConflictError):
    pass

class PolicyNotFoundError(NotFoundError):
    pass