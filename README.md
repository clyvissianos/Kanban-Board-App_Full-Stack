# Kanban Board App v.01

A compact full-stack Kanban showcasing pragmatic **ASP.NET Core Web API** (EF Core, DTO mapping, Swagger) with a **React (Vite + TypeScript)** client. The goal: clean vertical slices, clear API contracts, and an easy local run.

---

## TL;DR for Reviewers

- **Stack:** .NET 8, ASP.NET Core Web API, EF Core, SQL Server (LocalDB/Express), React + Vite + TS, Axios, Swagger.
- **Architecture bias:** Keep it simple. Use EF Core directly in the application layer (no Repository/UnitOfWork abstraction for a small app). Prefer **vertical slices** and DTO mapping for explicit boundaries.
- **What to look at:** Controller → Service → EF Core flow, DTOs with AutoMapper, LINQ projections, Vite proxy, and API docs via Swagger.

---

## Run It Locally (2 terminals, ~2–3 minutes)

**API**
```bash
cd Kanban.Api
dotnet restore
dotnet ef database update   # install dotnet-ef if needed
dotnet run                  # Swagger at https://localhost:7050/swagger
```

**Client**
```bash
cd kanban.client
npm i
npm run dev                 # http://localhost:5173
```
If your API runs on a different HTTPS port, set ```VITE_API_BASE``` in ```kanban.client/.env.```

---

**Repository Layout**
```
.
├─ Kanban.Api/            # ASP.NET Core Web API
│  ├─ Controllers/        # BoardsController, ColumnsController, CardsController
│  ├─ Domain/             # Entities (Board, Column, Card), value objects
│  ├─ Data/               # DbContext, migrations, seed
│  ├─ Services/           # Application services (business logic)
│  ├─ Dtos/               # Request/Response models
│  ├─ Mapping/            # AutoMapper profiles
│  ├─ Middleware/         # Error handling, ProblemDetails (if present)
│  └─ Program.cs          # Composition root (DI, Swagger, CORS)
├─ kanban.client/         # React + Vite + TypeScript SPA
│  ├─ src/
│  │  ├─ api/             # axios instances, API hooks
│  │  ├─ components/      # UI components
│  │  ├─ features/        # Kanban board, columns, cards (vertical slices)
│  │  └─ main.tsx         # App bootstrap
└─ kanban-fullstack.sln
```
---

**Architectural Choices (and Why)**

**1) EF Core directly (no generic Repository):**
For small apps, generic repositories add ceremony without real leverage. EF Core already implements the repository/unit-of-work patterns. We keep logic in services and use LINQ projections for DTOs.

**2) Vertical slices over a big service layer:**
Group code by feature (boards/columns/cards) rather than by technical layer. It keeps changes localized and reduces cross-module coupling.

**3) Explicit DTOs & AutoMapper:**
DTOs prevent accidental over-posting and let us shape responses for the client. AutoMapper reduces mapping noise; profiles are close to the feature.

**4) Swagger/OpenAPI first:**
Contracts are visible and testable via /swagger. It’s the quickest path to aligning server + client (and a fast demo during interviews).

---

**Data Model (simplified)**

- Board (Id, Name, CreatedAt, …)
- Column (Id, BoardId, Name, Ordinal, …)
- Card (Id, ColumnId, Title, Description?, Ordinal, CreatedAt, …)

**Notes:**
- Ordinal supports drag-and-drop ordering.
- Consider adding rowversion for optimistic concurrency if multiple users reorder simultaneously.

---

**API Surface (typical endpoints)**

- Boards
  - ```GET /api/boards```
  - ```POST /api/boards```
  - ```GET /api/boards/{id}```
  - ```PUT /api/boards/{id}```
  - ```DELETE /api/boards/{id}```
- Columns
  - ```GET /api/boards/{boardId}/columns```
  - ```POST /api/boards/{boardId}/columns```
  - ```PUT /api/columns/{id}```
  - ```DELETE /api/columns/{id}```
- Cards
  - ```GET /api/columns/{columnId}/cards```
  - ```POST /api/columns/{columnId}/cards```
  - ```PUT /api/cards/{id}```
  - ```DELETE /api/cards/{id}```
- Health
  - ```GET /health → 200 OK when the API is alive (not under /api).```

Example cURL
```bash
curl https://localhost:7050/api/boards
curl -X POST https://localhost:7050/api/boards -H "Content-Type: application/json" -d '{"name":"Demo"}'
```
---

**Error Handling & Validation**

- **Validation:** FluentValidation (recommended) or data annotations at DTO level.
- **Problem Details:** Return RFC 7807 responses for consistent error shapes.
- **Not Found / Conflict:** Prefer explicit 404/409 semantics over silent success.

---

**Client Notes (React + Vite + TS)**

- **API Access:** A base axios instance uses ${VITE_API_BASE}${VITE_API_PREFIX} for REST.
- **Vite Proxy:** Map /api and /health to the backend during npm run dev.
- **Drag & Drop (if included):** Persist reorders by PATCH/PUT to a dedicated endpoint to avoid race conditions.

  **Gotcha:** If axios base is ```${API}/api```, calling ```axios.get('/health')``` will hit ```/api/health (404)```. Use ```fetch('/health')``` (Vite proxies it) or a second axios instance with ```baseURL=${API}```.

---

**Security (when enabled)**

- **AuthN/Z:** JWT bearer auth with role-based authorization attributes.
- **CORS:** Restrict to the client origin in production.
- **Over-posting:** Use DTOs, never bind entities directly from requests.

---

**Known Limitations** 

- No real auth in the minimal demo (can be toggled on with JWT).
- Drag-and-drop persistence may be basic; optimistic concurrency not yet wired.
- No background jobs / outbox; all writes are in-process.

---
