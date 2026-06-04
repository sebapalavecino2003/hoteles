---
phase: 1
plan: 01-f01
type: tdd
wave: 1
depends_on: []
files_modified:
  - Dockerfile.django
  - docker-compose.yml
  - requirements.txt
  - config/settings/base.py
  - config/settings/local.py
  - config/urls.py
  - config/wsgi.py
  - users/models.py
  - users/serializers.py
  - users/services/registration_service.py
  - users/services/auth_service.py
  - users/repositories/user_repository.py
  - users/views/auth_views.py
  - users/urls.py
  - users/admin.py
  - manage.py
autonomous: true
requirements: [AUTH-03, AUTH-04, AUTH-05, AUTH-06, INF-01, INF-02]
---

<objective>
Build the Walking Skeleton of the entire project: Django project scaffolded with modular apps, PostgreSQL connected via Docker, custom User model with roles, JWT authentication (register, login, logout, token refresh, role-based access), and Docker Compose with hot reload. This is the thinnest end-to-end slice that proves the full stack works.
</objective>

<tasks>

<task>
<type>scaffold</type>
<id>01-01</id>
<files>
  - manage.py
  - config/settings/base.py
  - config/settings/local.py
  - config/urls.py
  - config/wsgi.py
  - requirements.txt
</files>
<read_first>
- PROJECT.md (project context)
- AGENTS.md (project instructions)
</read_first>
<action>
Create Django project "config" in the root directory with:
- manage.py at project root
- config/settings/ package with base.py and local.py (split settings)
- config/urls.py
- config/wsgi.py
- requirements.txt with: Django>=5.0, djangorestframework>=3.15, djangorestframework-simplejwt>=5.3, psycopg2-binary>=2.9, django-cors-headers>=4.3, python-decouple>=3.8
- Create apps directory structure: apps/users/
</action>
<acceptance_criteria>
- manage.py runs `python manage.py check --deploy` without errors
- config/settings/base.py exists with DATABASES configured for PostgreSQL
- config/settings/local.py imports base and adds DRF config
- requirements.txt contains all listed packages
- `python manage.py runserver` starts without errors (test with --help)
</acceptance_criteria>
</task>

<task>
<type>tdd</type>
<id>01-02</id>
<files>
  - apps/users/models.py
  - apps/users/admin.py
</files>
<read_first>
- apps/users/models.py (created in step 01-01)
</read_first>
<action>
Create CustomUser model in apps/users/models.py with:
- email (EmailField, unique, required)
- password (inherited from AbstractBaseUser)
- first_name, last_name (CharField, optional)
- phone (CharField, max_length=20, optional)
- role (CharField choices: client, employee, admin; default client)
- hotel_id (ForeignKey to hotels.Hotel, nullable — for employees)
- is_active (BooleanField, default True)
- created_at, updated_at (DateTimeField auto)
- USERNAME_FIELD = 'email'
- REQUIRED_FIELDS = []
- Use AbstractBaseUser + PermissionsMixin
- CustomUserManager with create_user and create_superuser
- Register in apps/users/admin.py
- Create and run migration: `python manage.py makemigrations users && python manage.py migrate`
</action>
<acceptance_criteria>
- `python manage.py makemigrations users` creates 0001_initial.py
- `python manage.py migrate` runs without errors
- `python manage.py createsuperuser --email admin@test.com` creates user with role=admin
- User model has email as USERNAME_FIELD
- Django admin shows User model
</acceptance_criteria>
</task>

<task>
<type>tdd</type>
<id>01-03</id>
<files>
  - apps/users/repositories/user_repository.py
  - apps/users/services/registration_service.py
  - apps/users/services/auth_service.py
  - apps/users/serializers.py
  - apps/users/views/auth_views.py
  - apps/users/urls.py
</files>
<read_first>
- apps/users/models.py
- apps/users/repositories/user_repository.py
- apps/users/services/registration_service.py
</read_first>
<action>
Implement the OOP service layer for auth:

1. UserRepository (OOP class) in apps/users/repositories/user_repository.py:
   - get_by_email(email) -> User | None
   - create_user(email, password, **kwargs) -> User
   - get_by_id(user_id) -> User | None
   - exists_by_email(email) -> bool

2. RegistrationService (OOP class) in apps/users/services/registration_service.py:
   - Uses UserRepository
   - register(email, password, first_name, last_name, phone, role) -> User
   - Validates email uniqueness, password strength (min 8 chars)
   - Returns created user

