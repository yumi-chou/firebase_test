from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import firebase_admin
from firebase_admin import credentials, auth

app = FastAPI()
firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
if firebase_json:
    # Vercel 上走這條：從環境變數讀 JSON 字串
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
else:
    # 本機開發走這條：用檔案
    cred = credentials.Certificate("firebase-service-account.json")

firebase_admin.initialize_app(cred)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print("🔥 Firebase token 驗證失敗：", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token",
        )


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/protected")
def protected_route(user=Depends(verify_firebase_token)):
    return {
        "message": "這是一個受保護的 API",
        "uid": user["uid"],
        "email": user.get("email"),
    }
