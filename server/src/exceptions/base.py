class AppException(Exception):
    pass

# AppError
class NotFoundError(AppException):
    pass

class ConflictError(AppException):
    pass

class ValidationError(AppException):
    pass

class AuthenticationError(AppException):
    pass

class PaymentError(AppException):
    pass

class FileError(AppException):
    pass

# AuthenticationError
class InvalidTokenError(AuthenticationError):
    pass

class ExpiredTokenError(AuthenticationError):
    pass

class RoleNotAllowedError(AuthenticationError):
    pass


# FileError
class FileSizeExceededError(FileError):
    pass

class FileTypeNotAllowedError(FileError):
    pass

class FileUploadFailedError(FileError):
    pass

class FileNotFoundError(FileError):
    pass