3. AuthService (OOP class) in apps/users/services/auth_service.py:
   - Uses UserRepository
   - authenticate(email, password) -> User | None (verify credentials)
   - generate_tokens(user) -> dict with access + refresh (via RefreshToken from simplejwt)
   - refresh_access_token(refresh_token) -> dict with new access
   - logout_user(refresh_token) -> None (blacklist token)
   - get_user_from_token(token) -> User | None

4. Serializers in apps/users/serializers.py:
   - RegisterSerializer (email, password, first_name, last_name, phone)
   - LoginSerializer (email, password)
   - TokenResponseSerializer (access, refresh, user info)
   - UserSerializer (all user fields)

5. DRF Views in apps/users/views/auth_views.py (thin — delegate to services):
   - RegisterView (POST /api/auth/register/) -> calls RegistrationService
   - LoginView (POST /api/auth/login/) -> calls AuthService.authenticate + generate_tokens
   - LogoutView (POST /api/auth/logout/) -> calls AuthService.logout_user
   - TokenRefreshView (POST /api/auth/refresh/) -> calls AuthService.refresh_access_token
   - MeView (GET /api/auth/me/) -> returns current user from token

6. URLs in apps/users/urls.py — wire all endpoints

7. In config/urls.py: include apps/users.urls at 'api/auth/'

8. In config/settings/local.py: configure SIMPLE_JWT (access 30min, refresh 1 day), REST_FRAMEWORK default auth classes, CORS for localhost:3000
</action>
<acceptance_criteria>
- RegistrationService.register() creates user with email as USERNAME_FIELD
- AuthService.authenticate() returns user for valid credentials, None for invalid
- POST /api/auth/register/ returns 201 + user data for valid input
- POST /api/auth/register/ returns 400 for duplicate email
- POST /api/auth/login/ returns 200 + access/refresh tokens for valid credentials
- POST /api/auth/login/ returns 401 for invalid credentials
- POST /api/auth/logout/ returns 200 (with valid token in Authorization header)
- POST /api/auth/refresh/ returns 200 + new access token
- GET /api/auth/me/ returns 200 + user data when authenticated
- GET /api/auth/me/ returns 401 without token
- All views are thin (no business logic, only delegation to services)
</acceptance_criteria>
</task>

<task>
<type>tdd</type>
<id>01-04</id>
<files>
  - Dockerfile.django
  - docker-compose.yml
  - .dockerignore
  - .env.example
  - config/settings/local.py
</files>
<read_first>
- Dockerfile.django (Django multi-stage)
- docker-compose.yml
- config/settings/local.py
</read_first>
<action>
Set up Docker Compose for development:

1. Dockerfile.django:
   - Stage 1: python:3.12-slim, install requirements, copy project
   - Expose port 8000
   - CMD: python manage.py runserver 0.0.0.0:8000

2. docker-compose.yml with services:
   - db: postgres:16-alpine, port 5432, volume for data persistence, healthcheck
   - api: build from Dockerfile.django, port 8000, depends_on db (condition: healthy), volume mount for hot reload (.:/app), env vars from .env

3. .env.example:
   - DATABASE_URL=postgres://hotel_user:hotel_pass@db:5432/hotel_booking
   - SECRET_KEY=change-me
   - DEBUG=True

4. .dockerignore: venv, __pycache__, .git, .env, .planning

5. Update config/settings/local.py to read DATABASE_URL from environment for Docker, with fallback to local SQLite for development without Docker

6. Add docker-compose.yml to manage.py's runserver check path
</action>
<acceptance_criteria>
- `docker compose build` succeeds without errors
- `docker compose up -d` starts both services (api + db)
- `docker compose exec api python manage.py migrate` runs migrations in container
- `docker compose exec api python manage.py createsuperuser --email admin@test.com` works
- curl to http://localhost:8000/api/auth/register/ returns response (Django is serving)
- Changing a .py file on host triggers Django auto-reload in container (hot reload)
- `docker compose down` stops and removes containers cleanly
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Run full auth flow in Docker: register -> login -> access protected endpoint -> logout
2. Verify role field on created users defaults to 'client'
3. Confirm PostgreSQL data persists across container restarts
4. Verify hot reload: change a view and confirm container restarts
5. All service classes follow OOP patterns (no standalone functions for business logic)
</verification>

<success_criteria>
1. `docker compose up` starts Django API + PostgreSQL
2. `python manage.py migrate` runs cleanly in container
3. POST /api/auth/register/ creates user and returns JWT tokens
4. POST /api/auth/login/ authenticates and returns tokens
5. GET /api/auth/me/ returns authenticated user
6. POST /api/auth/logout/ invalidates token
</success_criteria>
