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
from openpyxl import Workbook
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
    email: EmailStr = Form(...),
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


ROLE_PERMS = {
    "super_admin": {"leads", "content", "projects", "careers", "downloads", "media", "users", "activity"},
    "admin": {"leads", "content", "projects", "careers", "downloads", "media", "activity"},
    "content_manager": {"content", "projects", "downloads", "media"},
    "hr": {"leads", "careers"},
    "operations": {"leads"},
}
ROLES = list(ROLE_PERMS.keys())


def require(permission: str):
    async def dep(user: dict = Depends(get_current_user)):
        if permission not in ROLE_PERMS.get(user.get("role", ""), set()):
            raise HTTPException(status_code=403, detail="You do not have permission for this action")
        return user
    return dep


async def log_activity(user, action, detail="", request: Request = None):
    ip = ""
    if request is not None:
        xff = request.headers.get("x-forwarded-for", "")
        ip = xff.split(",")[0].strip() if xff else (request.client.host if request.client else "")
    await db.activity_log.insert_one({
        "user": (user or {}).get("email", "system"), "role": (user or {}).get("role", ""),
        "action": action, "detail": detail, "ip": ip, "at": now_iso(),
    })


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


@api_router.get("/admin/leads/{collection}")
async def list_leads(collection: str, user: dict = Depends(require("leads")), search: str = Query(""), status: str = Query(""), sort: str = Query("newest")):
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


@api_router.patch("/admin/leads/{collection}/{item_id}/status")
async def update_status(collection: str, item_id: str, body: StatusUpdate, user: dict = Depends(get_current_user)):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    await COLLECTIONS[collection].update_one({"_id": ObjectId(item_id)}, {"$set": {"status": body.status}})
    return {"status": "ok"}


@api_router.post("/admin/leads/{collection}/{item_id}/notes")
async def add_note(collection: str, item_id: str, body: NoteUpdate, user: dict = Depends(get_current_user)):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    note = {"text": body.note, "by": user["email"], "at": now_iso()}
    await COLLECTIONS[collection].update_one({"_id": ObjectId(item_id)}, {"$push": {"notes": note}})
    return {"status": "ok", "note": note}


@api_router.get("/admin/leads/{collection}/export")
async def export_leads(collection: str, format: str = Query("csv"), user: dict = Depends(get_current_user)):
    if collection not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")
    docs = await COLLECTIONS[collection].find({}).sort("created_at", -1).to_list(5000)
    fields = ["created_at", "name", "email", "phone", "mobile", "subject", "message",
              "state", "district", "city", "pincode", "occupation", "experience",
              "project", "role", "position", "resume_filename", "status"]

    def flatten(d):
        return {k: (v if not isinstance(v, list) else "; ".join(str(x.get("text", x)) if isinstance(x, dict) else str(x) for x in v)) for k, v in d.items()}

    if format == "xlsx":
        wb = Workbook()
        ws = wb.active
        ws.title = collection.capitalize()
        ws.append([f.replace("_", " ").title() for f in fields])
        for d in docs:
            row = flatten(d)
            ws.append([str(row.get(k, "")) for k in fields])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                 headers={"Content-Disposition": f"attachment; filename={collection}_export.xlsx"})

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for d in docs:
        row = flatten(d)
        writer.writerow({k: row.get(k, "") for k in fields})
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
                             headers={"Content-Disposition": f"attachment; filename={collection}_export.csv"})


@api_router.get("/admin/leads/careers/{item_id}/resume")
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


# ================================================================ CMS models


class SettingsUpdate(BaseModel):
    data: dict


class OpeningModel(BaseModel):
    title: str
    type: str = "Full-time"
    location: str = ""
    desc: str = ""
    status: str = "open"


class DownloadModel(BaseModel):
    label: str
    type: str = "PDF"
    url: str = ""
    category: str = "General"


class ProjectModel(BaseModel):
    data: dict


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


# ---- PUBLIC (no auth) ----
@api_router.get("/public/settings")
async def public_settings():
    doc = await db.settings.find_one({"key": "site"})
    return (doc or {}).get("data", {})


@api_router.get("/public/projects")
async def public_projects():
    docs = await db.projects.find({"status": {"$ne": "draft"}}).sort("order", 1).to_list(100)
    return [clean(d) for d in docs]


@api_router.get("/public/careers")
async def public_careers():
    docs = await db.job_openings.find({"status": "open"}).sort("created_at", -1).to_list(100)
    return [clean(d) for d in docs]


@api_router.get("/public/downloads")
async def public_downloads():
    docs = await db.downloads.find({}).sort("created_at", -1).to_list(200)
    return [clean(d) for d in docs]


