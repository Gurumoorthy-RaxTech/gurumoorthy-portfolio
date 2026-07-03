# ZenCampus Student Management — .NET 9 + React Sample Project

A small, fully working full-stack sample: an **ASP.NET Core 9 Web API** backend
talking to a **React (Vite) SPA** frontend over REST, doing full CRUD
(Create, Read, Update, Delete) on a `Student` entity. It's built as a
learning reference — every file is intentionally simple and thoroughly
commented so you can see exactly how the pieces connect.

```
ZenCampus-DotNet-React-Sample/
├── backend/     ASP.NET Core 9 Web API (C#, EF Core, SQLite)
└── frontend/    React 19 + Vite SPA (JavaScript)
```

---

## 1. The big picture — how the two projects talk to each other

```
┌─────────────────────┐        HTTP requests         ┌──────────────────────┐
│   React (Vite)       │  ────────────────────────►   │  ASP.NET Core Web API │
│   http://localhost:  │   GET/POST/PUT/DELETE         │  http://localhost:    │
│   5173                │   /api/students/...          │  5041                  │
│                       │  ◄────────────────────────   │                        │
│  fetch() → JSON       │        JSON responses         │  EF Core → SQLite     │
└─────────────────────┘                                └──────────────────────┘
```

These are **two completely separate processes** running on two different
ports. That's the standard real-world pattern (and matches how ZenCampus's
actual Angular frontend talks to its .NET backend today):

- The **backend** is a pure JSON API. It knows nothing about HTML, CSS, or
  React — it only exposes `/api/students` endpoints.
- The **frontend** is a pure browser app. It knows nothing about C#, EF Core,
  or SQL — it only calls URLs and renders whatever JSON comes back.

Because they run on different ports (`5173` vs `5041`), the browser treats
them as different **origins**, which is why the backend explicitly enables
**CORS** (Cross-Origin Resource Sharing) for `http://localhost:5173` — see
`backend/Program.cs`. Without that, the browser would silently block every
`fetch()` call from React with a CORS error in the console.

---

## 2. Backend — ASP.NET Core 9 Web API

### 2.1 Project layout

```
backend/
├── Program.cs                    App startup: services, middleware, DB init
├── Controllers/
│   └── StudentsController.cs     The 5 REST endpoints (GET/GET-by-id/POST/PUT/DELETE)
├── Models/
│   └── Student.cs                The EF Core entity (maps 1:1 to the DB table)
├── Dtos/
│   └── StudentDtos.cs            Request-only shapes for POST/PUT bodies
├── Data/
│   └── AppDbContext.cs           EF Core's "session" with the database + seed data
└── backend.csproj                NuGet dependencies (EF Core, SQLite, Swagger)
```

### 2.2 Student.cs — the entity

```csharp
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal FeeDue { get; set; }
    public bool FeesPaid { get; set; }
}
```

This plain C# class is the entity EF Core maps directly to a `Students`
table (one property = one column). `Id` is the primary key by convention
(EF Core recognizes any property literally named `Id` as the PK automatically).

### 2.3 AppDbContext.cs — the database session

`DbContext` is EF Core's central class: it represents one connected session
with the database, and exposes each table as a `DbSet<T>` (`Students` here).
`OnModelCreating` seeds three sample students via `HasData(...)`, so the app
has visible data from the very first run — no manual "insert a row" step.

### 2.4 StudentsController.cs — the 5 REST endpoints

| Verb + Route              | Action                          | Returns |
|----------------------------|----------------------------------|---------|
| `GET /api/students`        | List all students                | `200 OK` + array |
| `GET /api/students/{id}`   | One student by id                | `200 OK` or `404 Not Found` |
| `POST /api/students`       | Create a student                 | `201 Created` + the new student |
| `PUT /api/students/{id}`   | Replace a student's fields       | `204 No Content` or `404` |
| `DELETE /api/students/{id}`| Remove a student                 | `204 No Content` or `404` |

Every method is `async`/`await` end-to-end (`await _db.Students.ToListAsync()`,
etc.) — none of them block the request-handling thread while waiting on the
database, which is the whole point of ASP.NET Core's async pipeline: the
server can serve other requests concurrently while one query is still running.

`[ApiController]` + `[Route("api/[controller]")]` on the class give you:
- Automatic `400 Bad Request` if the request body doesn't match `CreateStudentRequest`'s shape (no manual validation code needed for that).
- The route prefix `api/students` derived from the class name `StudentsController` (the `Controller` suffix is stripped).

### 2.5 Dtos/StudentDtos.cs — why not just use `Student` directly?

`CreateStudentRequest` and `UpdateStudentRequest` are separate `record` types
used **only** as the shape of incoming POST/PUT bodies. This is a deliberate
separation, not duplication for its own sake: it means the API's public
"contract" (what a client is allowed to send) can evolve independently of
the database table. For example, if `Student` later grew an internal
`CreatedByStaffId` column that clients should never be able to set directly,
the DTO simply wouldn't include it — no risk of a client sneaking a value in
through a field the entity happens to expose.

### 2.6 Program.cs — wiring it all together

This is the file that answers "what actually happens when the app starts":

1. **Register services** (dependency injection container):
   - `AddControllers()` — enables the `[ApiController]` routing used above.
   - `AddDbContext<AppDbContext>(...UseSqlite(...))` — registers EF Core
     pointed at a local `zencampus.db` SQLite file. Swap this one line for
     `UseSqlServer(connectionString)` to point at a real SQL Server instance
     without touching any controller or model code — that's the benefit of
     EF Core's provider abstraction.
   - `AddCors(...)` — defines the `ReactAppPolicy` that allows requests
     specifically from `http://localhost:5173`.
   - `AddSwaggerGen()` — generates the interactive API docs at `/swagger`.

