# 入退室管理アプリImasuの開発ログ


### 2026-02-09(Day1)
gitignore, backend 作成  
前回のAwesome Lead Managerでは動画公開時のバージョンに固定することで、動画と同じ書き方をしてもエラーが出ないようにしていたが、今回は今後のことも考えて最新版で作成することにした。

```bash
python3 -m venv venv
source venv/bin/activate

pip install "fastapi[standard]" sqlalchemy alembic pydantic-settings python-dotenv passlib[bcrypt] pyjwt
```

### schemas.pyについて
- 継承で楽をしている
- フロントエンドから入ってくるデータと、フロントエンドへ出力するデータで構造を分けている。
    - 例えば、ユーザ登録のときに送られてくるのは**email**と**hashed_password**で、未登録だから{id}はない
    - 逆にフロントエンドに戻すときはパスワードを送る必要はないから**email**と**id**を送る
- SQLAlchemyのオブジェクト（クラス形式のデータ）```data['id']```を、Pydanticが解釈可能な形式```data.id```に自動翻訳するためのスイッチが必要
**Pydantic V1とV2では書き方が違う**
ex. V1
```python
class User(_UserBase):
    id: int

    class Config:
        orm_mode = True
```
ex. V2
```python
model_config = ConfigDict(from_attributes=True)
```