# ---- SETTINGS ----
@api_router.get("/admin/settings")
async def get_settings(user: dict = Depends(require("content"))):
    doc = await db.settings.find_one({"key": "site"})
    return (doc or {}).get("data", {})


@api_router.put("/admin/settings")
async def update_settings(body: SettingsUpdate, request: Request, user: dict = Depends(require("content"))):
    await db.settings.update_one({"key": "site"}, {"$set": {"data": body.data, "updated_at": now_iso()}}, upsert=True)
    await log_activity(user, "Updated site settings", "", request)
    return {"status": "ok"}


# ---- PROJECTS CRUD ----
@api_router.get("/admin/projects")
async def list_projects(user: dict = Depends(require("projects"))):
    docs = await db.projects.find({}).sort("order", 1).to_list(100)
    return [clean(d) for d in docs]


@api_router.post("/admin/projects")
async def create_project(body: ProjectModel, request: Request, user: dict = Depends(require("projects"))):
    data = body.data
    data.setdefault("order", 99)
    data.setdefault("status", "published")
    res = await db.projects.insert_one(data)
    await log_activity(user, "Created project", data.get("name", ""), request)
    return {"id": str(res.inserted_id)}


@api_router.put("/admin/projects/{pid}")
async def update_project(pid: str, body: ProjectModel, request: Request, user: dict = Depends(require("projects"))):
    body.data.pop("id", None)
    await db.projects.update_one({"_id": ObjectId(pid)}, {"$set": body.data})
    await log_activity(user, "Updated project", body.data.get("name", pid), request)
    return {"status": "ok"}


@api_router.delete("/admin/projects/{pid}")
async def delete_project(pid: str, request: Request, user: dict = Depends(require("projects"))):
    await db.projects.delete_one({"_id": ObjectId(pid)})
    await log_activity(user, "Deleted project", pid, request)
    return {"status": "ok"}


# ---- CAREERS OPENINGS ----
@api_router.get("/admin/openings")
async def list_openings(user: dict = Depends(require("careers"))):
    docs = await db.job_openings.find({}).sort("created_at", -1).to_list(100)
    return [clean(d) for d in docs]


@api_router.post("/admin/openings")
async def create_opening(body: OpeningModel, request: Request, user: dict = Depends(require("careers"))):
    doc = body.model_dump(); doc["created_at"] = now_iso()
    res = await db.job_openings.insert_one(doc)
    await log_activity(user, "Created job opening", body.title, request)
    return {"id": str(res.inserted_id)}


@api_router.put("/admin/openings/{oid}")
async def update_opening(oid: str, body: OpeningModel, request: Request, user: dict = Depends(require("careers"))):
    await db.job_openings.update_one({"_id": ObjectId(oid)}, {"$set": body.model_dump()})
    await log_activity(user, "Updated job opening", body.title, request)
    return {"status": "ok"}


@api_router.delete("/admin/openings/{oid}")
async def delete_opening(oid: str, request: Request, user: dict = Depends(require("careers"))):
    await db.job_openings.delete_one({"_id": ObjectId(oid)})
    await log_activity(user, "Deleted job opening", oid, request)
    return {"status": "ok"}


# ---- DOWNLOADS ----
@api_router.get("/admin/downloads")
async def list_downloads(user: dict = Depends(require("downloads"))):
    docs = await db.downloads.find({}).sort("created_at", -1).to_list(200)
    return [clean(d) for d in docs]


@api_router.post("/admin/downloads")
async def create_download(body: DownloadModel, request: Request, user: dict = Depends(require("downloads"))):
    doc = body.model_dump(); doc["created_at"] = now_iso()
    res = await db.downloads.insert_one(doc)
    await log_activity(user, "Added download", body.label, request)
    return {"id": str(res.inserted_id)}


@api_router.delete("/admin/downloads/{did}")
async def delete_download(did: str, request: Request, user: dict = Depends(require("downloads"))):
    await db.downloads.delete_one({"_id": ObjectId(did)})
    await log_activity(user, "Deleted download", did, request)
    return {"status": "ok"}


# ---- MEDIA LIBRARY ----
@api_router.get("/admin/media")
async def list_media(folder: str = Query(""), user: dict = Depends(require("media"))):
    q = {"is_deleted": {"$ne": True}}
    if folder and folder != "all":
        q["folder"] = folder
    docs = await db.media.find(q).sort("created_at", -1).to_list(1000)
    return [clean(d) for d in docs]


