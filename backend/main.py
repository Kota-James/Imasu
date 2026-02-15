from typing import List
import fastapi as _fastapi
import fastapi.security as _security
import sqlalchemy.orm as _orm
from fastapi.middleware.cors import CORSMiddleware

import services as _services, schemas as _schemas, models as _models, database as _database

_database.Base.metadata.create_all(bind=_database.engine)

app = _fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, PUT, DELETEなど全て許可
    allow_headers=["*"], # 全てのHTTPヘッダー（Authorization等）を許可
)

@app.post("/api/users", response_model=_schemas.Token)
def create_user(user: _schemas.UserCreate, 
    db: _orm.Session = _fastapi.Depends(_services.get_db)
):
    db_user = _services.get_user_by_email(user.email, db)
    if db_user:
        raise _fastapi.HTTPException(status_code=400, detail="Email Already in use")
    
    user = _services.create_user(user, db)

    return _services.create_token(user)


@app.post("/api/token", response_model=_schemas.Token)
def generate_token(
    form_data: _security.OAuth2PasswordRequestForm = _fastapi.Depends(), 
    db: _orm.Session = _fastapi.Depends(_services.get_db)
):
    user = _services.authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise _fastapi.HTTPException(status_code=401, detail="Invalid Credentials")
    
    return _services.create_token(user)

@app.get("/api/users/me", response_model=_schemas.User)
def get_user(user: _schemas.User = _fastapi.Depends(_services.get_current_user)):
    return user

@app.put("/api/users/me", response_model=_schemas.User)
def update_user_profile(
        user_update: _schemas.UserProfileUpdate, 
        db: _orm.Session = _fastapi.Depends(_services.get_db), 
        current_user: _schemas.User = _fastapi.Depends(_services.get_current_user), 
    ):
    pass
    return _services.update_user_profile(db=db, user=current_user, user_update=user_update)

@app.post("/api/users/me/logs", response_model=_schemas.Log)
def create_user_log(
        log_create: _schemas.LogCreate,
        user: _models.User = _fastapi.Depends(_services.get_current_user),
        db: _orm.Session = _fastapi.Depends(_services.get_db), 
    ):
    return _services.create_user_log(user=user, db=db, log_create=log_create)

@app.get("/api/users/me/logs", response_model=List[_schemas.Log])
def get_user_logs(
    user: _schemas.User = _fastapi.Depends(_services.get_current_user),
    db: _orm.Session = _fastapi.Depends(_services.get_db),
):
    return _services.get_user_logs(user=user, db=db)

@app.get("/api/users", response_model=List[_schemas.User])
def get_users(
    status: str | None = None, 
    user: _schemas.User = _fastapi.Depends(_services.get_current_user),
    db: _orm.Session = _fastapi.Depends(_services.get_db),
):
    return _services.get_users(db=db, status=status)