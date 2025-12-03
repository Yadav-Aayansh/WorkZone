from .resume_ranking_schemas import ResumeData, ScoringDetails, RankedCandidate, RankingReport, FeedbackInformation
from .jd_builder_schemas import JDBuilderPrompt, GeneratedJD
from .doc_generator_schemas import OfferLetterData, RejectionLetterData, PolicyUpdateData, DocumentRequest, GeneratedEmail
from .hr_interview import StartInterviewRequest, ProcessTextAnswerRequest, GenerateReportRequest
from .personalized_learning import LearningPathRequest, LearningPlanResponse, LearningResource, SkillArea
from .query_classifier import QueryCategory, UrgencyLevel, Sentiment, ClassificationResponse
from .hr_policy import ChatRequest, ChatResponse, ProcessDocumentRequest