import fastapi as _fastapi
import fastapi.security as _security
import datetime as _dt
import jwt as _jwt
import sqlalchemy.orm as _orm
import passlib.hash as _hash
import os

import database as _database, models as _models, schemas as _schemas
oauth2schema = _security.OAuth2PasswordBearer(tokenUrl="/api/token")

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def create_database():
    return _database.Base.metadata.create_all(bind=_database.engine)

def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_by_email(email: str, db: _orm.Session):
    return db.query(_models.User).filter(_models.User.email == email).first()

def create_user(user: _schemas.UserCreate, db: _orm.Session):
    user_obj = _models.User(
        email=user.email, 
        hashed_password=_hash.bcrypt.hash(user.password), 
        display_name=user.display_name, 
        original_id=user.original_id
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

def authenticate_user(email:str, password: str, db: _orm.Session):
    user = get_user_by_email(db=db, email=email)

    if not user:
        return False
    
    if not user.verify_password(password):
        return False
    
    return user

def create_token(user: _models.User):
    expire_time = _dt.datetime.now(_dt.timezone.utc) + _dt.timedelta(days=30)
    payload = {
        "id": user.id,
        "sub": user.email,
        "exp": expire_time
    }
    
    token = _jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return dict(access_token=token, token_type="bearer")

def get_current_user(
        db: _orm.Session = _fastapi.Depends(get_db), 
        token: str = _fastapi.Depends(oauth2schema), 
    ):
    try:
        payload = _jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = db.query(_models.User).get(payload["id"])
        
        if user is None:
             raise _fastapi.HTTPException(status_code=401, detail="User not found")
             
    except _jwt.PyJWTError: # JWTのエラーをキャッチ
        raise _fastapi.HTTPException(
            status_code=401, detail="Could not validate credentials"
        )
    except:
        raise _fastapi.HTTPException(
            status_code=401, detail="Invalid Email or Password"
        )
    
    return user


def update_user_profile(db: _orm.Session, user: _models.User, user_update: _schemas.UserProfileUpdate):
    if user_update.display_name is not None:
        user.display_name = user_update.display_name    
    if user_update.color_code is not None:
        user.color_code = user_update.color_code

    db.commit()
    db.refresh(user)

    return user

def create_user_log(user: _models.User, db: _orm.Session,  log_create: _schemas.LogCreate):
    log_obj = _models.Log(**log_create.model_dump(), owner_id=user.id)

    status_map = {
        "enter": "in",
        "return": "in",
        "exit": "out",
        "go_out": "away"
    }
    if log_create.action in status_map:
        user.status = status_map[log_create.action]

    db.add(log_obj)
    db.commit()
    db.refresh(log_obj)
    return log_obj

def get_user_logs(user: _schemas.User, db: _orm.Session):
    logs = db.query(_models.Log).filter_by(owner_id=user.id).all()
    return logs

def get_users(db: _orm.Session, status: str | None = None):
    query = db.query(_models.User)
    if status:
        query = query.filter_by(status=status)
    return query.all()