from src.core.celery import worker
from src.core.database import get_tenant_db_sync, get_public_db_sync
from src.genai import process_and_rank_resumes, generate_document
from src.genai.schemas import RejectionLetterData
from src.models.tenant import Job, Application, User
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
            ).scalar_one_or_none()
            applicant_details = [(application.id, application.resume) for application in job.applications]
            if not top_x or top_x <= 0:
                top_x = max(1, len(applicant_details) // 2)
            ranking_results = process_and_rank_resumes(applicant_details, job.description, top_x)
            # for shortlisted in ranking_results.shortlisted_candidates:
                # self.job_repo.update_application(id, Status.SHORTLISTED, score)
                # send mail to complete ai interview
                # pass

            for rejected in ranking_results.rejected_candidates:
                application = db.execute(
                    select(Application)
                    .options(joinedload(Application.user), joinedload(Application.job))
                    .where(Application.id == rejected.application_id)
                ).scalar_one_or_none()
                data = RejectionLetterData(
                    candidate_name=application.user.name,
                    company_name=brand,
                    position=application.job.title,
                    feedback=rejected.feedback
                )
                html = generate_document(data)
                send_rejection_email(application.user.email, html, brand)
    except Exception as exc:
        # retry the task (Celery will raise if max_retries exceeded)
        try:
            raise self.retry(exc=exc)
        except Exception:
            # re-raise so Celery logs it if retry can't be scheduled
            raise
            
