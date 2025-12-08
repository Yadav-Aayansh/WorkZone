from .base import ConflictError, AuthenticationError, NotFoundError, AuthorizationError, ValidationError

class UserAlreadyExistsError(ConflictError):
    pass

class InvitationRequiredError(AuthenticationError):
    pass

class UserNotFoundError(NotFoundError):
    pass

class EmployeeNotFoundError(NotFoundError):
    pass

class ApplicantNotFoundError(NotFoundError):
    pass

class ManagerNotFoundError(NotFoundError):
    pass

class RecruiterNotFoundError(NotFoundError):
    pass

class ApplicationNotFoundError(NotFoundError):
    pass

class AiInterviewNotFoundError(NotFoundError):
    pass

class AiInterviewAlreadyExistsError(ConflictError):
    pass

class ApplicationNotShortlistedError(ValidationError):
    pass

class InvalidUserCredentialsError(AuthenticationError):
    pass

class JobNotFoundError(NotFoundError):
    pass

class UnauthorizedAccessError(AuthorizationError):
    pass

class ApplicationNotFoundError(NotFoundError):
    pass

class ApplicationAlreadyExistsError(ConflictError):
    pass

class InsufficientLeaveBalanceError(ValidationError):
    pass

class LeaveRequestNotFoundError(NotFoundError):
    pass

class InvalidLeaveActionError(ValidationError):
    pass

class ResumeNotFoundError(ValidationError):
    pass

class JobTitleNotFoundError(ValidationError):
    pass

class LearningPathGenerationError(Exception):
    pass

class QueryNotFoundError(NotFoundError):
    pass

class QueryClassificationError(ValidationError):
    pass

class QueryUnassignedError(ValidationError):
    pass

class NoRecruiterFoundError(NotFoundError):
    pass