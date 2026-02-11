from typing import List
import fastapi as _fastapi
import fastapi.security as _security
import sqlalchemy.orm as _orm

import services as _services, schemas as _schemas

app = _fastapi.FastAPI()

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