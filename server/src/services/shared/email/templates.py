from pathlib import Path
from jinja2 import Template

TEMPLATE_DIR = Path(__file__).parent / "templates"

def load_template(name: str) -> str:
    return (TEMPLATE_DIR / f"{name}.html").read_text()

def render_invite(invite_link: str) -> str:
    template_str = load_template("invite")
    template = Template(template_str)
    return template.render(invite_link=invite_link)