@api_router.post("/admin/media")
async def upload_media(request: Request, folder: str = Form("General"), file: UploadFile = File(...), user: dict = Depends(require("media"))):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    data = await file.read()
    if len(data) > 60 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File must be under 60MB")
    path = f"{APP_NAME}/media/{folder}/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, file.content_type or "application/octet-stream")
    doc = {
        "storage_path": result["path"], "original_filename": file.filename, "folder": folder,
        "content_type": file.content_type or "application/octet-stream", "size": result.get("size", len(data)),
        "is_deleted": False, "created_at": now_iso(), "uploaded_by": user["email"],
    }
    res = await db.media.insert_one(doc)
    await log_activity(user, "Uploaded media", f"{folder}/{file.filename}", request)
    return {"id": str(res.inserted_id), "storage_path": result["path"]}


@api_router.delete("/admin/media/{mid}")
async def delete_media(mid: str, request: Request, user: dict = Depends(require("media"))):
    await db.media.update_one({"_id": ObjectId(mid)}, {"$set": {"is_deleted": True}})
    await log_activity(user, "Deleted media", mid, request)
    return {"status": "ok"}


@api_router.get("/admin/media/{mid}/file")
async def media_file(mid: str, authorization: str = Header(None), auth: str = Query(None)):
    token = authorization[7:] if authorization and authorization.startswith("Bearer ") else auth
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not await db.users.find_one({"_id": ObjectId(payload["sub"])}):
            raise HTTPException(status_code=401, detail="Invalid user")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    rec = await db.media.find_one({"_id": ObjectId(mid)})
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")
    data, ctype = get_object(rec["storage_path"])
    return Response(content=data, media_type=rec.get("content_type", ctype))


# ---- USERS (super_admin only) ----
@api_router.get("/admin/users")
async def list_users(user: dict = Depends(require("users"))):
    docs = await db.users.find({}).sort("created_at", 1).to_list(200)
    out = []
    for d in docs:
        out.append({"id": str(d["_id"]), "name": d.get("name"), "email": d.get("email"),
                    "role": d.get("role"), "created_at": d.get("created_at")})
    return out


@api_router.post("/admin/users")
async def create_user(body: UserCreate, request: Request, user: dict = Depends(require("users"))):
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="A user with this email already exists")
    await db.users.insert_one({"name": body.name, "email": email, "role": body.role,
                               "password_hash": hash_password(body.password), "created_at": now_iso()})
    await log_activity(user, "Created user", f"{email} ({body.role})", request)
    return {"status": "ok"}


@api_router.put("/admin/users/{uid}")
async def update_user(uid: str, body: UserUpdate, request: Request, user: dict = Depends(require("users"))):
    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.role is not None:
        if body.role not in ROLES:
            raise HTTPException(status_code=400, detail="Invalid role")
        updates["role"] = body.role
    if body.password:
        updates["password_hash"] = hash_password(body.password)
    if updates:
        await db.users.update_one({"_id": ObjectId(uid)}, {"$set": updates})
    await log_activity(user, "Updated user", uid, request)
    return {"status": "ok"}


@api_router.delete("/admin/users/{uid}")
async def delete_user(uid: str, request: Request, user: dict = Depends(require("users"))):
    target = await db.users.find_one({"_id": ObjectId(uid)})
    if target and target.get("email") == ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="Cannot delete the primary administrator")
    await db.users.delete_one({"_id": ObjectId(uid)})
    await log_activity(user, "Deleted user", (target or {}).get("email", uid), request)
    return {"status": "ok"}


# ---- ACTIVITY LOG + OVERVIEW ----
@api_router.get("/admin/activity")
async def get_activity(user: dict = Depends(require("activity"))):
    docs = await db.activity_log.find({}).sort("at", -1).to_list(200)
    return [clean(d) for d in docs]


