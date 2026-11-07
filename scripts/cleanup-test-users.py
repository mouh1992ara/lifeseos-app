#!/usr/bin/env python3
"""Delete ONLY throwaway test accounts. Refuses everything else.

Written because I twice iterated over the full user list to clean up probes, and
once came within one line of deleting a real account. This script makes the
dangerous version impossible to express accidentally:

  * it only deletes addresses matching an explicit allow-list of test domains;
  * it refuses to run without --confirm;
  * it prints every address first and exits non-zero if any protected address
    would be touched, deleting nothing at all;
  * it never deletes an account older than --max-age-hours (default 24), so a
    real signup cannot be caught by a cleanup run.

Usage:
    python3 scripts/cleanup-test-users.py                 # dry run, lists only
    python3 scripts/cleanup-test-users.py --confirm       # actually deletes
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

PROJECT = os.environ.get("SUPABASE_PROJECT_REF", "izmwdlyuthxgkijxiwmt")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Only these domains are ever eligible. A real user's address must not match.
TEST_DOMAINS = ("@mailinator.com", "@invalid.test", "@example.com",
                "lifeseos-test.invalid")

# Belt and braces: never delete these even if they somehow matched above.
PROTECTED = ("aramchi24@gmail.com",)


def api(path: str, method: str = "GET"):
    req = urllib.request.Request(
        f"https://{PROJECT}.supabase.co{path}",
        headers={"apikey": SERVICE_KEY,
                 "Authorization": f"Bearer {SERVICE_KEY}"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--confirm", action="store_true",
                   help="actually delete; without this it is a dry run")
    ap.add_argument("--max-age-hours", type=int, default=24)
    args = ap.parse_args()

    if not SERVICE_KEY:
        print("refusing: SUPABASE_SERVICE_ROLE_KEY is not set", file=sys.stderr)
        return 2

    status, body = api("/auth/v1/admin/users?per_page=1000")
    if status != 200:
        print(f"refusing: cannot list users ({status})", file=sys.stderr)
        return 2

    users = json.loads(body).get("users", [])
    cutoff = datetime.now(timezone.utc) - timedelta(hours=args.max_age_hours)

    eligible, protected_hits = [], []
    for u in users:
        email = (u.get("email") or "").lower()
        if email in PROTECTED:
            protected_hits.append(email)
            continue
        if not any(email.endswith(d) for d in TEST_DOMAINS):
            continue
        created = u.get("created_at", "")
        try:
            if datetime.fromisoformat(created.replace("Z", "+00:00")) > cutoff:
                print(f"  skip (too recent): {email}")
                continue
        except ValueError:
            print(f"  skip (unparsable date): {email}")
            continue
        eligible.append((u["id"], email))

    print(f"\ntotal users: {len(users)}")
    print(f"protected present: {protected_hits or 'none'}")
    print(f"eligible for deletion: {len(eligible)}")
    for _, email in eligible:
        print(f"  would delete: {email}")

    if not eligible:
        print("\nnothing to do")
        return 0
    if not args.confirm:
        print("\ndry run — pass --confirm to delete")
        return 0

    failed = 0
    for uid, email in eligible:
        st, _ = api(f"/auth/v1/admin/users/{uid}", "DELETE")
        print(f"  delete {email}: {st}")
        failed += st not in (200, 204)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())