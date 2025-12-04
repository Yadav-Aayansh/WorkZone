from pathlib import Path
from jinja2 import Template
from src.utils.datetime import get_indian_year

TEMPLATE_DIR = Path(__file__).parent / "templates"

def load_template(name: str) -> str:
    return (TEMPLATE_DIR / f"{name}.html").read_text()

def render_onboarding_success(name: str, brand: str, tenant_id: str, dashboard_link: str) -> str:
    template_str = load_template("platform_onboarding")
    template = Template(template_str)
    return template.render(admin_name=name, company=brand, tenant_id=tenant_id, dashboard_link=dashboard_link, year=get_indian_year())

def render_invite(invite_link: str, brand: str, name: str, role: str) -> str:
    template_str = load_template("tanent_invitation")
    template = Template(template_str)
    return template.render(invite_link=invite_link, company=brand, name=name, role=role, year=get_indian_year())

def render_shortlist(brand: str, name: str, position: str) -> str:
    template_str = load_template("tanent_shortlisted")
    template = Template(template_str)
    return template.render(company=brand, name=name, position=position, year=get_indian_year())

def render_platform_reset_password(name: str, reset_link: str) -> str:
    template_str = load_template("platform_reset_password")
    template = Template(template_str)
    return template.render(name=name, reset_link=reset_link, expiry_hours=1, year=get_indian_year())

def render_tenant_reset_password(name: str, reset_link: str, brand: str, tenant_subdomain: str) -> str:
    template_str = load_template("tenant_reset_password")
    template = Template(template_str)
    return template.render(name=name, reset_link=reset_link, company=brand, company_domain=tenant_subdomain, expiry_hours=1, year=get_indian_year())



