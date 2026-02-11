import fastapi as _fastapi
import fastapi.security as _security
import datetime as _dt
import jwt as _jwt
import sqlalchemy.orm as _orm
import passlib.hash as _hash
import os

import database as _database, models as _models, schemas as _schemas
oauth2schema = _security.OAuth2PasswordBearer(tokenUrl="/api/token")
JWT_SECRET = os.getenv("JWT_SECRET", "default-secret-key")
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
        hashed_password=_hash.bcrypt.hash(user.password)
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