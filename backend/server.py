from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import io
import csv
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import jwt
import bcrypt
import httpx
import requests
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form, Query, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict

# ---------------------------------------------------------------- config
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
OWNER_EMAIL = os.environ.get('OWNER_EMAIL', ADMIN_EMAIL)
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ['EMERGENT_EMAIL_KEY']
EMAIL_FROM_NAME = os.environ['EMAIL_FROM_NAME']

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "skl-enterprises"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="SKL Enterprises API")
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------- mongo helpers
PyObjectId = Annotated[str, BeforeValidator(str)]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------- storage
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------- auth utils
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=8), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------- email
async def send_email(recipient: str, subject: str, html: str, reply_to: Optional[str] = None):
    payload = {"to": [recipient], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to:
        payload["contact_email"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            resp = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send", headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send failed to {recipient}: {e}")
        return None


BRAND_BLUE = "#0033A0"
BRAND_GOLD = "#C5A059"


def email_shell(title: str, body_html: str) -> str:
    return f"""
    <div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
        <tr><td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr><td style="background:{BRAND_BLUE};padding:28px 32px;">
              <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:1px;">SKL ENTERPRISES</span><br/>
              <span style="color:{BRAND_GOLD};font-size:12px;letter-spacing:2px;text-transform:uppercase;">Technology-Driven Public Service Solutions</span>
            </td></tr>
            <tr><td style="padding:32px;">
              <h1 style="color:#0f172a;font-size:20px;margin:0 0 16px;">{title}</h1>
              {body_html}
            </td></tr>
            <tr><td style="background:#0f172a;padding:20px 32px;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                SKL Enterprises &middot; No. 2, Shop No. 6, 2nd Street, Race View Colony, Guindy, Chennai – 600032, Tamil Nadu, India<br/>
                +91 95516 11666 &middot; sklenterprises@zohomail.in
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </div>"""


def contact_email_html(name: str) -> str:
    return email_shell("We've received your message", f"""
      <p style="color:#475569;font-size:15px;line-height:1.7;">Dear {name},</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;">Thank you for contacting SKL Enterprises. Our team has received your enquiry and will respond within one business day.</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;">We appreciate your interest in our technology-enabled public service solutions.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.7;margin-top:24px;">Warm regards,<br/><strong>Team SKL Enterprises</strong></p>""")


def career_email_html(name: str, position: str) -> str:
    return email_shell("Application received", f"""
      <p style="color:#475569;font-size:15px;line-height:1.7;">Dear {name},</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;">Thank you for applying for the position of <strong>{position}</strong> at SKL Enterprises. Your application and resume have been received successfully.</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;">Our talent team will review your profile and reach out if there is a suitable match.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.7;margin-top:24px;">Warm regards,<br/><strong>SKL Enterprises Talent Team</strong></p>""")


def agent_email_html(name: str) -> str:
    return email_shell("Welcome to the SKL Network", f"""
      <p style="color:#475569;font-size:15px;line-height:1.7;">Dear {name},</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;">Thank you for your interest in joining the SKL Enterprises agent network. We have received your registration details.</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;">Our partnerships team will verify your details and contact you with the next steps to begin delivering trusted citizen services in your region.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.7;margin-top:24px;">Warm regards,<br/><strong>SKL Enterprises Partnerships Team</strong></p>""")


# ---------------------------------------------------------------- models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: Optional[str] = ""
    message: str


class AgentCreate(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    state: str
    district: str
    city: str
    pincode: str
    occupation: Optional[str] = ""
    experience: Optional[str] = ""
    project: Optional[str] = ""
    role: Optional[str] = ""
    message: Optional[str] = ""


class StatusUpdate(BaseModel):
    status: str


class NoteUpdate(BaseModel):
    note: str


VALID_STATUSES = ["New", "Contacted", "Pending", "Approved", "Rejected"]


def clean(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------------------------------------------------------- auth routes
@api_router.post("/auth/login")
async def login(body: LoginRequest, request: Request, response: Response):
    email = body.email.lower().strip()
    xff = request.headers.get("x-forwarded-for", "")
    ip = xff.split(",")[0].strip() if xff else (request.client.host if request.client else "unknown")
    identifier = f"{ip}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        count = (attempt.get("count", 0) if attempt else 0) + 1
        update = {"count": count, "last_attempt": now_iso()}
        if count >= 5:
            update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=28800, path="/")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name"), "role": user.get("role"), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"status": "ok"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------------------------------------------------------------- public submissions
@api_router.post("/contact")
async def create_contact(body: ContactCreate):
    doc = body.model_dump()
    doc.update({"type": "contact", "status": "New", "notes": [], "created_at": now_iso()})
    res = await db.contacts.insert_one(doc)
    await send_email(body.email, "Thank you for contacting SKL Enterprises", contact_email_html(body.name), reply_to=OWNER_EMAIL)
    return {"id": str(res.inserted_id), "status": "success"}


@api_router.post("/agents")
async def create_agent(body: AgentCreate):
    doc = body.model_dump()
    doc.update({"type": "agent", "status": "New", "notes": [], "created_at": now_iso()})
    res = await db.agents.insert_one(doc)
    await send_email(body.email, "Welcome to the SKL Enterprises Agent Network", agent_email_html(body.name), reply_to=OWNER_EMAIL)
    return {"id": str(res.inserted_id), "status": "success"}


@api_router.post("/careers")
async def create_career(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    position: str = Form(...),
    experience: str = Form(""),
    message: str = Form(""),
    resume: UploadFile = File(...),
):
    ext = resume.filename.split(".")[-1].lower() if "." in resume.filename else "pdf"
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Resume must be a PDF or Word document")
    data = await resume.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume must be under 10MB")
    path = f"{APP_NAME}/resumes/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, resume.content_type or "application/octet-stream")
    doc = {
        "name": name, "email": email, "phone": phone, "position": position,
        "experience": experience, "message": message, "type": "career",
        "resume_path": result["path"], "resume_filename": resume.filename,
        "resume_content_type": resume.content_type or "application/pdf",
        "status": "New", "notes": [], "created_at": now_iso(),
    }
    res = await db.careers.insert_one(doc)
    await send_email(email, "Your application to SKL Enterprises", career_email_html(name, position), reply_to=OWNER_EMAIL)
    return {"id": str(res.inserted_id), "status": "success"}


# ---------------------------------------------------------------- admin CRM
COLLECTIONS = {"contacts": db.contacts, "agents": db.agents, "careers": db.careers}


@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_user)):
    stats = {}
    for name, col in COLLECTIONS.items():
        stats[name] = await col.count_documents({})
    stats["new_leads"] = sum([await col.count_documents({"status": "New"}) for col in COLLECTIONS.values()])
    stats["total"] = stats["contacts"] + stats["agents"] + stats["careers"]
    return stats


