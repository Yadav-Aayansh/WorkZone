import httpx
from src.core.celery import worker

@worker.task(bind=True, max_retries=3)
def link_domain_and_redirect_task(self, domain: str, tenant_subdomain: str):
    # Route 1: Serve custom domain
    route_config = {
        "match": [{"host": [domain]}],
        "handle": [{
            "handler": "subroute",
            "routes": [
                {
                    "match": [{"path": ["/api*"]}],
                    "handle": [{"handler": "reverse_proxy", "upstreams": [{"dial": "127.0.0.1:8000"}]}]
                },
                {
                    "handle": [{"handler": "reverse_proxy", "upstreams": [{"dial": "127.0.0.1:3000"}]}]
                }
            ]
        }],
        "terminal": True
    }
    
    # Route 2: Redirect tenant subdomain → custom domain
    redirect_config = {
        "match": [{"host": [tenant_subdomain]}],
        "handle": [{
            "handler": "static_response",
            "headers": {"Location": [f"https://{domain}{{uri}}"]},
            "status_code": 308
        }],
        "terminal": True
    }
    
    try:
        r1 = httpx.post("http://localhost:2019/config/apps/http/servers/srv0/routes", 
                        json=route_config, timeout=10)
        r1.raise_for_status()
        
        r2 = httpx.post("http://localhost:2019/config/apps/http/servers/srv0/routes", 
                        json=redirect_config, timeout=10)
        r2.raise_for_status()
        
    except Exception as exc:
        raise self.retry(exc=exc)