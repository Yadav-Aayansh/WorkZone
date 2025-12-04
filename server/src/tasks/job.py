from src.core.celery import worker
from src.core.database import get_tenant_db_sync, get_public_db_sync
from src.genai import process_and_rank_resumes, generate_document
from src.genai.schemas import FeedbackInformation
from src.models.tenant import Job, Application, ApplicationStatus
from src.models.platform import Client
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional
from .email import send_rejection_email

@worker.task(bind=True, max_retries=3)
def resume_ranking(self, tenant_id: str, job_id: str, top_x: Optional[int]):
    try:
        with get_public_db_sync() as public_db:
            brand_result = public_db.execute(
                select(Client.brand_name).where(Client.tenant_id == tenant_id)
            ).scalar_one_or_none()
            brand = brand_result or tenant_id
        with get_tenant_db_sync(tenant_id) as db:
            job = db.execute(
                select(Job)
                .options(joinedload(Job.applications).joinedload(Application.user),
                         joinedload(Job.applications).joinedload(Application.job))
                .where(Job.id == job_id)
            ).unique().scalar_one_or_none()
            applicant_details = [(str(application.id), application.user.name, application.resume) for application in job.applications]
            if not top_x or top_x <= 0:
                top_x = max(1, len(applicant_details) // 2)

            feedback_info = FeedbackInformation(company_name=brand, position=job.title)
            ranking_results = process_and_rank_resumes(applicant_details, job.description, feedback_info, top_x)
            for shortlisted in ranking_results.shortlisted_candidates:
                application = db.execute(select(Application).where(Application.id == shortlisted.application_id)).scalar_one_or_none()
                application.resume_score = shortlisted.final_score
                application.status = ApplicationStatus.SHORTLISTED
                # send_shortlisted_email(application.user.email, rejected.feedback, brand)

            for rejected in ranking_results.rejected_candidates:
                application = db.execute(select(Application).where(Application.id == rejected.application_id)).scalar_one_or_none()

                application.resume_score = rejected.final_score
                application.status = ApplicationStatus.REJECTED
                send_rejection_email(application.user.email, rejected.feedback, brand)

    except Exception as exc:
        # retry the task (Celery will raise if max_retries exceeded)
        try:
            raise self.retry(exc=exc)
        except Exception:
            # re-raise so Celery logs it if retry can't be scheduled
            raise
            
