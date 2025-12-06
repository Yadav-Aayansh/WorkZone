from src.core.celery import worker
from pydantic import EmailStr
from src.services.shared.email import (
    email_client, render_invite, render_shortlist, render_onboarding_success, 
    render_platform_reset_password, render_tenant_reset_password
) 

@worker.task(bind=True, max_retries=3)
def send_invite_email(self, to: EmailStr, link: str, brand: str, name: str, role: str):
    subject = f"Invitation to Join {brand}"
    html = render_invite(link, brand, name, role)
    email_client.send_email(to, subject, html)

@worker.task(bind=True, max_retries=3)
def send_shortlist_email(self, to: EmailStr, brand: str, name: str, position: str):
    subject = f"Update on Your Application to {brand}"
    html = render_shortlist(brand, name, position)
    email_client.send_email(to, subject, html)

@worker.task(bind=True, max_retries=3)
def send_rejection_email(self, to: EmailStr, html: str, brand: str):
    subject = f"Update on Your Application to {brand}"
    email_client.send_email(to, subject, html)

@worker.task(bind=True, max_retries=3)
def send_onboarding_email_task(self, to: EmailStr, name: str, brand: str, tenant_id: str, dashboard_link: str):
    subject = f"Update on Your Application to {brand}"
    html = render_onboarding_success(name, brand, tenant_id, dashboard_link)
    email_client.send_email(to, subject, html)

@worker.task(bind=True, max_retries=3)
def send_platform_reset_password_email_task(self, to: EmailStr, name: str, reset_link: str):
    subject = f"Reset your WorkZone password"
    html = render_platform_reset_password(name, reset_link)
    email_client.send_email(to, subject, html)

@worker.task(bind=True, max_retries=3)
def send_tenant_reset_password_email_task(self, to: EmailStr, name: str, reset_link: str, brand: str, tenant_subdomain: str):
    subject = f"Reset your {brand} password"
    html = render_tenant_reset_password(name, reset_link, brand, tenant_subdomain)
    email_client.send_email(to, subject, html)