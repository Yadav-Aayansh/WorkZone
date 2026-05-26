import smtplib
from pydantic import EmailStr
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from src.core.config import Config
from src.core.logger import logger
from typing import List

class EmailService:
    def __init__(self):
        self.smtp_host = Config.SMTP_HOST
        self.smtp_port = Config.SMTP_PORT
        self.smtp_user = Config.SMTP_USER
        self.smtp_password = Config.SMTP_PASSWORD
        self.from_address = Config.FROM_EMAIL
        self.from_email = f"{Config.SMTP_NAME} <{self.from_address}>" 

    def send_email(self, to: EmailStr | List[EmailStr], subject: str, html: str):
        message = MIMEMultipart("alternative")
        message["From"] = self.from_email
        if isinstance(to, list):
            message["To"] = ", ".join(to)
            recipients = to
        else:
            message["To"] = to
            recipients = [to]
        message["Subject"] = subject
        message.attach(MIMEText(html, "html"))

        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as smtp:
                smtp.starttls()
                smtp.login(self.smtp_user, self.smtp_password)
                smtp.send_message(message, from_addr=self.from_address, to_addrs=recipients)
            logger.info(f"Email sent to {recipients}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipients}: {e}")
            raise

email_client = EmailService()
