from typing import Dict
from src.core.logger import logger


def build_personalized_context(user_info: Dict) -> str:
    context_parts = []
    
    name = user_info.get("name", "Employee")
    context_parts.append(f"Employee Name: {name}")
    
    if "department" in user_info:
        context_parts.append(f"Department: {user_info['department']}")
    
    if "location" in user_info:
        context_parts.append(f"Location: {user_info['location']}")
    
    if "designation" in user_info:
        context_parts.append(f"Designation: {user_info['designation']}")
    
    if "employee_type" in user_info:
        context_parts.append(f"Employee Type: {user_info['employee_type']}")
    
    if "tenure_years" in user_info:
        tenure = user_info['tenure_years']
        context_parts.append(f"Tenure: {tenure} years")
    
    if "leave_balance" in user_info:
        leave_balance = user_info['leave_balance']
        total_leaves = user_info.get('total_annual_leaves', 24)
        context_parts.append(f"Leave Balance: {leave_balance} days remaining (out of {total_leaves})")
    
    if user_info.get("is_manager"):
        context_parts.append("Role: Manager/Team Lead")
        if "team_size" in user_info:
            context_parts.append(f"Team Size: {user_info['team_size']} members")
    
    if user_info.get("on_probation"):
        context_parts.append("Status: On Probation")
        if "probation_end_date" in user_info:
            context_parts.append(f"Probation Ends: {user_info['probation_end_date']}")
    
    if "work_arrangement" in user_info:
        context_parts.append(f"Work Mode: {user_info['work_arrangement']}")
    
    return "\n".join(context_parts)


async def personalize_answer(
    raw_answer: str,
    user_info: Dict,
    query: str
) -> str:
    personalized = raw_answer
    
    name = user_info.get("name", "")
    if name and not name in raw_answer[:100]:
        personalized = f"Hi {name}! {raw_answer}"
    
    if any(word in query.lower() for word in ['leave', 'vacation', 'time off']):
        if "leave_balance" in user_info and "leave balance" not in raw_answer.lower():
            leave_balance = user_info['leave_balance']
            personalized += f"\n\n Your current leave balance: **{leave_balance} days** remaining."
    
    if any(word in query.lower() for word in ['office', 'timing', 'hours']):
        if "location" in user_info:
            location = user_info['location']
            if location.lower() not in raw_answer.lower():
                personalized += f"\n\n This information applies to {location} office."
    
    if user_info.get("on_probation") and any(word in query.lower() for word in ['leave', 'benefit', 'policy']):
        if "probation" not in raw_answer.lower():
            personalized += f"\n\n Note: As you're currently on probation, some policies may differ. Your probation period will end on {user_info.get('probation_end_date', 'TBD')}."
    
    return personalized


# def detect_query_intent(query: str) -> Dict:
#     query_lower = query.lower()
    
#     intent = {
#         "is_about_leave": any(word in query_lower for word in ['leave', 'vacation', 'time off', 'pto', 'holiday']),
#         "is_about_payroll": any(word in query_lower for word in ['salary', 'pay', 'payroll', 'gratuity', 'bonus', 'compensation']),
#         "is_about_benefits": any(word in query_lower for word in ['insurance', 'health', 'benefit', 'gym', 'wellness']),
#         "is_about_office": any(word in query_lower for word in ['office', 'timing', 'hours', 'location', 'address']),
#         "is_about_wfh": any(word in query_lower for word in ['wfh', 'work from home', 'remote', 'hybrid']),
#         "is_manager_query": any(word in query_lower for word in ['approve', 'team', 'manager', 'report']),
#     }
    
#     return intent


def get_user_category(user_info: Dict) -> str:
    tenure = user_info.get("tenure_years", 0)
    is_manager = user_info.get("is_manager", False)
    on_probation = user_info.get("on_probation", False)
    
    if on_probation or tenure < 0.25:
        return "new_employee"
    elif is_manager:
        return "manager"
    elif tenure > 3:
        return "senior"
    else:
        return "regular"