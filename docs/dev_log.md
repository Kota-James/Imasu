# 入退室管理アプリImasuの開発ログ


### 2026-02-10(Day2)
#### 1. データベース設計 (models.py)

##### 設計のポイント
1.  **SQLite + SQLAlchemy** を採用。
    * 将来的な拡張（PostgreSQL等への移行）を見越し、ORMを利用。
2.  **ユーザー状態管理 (`status`) の導入**
    * **「在室中(in) / 帰宅(out)」** を管理する専用カラムを作成。
    * これにより、リアルタイムな在室状況の取得を高速化（`status="in"` で検索可能）。
3.  **ログ管理 (`action`) の明確化**
    * ユーザーの状態と区別するため、カラム名を `status` から `action` に変更。
    * 値は可読性を重視し、整数ではなく文字列（"enter", "exit" 等）を採用。
4.  **セキュリティと利便性のバランス**
    * パスワードはハッシュ化（`bcrypt`）。
    * 学籍番号（`original_id`）や学生証ID（`nfc_card_id`）は**平文保存**し、検索・デバッグを容易に。
    * パスワード検証ロジックをモデル内にカプセル化（`verify_password`）。
5.  **日時管理の自動化**
    * `func.now()` を使用し、DBサーバー側で作成日時・更新日時を自動管理。

#### 2. Pydanticスキーマ設計 (schemas.py)

##### 設計のポイント
* **2段階登録フローへの対応**
    * `UserCreate`: アカウント作成用（メール・パスワードのみ）。
    * `UserBaseUpdate`: プロフィール登録・更新用（表示名、学籍番号など）。
    * これにより、「まずは登録 → 後から情報入力」という柔軟なUXを実現。
* **更新用スキーマの独立定義**
    * `UserBase` を継承せず、全フィールドを `Optional (str | None)` で定義。
    * `email` 等の変更不可項目を含めないことで、セキュリティを向上（Partial Updateの実現）。
* **出力用スキーマの整合性**
    * DB上のカラム（`role`, `color_code` 等）にはデフォルト値があるため、出力時は `Optional` ではなく必須項目（`str`）として定義。
    * 不要な `is_active` フィールドを削除し、代わりに `status` フィールドを追加してモデルとの整合性を確保。


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

### model.pyでのプロトタイプからの変更点
## 2026-02-09: データベースモデルの実装 (models.py)

### 変更点・設計判断
1.  **Userモデル: `original_id` の型変更**
    * **変更前:** `Integer`
    * **変更後:** `String`
    * **理由:** 学籍番号（例: `1X99...`）や社員番号など、アルファベットが含まれる場合や先頭が `0` で始まる番号に対応するため。

2.  **Userモデル: `display_name` の制約緩和**
    * **変更:** `unique=True` を削除（推奨）
    * **理由:** 同姓同名ユーザーや、同じニックネームを使用したいユーザーが登録できなくなるのを防ぐため。

3.  **Logモデル: 日時管理の最適化**
    * **変更前:** Python側の `datetime.utcnow` を使用
    * **変更後:** SQLAlchemyの `func.now()` を使用（`server_default`, `onupdate`）
    * **理由:**
        * Python 3.12以降の `datetime.utcnow` 非推奨警告を回避するため。
        * DBサーバーの時刻を正とし、タイムゾーンのブレを防ぐため。
        * `onupdate` により、レコード更新時に自動的に `date_last_updated` が書き換わるようにするため。