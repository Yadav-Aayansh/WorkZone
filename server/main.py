from fastapi import FastAPI
from db import init_db
from routes.signup import signup_router

app = FastAPI()

init_db()

app.include_router(signup_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