@api_router.get("/admin/overview")
async def overview(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    async def today_count(col):
        return await col.count_documents({"created_at": {"$regex": f"^{today}"}})
    stats = {
        "contacts": await db.contacts.count_documents({}),
        "agents": await db.agents.count_documents({}),
        "careers": await db.careers.count_documents({}),
        "today": sum([await today_count(c) for c in COLLECTIONS.values()]),
        "media": await db.media.count_documents({"is_deleted": {"$ne": True}}),
        "projects": await db.projects.count_documents({}),
        "openings": await db.job_openings.count_documents({"status": "open"}),
        "users": await db.users.count_documents({}),
    }
    stats["total"] = stats["contacts"] + stats["agents"] + stats["careers"]
    recent = await db.activity_log.find({}).sort("at", -1).to_list(8)
    stats["recent_activity"] = [clean(r) for r in recent]
    return stats


@api_router.get("/admin/search")
async def global_search(q: str = Query(""), user: dict = Depends(get_current_user)):
    q = q.strip()
    empty = {"pages": [], "projects": [], "careers": [], "downloads": [], "media": []}
    if not q:
        return empty
    rx = {"$regex": q, "$options": "i"}
    projects = await db.projects.find({"$or": [{"name": rx}, {"slug": rx}, {"tagline": rx}]}).to_list(20)
    openings = await db.job_openings.find({"$or": [{"title": rx}, {"desc": rx}, {"location": rx}]}).to_list(20)
    downloads = await db.downloads.find({"$or": [{"label": rx}, {"category": rx}]}).to_list(20)
    media = await db.media.find({"original_filename": rx, "is_deleted": {"$ne": True}}).to_list(20)
    pages = [p for p in ["Home", "About Us", "Projects", "APAAR", "PAN 2.0", "Careers", "Contact", "Join Our Network"] if q.lower() in p.lower()]
    return {"pages": pages, "projects": [clean(d) for d in projects], "careers": [clean(d) for d in openings],
            "downloads": [clean(d) for d in downloads], "media": [clean(d) for d in media]}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_cms():
    if await db.settings.find_one({"key": "site"}) is None:
        await db.settings.update_one({"key": "site"}, {"$set": {"data": {
            "company_name": "SKL Enterprises",
            "positioning": "Technology-Driven Public Service Solutions",
            "tagline": "Empowering Digital Citizen Services Across India",
            "address": "No. 2, Shop No. 6, 2nd Street, Race View Colony, Guindy, Chennai – 600032, Tamil Nadu, India",
            "phone": "+91 95516 11666",
            "whatsapp": "+91 94984 00986",
            "email": "sklenterprises@zohomail.in",
            "hours": "Monday – Saturday: 9:30 AM – 6:30 PM · Sunday: Closed",
            "partnership": "SKL Enterprises serves as the South India Channel Partner of EAS, supporting the implementation and expansion of digital public service initiatives across the region.",
            "founder_name": "E.L. Ashok Anand",
            "founder_title": "Founder & Managing Director",
            "linkedin": "", "twitter": "", "facebook": "", "instagram": "", "youtube": "",
            "hero_headline": "Technology-Driven Public Service Solutions",
            "hero_subheadline": "Empowering Digital Citizen Services Across India through innovation, technology, operational excellence and trusted execution.",
            "hero_image": "",
            "company_description": "Technology-Driven Public Service Solutions. Empowering digital citizen services across India through trusted execution.",
            "footer_note": "",
            "maintenance_mode": False,
            "maintenance_message": "Our website is undergoing scheduled maintenance. Please check back shortly.",
            "seo_description": "SKL Enterprises — Technology-Driven Public Service Solutions. Empowering digital citizen services across India.",
        }, "updated_at": now_iso()}}, upsert=True)
    if await db.job_openings.count_documents({}) == 0:
        for o in [
            {"title": "State Project Coordinator", "type": "Full-time", "location": "Chennai", "desc": "Lead project delivery and coordinator networks across the state.", "status": "open"},
            {"title": "District Operations Executive", "type": "Full-time", "location": "South India", "desc": "Manage district-level service delivery and agent onboarding.", "status": "open"},
            {"title": "Field Service Agent", "type": "Field", "location": "South India", "desc": "Deliver citizen services and enrolment support at the last mile.", "status": "open"},
            {"title": "Customer Support Associate", "type": "Full-time", "location": "Chennai", "desc": "Assist citizens navigating government programmes across channels.", "status": "open"},
        ]:
            o["created_at"] = now_iso()
            await db.job_openings.insert_one(o)
    if await db.projects.count_documents({}) == 0:
        base = [
            {"slug": "apaar", "name": "APAAR", "tagline": "One Nation, One Student ID — for a lifelong academic identity.",
             "coverage": "South India", "hero": "/apaar.png", "order": 1, "status": "published",
             "positions": ["State Coordinator", "District Coordinator", "Field Agent"]},
            {"slug": "pan-2", "name": "PAN 2.0", "tagline": "A smarter, secure and QR-enabled Permanent Account Number for every citizen.",
             "coverage": "South India", "hero": "/pan2.png", "order": 2, "status": "published",
             "positions": ["State Coordinator", "District Coordinator", "Pincode-Level Agent"]},
        ]
        for p in base:
            p["created_at"] = now_iso()
            await db.projects.insert_one(p)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.activity_log.create_index("at")
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({"email": ADMIN_EMAIL, "password_hash": hash_password(ADMIN_PASSWORD),
                                   "name": "SKL Admin", "role": "super_admin", "created_at": now_iso()})
        logger.info("Admin user seeded")
    else:
        upd = {}
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            upd["password_hash"] = hash_password(ADMIN_PASSWORD)
        if existing.get("role") != "super_admin":
            upd["role"] = "super_admin"
        if upd:
            await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": upd})
    await seed_cms()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
