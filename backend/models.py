import sqlalchemy as _sql
import sqlalchemy.orm as _orm
import passlib.hash as _hash
from sqlalchemy.sql import func

import database as _database

class User(_database.Base):
    __tablename__ = "users"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True) #自動で振られるID
    email = _sql.Column(_sql.String, unique=True, index=True)
    hashed_password = _sql.Column(_sql.String)
    original_id = _sql.Column(_sql.String, index=True) #学籍番号や社員番号を想定
    display_name = _sql.Column(_sql.String, index=True) #表示名

    role = _sql.Column(_sql.String, default="user") # 権限: "master", "admin", "user"
    status = _sql.Column(_sql.String, default="out", index=True) # 状態管理 "in", "out", "away"
    color_code = _sql.Column(_sql.String, default="#3b82f6") # UI用: テーマカラー (デフォルトは青色 #3b82f6)
    nfc_card_id = _sql.Column(_sql.String, unique=True, index=True, nullable=True) # 学生証連携 (FeliCa IDmなど) - 登録しない人もいるので nullable=True
    is_deleted = _sql.Column(_sql.Boolean, default=False) # 論理削除フラグ: Trueなら削除済み扱い

    date_created = _sql.Column(_sql.DateTime(timezone=True), server_default=func.now())
    date_last_updated = _sql.Column(_sql.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    logs = _orm.relationship("Log", back_populates="owner")

    def verify_password(self, password: str):
        return _hash.bcrypt.verify(password, self.hashed_password)
    
class Log(_database.Base):
    __tablename__ = "logs"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    owner_id = _sql.Column(_sql.Integer, _sql.ForeignKey("users.id")) #誰のログか
    action = _sql.Column(_sql.String, index=True)   # "Enter", "exit", "go_out", "return"
    place = _sql.Column(_sql.String, index=True, default="") #場所
    note = _sql.Column(_sql.String, default="")
    date_created_log = _sql.Column(_sql.DateTime(timezone=True), server_default=func.now())
    date_last_updated_log = _sql.Column(_sql.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = _orm.relationship("User", back_populates="logs")