class AppException(Exception):
    pass

class NotFoundError(AppException):
    pass

class ConflictError(AppException):
    pass

class ValidationError(AppException):
    pass

class AuthenticationError(AppException):
    pass

class RoleNotAllowedError(AuthenticationError):
    status_code = 403

class FileError(AppException):
    pass

class FileSizeExceededError(FileError):
    pass

class FileTypeNotAllowedError(FileError):
    pass

class FileUploadFailedError(FileError):
    pass

class FileNotFoundError(FileError):
    pass
