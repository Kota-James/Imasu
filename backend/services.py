import fastapi as _fastapi
import fastapi.security as _security
import datetime as _dt
import jwt as _jwt

import database as _database, models as _models

def create_database():
    return _database.Base.metadata.create_all(bind=_database.engine)