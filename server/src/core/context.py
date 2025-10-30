from contextvars import ContextVar

tenant_context: ContextVar[str] = ContextVar('tenant_id')