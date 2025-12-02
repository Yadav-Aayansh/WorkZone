import tldextract, re, dns.resolver
from src.core.config import Config

custom_extract = tldextract.TLDExtract(cache_dir=False, suffix_list_urls=["localhost"])

def get_tenant_id_or_domain(host: str):
    ext = custom_extract(host)
    domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain
    if domain == Config.DOMAIN_NAME:
        return ext.subdomain
    return host

def is_valid_domain(domain: str) -> bool:
    pattern = r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
    return bool(re.match(pattern, domain)) and len(domain) <= 253

# Noctivagous!!!
def verify_domain(domain: str, tenant_subdomain: str) -> bool:
    try:
        answers = dns.resolver.resolve(domain, 'A', lifetime=5)
        if str(answers[0]) == Config.SERVER_IP:
            return True
    except:
        pass
    
    if domain.count('.') >= 2:
        try:
            answers = dns.resolver.resolve(domain, 'CNAME', lifetime=5)
            cname = str(answers[0]).rstrip('.')
            
            if cname == tenant_subdomain:
                return True
        except:
            pass
    
    return False