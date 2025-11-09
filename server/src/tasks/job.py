from src.core.celery import worker
from src.services.tenant import JobService

@worker.task(bind=True, max_retries=3)
def resume_ranking(self, job_id: str, top_x: int):
    JobService.resume_ranking(job_id, top_x)