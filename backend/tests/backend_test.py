"""Backend API tests for SKL Enterprises CRM."""
import io
import os
import time
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


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    assert "token" in data and data["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- Health
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200


# ---------------- Auth
class TestAuth:
    def test_login_invalid(self, s):
        # use unique email to avoid triggering lockout of real admin
        r = s.post(f"{API}/auth/login", json={"email": f"noone_{uuid.uuid4().hex}@ex.com", "password": "x"})
        assert r.status_code == 401

    def test_me_requires_auth(self, s):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_brute_force_lockout(self):
        # Known bug: `request.client.host` differs per backend pod (round-robin) so lockout keyed on
        # IP+email is bypassed. We still assert intent; if it passes across pods, great.
        email = f"bf_{uuid.uuid4().hex}@ex.com"
        codes = []
        for _ in range(8):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
            codes.append(r.status_code)
        assert 429 in codes, (
            f"Brute-force lockout did not trigger across 8 attempts: {codes}. "
            "Likely root cause: request.client.host varies per pod behind the ingress; "
            "identifier should use X-Forwarded-For or email-only."
        )


# ---------------- Public submissions
class TestPublic:
    created = {"contacts": [], "agents": [], "careers": []}

    def test_contact_create(self):
        payload = {"name": "TEST_Contact", "email": "test_contact@example.com", "phone": "9999999999",
                   "subject": "Hello", "message": "Test message"}
        r = requests.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "success" and "id" in data
        TestPublic.created["contacts"].append(data["id"])

    def test_agent_create(self):
        payload = {"name": "TEST_Agent", "mobile": "9998887777", "email": "test_agent@example.com",
                   "state": "TN", "district": "Chennai", "city": "Chennai", "pincode": "600032",
                   "occupation": "Business", "experience": "3", "message": "Interested", "project": "APAAR"}
        r = requests.post(f"{API}/agents", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "success"
        TestPublic.created["agents"].append(data["id"])

    def test_career_create_with_resume(self):
        files = {"resume": ("test_resume.pdf", io.BytesIO(b"%PDF-1.4 test resume"), "application/pdf")}
        data = {"name": "TEST_Career", "email": "test_career@example.com", "phone": "8887776666",
                "position": "Engineer", "experience": "2", "message": "applying"}
        r = requests.post(f"{API}/careers", data=data, files=files)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["status"] == "success"
        TestPublic.created["careers"].append(j["id"])

    def test_career_rejects_bad_extension(self):
        files = {"resume": ("bad.exe", io.BytesIO(b"binary"), "application/octet-stream")}
        data = {"name": "TEST_Bad", "email": "bad@ex.com", "phone": "1", "position": "X"}
        r = requests.post(f"{API}/careers", data=data, files=files)
        assert r.status_code == 400


# ---------------- Admin CRM
class TestAdmin:
    def test_stats(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        j = r.json()
        for key in ["contacts", "agents", "careers", "new_leads", "total"]:
            assert key in j

    def test_stats_unauthenticated(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401

    @pytest.mark.parametrize("col", ["contacts", "agents", "careers"])
    def test_list(self, auth_headers, col):
        r = requests.get(f"{API}/admin/{col}", headers=auth_headers)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        for d in arr:
            assert "_id" not in d
            assert "id" in d

    def test_list_search_and_filter(self, auth_headers):
        # Seed a contact in this worker so the search matches
        marker = f"TEST_ADMIN_SEARCH_{uuid.uuid4().hex[:8]}"
        requests.post(f"{API}/contact", json={"name": marker, "email": "s@e.com",
                                              "phone": "1", "subject": "s", "message": "m"})
        r = requests.get(f"{API}/admin/contacts?search={marker}&status=New&sort=newest", headers=auth_headers)
        assert r.status_code == 200
        arr = r.json()
        assert any(marker in (d.get("name") or "") for d in arr)

    def test_list_invalid_collection(self, auth_headers):
        r = requests.get(f"{API}/admin/unknown", headers=auth_headers)
        assert r.status_code == 404

    def test_status_and_notes_flow(self, auth_headers):
        # Self-seed a contact
        marker = f"TEST_STATUS_{uuid.uuid4().hex[:8]}"
        r = requests.post(f"{API}/contact", json={"name": marker, "email": "st@e.com",
                                                  "phone": "1", "subject": "s", "message": "m"})
        assert r.status_code == 200
        cid = r.json()["id"]

        # Update status
        r = requests.patch(f"{API}/admin/contacts/{cid}/status", headers=auth_headers, json={"status": "Contacted"})
        assert r.status_code == 200

        # Verify persisted
        r = requests.get(f"{API}/admin/contacts?search={marker}", headers=auth_headers)
        item = next((d for d in r.json() if d["id"] == cid), None)
        assert item and item["status"] == "Contacted"

        # Invalid status
        r = requests.patch(f"{API}/admin/contacts/{cid}/status", headers=auth_headers, json={"status": "Bogus"})
        assert r.status_code == 400

        # Add note
        r = requests.post(f"{API}/admin/contacts/{cid}/notes", headers=auth_headers, json={"note": "TEST_note"})
        assert r.status_code == 200

        r = requests.get(f"{API}/admin/contacts?search={marker}", headers=auth_headers)
        item = next((d for d in r.json() if d["id"] == cid), None)
        assert item and any(n.get("text") == "TEST_note" for n in item.get("notes", []))

    @pytest.mark.parametrize("col", ["contacts", "agents", "careers"])
    def test_export_csv(self, auth_headers, col):
        r = requests.get(f"{API}/admin/{col}/export", headers=auth_headers)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert b"name" in r.content[:200]

    def test_resume_download_requires_auth(self):
        # Seed a career in this worker
        files = {"resume": ("r.pdf", io.BytesIO(b"%PDF-1.4 ok"), "application/pdf")}
        data = {"name": "TEST_ResumeAuth", "email": "ra@e.com", "phone": "1", "position": "X"}
        rid = requests.post(f"{API}/careers", data=data, files=files).json()["id"]
        r = requests.get(f"{API}/admin/careers/{rid}/resume")
        assert r.status_code == 401

    def test_resume_download_with_token(self, token):
        files = {"resume": ("r.pdf", io.BytesIO(b"%PDF-1.4 ok"), "application/pdf")}
        data = {"name": "TEST_ResumeDL", "email": "rd@e.com", "phone": "1", "position": "X"}
        rid = requests.post(f"{API}/careers", data=data, files=files).json()["id"]
        r = requests.get(f"{API}/admin/careers/{rid}/resume?auth={token}")
        assert r.status_code == 200
        assert len(r.content) > 0


# ---------------- Cleanup
@pytest.fixture(scope="session", autouse=True)
def cleanup(auth_headers):
    yield
    # Best-effort cleanup via direct Mongo delete not available; leave data flagged TEST_
    # Just update statuses so they aren't confused with live leads
    for col in ["contacts", "agents", "careers"]:
        for _id in TestPublic.created.get(col, []):
            try:
                requests.patch(f"{API}/admin/{col}/{_id}/status", headers=auth_headers, json={"status": "Rejected"})
            except Exception:
                pass