@api_router.get("/admin/{collection}")
async def list_leads(collection: str, user: dict = Depends(get_current_user),
                     search: str = Query(""), status: str = Query(""), sort: str = Query("newest")):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    q = {}
    if status and status != "all":
        q["status"] = status
    if search:
        q["$or"] = [{f: {"$regex": search, "$options": "i"}} for f in ["name", "email", "phone", "mobile", "city", "district", "position"]]
    direction = 1 if sort == "oldest" else -1
    docs = await COLLECTIONS[collection].find(q).sort("created_at", direction).to_list(2000)
    return [clean(d) for d in docs]


@api_router.patch("/admin/{collection}/{item_id}/status")
async def update_status(collection: str, item_id: str, body: StatusUpdate, user: dict = Depends(get_current_user)):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    await COLLECTIONS[collection].update_one({"_id": ObjectId(item_id)}, {"$set": {"status": body.status}})
    return {"status": "ok"}


@api_router.post("/admin/{collection}/{item_id}/notes")
async def add_note(collection: str, item_id: str, body: NoteUpdate, user: dict = Depends(get_current_user)):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    note = {"text": body.note, "by": user["email"], "at": now_iso()}
    await COLLECTIONS[collection].update_one({"_id": ObjectId(item_id)}, {"$push": {"notes": note}})
    return {"status": "ok", "note": note}


@api_router.get("/admin/{collection}/export")
async def export_leads(collection: str, user: dict = Depends(get_current_user)):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    docs = await COLLECTIONS[collection].find({}).sort("created_at", -1).to_list(5000)
    if not docs:
        docs = [{}]
    fields = ["created_at", "name", "email", "phone", "mobile", "subject", "message",
              "state", "district", "city", "pincode", "occupation", "experience",
              "project", "role", "position", "resume_filename", "status"]
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for d in docs:
        row = {k: (v if not isinstance(v, list) else "; ".join(str(x.get("text", x)) if isinstance(x, dict) else str(x) for x in v)) for k, v in d.items()}
        writer.writerow({k: row.get(k, "") for k in fields})
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
                             headers={"Content-Disposition": f"attachment; filename={collection}_export.csv"})


@api_router.get("/admin/careers/{item_id}/resume")
async def download_resume(item_id: str, authorization: str = Header(None), auth: str = Query(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    elif auth:
        token = auth
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not await db.users.find_one({"_id": ObjectId(payload["sub"])}):
            raise HTTPException(status_code=401, detail="Invalid user")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    record = await db.careers.find_one({"_id": ObjectId(item_id)})
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    data, ctype = get_object(record["resume_path"])
    return Response(content=data, media_type=record.get("resume_content_type", ctype),
                    headers={"Content-Disposition": f"inline; filename={record.get('resume_filename', 'resume')}"})


@api_router.get("/")
async def root():
    return {"message": "SKL Enterprises API", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({"email": ADMIN_EMAIL, "password_hash": hash_password(ADMIN_PASSWORD),
                                   "name": "SKL Admin", "role": "admin", "created_at": now_iso()})
        logger.info("Admin user seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
