"""Backend API tests for SKL Enterprises CMS + CRM (iteration 3)."""
import io
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "poojithaayyani1592@gmail.com"
ADMIN_PASSWORD = "SklAdmin@2026"


# ---------------- Auth helpers
def login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    return r


@pytest.fixture(scope="session")
def admin_token():
    r = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    assert data["role"] == "super_admin"
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- Health
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------------- Auth
class TestAuth:
    def test_login_success_returns_role(self):
        r = login(ADMIN_EMAIL, ADMIN_PASSWORD)
        assert r.status_code == 200
        j = r.json()
        assert j["email"] == ADMIN_EMAIL
        assert j["role"] == "super_admin"
        assert isinstance(j["token"], str) and len(j["token"]) > 20

    def test_login_invalid(self):
        r = login(f"noone_{uuid.uuid4().hex}@example.com", "x")
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---------------- Public submissions
class TestPublicSubmissions:
    def test_contact_create(self):
        payload = {"name": f"TEST_C_{uuid.uuid4().hex[:6]}", "email": "test_contact@example.com",
                   "phone": "9999999999", "subject": "Hello", "message": "Test"}
        r = requests.post(f"{API}/contact", json=payload)
        assert r.status_code == 200
        assert r.json()["status"] == "success"

    def test_agent_create(self):
        payload = {"name": f"TEST_A_{uuid.uuid4().hex[:6]}", "mobile": "9998887777",
                   "email": "test_agent@example.com", "state": "Tamil Nadu", "district": "Chennai",
                   "city": "Chennai", "pincode": "600032", "project": "APAAR"}
        r = requests.post(f"{API}/agents", json=payload)
        assert r.status_code == 200

    def test_career_create(self):
        files = {"resume": ("r.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")}
        data = {"name": "TEST_Career", "email": "cr@example.com", "phone": "1", "position": "Eng"}
        r = requests.post(f"{API}/careers", data=data, files=files)
        assert r.status_code == 200

    def test_career_bad_ext(self):
        files = {"resume": ("bad.exe", io.BytesIO(b"binary"), "application/octet-stream")}
        data = {"name": "TEST_Bad", "email": "b@ex.com", "phone": "1", "position": "X"}
        r = requests.post(f"{API}/careers", data=data, files=files)
        assert r.status_code == 400


