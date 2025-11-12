from src.core.celery import worker
from pydantic import EmailStr
from src.services.shared.email import email_client, render_invite

@worker.task(bind=True, max_retries=3)
def send_invite_email(self, to: EmailStr, link: str, brand: str):
    subject = f"Invitation to Join {brand}"
    html = render_invite(link)
    email_client.send_email(to, subject, html)


# @worker.task(bind=True, max_retries=3)
# def send_shortlist_email(self, to: EmailStr, brand: str):
#     subject = f"Invitation to Join {brand}"
#     html = render_invite(link)
#     email_client.send_email(to, subject, html)

@worker.task(bind=True, max_retries=3)
def send_rejection_email(self, to: EmailStr, html: str, brand: str):
    subject = f"Update on Your Application to {brand}"
    email_client.send_email(to, subject, html)