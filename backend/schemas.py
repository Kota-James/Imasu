import pydantic as _pydantic
import datetime as _dt

### Base Schemas
class _UserBase(_pydantic.BaseModel):
    email: _pydantic.EmailStr

### Input Schemas
class UserCreate(_UserBase):    # creating account
    password: str

class UserBaseUpdate(_pydantic.BaseModel):  # registering prifile, and another info
    display_name: str | None = None
    original_id: str | None = None
    role: str | None = None
    color_code: str | None = None
    nfc_card_id: str | None = None
    is_deleted: bool | None = None

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