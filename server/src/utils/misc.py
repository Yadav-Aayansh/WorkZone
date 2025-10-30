import tldextract
from src.core.config import Config

custom_extract = tldextract.TLDExtract(cache_dir=False, suffix_list_urls=["localhost"])

def get_tenant_id_or_domain(host: str):
    ext = custom_extract(host)
    domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain
    if domain == Config.DOMAIN_NAME:
        return ext.subdomain
    return host