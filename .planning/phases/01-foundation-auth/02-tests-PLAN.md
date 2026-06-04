---
phase: 1
plan: 02-tests
type: execute
wave: 2
depends_on: [01-f01]
files_modified:
  - apps/users/tests/test_auth_api.py
  - apps/users/tests/test_services.py
  - apps/users/tests/__init__.py
  - pytest.ini
autonomous: true
requirements: [TST-02]
---

<objective>
Write comprehensive API tests and service unit tests for the auth flow, ensuring all endpoints are covered and the OOP service layer is testable in isolation.
</objective>

<tasks>

<task>
<type>execute</type>
<id>02-01</id>
<files>
  - pytest.ini
  - apps/users/tests/__init__.py
</files>
<read_first>
- apps/users/tests/ (create directory)
</read_first>
<action>
Set up test configuration:
1. Install pytest and pytest-django: add to requirements.txt
2. Create pytest.ini at project root with:
   - DJANGO_SETTINGS_MODULE=config.settings.local
   - python_files = tests.py test_*.py *_tests.py
3. Create apps/users/tests/__init__.py (empty)
4. Confirm `python -m pytest` discovers tests (0 collected initially)
</action>
<acceptance_criteria>
- pytest.ini exists with DJANGO_SETTINGS_MODULE set
- `python -m pytest` runs without ImportError
- `python -m pytest --collect-only` shows test discovery path
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<id>02-02</id>
<files>
  - apps/users/tests/test_services.py
</files>
<read_first>
- apps/users/services/registration_service.py
- apps/users/services/auth_service.py
- apps/users/repositories/user_repository.py
- apps/users/models.py
</read_first>
<action>
Write unit tests for service classes in apps/users/tests/test_services.py:

1. RegistrationServiceTest:
   - test_register_creates_user: calls service.register() and verifies user exists
   - test_register_duplicate_email: raises ValidationError
   - test_register_weak_password: validates min 8 chars

2. AuthServiceTest:
   - test_authenticate_valid: returns user for correct email+password
   - test_authenticate_invalid_password: returns None
   - test_authenticate_nonexistent_email: returns None
   - test_generate_tokens: returns dict with access and refresh keys
   - test_refresh_access_token: valid refresh returns new access
   - test_refresh_access_token_invalid: raises error for bad token

Use pytest fixtures, django.test.TestCase, or pytest-django's db marker. Mock UserRepository for true unit isolation where appropriate.
</action>
<acceptance_criteria>
- `python -m pytest apps/users/tests/test_services.py -v` passes all tests
- Each service method has at least one test
- Tests use factories or fixtures (not hard-coded DB state)
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<id>02-03</id>
<files>
  - apps/users/tests/test_auth_api.py
</files>
<read_first>
- apps/users/views/auth_views.py
- apps/users/urls.py
- apps/users/serializers.py
</read_first>
<action>
Write API integration tests for all auth endpoints in apps/users/tests/test_auth_api.py using APITestCase or APIClient:

1. RegisterEndpointTest:
   - test_register_success: POST 201 + tokens in response
   - test_register_missing_fields: POST 400
   - test_register_duplicate_email: POST 400
   - test_register_weak_password: POST 400

2. LoginEndpointTest:
   - test_login_success: POST 200 + access/refresh tokens
   - test_login_wrong_password: POST 401
   - test_login_nonexistent: POST 401

3. MeEndpointTest:
   - test_me_authenticated: GET 200 with user data
   - test_me_unauthenticated: GET 401
   - test_me_expired_token: GET 401

4. LogoutEndpointTest:
   - test_logout_success: POST 200

5. TokenRefreshTest:
   - test_refresh_success: POST 200 + new access
   - test_refresh_invalid: POST 401

6. RoleAccessTest:
   - Test that role field is returned in /me endpoint
   - Test that created user defaults to role='client'
</action>
<acceptance_criteria>
- `python -m pytest apps/users/tests/test_auth_api.py -v` passes all tests
- All 12+ test cases pass
- Tests run inside Docker: `docker compose exec api python -m pytest apps/users/tests/ -v`
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Run `python -m pytest apps/users/tests/ -v --cov=apps/users` to verify coverage
2. Confirm tests run both locally and in Docker
3. Verify no test mutates production database
</verification>

<success_criteria>
1. All service unit tests pass
2. All API endpoint tests pass
3. Tests are runnable via `docker compose exec api python -m pytest`
4. Registration, login, logout, token refresh, and role access are fully covered
</success_criteria>
