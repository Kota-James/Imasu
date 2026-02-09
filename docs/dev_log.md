# 入退室管理アプリImasuの開発ログ


### 2026-02-09(Day1)
gitignore, backend 作成  
前回のAwesome Lead Managerでは動画公開時のバージョンに固定することで、動画と同じ書き方をしてもエラーが出ないようにしていたが、今回は今後のことも考えて最新版で作成することにした。

```bash
python3 -m venv venv
source venv/bin/activate

pip install "fastapi[standard]" sqlalchemy alembic pydantic-settings python-dotenv passlib[bcrypt] pyjwt
```

