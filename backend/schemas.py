import pydantic as _pydantic
import datetime as _dt

### Base Schemas
class _UserBase(_pydantic.BaseModel):
    email: _pydantic.EmailStr

### Input Schemas
class UserCreate(_UserBase):    # creating account
    password: str
    display_name: str | None = None
    original_id: str | None = None

class UserProfileUpdate(_pydantic.BaseModel):
    display_name: str | None = None
    color_code: str | None = None

class UserSystemUpdate(_pydantic.BaseModel):
    original_id: str | None = None   # 学籍番号など
    nfc_card_id: str | None = None   # カードID

### Output Schemas
class User(_UserBase):  # output
    id: int

    # profile
    display_name: str | None = None
    original_id: str | None = None
    role: str
    color_code: str
    nfc_card_id: str | None = None

    # system
    status: str
    is_deleted: bool
    date_created: _dt.datetime
    date_last_updated: _dt.datetime
    
    model_config = _pydantic.ConfigDict(from_attributes=True)

class Token(_pydantic.BaseModel):
    access_token: str
    token_type: str
    

# Logs
class _LogBase(_pydantic.BaseModel):
    action: str
    place: str | None = None
    note: str | None = None

class LogCreate(_LogBase):
    pass

class Log(_LogBase):
    id: int
    owner_id: int
    date_created_log: _dt.datetime
    date_last_updated_log: _dt.datetime

    model_config = _pydantic.ConfigDict(from_attributes=True)