2. **Ensure the database exists**: `db.Database.EnsureCreated()` runs once
   at startup, creating `zencampus.db` (and the seeded rows) if it doesn't
   exist yet. *(In a production app you'd use EF Core Migrations instead —
   `dotnet ef migrations add InitialCreate` + `dotnet ef database update` —
   which version-controls schema changes over time. `EnsureCreated()` is
   the simpler option for a learning sample; it can't apply incremental
   schema changes to an existing DB the way migrations can.)*

3. **Configure the middleware pipeline** — the order matters, since each
   request flows through these in sequence:
   `UseSwagger/UseSwaggerUI` → `UseHttpsRedirection` → `UseCors` →
   `UseAuthorization` → `MapControllers`. CORS must run *before*
   `MapControllers` so the policy applies to the actual API routes.

---

## 3. Frontend — React 19 + Vite

### 3.1 Project layout

```
frontend/
├── src/
│   ├── api/
│   │   └── studentApi.js         All fetch() calls to the backend, in one place
│   ├── components/
│   │   ├── StudentForm.jsx       Controlled add/edit form
│   │   └── StudentList.jsx       Table rendering the student list
│   ├── App.jsx                   Owns state, wires form + list + API together
│   ├── App.css / index.css       Styling
│   └── main.jsx                  React entry point (renders <App /> into #root)
├── index.html
└── package.json
```

### 3.2 api/studentApi.js — the only file that knows the backend's URL

```js
const API_BASE = 'http://localhost:5041/api/students';

export function getStudents() {
  return fetch(API_BASE).then(handleResponse);
}
```

Every component calls these functions — never `fetch()` directly. That
means if the backend's URL ever changes (a different port, a deployed
domain, an added `/v2` prefix), there's exactly **one** place in the whole
frontend to update.

### 3.3 components/StudentForm.jsx — a controlled component

The form's field values live in React state (`useState`), not in the raw
DOM inputs — this is the "controlled component" pattern:

```jsx
<input name="name" value={form.name} onChange={handleChange} required />
```

`value={form.name}` means React, not the browser, is the source of truth
for what's currently in that box. One `handleChange` function updates
whichever field changed, using the input's own `name` attribute as the key:

```js
function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
}
```

The **same** form component handles both "Add" and "Edit" — it just checks
whether an `initialData` prop was passed in. This avoids writing two nearly
identical forms.

### 3.4 components/StudentList.jsx — a "dumb" presentational component

`StudentList` has zero knowledge of the API — it receives a `students`
array and two callback props (`onEdit`, `onDelete`) and just renders a
table, calling those callbacks when a button is clicked. This separation
(data/logic in `App.jsx`, rendering in `StudentList.jsx`) is what makes each
piece independently easy to read, reuse, and test.

### 3.5 App.jsx — where it all connects

`App.jsx` is the "smart" component. It:
1. Holds the actual state: `students`, `editingStudent`, `loading`, `error`.
2. Fetches the student list once on mount via `useEffect(() => { loadStudents() }, [])`.
3. Passes `students` + callback functions down as props to `StudentList` and `StudentForm`.
4. Re-fetches the list after every successful create/update/delete, so the
   UI always reflects what's actually in the database (rather than trying
   to manually patch local state to match — simpler and less error-prone
   for a sample this size).

This top-down data flow (state lives high up, data flows down as props,
events flow up as callback calls) is the core React mental model — nothing
here uses more advanced tools like Context or a state library, because a
single-page CRUD app this size doesn't need them.

---

## 4. Running it yourself

**Prerequisites:** .NET 9 SDK, Node.js 18+.

### Start the backend (Terminal 1)

```bash
cd backend
dotnet run --urls http://localhost:5041
```

- First run creates `backend/zencampus.db` (SQLite) with 3 seeded students.
- Swagger UI (try every endpoint interactively): http://localhost:5041/swagger

### Start the frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

- Open http://localhost:5173 — you should see the 3 seeded students, and be
  able to add/edit/delete them, with changes persisted in the SQLite file.

### Verifying it's actually wired up correctly

If the table on the page stays empty or you see a red error banner
("Could not reach the API..."), the most common cause is the backend not
running yet, or running on a different port than `5041` — `frontend/src/api/studentApi.js`'s
`API_BASE` constant is hardcoded to `http://localhost:5041`.

---

## 5. What this sample deliberately leaves out (and why)

Kept out to stay focused as a learning reference — each is a natural
next step once you're comfortable with the CRUD flow above:

- **Authentication/JWT** — every endpoint here is open. A real ZenCampus
  service would add an `authMiddleware`-style JWT check (see the
  `ZenCampus_NodeJS_Complete_Guide.html` / `ZenCampus_WebAPI_Complete_Guide.html`
  guides in `interview_quetions/frontend/` for that pattern).
- **EF Core Migrations** — `EnsureCreated()` is used instead, since it needs
  no extra CLI tooling for a first run; migrations are the production-grade
  choice once the schema needs to evolve over time.
- **Client-side routing** — a single page is enough for one CRUD screen;
  `react-router-dom` becomes worth adding once there's more than one "page".
- **Input validation feedback** — the form relies on basic HTML `required`
  attributes; a production form would validate more thoroughly and surface
  field-level errors from the API's `400` responses.
