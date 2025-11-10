from src.core.celery import worker
from src.services.tenant import JobService
from s
    

    async def resume_ranking(self, id: str, top_x: int):
        job = await self.job_repo.get_job_by_id(id, True)
        applicant_details = [(application.user_id, application.resume) for application in job.applications]

        ranking_results = process_and_rank_resumes(applicant_details, job.description, top_x)
        for shortlisted in ranking_results.shortlisted_candidates:
            # self.job_repo.update_application(id, Status.SHORTLISTED, score)
            # send mail to complete ai interview
            pass

        for rejected in ranking_results.rejected_candidates:
            # html = generate_doc(rejection_schema)
            # Rejection email
            pass

@worker.task(bind=True, max_retries=3)
def resume_ranking(self, job_id: str, top_x: int):
    