import httpx
from src.core.celery import worker

@worker.task(bind=True, max_retries=3)
def link_domain_and_redirect_task(self, domain: str, tenant_subdomain: str):
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
    
    redirect_config = {
        "match": [{"host": [tenant_subdomain]}],
        "handle": [{
            "handler": "static_response",
            "headers": {"Location": [f"https://{domain}{{http.request.uri}}"]},
            "status_code": 308
        }],
        "terminal": True
    }
    
    try:
        # Insert at position 0 (before wildcard)
        httpx.put("http://localhost:2019/config/apps/http/servers/srv0/routes/0", json=route_config, timeout=10).raise_for_status()
        
        # Insert redirect at position 1 (after route, still before wildcard)
        httpx.put("http://localhost:2019/config/apps/http/servers/srv0/routes/1", json=redirect_config, timeout=10).raise_for_status()
        
    except Exception as exc:
        raise self.retry(exc=exc)


@worker.task(bind=True, max_retries=3)
def unlink_domain_task(self, domain: str, tenant_subdomain: str):
    try:
        # Get all routes
        r = httpx.get("http://localhost:2019/config/apps/http/servers/srv0/routes", timeout=10)
        r.raise_for_status()
        routes = r.json()
        
        # Find indices to delete (in reverse order to avoid index shifting)
        indices_to_delete = []
        for i, route in enumerate(routes):
            hosts = route.get("match", [{}])[0].get("host", [])
            if domain in hosts or tenant_subdomain in hosts:
                indices_to_delete.append(i)
        
        # Delete in reverse order
        for idx in sorted(indices_to_delete, reverse=True):
            httpx.delete(f"http://localhost:2019/config/apps/http/servers/srv0/routes/{idx}", timeout=10).raise_for_status()
        
    except Exception as exc:
        raise self.retry(exc=exc)