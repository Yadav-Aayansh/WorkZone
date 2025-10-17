import tldextract
from src.core.config import Config

def get_tenant_id_or_domain(host: str):
    ext = tldextract.extract(host)
    domain = f"{ext.domain}.{ext.suffix}"
    if domain == Config.DOMAIN_NAME:
        return ext.subdomain
    return host