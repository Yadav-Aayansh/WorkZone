from typing import Dict
from src.core.logger import logger
from src.genai.llm_client import llm_client


def build_personalized_context(user_info: Dict) -> str:
    context_parts = []
    
    # Extract name (try common variations)
    name = user_info.get("name") or user_info.get("employee_name") or "Employee"
    context_parts.append(f"Employee Name: {name}")
    
    # Extract title/designation (try common variations)
    title = user_info.get("title") or user_info.get("designation") or user_info.get("role")
    if title:
        context_parts.append(f"Title: {title}")
    
    # Department
    if "department" in user_info:
        context_parts.append(f"Department: {user_info['department']}")
    
    # Location
    if "location" in user_info:
        context_parts.append(f"Location: {user_info['location']}")
    
    # Employee type
    if "employee_type" in user_info:
        context_parts.append(f"Employee Type: {user_info['employee_type']}")
    
    # Tenure
    if "tenure_years" in user_info:
        tenure = user_info['tenure_years']
        context_parts.append(f"Tenure: {tenure} years")
    
    # Leave balances (flexible structure)
    if "balance" in user_info and isinstance(user_info["balance"], dict):
        context_parts.append("Leave Balance:")
        for leave_type, days in user_info["balance"].items():
            context_parts.append(f"  - {leave_type.title()}: {days} days")
    elif "leave_balance" in user_info:
        # Old structure support
        leave_balance = user_info['leave_balance']
        total_leaves = user_info.get('total_annual_leaves', 24)
        context_parts.append(f"Leave Balance: {leave_balance} days remaining (out of {total_leaves})")
    
    # Granted leaves (if available)
    if "granted" in user_info and isinstance(user_info["granted"], dict):
        context_parts.append("Granted Leave:")
        for leave_type, days in user_info["granted"].items():
            context_parts.append(f"  - {leave_type.title()}: {days} days")
    
    # Used leaves (if available)
    if "used" in user_info and isinstance(user_info["used"], dict):
        if any(user_info["used"].values()):  # Only show if any used
            context_parts.append("Used Leave:")
            for leave_type, days in user_info["used"].items():
                if days > 0:
                    context_parts.append(f"  - {leave_type.title()}: {days} days")
    
    # Manager status
    if user_info.get("is_manager"):
        context_parts.append("Role: Manager/Team Lead")
        if "team_size" in user_info:
            context_parts.append(f"Team Size: {user_info['team_size']} members")
    
    # Probation status
    if user_info.get("on_probation"):
        context_parts.append("Status: On Probation")
        if "probation_end_date" in user_info:
            context_parts.append(f"Probation Ends: {user_info['probation_end_date']}")
    
    # Work arrangement
    if "work_arrangement" in user_info:
        context_parts.append(f"Work Mode: {user_info['work_arrangement']}")
    
    return "\n".join(context_parts)

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