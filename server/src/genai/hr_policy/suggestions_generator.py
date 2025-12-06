from typing import Dict, List
from src.core.logger import logger
from src.genai.hr_policy.personalization import get_user_category
from src.genai.llm_client import llm_client


BASE_SUGGESTIONS = {
    "leave": [
        "What's the annual leave policy?",
        "How do I apply for leave?",
        "Can I carry forward unused leaves?",
        "What's the sick leave policy?"
    ],
    "payroll": [
        "When is salary credited?",
        "How is gratuity calculated?",
        "What are my salary components?",
        "How is PF calculated?"
    ],
    "benefits": [
        "What health insurance benefits do we have?",
        "Are there gym membership benefits?",
        "What's the maternity/paternity leave policy?",
        "How do I enroll in benefits?"
    ],
    "policies": [
        "What's the work from home policy?",
        "What are office timings?",
        "What's the dress code?",
        "What's the notice period for resignation?"
    ]
}


FOLLOW_UP_SUGGESTIONS = {
    "leave_policy": [
        "How do I apply for leave?",
        "What about part-time employees?",
        "Can managers approve leaves instantly?",
        "What if I need emergency leave?",
        "How is leave balance calculated?"
    ],
    "payroll": [
        "When will I receive my payslip?",
        "How can I download Form 16?",
        "What deductions are there?",
        "How is overtime calculated?"
    ],
    "benefits": [
        "How do I enroll in insurance?",
        "What's covered under health insurance?",
        "Are dependents covered?",
        "How do I make a claim?"
    ],
    "work_arrangement": [
        "How many days can I work remotely?",
        "Do I need approval for WFH?",
        "What are the hybrid work guidelines?",
        "Can I work from another city?"
    ],
    "office_policies": [
        "Where is the office located?",
        "What are parking facilities?",
        "Is there a cafeteria?",
        "What are the security protocols?"
    ]
}


async def generate_initial_suggestions(user_info: Dict) -> Dict[str, List[str]]:
    suggestions = {
        "for_you": [],
        **BASE_SUGGESTIONS
    }
    
    # Get user category for better personalization
    user_category = get_user_category(user_info)
    
    # Personalization based on category
    if user_category == "new_employee":
        suggestions["for_you"].extend([
            "What's the probation period policy?",
            "When will I get my first salary?",
            "What documents do I need to submit?",
            "How do I access company systems?"
        ])
    elif user_category == "manager":
        suggestions["for_you"].extend([
            "How do I approve team leaves?",
            "What's the team appraisal process?",
            "How do I access team reports?"
        ])
    elif user_category == "senior":
        suggestions["for_you"].extend([
            "What long service awards are available?",
            "What's the sabbatical policy?"
        ])
    
    # Low leave balance
    leave_balance = user_info.get("leave_balance", 100)
    if leave_balance < 5:
        suggestions["for_you"].append(
            f"Your leave balance is low ({leave_balance} days). When do leaves refresh?"
        )
    
    # Location-specific
    location = user_info.get("location", "")
    if location:
        suggestions["for_you"].append(f"What are {location} office timings?")
    
    # Probation status
    if user_info.get("on_probation"):
        suggestions["for_you"].insert(0, "What policies apply during probation?")
    
    logger.info(f"✓ Generated initial suggestions with {len(suggestions['for_you'])} personalized items")
    return suggestions

async def generate_contextual_suggestions(
    session_context: Dict,
    user_info: Dict
) -> List[str]:

    current_topic = session_context.get("current_topic", "general")
    
    suggestions = FOLLOW_UP_SUGGESTIONS.get(current_topic, []).copy()
    
    # Add user-specific follow-ups
    if current_topic == "leave_policy":
        employee_type = user_info.get("employee_type", "Full-time")
        if employee_type == "Part-time":
            suggestions.insert(0, "How is pro-rated leave calculated for part-time employees?")
        
        if user_info.get("is_manager"):
            suggestions.append("How do I manage team leave calendars?")
    
    elif current_topic == "payroll":
        if user_info.get("tenure_years", 0) > 5:
            suggestions.insert(0, "What long service benefits am I eligible for?")
    
    elif current_topic == "benefits":
        if not user_info.get("health_insurance_enrolled"):
            suggestions.insert(0, "How do I enroll in health insurance?")
    
    logger.info(f"Generated {len(suggestions)} contextual suggestions for topic: {current_topic}")
    return suggestions[:5]