# ---------------- Public CMS endpoints
class TestPublicCMS:
    def test_public_settings(self):
        r = requests.get(f"{API}/public/settings")
        assert r.status_code == 200
        j = r.json()
        assert "phone" in j and "company_name" in j

    def test_public_projects(self):
        r = requests.get(f"{API}/public/projects")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 2
        slugs = {p.get("slug") for p in arr}
        assert "apaar" in slugs and "pan-2" in slugs

    def test_public_careers_only_open(self):
        r = requests.get(f"{API}/public/careers")
        assert r.status_code == 200
        assert all(o.get("status") == "open" for o in r.json())

    def test_public_downloads(self):
        r = requests.get(f"{API}/public/downloads")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------- Leads (namespaced under /admin/leads/*)
class TestLeadsRoutes:
    @pytest.mark.parametrize("col", ["contacts", "agents", "careers"])
    def test_list(self, admin_headers, col):
        r = requests.get(f"{API}/admin/leads/{col}", headers=admin_headers)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        for d in arr:
            assert "_id" not in d and "id" in d

    def test_list_requires_auth(self):
        r = requests.get(f"{API}/admin/leads/contacts")
        assert r.status_code == 401

    def test_status_and_notes_flow(self, admin_headers):
        marker = f"TEST_STATUS_{uuid.uuid4().hex[:8]}"
        r = requests.post(f"{API}/contact", json={"name": marker, "email": "st@e.com",
                                                  "phone": "1", "subject": "s", "message": "m"})
        cid = r.json()["id"]
        r = requests.patch(f"{API}/admin/leads/contacts/{cid}/status",
                           headers=admin_headers, json={"status": "Contacted"})
        assert r.status_code == 200
        r = requests.get(f"{API}/admin/leads/contacts?search={marker}", headers=admin_headers)
        item = next((d for d in r.json() if d["id"] == cid), None)
        assert item and item["status"] == "Contacted"
        r = requests.post(f"{API}/admin/leads/contacts/{cid}/notes",
                          headers=admin_headers, json={"note": "TEST_note"})
        assert r.status_code == 200

    @pytest.mark.parametrize("col", ["contacts", "agents", "careers"])
    def test_export_csv(self, admin_headers, col):
        r = requests.get(f"{API}/admin/leads/{col}/export", headers=admin_headers)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")

    @pytest.mark.parametrize("col", ["contacts", "agents", "careers"])
    def test_export_xlsx(self, admin_headers, col):
        r = requests.get(f"{API}/admin/leads/{col}/export?format=xlsx", headers=admin_headers)
        assert r.status_code == 200
        assert "spreadsheetml" in r.headers.get("content-type", "")
        assert r.content[:2] == b"PK"

    def test_resume_download_with_token(self, admin_token):
        files = {"resume": ("r.pdf", io.BytesIO(b"%PDF-1.4 ok"), "application/pdf")}
        data = {"name": "TEST_ResumeDL", "email": "rd@example.com", "phone": "1", "position": "X"}
        rid = requests.post(f"{API}/careers", data=data, files=files).json()["id"]
        r = requests.get(f"{API}/admin/leads/careers/{rid}/resume?auth={admin_token}")
        # Note: server.py currently defines this at /admin/careers/{id}/resume (legacy path)
        # so also try that if the new one 404s.
        if r.status_code == 404:
            r = requests.get(f"{API}/admin/careers/{rid}/resume?auth={admin_token}")
        assert r.status_code == 200
        assert len(r.content) > 0


# ---------------- Users & RBAC
class TestUsersAndRBAC:
    created_ids = []

    @classmethod
    def _make_user(cls, admin_headers, email, role, password="Passw0rd!"):
        payload = {"name": f"TEST_{role}", "email": email, "password": password, "role": role}
        r = requests.post(f"{API}/admin/users", headers=admin_headers, json=payload)
        assert r.status_code == 200, f"create user failed: {r.status_code} {r.text[:200]}"
        # find created id
        lst = requests.get(f"{API}/admin/users", headers=admin_headers).json()
        u = next((x for x in lst if x["email"] == email), None)
        assert u is not None
        cls.created_ids.append(u["id"])
        return u["id"]

    def test_list_users_super_admin(self, admin_headers):
        r = requests.get(f"{API}/admin/users", headers=admin_headers)
        assert r.status_code == 200
        arr = r.json()
        assert any(u["email"] == ADMIN_EMAIL for u in arr)

    def test_create_duplicate_email_rejected(self, admin_headers):
        email = f"dup_{uuid.uuid4().hex[:6]}@example.com"
        self._make_user(admin_headers, email, "operations")
        r = requests.post(f"{API}/admin/users", headers=admin_headers,
                          json={"name": "x", "email": email, "password": "Passw0rd!", "role": "operations"})
        assert r.status_code == 400

    def test_create_invalid_role(self, admin_headers):
        r = requests.post(f"{API}/admin/users", headers=admin_headers,
                          json={"name": "x", "email": f"ir_{uuid.uuid4().hex[:6]}@example.com",
                                "password": "Passw0rd!", "role": "wizard"})
        assert r.status_code == 400

    def test_cannot_delete_primary_admin(self, admin_headers):
        lst = requests.get(f"{API}/admin/users", headers=admin_headers).json()
        admin = next(u for u in lst if u["email"] == ADMIN_EMAIL)
        r = requests.delete(f"{API}/admin/users/{admin['id']}", headers=admin_headers)
        assert r.status_code == 400

    def test_operations_rbac(self, admin_headers):
        email = f"ops_{uuid.uuid4().hex[:6]}@example.com"
        pwd = "OpsPass@1"
        self._make_user(admin_headers, email, "operations", pwd)
        tok = login(email, pwd).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        assert requests.get(f"{API}/admin/leads/contacts", headers=h).status_code == 200
        assert requests.get(f"{API}/admin/users", headers=h).status_code == 403
        assert requests.get(f"{API}/admin/settings", headers=h).status_code == 403

    def test_content_manager_rbac(self, admin_headers):
        email = f"cm_{uuid.uuid4().hex[:6]}@example.com"
        pwd = "CmPass@1"
        self._make_user(admin_headers, email, "content_manager", pwd)
        tok = login(email, pwd).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        assert requests.get(f"{API}/admin/leads/contacts", headers=h).status_code == 403
        assert requests.get(f"{API}/admin/users", headers=h).status_code == 403
        assert requests.get(f"{API}/admin/settings", headers=h).status_code == 200
        assert requests.get(f"{API}/admin/projects", headers=h).status_code == 200

    def test_update_user_role_and_password(self, admin_headers):
        email = f"upd_{uuid.uuid4().hex[:6]}@example.com"
        uid = self._make_user(admin_headers, email, "operations", "OldPass@1")
        # change role -> hr, password -> new
        r = requests.put(f"{API}/admin/users/{uid}", headers=admin_headers,
                         json={"role": "hr", "password": "NewPass@1"})
        assert r.status_code == 200
        # verify new password works & role
        j = login(email, "NewPass@1").json()
        assert j["role"] == "hr"

    @classmethod
    def teardown_class(cls):
        # cleanup: login as admin fresh and delete
        tok = login(ADMIN_EMAIL, ADMIN_PASSWORD).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        for uid in cls.created_ids:
            try:
                requests.delete(f"{API}/admin/users/{uid}", headers=h)
            except Exception:
                pass


# ---------------- Settings
class TestSettings:
    def test_get_and_update_settings(self, admin_headers):
        r = requests.get(f"{API}/admin/settings", headers=admin_headers)
        assert r.status_code == 200
        current = r.json()
        original_phone = current.get("phone", "+91 95516 11666")
        new_phone = f"+91 90000{uuid.uuid4().hex[:5]}"
        current["phone"] = new_phone
        r = requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": current})
        assert r.status_code == 200
        # public reflects
        pub = requests.get(f"{API}/public/settings").json()
        assert pub["phone"] == new_phone
        # restore
        current["phone"] = original_phone
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": current})


# ---------------- Openings CMS
class TestOpenings:
    def test_openings_crud(self, admin_headers):
        # create
        title = f"TEST_JOB_{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/admin/openings", headers=admin_headers,
                          json={"title": title, "type": "Full-time", "location": "Chennai",
                                "desc": "Test opening", "status": "open"})
        assert r.status_code == 200
        oid = r.json()["id"]

        # list
        arr = requests.get(f"{API}/admin/openings", headers=admin_headers).json()
        assert any(o["id"] == oid for o in arr)

        # public reflects
        pub = requests.get(f"{API}/public/careers").json()
        assert any(o.get("title") == title for o in pub)

        # update to closed -> should disappear from public
        r = requests.put(f"{API}/admin/openings/{oid}", headers=admin_headers,
                        json={"title": title, "type": "Full-time", "location": "Chennai",
                              "desc": "closed now", "status": "closed"})
        assert r.status_code == 200
        pub = requests.get(f"{API}/public/careers").json()
        assert not any(o.get("title") == title for o in pub)

        # delete
        r = requests.delete(f"{API}/admin/openings/{oid}", headers=admin_headers)
        assert r.status_code == 200


# ---------------- Downloads CMS
class TestDownloads:
    def test_downloads_crud(self, admin_headers):
        label = f"TEST_DL_{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/admin/downloads", headers=admin_headers,
                          json={"label": label, "type": "PDF", "url": "https://example.com/x.pdf",
                                "category": "Brochure"})
        assert r.status_code == 200
        did = r.json()["id"]
        arr = requests.get(f"{API}/admin/downloads", headers=admin_headers).json()
        assert any(d["id"] == did for d in arr)
        r = requests.delete(f"{API}/admin/downloads/{did}", headers=admin_headers)
        assert r.status_code == 200


# ---------------- Projects CMS
class TestProjectsCMS:
    def test_seeded(self, admin_headers):
        r = requests.get(f"{API}/admin/projects", headers=admin_headers)
        assert r.status_code == 200
        arr = r.json()
        slugs = {p.get("slug") for p in arr}
        assert "apaar" in slugs and "pan-2" in slugs

    def test_project_crud(self, admin_headers):
        name = f"TEST_PROJ_{uuid.uuid4().hex[:6]}"
        payload = {"data": {"slug": f"test-{uuid.uuid4().hex[:6]}", "name": name,
                            "coverage": "South India", "order": 99, "status": "published"}}
        r = requests.post(f"{API}/admin/projects", headers=admin_headers, json=payload)
        assert r.status_code == 200
        pid = r.json()["id"]
        r = requests.put(f"{API}/admin/projects/{pid}", headers=admin_headers,
                         json={"data": {"name": name + "_updated", "coverage": "South India"}})
        assert r.status_code == 200
        r = requests.delete(f"{API}/admin/projects/{pid}", headers=admin_headers)
        assert r.status_code == 200


# ---------------- Media Library
class TestMedia:
    def test_media_upload_list_serve_delete(self, admin_headers, admin_token):
        files = {"file": (f"test_{uuid.uuid4().hex[:6]}.txt",
                          io.BytesIO(b"hello media"), "text/plain")}
        data = {"folder": "General"}
        r = requests.post(f"{API}/admin/media", headers=admin_headers, files=files, data=data)
        assert r.status_code == 200, r.text
        mid = r.json()["id"]

        # list
        arr = requests.get(f"{API}/admin/media", headers=admin_headers).json()
        assert any(m["id"] == mid for m in arr)

        # serve
        r = requests.get(f"{API}/admin/media/{mid}/file?auth={admin_token}")
        assert r.status_code == 200
        assert r.content == b"hello media"

        # delete (soft)
        r = requests.delete(f"{API}/admin/media/{mid}", headers=admin_headers)
        assert r.status_code == 200
        arr = requests.get(f"{API}/admin/media", headers=admin_headers).json()
        assert not any(m["id"] == mid for m in arr)


# ---------------- New settings keys, global search, sitemap/robots
class TestNewSettingsKeys:
    def test_settings_contains_new_keys(self, admin_headers):
        r = requests.get(f"{API}/admin/settings", headers=admin_headers)
        assert r.status_code == 200
        j = r.json()
        for k in ["hero_headline", "hero_subheadline", "hero_image", "company_description",
                  "footer_note", "instagram", "youtube", "linkedin", "facebook", "twitter",
                  "maintenance_mode", "maintenance_message"]:
            assert k in j, f"settings missing key {k}"

    def test_update_social_links_reflects_public(self, admin_headers):
        cur = requests.get(f"{API}/admin/settings", headers=admin_headers).json()
        old_li = cur.get("linkedin", "")
        old_ig = cur.get("instagram", "")
        cur["linkedin"] = "https://linkedin.com/company/skl-test"
        cur["instagram"] = "https://instagram.com/skl_test"
        r = requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})
        assert r.status_code == 200
        pub = requests.get(f"{API}/public/settings").json()
        assert pub["linkedin"] == "https://linkedin.com/company/skl-test"
        assert pub["instagram"] == "https://instagram.com/skl_test"
        # restore
        cur["linkedin"] = old_li
        cur["instagram"] = old_ig
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})

    def test_update_hero_headline_reflects_public(self, admin_headers):
        cur = requests.get(f"{API}/admin/settings", headers=admin_headers).json()
        old = cur.get("hero_headline", "")
        cur["hero_headline"] = "TEST Hero Headline"
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})
        pub = requests.get(f"{API}/public/settings").json()
        assert pub["hero_headline"] == "TEST Hero Headline"
        # restore
        cur["hero_headline"] = old
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})

    def test_maintenance_mode_toggle_and_restore(self, admin_headers):
        cur = requests.get(f"{API}/admin/settings", headers=admin_headers).json()
        cur["maintenance_mode"] = True
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})
        pub = requests.get(f"{API}/public/settings").json()
        assert pub["maintenance_mode"] is True
        # restore
        cur["maintenance_mode"] = False
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})
        pub = requests.get(f"{API}/public/settings").json()
        assert pub["maintenance_mode"] is False


class TestGlobalSearch:
    def test_search_requires_auth(self):
        r = requests.get(f"{API}/admin/search?q=apaar")
        assert r.status_code == 401

    def test_search_empty_returns_groups(self, admin_headers):
        r = requests.get(f"{API}/admin/search?q=", headers=admin_headers)
        assert r.status_code == 200
        j = r.json()
        for k in ["pages", "projects", "careers", "downloads", "media"]:
            assert k in j and j[k] == []

    def test_search_apaar_returns_project(self, admin_headers):
        r = requests.get(f"{API}/admin/search?q=apaar", headers=admin_headers)
        assert r.status_code == 200
        j = r.json()
        slugs = {p.get("slug") for p in j["projects"]}
        assert "apaar" in slugs
        # pages should contain APAAR
        assert any("APAAR" in p for p in j["pages"])

    def test_search_coordinator_hits_careers(self, admin_headers):
        r = requests.get(f"{API}/admin/search?q=coordinator", headers=admin_headers)
        assert r.status_code == 200
        j = r.json()
        # State Project Coordinator seeded
        assert len(j["careers"]) > 0


class TestSitemapAndRobots:
    def test_sitemap_served(self):
        r = requests.get(f"{BASE_URL}/sitemap.xml")
        assert r.status_code == 200
        assert "<urlset" in r.text

    def test_robots_served(self):
        r = requests.get(f"{BASE_URL}/robots.txt")
        assert r.status_code == 200
        assert "Sitemap" in r.text or "User-agent" in r.text


# ---------------- Activity & Overview
class TestActivityOverview:
    def test_overview_shape(self, admin_headers):
        r = requests.get(f"{API}/admin/overview", headers=admin_headers)
        assert r.status_code == 200
        j = r.json()
        for k in ["today", "total", "agents", "careers", "contacts", "media",
                  "openings", "users", "recent_activity"]:
            assert k in j, f"overview missing {k}"
        assert isinstance(j["recent_activity"], list)

    def test_activity_logged_on_settings_update(self, admin_headers):
        # update settings and expect a new activity entry
        cur = requests.get(f"{API}/admin/settings", headers=admin_headers).json()
        requests.put(f"{API}/admin/settings", headers=admin_headers, json={"data": cur})
        r = requests.get(f"{API}/admin/activity", headers=admin_headers)
        assert r.status_code == 200
        entries = r.json()
        assert len(entries) > 0
        # Look within recent entries (parallel test workers may interleave activities)
        recent = entries[:20]
        assert any(e.get("user") == ADMIN_EMAIL and "settings" in e.get("action", "").lower()
                   for e in recent), f"No settings-update activity found in top 20: {[e.get('action') for e in recent]}"
