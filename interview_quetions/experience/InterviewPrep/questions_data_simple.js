const QUESTIONS = [
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "Walk me through the ASP.NET Core middleware pipeline — how does a request actually flow through it?",
    "what": "The request passes through a chain of middleware, one after another. Each one can pass it to the next, or stop and handle it right there. Things like exception handling, HTTPS redirect, static files, routing, auth, and the endpoint all sit in that chain.",
    "why": "The order you register them in Program.cs decides the order they run in, and getting it wrong causes silent bugs.",
    "when": "This matters every time I touch Program.cs, especially when adding something new like logging or CORS.",
    "example": "In Zen Campus the order is exception handling, HTTPS redirect, static files, routing, CORS, authentication, authorization, then endpoints. I once put our logging middleware near the end and it missed early pipeline failures. Moving it near the top fixed it."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Scenario",
    "question": "Say a teammate swaps UseAuthentication and UseAuthorization, or puts CORS after routing. What actually breaks, and how would you catch it?",
    "what": "If UseAuthorization runs before UseAuthentication, it checks a user identity that isn't set yet, so valid tokens still look unauthenticated. If CORS isn't before routing and auth, preflight OPTIONS requests can get rejected.",
    "why": "This bug doesn't throw a compile error — it just quietly returns 401s or CORS failures that look like token or browser problems.",
    "when": "I check pipeline order first if authenticated requests start failing right after someone edits Program.cs.",
    "example": "In Zen Campus we once moved CORS below UseAuthorization during a cleanup, and front-end calls from a different origin started failing preflight checks. It took a bit to realize it was pipeline order, not a CORS policy problem."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "Explain the different service lifetimes in ASP.NET Core DI — Singleton, Scoped, Transient — and how you decide which to use.",
    "what": "Singleton is one instance for the whole app, Scoped is one instance per request, and Transient gives a new instance every time. A DbContext or repository should almost always be Scoped.",
    "why": "Injecting a Scoped service into a Singleton can leave you with a stale or disposed DbContext — the classic captive dependency bug.",
    "when": "I think about lifetime every time I register a new service, especially anything holding state.",
    "example": "In Zen Campus our Dapper connection factory and EF Core context are Scoped. JWT config and app settings are Singleton since they're read-only. Small stateless helpers like a PDF formatter I leave as Transient."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Scenario",
    "question": "You've got a background service that needs to talk to the database, but DbContext is Scoped. How do you handle that without breaking things?",
    "what": "I don't inject a Scoped DbContext into a long-lived service constructor. Instead I inject IServiceScopeFactory and create a fresh scope, resolving the DbContext from it, each time I need to do work.",
    "why": "This keeps each unit of work isolated instead of sharing one DbContext instance across concurrent operations.",
    "when": "This came up for us with a background hosted job, which is effectively singleton-ish in lifetime.",
    "example": "We have a hosted service in Zen Campus that checks pending fee reminders and sends SMS. The first version injected the repository directly and threw 'second operation started on this context' errors under load. Switching to IServiceScopeFactory with a scope per run fixed it."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "What's the difference between attribute routing and conventional routing, and which do you use for your APIs?",
    "what": "Conventional routing is one global template set up in Program.cs. Attribute routing puts Route, HttpGet, and HttpPost directly on the controller and action, so each endpoint defines its own path.",
    "why": "Attribute routing is clearer for APIs, especially with versioning or nested paths. Conventional routing still fits classic MVC controllers serving views.",
    "when": "I use attribute routing for APIs, always. I use conventional routing for Razor view controllers like attendance and admissions pages.",
    "example": "Our Web API controllers in Zen Campus, like StudentController and BillingController, are attribute-routed under api/v1/students. The MVC controllers rendering admission and attendance pages use the default conventional route."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "How does model binding work in ASP.NET Core, and how do you handle validation?",
    "what": "Model binding maps route values, query strings, form data, and JSON bodies onto action parameters. For validation I use data annotations like Required and StringLength, and check ModelState.IsValid, or rely on ApiController to do that automatically.",
    "why": "Model binding plus validation gives a consistent gate before bad data touches business logic or the database.",
    "when": "Every POST or PUT taking user input — admission forms, payments — needs this, since it's student and financial data.",
    "example": "The dynamic form builder in Zen Campus has admin-configured fields, so standard data annotations don't fully cover it. I wrote a separate validation layer that reads the field config and validates dynamically, on top of ModelState checks for fixed fields."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "What are the different types of filters in ASP.NET Core MVC and when have you actually used a custom one?",
    "what": "There are authorization, resource, action, exception, and result filters, running roughly in that order. Action filters are the ones I use most, running code before and after an action without cluttering it.",
    "why": "Filters avoid repeating the same cross-cutting logic like logging or auditing in every controller.",
    "when": "Whenever I notice the same boilerplate at the start or end of multiple actions, I pull it into a filter.",
    "example": "In Zen Campus we have a custom action filter that logs every API call with user, endpoint, and timing into our centralized logging. There's also an exception filter that formats unhandled exceptions into a consistent error response."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "What's the difference between Razor views in MVC and Razor Pages, and why did you go with one over the other?",
    "what": "Razor views are tied to a controller and action that decides what data to fetch. Razor Pages bundle the view and handler logic into one self-contained file pair.",
    "why": "We stuck with MVC for Zen Campus because admissions, attendance, and billing share a lot of logic, and controllers work well as a coordination layer.",
    "when": "For a small greenfield app I'd pick Razor Pages now. For an interconnected app like our ERP, MVC controllers still fit better.",
    "example": "All of Zen Campus — admissions, attendance, billing, payroll, inventory, student management — is MVC. We looked at Razor Pages for a small reporting tool but stayed consistent with MVC instead."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "How do you approach designing a RESTful Web API — what makes an API actually RESTful versus just an API that happens to use HTTP?",
    "what": "URLs should represent resources, like /api/students/{id}, not actions like /api/getStudent. HTTP methods express the action — GET, POST, PUT/PATCH, DELETE — and status codes should mean something.",
    "why": "This makes an API predictable, so other developers can guess an endpoint's shape without reading docs, and it makes tooling like Swagger work properly.",
    "when": "This is the default for every new Web API endpoint now.",
    "example": "In Zen Campus the student and billing APIs are resource-based, with bills nested under a student and payments under a bill. I pushed for this consistency across services because everything routes through Ocelot, and inconsistent conventions would've made the gateway config a nightmare."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "Talk me through how you use HTTP status codes in your APIs — do you just return 200 and 500 for everything, or is there more nuance?",
    "what": "I use 201 for creates, 204 for a successful action with no body, 400 for bad input, 401 vs 403 for auth vs permissions, 404 for missing resources, and 409 for conflicts. 500 is only for real unhandled server failures.",
    "why": "If everything returns 200 with a flag in the JSON, clients have to parse the body just to know what happened.",
    "when": "I try to be deliberate about this on every endpoint now, though early Zen Campus endpoints weren't.",
    "example": "Our payment processing API originally returned 200 with an error message in the JSON for failed payments, so some failures looked like successes in the UI. Switching to proper 4xx codes let the front end just check response.ok."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "How do you handle API versioning, and why does it matter for something like Zen Campus with multiple modules calling shared services?",
    "what": "We version through the URL segment, like api/v1/students and api/v2/students. For a breaking change we stand up a v2 route alongside v1 instead of mutating the existing contract.",
    "why": "With microservices behind Ocelot, multiple modules call the same API, so you can't change the response shape overnight and expect every consumer to update at once.",
    "when": "Whenever a change would break existing consumers — adding an optional field usually doesn't need a new version, renaming or removing one does.",
    "example": "We hit this on the billing service when payment line items needed a new structure for a new gateway, but an old report module still used the old shape. We stood up v2, kept v1 alive, migrated the report module, then deprecated v1."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "How have you used Swagger or OpenAPI in your projects, and what's it actually good for beyond just docs?",
    "what": "Swagger auto-generates API documentation from controllers and DTOs, with a UI to try endpoints directly and see real responses.",
    "why": "The real win is cutting down back-and-forth with whoever consumes the API — they can look it up instead of pinging me.",
    "when": "Every Web API project has it wired up from day one now.",
    "example": "All our Zen Campus microservices expose Swagger. During the Ocelot gateway setup it helped confirm requests reached the right downstream service. We use Postman alongside it for complex auth headers or scripted flows."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "You've worked with both WCF and Web API — what's the real difference, and why did the bank locker project end up mixing approaches?",
    "what": "WCF is older and heavier, config-driven, and supports many transports. Web API is lighter, HTTP-first, JSON by default, and maps naturally onto REST.",
    "why": "The locker project needed a persistent TCP socket for real-time hardware communication, plus REST for the OTP lifecycle, so it wasn't really a WCF vs Web API choice.",
    "when": "If starting something new today, I'd pick Web API or gRPC, not WCF, unless maintaining existing legacy code.",
    "example": "The locker system's OTP endpoints were plain REST with SQL Server audit logging. For the hardware side I built a TCP socket listener so unlock commands and status updates happened in real time instead of slow HTTP polling."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Scenario",
    "question": "Walk me through migrating something from ASP.NET MVC 4.8 to ASP.NET Core — what actually trips people up?",
    "what": "Controllers, actions, and Razor syntax are mostly mechanical to migrate. The real trip-ups are Web.config becoming appsettings.json and Program.cs, System.Web being gone, and DI changes if you used something like Unity before.",
    "why": "ASP.NET Core is a rewrite, not just a new version, so treating it as a drop-in upgrade gets projects stuck halfway.",
    "when": "I've dealt with this on smaller pieces and shared logic during a transition, not a full rewrite.",
    "example": "We had older RAX utility pieces on 4.8 that needed to move into Zen Campus on Core. The messiest part was old code with implicit dependencies on request context state, which I had to restructure to pass explicitly."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "How do you use async and await in your controllers, and is there ever a case where you'd deliberately keep an action synchronous?",
    "what": "Any action doing I/O — database calls, calling another microservice, hitting the SMS gateway — I make async all the way down. For pure in-memory logic with no I/O, I don't force async.",
    "why": "Async frees up the thread while waiting on I/O, so the server can handle more concurrent requests.",
    "when": "I default to async for any controller action touching the database or another service.",
    "example": "In Zen Campus all our Dapper and EF Core calls in the API layer are async, awaited by the controller actions. Early on I once called .Result inside an async method by mistake, which defeats the point and can deadlock — I caught it in review and now check for it in every PR."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Scenario",
    "question": "Ever run into a deadlock caused by async code? What happened and how'd you fix it?",
    "what": "Early on I had synchronous code calling an async method with .Result or .Wait() instead of awaiting it, which can capture a context and hang waiting on itself.",
    "why": "Mixing sync and async blocking calls is a classic way to cause a deadlock, and it doesn't show up in every environment.",
    "when": "It only bit us where sync-over-async happened in a context with a captured synchronization context, mostly older code.",
    "example": "On an older locker project piece, a helper wrapped an async SMS gateway call but exposed a sync method calling .Result. It worked in testing but locked up under real load. Making the caller chain properly async fixed it."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "What's content negotiation in Web API, and have you had to deal with it in practice?",
    "what": "Content negotiation is how the API decides the response format based on the client's Accept header. ASP.NET Core defaults to JSON but can serve other formats if configured.",
    "why": "Not every consumer wants the same format, though for us it's almost always JSON.",
    "when": "This doesn't come up much day to day since everything's JSON, but it mattered for report exports.",
    "example": "For Zen Campus report generation, a user can get the same data as PDF or Excel. I didn't use Accept-header negotiation for that — I used an explicit query parameter or separate endpoint per format, which fit a UI with actual download buttons better."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "What's the difference between ViewBag, ViewData, and TempData, and when would you actually reach for each?",
    "what": "ViewData is a dictionary from controller to view; ViewBag is the same thing as a dynamic object. TempData persists across a single redirect, stored in session or cookie, then it's gone once read.",
    "why": "ViewBag and ViewData suit small one-off view data, but aren't type-safe. TempData's real use case is the redirect pattern.",
    "when": "I use TempData mainly after a form submit that redirects, and ViewBag for small supporting data.",
    "example": "In Zen Campus, the success banner after an admission form redirect uses TempData. I once had a bug where I set TempData but returned a View directly instead of redirecting, so the message never showed — TempData needs that redirect round-trip."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "Tell me about the custom middleware you've written — walk me through the centralized logging and exception handling piece.",
    "what": "It sits early in the pipeline, right after the built-in exception handler, wrapping the rest of the request in a try/catch. It logs request details and, on an unhandled exception, logs it with context and returns a consistent error response.",
    "why": "Before this, exception handling was scattered across controllers and services with inconsistent formats, making production issues hard to trace.",
    "when": "Every request going through the API pipeline hits this now — it's not opt-in.",
    "example": "This is one of the things I'm proudest of from Zen Campus. Building centralized logging and exception-handling middleware cut production incident resolution time by around 35%, since I can now pinpoint failing calls within minutes."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Technical",
    "question": "How do you configure CORS in ASP.NET Core, and have you run into issues with it?",
    "what": "You define a CORS policy — allowed origins, methods, headers — usually in Program.cs, and apply it globally or per-controller.",
    "why": "With Zen Campus's front end and now microservices, requests cross origins more than before, and without a policy the browser just blocks them.",
    "when": "Any time the front end and API aren't on the exact same origin, including different ports in local dev.",
    "example": "Locally the front end and API ran on different ports and I hadn't set up a dev CORS policy, so every fetch call got blocked. I first assumed it was a token issue before spotting the preflight failure in the console, then added a local dev CORS policy."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Production Issue",
    "question": "Tell me about a real production issue you dealt with in the ERP — something that actually misbehaved for users.",
    "what": "During admission season, response times on student and billing endpoints crawled, and some requests timed out under 1,000-plus concurrent users.",
    "why": "We hadn't done a proper pass on indexing, and some Dapper queries made more round trips than needed, which only broke down under real concurrent load.",
    "when": "This kind of thing shows up specifically under real load, not in dev or normal testing.",
    "example": "We reviewed slow endpoints with SQL Server execution plans, added missing indexes, rewrote queries into stored procedures, and added in-memory caching for reference lookups. That cut query execution time by about 40%, and combined with the logging middleware, brought incident resolution time down by around 35%."
  },
  {
    "category": "ASP.NET Core MVC & Web API",
    "type": "Scenario",
    "question": "If you had to design a Web API layer to reliably handle 1,000+ concurrent users across a microservices setup, what would you actually put in place?",
    "what": "An API gateway like Ocelot in front for routing, load balancing, and rate limiting. Behind that, stateless services, async I/O throughout, proper DB indexing, and caching for stable data.",
    "why": "At real concurrency the bottlenecks are usually threads blocked on I/O, database contention, or one slow downstream call, not raw CPU.",
    "when": "This is how we approached the Zen Campus microservices split from early on, with query optimization and caching added once we saw real bottlenecks.",
    "example": "For Zen Campus, Ocelot handles routing and rate limiting, and each service is its own containerized deployment via Docker Compose so we can scale busier services like billing separately. We split data between SQL Server and MongoDB, and added caching once we saw where things were actually straining."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Technical",
    "question": "What does it mean for PUT to be idempotent but POST not to be, and how does that actually change how you design an endpoint?",
    "what": "Idempotent means calling the same request multiple times leaves the resource in the same state as calling it once. PUT is idempotent since it sends a full representation to a known URI. POST usually isn't, since the server decides the new resource's identity.",
    "why": "This matters most for retries — retrying a PUT is safe, but retrying a POST blindly can create duplicates.",
    "when": "I think about this with mobile clients, flaky networks, or actions with real-world side effects like charging money.",
    "example": "In Zen Campus, the fee payment POST call was retried by the frontend after a timeout even though it had already gone through. We added a client-generated idempotency key checked against existing records before creating a new payment entry, which stopped the double-charge issue."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Technical",
    "question": "What's JSON Patch and how would you use it for a PATCH endpoint in ASP.NET Core?",
    "what": "JSON Patch, from RFC 6902, is an array of operations — add, remove, replace, move — describing exactly what changed on a resource. In ASP.NET Core you use JsonPatchDocument<T> to apply those ops onto the loaded entity.",
    "why": "It avoids overwriting fields the client never touched, which a plain PUT can do if the client's copy is stale.",
    "when": "It's meant for partial updates on resources with many fields where clients usually touch only one or two.",
    "example": "We looked at JSON Patch for student profile updates in Zen Campus but didn't use it since the frontend team wasn't comfortable with the operation array format. Instead we sent a partial DTO with just the changed fields and merged it server-side."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Technical",
    "question": "Do you use HATEOAS in your APIs? Walk me through what it actually is first.",
    "what": "HATEOAS means the API response includes links telling the client what it can do next, like a student record pointing to update, delete, or attendance-history endpoints.",
    "why": "In theory it decouples the client from your URL structure, so routes can change without breaking consumers.",
    "when": "It makes more sense for public APIs with third-party consumers who can't read your source code.",
    "example": "We don't use HATEOAS in Zen Campus — every consumer is our own frontend or a mobile client we control, and everyone works off the Swagger docs. I've seen the concept in payment gateway callback docs though."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Technical",
    "question": "ASP.NET Core has built-in rate limiting since .NET 7. How is that different from the rate limiting you configured in Ocelot?",
    "what": "The built-in System.Threading.RateLimiting middleware attaches limiting strategies per endpoint or globally. Ocelot's rate limiting sits at the gateway in front of all downstream microservices.",
    "why": "Gateway-level limiting doesn't help if something calls a service directly, bypassing the gateway, like webhooks or internal jobs.",
    "when": "I'd use the in-process limiter on an endpoint exposed outside the gateway or for a specific business rule.",
    "example": "In Zen Campus, Ocelot handled rate limiting for the microservices generally, but one payment callback endpoint was hit directly by the provider, bypassing the gateway. At the time we relied on validation and idempotency checks there, but I'd add the built-in RateLimiter middleware too in a redo."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Production Issue",
    "question": "Tell me about a time caching bit you — response caching or output caching gone wrong.",
    "what": "Response and output caching store a full response and serve it back without hitting the controller again. Both depend on getting your vary-by rules right.",
    "why": "If you cache something that looks the same but actually depends on the user or a query parameter, you'll serve wrong data to someone.",
    "when": "Good candidates are read-heavy responses that don't change per request, like reference data or periodic dashboard summaries.",
    "example": "On the Zen Campus attendance dashboard, I cached the summary but didn't vary the cache key by class and section at first. For a short window a teacher saw another class's cached numbers. Adding VaryByQueryKeys explicitly fixed it."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Scenario",
    "question": "How would you use ETags and If-None-Match to cut down bandwidth on an endpoint that's polled frequently?",
    "what": "The server sends an ETag representing the resource's state. The client sends it back as If-None-Match, and if nothing's changed the server returns 304 Not Modified with no body.",
    "why": "For frequently polled data that rarely changes, this saves bandwidth since most of the time nothing changed.",
    "when": "Dashboards or list screens that auto-refresh every few seconds are the classic case.",
    "example": "For Zen Campus attendance and report screens teachers left open and auto-refreshing, I based a freshness check on a LastModified timestamp instead of a full ETag hash. If nothing changed, we returned a lightweight 'no update' response instead of the full list."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Scenario",
    "question": "Walk me through how you'd design a file upload endpoint that needs to handle fairly large files without blowing up memory.",
    "what": "The naive way buffers the whole file into memory with IFormFile, which hurts once files get large with concurrent uploads. The better way streams the multipart data directly to disk or blob storage in chunks, with Kestrel and IIS request size limits raised.",
    "why": "Buffering everything in memory means a handful of large concurrent uploads can spike server memory and slow every other request.",
    "when": "This applies to document uploads, ID proofs, bulk imports — anywhere file size isn't tiny and predictable.",
    "example": "In the Zen Campus admission module, parents uploading ID proofs hit 'request body too large' errors past around 28-30MB. We raised the Kestrel and IIS limits and also changed the handler to stream the file to disk instead of buffering it fully in memory."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Scenario",
    "question": "When would you stream a response instead of building the whole thing and returning it?",
    "what": "Streaming writes the response incrementally as it's generated instead of building the whole payload in memory first. In ASP.NET Core that's writing to the response stream, IAsyncEnumerable, or FileStreamResult.",
    "why": "Building something large entirely in memory before sending means high memory use and a longer wait before the client sees anything.",
    "when": "Bulk exports or any download where the file could be large enough that buffering it fully is wasteful.",
    "example": "The Excel export for school-wide attendance in Zen Campus originally built the whole workbook in a MemoryStream, which spiked memory noticeably for a full-term export. Writing rows to the response stream as they were generated brought that down a lot, though it took a couple of passes to get right."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Scenario",
    "question": "What's the difference between an API gateway and the BFF pattern, and would BFF make sense for something like Zen Campus?",
    "what": "A gateway like Ocelot is a single generic entry point routing to whatever microservices are behind it. BFF builds a tailored API layer per client type, so each UI gets a backend shaped around what it needs.",
    "why": "A generic gateway is simpler when all clients need roughly the same data shape. BFF pays off when different frontends need very different aggregations.",
    "when": "I'd reach for BFF with multiple, quite different client apps, like a full admin portal versus a lightweight parent mobile app.",
    "example": "In Zen Campus we're on the Ocelot gateway model, with staff and parent-facing screens going through the same routes today. It's come up that the parent portal might eventually want its own lighter-weight API, which is basically the BFF conversation, but we haven't built it."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Production Issue",
    "question": "Have you ever run into problems from returning EF entities directly instead of DTOs? What happened?",
    "what": "Returning an EF entity directly sends out whatever's on that class, including navigation properties, whether you meant to or not. A DTO is a plain object you control explicitly.",
    "why": "Entities with navigation properties can create circular references during serialization, and binding straight to an entity opens up overposting risk.",
    "when": "This is an always-do-it thing for anything client-facing, though it's easy to skip early on.",
    "example": "Early in the Zen Campus student module, a get-student-details endpoint returned the EF entity directly and hit a circular navigation chain during serialization. I introduced proper DTOs for the response and also added a request DTO to fix the same overposting risk on the update endpoint."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Technical",
    "question": "When would you reach for FluentValidation over plain DataAnnotations attributes?",
    "what": "DataAnnotations attributes sit on the model and work fine for simple field-level rules. FluentValidation moves validation into an AbstractValidator<T> class with RuleFor chains, which handles conditional and cross-field rules more cleanly.",
    "why": "Once you need rules like 'required only if category is X,' DataAnnotations gets awkward fast compared to a fluent rule chain.",
    "when": "Complex forms with conditional logic are my trigger — simple CRUD DTOs are fine with DataAnnotations.",
    "example": "The Zen Campus admission forms have required fields that differ by category and quota. DataAnnotations got hard to read as conditions stacked up, so I looked into FluentValidation for that module, though it's not rolled out everywhere yet."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Technical",
    "question": "What's ProblemDetails and RFC 7807, and how does it relate to the exception-handling middleware you built?",
    "what": "RFC 7807 defines a standard error response shape — type, title, status, detail, instance. ASP.NET Core's ProblemDetails class can format errors this way automatically.",
    "why": "Without a standard, every error response is shaped differently and the frontend has to write custom parsing per endpoint.",
    "when": "This is central to any global exception handler, so every unhandled exception gets the same response shape.",
    "example": "My centralized exception-handling middleware in Zen Campus originally returned a custom error object. I later moved it to the ProblemDetails shape plus a correlation ID, which let support and dev match an error response straight to a log entry."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Production Issue",
    "question": "What's the difference between throttling per IP versus per user, and when did that distinction actually matter for you?",
    "what": "Per-IP throttling counts requests from a source address. Per-user throttling ties the limit to an authenticated identity regardless of IP.",
    "why": "Per-IP breaks down when many legitimate users share an IP, and doesn't stop someone rotating IPs. Per-user is more precise but needs authentication first.",
    "when": "I'd want per-user limits on anything sensitive tied to an account, like OTP generation, with per-IP as a coarser first line of defense.",
    "example": "On the bank locker OTP project, gateway-level IP throttling could both block legitimate users on one shared network and fail to stop someone switching networks to spam requests. We added a check keyed to the account itself, which helped us get zero unauthorized access incidents."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Scenario",
    "question": "How would you design a webhook receiver endpoint for something like a payment gateway callback?",
    "what": "I'd verify the sender's signature, respond fast with a 200 so the gateway doesn't retry, and do the heavy processing separately rather than inline. The endpoint also needs to tolerate receiving the same event more than once.",
    "why": "A slow or heavy synchronous handler can make the gateway time out and resend the same webhook, causing duplicate processing if you're not checking for it.",
    "when": "Any integration where a third party calls back asynchronously, most commonly payment confirmation.",
    "example": "In the Zen Campus billing module, our first payment callback handler processed synchronously and got bitten by a duplicate callback for one transaction. Checking the transaction reference against existing records before processing fixed the double-processing issue."
  },
  {
    "category": "Web API — Deep Dive",
    "type": "Scenario",
    "question": "For machine-to-machine calls — like your service talking to an SMS gateway or hardware — would you use an API key or JWT, and why?",
    "what": "JWT carries identity and claims, good when you need to know who's calling. An API key is a simpler shared secret that just says 'this caller is trusted,' without user context.",
    "why": "User-facing endpoints need JWT for claims, expiry, and tying actions to a person. External providers or constrained devices usually expect a simpler API key.",
    "when": "I default to JWT with RBAC for internal, user-facing, or service-to-service calls, and API keys for external providers or devices.",
    "example": "In Zen Campus, JWT plus role-based access covers user-facing and internal microservice calls. On the bank locker project, the SMS gateway used a provider-issued API key, and the locker hardware, talking over TCP, used a device-level shared token instead of JWT."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "What's the real difference between microservices and a monolith, and why did you move Zen Campus to microservices?",
    "what": "A monolith is one codebase, one process, usually one database, all deployed together. Microservices split that into separate services, each with its own data and its own deployment, talking to each other over the network.",
    "why": "It's about blast radius and independence — a bug in billing shouldn't take down attendance, and I don't want to redeploy everything to fix one form.",
    "when": "It's worth it once the app has genuinely separable domains and enough traffic or team size to make independent scaling pay off.",
    "example": "In Zen Campus we split admissions, attendance, billing, payroll, inventory, and student management into separate ASP.NET Core Web API services behind Ocelot. It wasn't a clean split on day one — some early services overlapped, so we refactored boundaries a few months in."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "How did you handle the database-per-service pattern, and what problems did it actually cause you?",
    "what": "Each service owns its own database. No other service queries it directly — it has to go through the API.",
    "why": "It decouples services, so a schema change in billing won't break attendance's queries. The tradeoff is you lose easy joins across domains.",
    "when": "It works well when services are truly separate domains, but reporting across services needs deliberate handling.",
    "example": "Billing had its own SQL Server database, and some student document data went into MongoDB. A fee-vs-attendance report needed data from both services, so we pulled from each and combined it in a reporting layer. The first version was clunky before we improved it."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "How do the services in your microservices ecosystem actually talk to each other?",
    "what": "Mostly synchronous REST over HTTP, usually through Ocelot, sometimes directly for internal calls that don't need gateway features.",
    "why": "REST was the pragmatic choice since the team already knew Web API and we had no message broker set up.",
    "when": "Sync REST works when the caller genuinely needs an answer right away, like checking a student exists before marking attendance.",
    "example": "Attendance service calls student service synchronously to validate a student ID. Under load these calls stack up, which is part of why we added Ocelot's QoS timeouts later."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "Walk me through how you actually configured Ocelot for the Zen Campus services — what does ocelot.json look like in practice?",
    "what": "Each route has an UpstreamPathTemplate, a DownstreamPathTemplate and DownstreamHostAndPorts, plus allowed HTTP methods. You register it with AddOcelot and wire it in with UseOcelot.",
    "why": "Without it, every client would need to know every service's internal address, and every service would need public exposure.",
    "when": "You need this as soon as you have more than one backend service a client has to reach.",
    "example": "We had routes like /admissions/*, /billing/*, /attendance/* mapped to each container's port. I once lost an afternoon to a 404 caused by a trailing slash mismatch between upstream and downstream templates."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "What load balancing strategy did you use in Ocelot, and why that one?",
    "what": "Ocelot lets you list multiple DownstreamHostAndPorts for a route and pick a load balancer type. We used round robin to spread requests across instances.",
    "why": "Without load balancing, all traffic would still hit the first instance in the list, defeating the point of scaling out.",
    "when": "This matters once you run more than one replica of a service, which for us was during high-traffic windows.",
    "example": "During admission season we scaled attendance and billing to extra container instances, and Ocelot round-robinned across them. It wasn't perfectly even since round robin ignores request weight, so I looked into least-connection balancing but never switched over."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "How did you set up rate limiting in Ocelot, and what was it actually protecting against?",
    "what": "Ocelot has rate limit options per route — a limit, a period, and it returns a 429 once a client goes over that.",
    "why": "It stops one client or a bad script from overloading a downstream service and slowing it down for everyone else.",
    "when": "Worth adding on sensitive or expensive endpoints like login, OTP requests, or report generation.",
    "example": "We added rate limits on login and report generation after a client-side retry loop kept hitting login repeatedly. It wasn't malicious, just a bad retry setting, but the rate limit kept it from causing an outage."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "Did you use Ocelot's request aggregation feature — what problem was that solving?",
    "what": "Aggregation lets one upstream route fan out to several downstream services and merge the responses into a single payload.",
    "why": "It cuts round trips — instead of the client calling three services separately, it gets one merged response back.",
    "when": "Useful for dashboard or summary pages that need data from multiple services at once.",
    "example": "The Zen Campus dashboard needed student counts, attendance percentage, and fee dues together. We aggregated the count widgets through Ocelot, which helped, though the config got messy so one heavier view got its own dedicated summary endpoint instead."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "Did you set up service discovery like Consul, or was routing static?",
    "what": "It was static. The downstream host in ocelot.json pointed straight at the docker-compose service name, and Compose's internal DNS resolved it.",
    "why": "We didn't need dynamic discovery because our services and their names were fixed and known ahead of time.",
    "when": "Static config is fine while the environment is stable; you'd want real service discovery on something like Kubernetes.",
    "example": "The Ocelot config just used the compose service name, like billing-service, and Docker handled resolution. Moving to Kubernetes would need proper service discovery, which is on my list of gaps I'm reading up on."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "How did you handle a downstream service getting slow or unresponsive — did you use Polly or Ocelot's QoS options?",
    "what": "Ocelot's QoS settings wrap Polly's circuit breaker — settings like exceptions allowed before breaking, break duration, and a timeout per route. Past that threshold, the gateway stops calling the service and fails fast.",
    "why": "Without it, a slow service keeps getting hammered with requests that time out, tying up threads on the gateway too.",
    "when": "Worth having on any downstream call that does real database work under load.",
    "example": "Month-end billing reports slowed that service down and requests piled up, affecting other calls through the gateway. Adding the circuit breaker made the gateway fail fast on billing calls instead of queuing them forever."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "Does the gateway handle authentication, or does every microservice validate the JWT itself?",
    "what": "Both. Ocelot validates the JWT at the gateway and rejects bad tokens early. Services still check role claims themselves for actual permission.",
    "why": "Rejecting bad tokens at the gateway saves every service from repeating that logic, but relying only on the gateway is risky if one route is misconfigured.",
    "when": "Gateway auth checks if a token is valid; service-level RBAC checks if that role can do this action.",
    "example": "The gateway validates the token, then the payroll service checks the role claim so only admin or HR can access it. We added that second layer after realizing a valid token alone didn't mean the caller should be allowed to act."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Scenario",
    "question": "Your resume says you designed microservices serving 1000+ concurrent users. What would've actually broken if you hadn't planned for that load?",
    "what": "Connection pool exhaustion, slow unindexed queries multiplying under load, a single gateway instance becoming a bottleneck, and no caching meaning every request hits the database.",
    "why": "At low traffic these shortcuts stay hidden; real concurrent load turns them into timeouts and stacked-up requests.",
    "when": "This shows up during predictable spikes — for us, fee due dates and admission season.",
    "example": "Fee due date caused timeouts in billing from N+1 style queries. We fixed those, added indexes, moved logic to stored procedures with Dapper (the 40% query time cut on my resume), added in-memory caching, and scaled billing to extra instances. The next cycle was smoother, though we still watched logs nervously."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "How do you version a microservice's API without breaking whoever's already calling it?",
    "what": "Route-based versioning — /v1/ and /v2/ as separate routes in Ocelot, pointing at the same service if compatible or a new deployment if the contract changed.",
    "why": "Clients can't all update instantly, so keeping the old route alive gives them time to migrate.",
    "when": "Only needed for breaking changes, not for adding a new optional field.",
    "example": "We added a mandatory field to the admission API for a compliance requirement, so we stood up /v2/ and kept /v1/ working until the frontend switched over. An earlier big-bang change on a different service broke the mobile team's morning — a lesson learned."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Production Issue",
    "question": "Tell me about a time a downstream call timed out or failed in production — what actually happened and how did you fix it?",
    "what": "Attendance service calls to student service started timing out one busy morning because student service had a slow query kick in under load, with no timeout configured on that route.",
    "why": "With no timeout or breaker, slow responses backed up thread by thread until the gateway itself started struggling.",
    "when": "This shows up whenever a call has no timeout and its dependency can get slow under real load.",
    "example": "Teachers couldn't mark attendance for close to twenty minutes before we noticed. We added a QoS timeout and circuit breaker, fixed the slow query, and added centralized logging — a big reason incident resolution time dropped afterward."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Scenario",
    "question": "If a parent registers a new student and pays the admission fee in one flow, but that touches both the student service and the billing service, how do you keep that consistent without one shared database transaction?",
    "what": "You can't wrap two services' databases in one transaction, so the pattern is a saga — do step one, and if step two fails, undo or mark step one incomplete instead of pretending it succeeded.",
    "why": "A distributed transaction would tightly couple the services, defeating the reason we split them up. Eventual consistency with a clear compensating action is the more honest tradeoff.",
    "when": "Comes up whenever a single business workflow needs to touch more than one service's data.",
    "example": "For admission plus fee payment, we created the student record as 'pending', called billing, and marked admission failed with a retry option if billing failed. It's not elegant — a proper message queue with compensating events would be better if this had to scale further."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "Do your services have health checks, and how do those tie into Ocelot or your deployment?",
    "what": "Each service exposes a /health endpoint that checks DB connectivity, wired into Docker's healthcheck so an unhealthy container gets flagged or restarted.",
    "why": "A process being 'running' isn't the same as it being able to serve a request, so you want to know it's genuinely responsive before routing traffic to it.",
    "when": "Matters constantly in production, especially before routing traffic to a fresh instance or after a deploy.",
    "example": "Our first health check just returned 200 without checking anything. A container with an exhausted DB connection pool still showed healthy while failing requests, so we fixed it to run a lightweight DB query instead."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "What did 'independent deployment' actually look like day to day — could you really ship one service without touching the others?",
    "what": "Yes, mostly — each service had its own Dockerfile and image, built and pushed on its own. Redeploying one didn't require touching others as long as its route and contract stayed the same.",
    "why": "A fix to one module doesn't force you to retest or redeploy everything else, which shrinks both risk and time to ship.",
    "when": "Matters most for hotfixes or when different modules need different release schedules.",
    "example": "A rounding bug in billing's fee calculation got fixed same-day by rebuilding just that container. Attendance and payroll never even restarted — a big improvement over earlier when any change meant redeploying the whole app."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Production Issue",
    "question": "Microservices are known for the 'chatty' communication problem — did that actually hit you, and how did you deal with it?",
    "what": "One page or user action quietly triggers a bunch of sequential service calls, and each hop's latency stacks up fast under load.",
    "why": "Every network call has overhead that doesn't show up when testing locally with one user, but compounds under real concurrent traffic.",
    "when": "Comes up most on dashboard or summary pages that need data from many different services.",
    "example": "The dashboard called student, attendance, billing, and inventory one after another, taking several seconds during the morning login rush. We fixed part of it with Ocelot aggregation and part with caching pre-fetched counts, over a couple of sprints."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Technical",
    "question": "How do you trace a single request as it moves across several services, especially once something's gone wrong?",
    "what": "We generate a correlation ID at the gateway when a request comes in, pass it as a header to every downstream call, and every service logs it on every line.",
    "why": "Without it, tracing a bug means comparing timestamps across separate log files by hand. With a correlation ID you just search for it once.",
    "when": "You need this the moment a request crosses more than one service — basically every action in the app.",
    "example": "This was part of our centralized logging middleware, and it's directly why incident resolution got faster. Before that, tracing an issue meant opening multiple log files side by side and eyeballing timestamps."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Production Issue",
    "question": "If Ocelot goes down, doesn't that mean your whole gateway is a single point of failure? Did that ever actually bite you?",
    "what": "Yes, it's a real risk — if the gateway is down, nothing's reachable even if every backend service is healthy. We didn't run multiple gateway instances initially.",
    "why": "The gateway needs the same reliability as any critical service, since everything else depends on it to be reached.",
    "when": "This is a risk from day one if the gateway is your only path in.",
    "example": "We once redeployed the gateway without keeping the old instance up until the new one was confirmed healthy, causing a few minutes of downtime across every module during school hours. After that we changed the deploy process to health-check the new instance before cutting traffic over."
  },
  {
    "category": "Microservices & Ocelot API Gateway",
    "type": "Scenario",
    "question": "If you had to add a brand-new microservice — say, a hostel management module — to the existing Zen Campus setup, walk me through what you'd actually do.",
    "what": "Design its own database schema, build a standalone ASP.NET Core Web API, reuse the same JWT auth and logging middleware pattern, containerize it, add it to docker-compose with a health check, and register a route in ocelot.json.",
    "why": "The benefit of the architecture is that adding one new bounded service doesn't mean touching or redeploying anything already running.",
    "when": "You'd do this when the new thing is genuinely a separate domain with its own data and lifecycle.",
    "example": "This is close to what happened when we added inventory — reused the existing project template, gave it its own SQL Server schema, and added one route in ocelot.json. It took a fraction of the time the first service took, since the pattern was already worked out."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "You've used Ocelot for synchronous routing between services. Have you worked with an event-driven setup using something like RabbitMQ or Kafka, and how would that be different from what you built at Zen Campus?",
    "what": "Event-driven means services publish events to a broker instead of calling each other directly, and other services subscribe and react. RabbitMQ is a traditional queue for task routing; Kafka is a distributed log built for high-throughput streaming and replay.",
    "why": "With a broker, the producer doesn't wait and both sides don't need to be up at the same time, giving resilience and room to add new subscribers later.",
    "when": "You'd reach for this when one action needs to trigger multiple side effects and the caller shouldn't be blocked waiting on all of them.",
    "example": "Everything in Zen Campus goes through Ocelot as synchronous REST — we haven't put a broker in production. I've thought about publishing a FeePaid event instead of billing calling hostel and inventory directly, and that's where I'd start if I introduced one."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "What's CQRS, in your own words, and do you think it would've helped anywhere in the Zen Campus reporting or billing modules?",
    "what": "CQRS splits the write path and read path into separate models — commands enforce business rules, and queries are shaped just for reading, sometimes in a different data store.",
    "why": "Writes care about validation and consistency, reads care about speed and shape, especially for dashboards joining many tables.",
    "when": "Makes sense when read and write load are very different, or reporting queries are dragging down the transactional side.",
    "example": "We never fully split it at Zen Campus — we optimized the read side directly with indexing, stored procs, and caching, getting close to a 40% improvement. If reporting kept growing, I'd push for a proper read-model split, maybe a reporting replica first."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Scenario",
    "question": "A school principal calls you — she paid a student's fee, the payment page said success, but the ledger on her dashboard still shows it as pending five minutes later. How do you explain that to her without using the word 'eventual consistency'?",
    "what": "I'd tell her the payment itself went through fine, but a couple of other systems, like the ledger view, update themselves a little after the fact instead of instantly.",
    "why": "Non-technical stakeholders need reassurance nothing's lost and a sense of timing, not a technical explanation.",
    "when": "Comes up any time a payment or status update is processed in one service and displayed via another.",
    "example": "Our billing dashboard sometimes lagged a few seconds behind a payment because of caching we'd added. Now if a staff member flags it, I tell them the payment's recorded and safe, and the page will catch up shortly, since the receipt always reflects the write-side truth immediately."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Scenario",
    "question": "Say Zen Campus had started as one big ASP.NET MVC monolith instead of microservices from day one. How would you have used the strangler fig pattern to migrate it out without a risky big-bang rewrite?",
    "what": "Strangler fig means putting a routing layer in front of the old monolith and building a new service for one capability at a time, routing just that traffic to it until the monolith shrinks to nothing.",
    "why": "Rewriting everything at once is high risk; doing it slice by slice makes each cutover small, testable, and reversible.",
    "when": "Fits when the old system handles real production traffic you can't afford downtime on, and you can carve out a self-contained module.",
    "example": "Our Ocelot gateway already routes by path this way, even without a legacy monolith behind it. If I'd inherited an old MVC app, I'd start with the cleanest module, attendance, stand it up as its own Web API, and route it through Ocelot while the monolith served everything else."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "What's actually different between an API gateway like Ocelot and a service mesh like Istio or Linkerd? Would Zen Campus ever need one?",
    "what": "Ocelot sits at the edge, handling traffic from clients — routing, auth, rate limiting. A service mesh handles service-to-service traffic inside the cluster, with a sidecar proxy per service doing retries, mTLS, and traffic shaping.",
    "why": "They solve different problems, and a mesh adds real operational weight, so you don't reach for it unless internal traffic complexity justifies it.",
    "when": "A mesh makes sense once many services talk to each other directly and you need consistent mTLS, retries, and observability without hand-rolling it.",
    "example": "We only use Ocelot at the edge — service-to-service calls mostly go through it too, so our internal traffic hasn't gotten complex enough to need a mesh. I know Istio and Linkerd conceptually but haven't run one hands-on."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "You mentioned correlation IDs for tracking a request through the gateway and downstream services. How is distributed tracing, like what OpenTelemetry gives you, different from just grepping logs by correlation ID?",
    "what": "A correlation ID lets you pull every log line for one request, but you still read a flat list. Distributed tracing captures spans with start and end times and parent-child relationships, giving you an actual timeline.",
    "why": "With just logs, finding the slow hop in a chain means comparing timestamps manually; a trace shows immediately which hop was slow.",
    "when": "You'd want it once you have enough services that eyeballing logs stops being practical, or latency issues are intermittent.",
    "example": "Our centralized logging with correlation IDs got us roughly a 35% cut in incident resolution time. We didn't wire up full OpenTelemetry with span-level timing though — that's the honest gap, and it's what I'd add next for the slower reporting endpoints."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "How did you handle common code, like JWT validation or the exception-handling middleware, across all your Zen Campus microservices — one shared library, or did each service just have its own copy?",
    "what": "A shared library keeps things consistent, fix once and every service picks it up, but couples services to its release cycle. Duplicating avoids that coupling but lets the logic drift over time.",
    "why": "Microservices are supposed to deploy independently, and a shared library that forces every service to redeploy together undermines that.",
    "when": "A shared library makes sense for stable cross-cutting stuff like JWT validation or logging; duplicate anything closer to business logic.",
    "example": "We pulled JWT auth, RBAC, and logging and exception middleware into a shared internal library, which made the RBAC rollout manageable. Billing calculation and admission validation logic stayed local on purpose, so a billing change wouldn't force an attendance redeploy."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "If billing needs to save a payment record in the database and also notify other services that the payment happened, how do you make sure you don't end up with the DB write succeeding but the event never going out, or the other way round?",
    "what": "That's the outbox pattern — you write the business record and an 'event to send' row into the database in the same transaction, and a separate background process reads that table and publishes the events afterward.",
    "why": "A database commit and a message publish are two different systems that can't be wrapped in one transaction, so a crash between them can lose or wrongly announce an event.",
    "when": "Use it wherever a state change needs to reliably trigger something in another service asynchronously, especially for money or audit trails.",
    "example": "We don't have this in production — billing writes to SQL Server and any downstream effect happens through a direct synchronous call, so there's no dual-write problem to solve. If billing published events asynchronously later, I'd want the outbox in place from day one."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Production Issue",
    "question": "You changed a column name in the student service's database while optimizing queries, and it turns out another service — or the reporting layer — was still expecting the old schema. Walk me through what happened and how you'd prevent it next time.",
    "what": "A backwards-incompatible database change in one service breaks another service or report that queried the same table directly, even though the migrating service itself still works fine.",
    "why": "Each service is supposed to own its data independently, but once anything shares a schema, even indirectly, that independence is fake and a rename becomes a coordination problem.",
    "when": "Happens any time you rename or drop a column, or restructure a table other services or reports read from directly.",
    "example": "I renamed a column during a Dapper optimization pass and tested the student service fine, but an Excel report that queried that column directly broke the next day. I now use expand-and-contract — add the new column, migrate every consumer, then drop the old one, instead of renaming in place."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Technical",
    "question": "How do you make sure the API contract between, say, the billing service and whatever consumes it through Ocelot doesn't silently break, without spinning up every single service for every test run?",
    "what": "There's a spectrum — unit tests for logic, integration tests against a real database, and contract testing, where a consumer's expectations of a provider's API get checked automatically without both sides running live. Tools like Pact do this.",
    "why": "Full end-to-end tests across services are slow and flaky, so contract tests catch a renamed field cheaply before it hits staging.",
    "when": "Worth it once you have enough services and teams that a schema change in one can silently break another.",
    "example": "We relied on unit tests above 90% coverage plus Swagger and Postman collections to verify request and response shapes. We never set up formal Pact-style contract testing — I saw a Swagger doc go stale once, so that's where I'd start if pushing this forward."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Scenario",
    "question": "If your team moved to a 'you build it, you run it' model for Zen Campus services, what would actually change for you day to day compared to now?",
    "what": "The team that writes a service also owns running it in production, monitoring it, getting paged, and fixing it, instead of handing it to a separate ops team.",
    "why": "Knowing you'll get paged for a bad deploy changes how you write code — better logging and more defensive error handling.",
    "when": "Fits naturally in microservices since each team already owns a bounded piece end to end.",
    "example": "This is close to what already happens at RAX Tech — I've done production support on modules I built, like debugging OTP delivery timing on the bank locker system. I'd want better on-call rotation and alerting set up ahead of time if it were formalized."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Production Issue",
    "question": "Suppose the student service in a school ERP like Zen Campus quietly absorbed admissions, attendance, and half the reporting logic over a couple of years, and now every change to it risks breaking three other things. How would you go about splitting it apart?",
    "what": "First map out what's inside the service by domain, then extract the least entangled piece first as its own service, redirecting gateway routes to it once proven — strangler-fig-ing your own service.",
    "why": "A service running for years has a lot of implicit behavior, so pulling it apart incrementally lets you isolate what caused a regression.",
    "when": "You know it's time when a service becomes the bottleneck for every release or teams are blocked on its deploy window.",
    "example": "Our modules stayed mostly separate from early on, but attendance did start absorbing reporting logic that dashboards kept needing. My plan would've been to pull those reporting queries into their own service so a reporting change couldn't risk the attendance-marking flow."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Scenario",
    "question": "If you were starting a brand-new project today, would you go straight to microservices like Zen Campus, or start with a modular monolith? How would you actually decide?",
    "what": "It depends on team size, how well you know the domain boundaries, and expected scale. Microservices buy independent deployment and scaling but add network calls and infra overhead. A modular monolith gives clean internal boundaries without the network tax.",
    "why": "Splitting too early, before you understand the domain, usually means drawing service boundaries wrong, which is more painful to fix across a network than within one codebase.",
    "when": "I'd lean microservices when the team's split by domain and real scale is expected; otherwise start modular monolith and extract services later.",
    "example": "Zen Campus made sense as microservices since the domains were already distinct and the user load justified the investment in Ocelot and Docker. For a smaller project with two developers, I'd build a modular monolith and pull pieces out only once there's an actual reason."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Production Issue",
    "question": "A new build of the billing service goes out and something's clearly wrong — payments are failing intermittently. Walk me through how you'd roll it back, and what you'd want set up so that next time it's less of a scramble.",
    "what": "The fastest safe move is redeploying the previous known-good Docker image rather than hotfixing under pressure. Blue-green keeps two environments and switches traffic between them; canary sends a small percentage of traffic to the new version first.",
    "why": "Either strategy cuts blast radius and recovery time compared to noticing a bad deploy after it's already serving all traffic.",
    "when": "Canary suits customer-facing flows that are hard to fully test beforehand, like payments; blue-green suits near-instant rollback needs.",
    "example": "Our actual rollback was manual — redeploy the previous image tag, check the health check, watch the logs. We never set up canary or blue-green routing through Ocelot, and that's the gap I'd want to close first for payment flows specifically."
  },
  {
    "category": "Microservices — Deep Dive",
    "type": "Production Issue",
    "question": "During the bank locker OTP project, the TCP socket connection between the backend and the locker hardware would occasionally retry a message. What stops that retry from, say, unlocking the locker twice or sending a duplicate SMS?",
    "what": "This is about idempotency — tagging each request with a unique ID, checking if it's already been processed, and if so, skipping the action instead of repeating it.",
    "why": "Networks retry — a connection can drop mid-acknowledgment even though the action succeeded, so you have to design for the same message arriving more than once.",
    "when": "Needed anywhere a physical action or real-world side effect isn't safe to repeat, like unlocking hardware or sending an SMS.",
    "example": "On the locker system, we tracked OTP and request state in SQL Server, so a repeated unlock request was treated as already-handled instead of re-triggering the hardware. We also tracked whether an OTP had already been sent before dispatching another one, since a duplicate SMS would erode trust."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "How do you decide between Dapper and EF Core for a given module?",
    "what": "Dapper is a thin wrapper over ADO.NET — I write the SQL myself and it maps results to objects. EF Core gives me LINQ, change tracking, and migrations, but with more overhead.",
    "why": "I pick based on the module — Dapper for full control on heavy reads, EF Core to save boilerplate on CRUD-heavy forms.",
    "when": "High-read screens like reports and dashboards get Dapper. Forms with lots of writes and business rules get EF Core.",
    "example": "In Zen Campus, attendance and billing reports used Dapper with stored procs since those screens got hit constantly with multi-table joins. The student admission module stayed in EF Core because the tracking and cascading saves kept the code simple."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "Explain QueryMultiple in Dapper and where multi-mapping helped you.",
    "what": "QueryMultiple runs several result sets off one stored proc call and reads them off in order with GridReader, so I get one round trip instead of several. Multi-mapping lets Dapper map a joined query straight into a parent object with a nested child object.",
    "why": "Round trips are expensive, so if a screen needs several related pieces of data I'd rather pay for one connection and one network hop.",
    "when": "I use QueryMultiple for dashboard-type screens needing several pieces of data at once, and multi-mapping whenever results naturally have a parent-child shape.",
    "example": "The Zen Campus admin dashboard pulls total students, today's attendance percentage, and pending fee count in one stored proc using QueryMultiple. My first version ran three separate Dapper calls — it worked, but merging them into one made it faster."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "Have you run into the N+1 query problem? Walk me through it.",
    "what": "N+1 is fetching a list with one query, then firing a separate query per item for related data. A list of 50 students can turn into 51 database calls instead of 2.",
    "why": "Each extra call is a round trip with its own overhead, and it's a common reason a screen that worked fine in testing turns slow in production.",
    "when": "It shows up mostly with EF Core lazy loading or a loop calling a repository method inside it.",
    "example": "In the Zen Campus attendance report, we were calling a separate method per student for their attendance percentage — hundreds of extra calls across the school. I rewrote it as one Dapper query with a join and GROUP BY, and that change was a big chunk of the 40% improvement we reported."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "What is EF Core's change tracker and how does it decide what to update?",
    "what": "When EF Core loads a tracked entity, it snapshots the property values. On SaveChanges, it compares current values to that snapshot and only updates the columns that actually changed.",
    "why": "This makes simple edits easy, but every tracked entity sits in memory with its snapshot, which costs memory and CPU for data you don't need to modify.",
    "when": "It matters most with long-lived DbContexts or large read-only lists.",
    "example": "On a fee-payment screen, we loaded a student with all their fee line items just to display them, and the context tracked every row unnecessarily. Switching that query to AsNoTracking cut memory churn, especially under concurrent load."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "Lazy loading vs eager loading in EF Core — what's the actual tradeoff?",
    "what": "Eager loading with Include() pulls related data in the same query upfront, in one round trip. Lazy loading fetches related data only when you touch it, which can quietly cause N+1.",
    "why": "Lazy loading feels convenient while coding, but it hides the real number of DB calls until you're staring at a slow endpoint in production.",
    "when": "I use eager loading whenever I already know I need the related data. I avoid lazy loading for anything list-based.",
    "example": "Early in Zen Campus, lazy loading was silently issuing a query per student for class info on a fee report. Once I turned on logging and saw the query count, I switched that path to Include() and moved the report to Dapper."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "When would you use a stored procedure instead of an inline/parameterized query from code?",
    "what": "Stored procs run on SQL Server and are easier to tune independently for complex logic with joins and conditions. Inline parameterized queries are simpler to version-control with the app code.",
    "why": "It's less about security — both are safe if parameterized — and more about where heavy logic should live.",
    "when": "Reports and billing calculations with several joins go in a proc. Simple lookups and single-table CRUD stay inline.",
    "example": "In Zen Campus, most reporting and billing queries became stored procs — the fee summary report alone joined six or seven tables. Simple lookups like fetching a student by admission number stayed as plain parameterized Dapper calls."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "What's a clustered index and how many can a table have?",
    "what": "A clustered index physically orders a table's data on disk by the index key, so the table itself is the index. A table can only have one, since data can only be sorted one way.",
    "why": "Every non-clustered index carries the clustered key as a pointer back to the row, so a bad clustered key choice causes page splits and fragmentation.",
    "when": "It's usually the primary key by default, which works well for a sequential identity column.",
    "example": "Most Zen Campus tables used the identity primary key as the clustered index. For the attendance table, which grew fast and was mostly queried by date range, aligning the clustered index with that query pattern made a real difference."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "Explain non-clustered indexes and what makes an index 'covering'.",
    "what": "A non-clustered index is a separate sorted structure of just the indexed columns, with a pointer back to the row. A covering index includes enough columns that SQL Server can answer the query from the index alone, without a lookup back to the table.",
    "why": "Without covering, every match still triggers a lookup back to the table, and that cost adds up at scale.",
    "when": "Worth it for queries that run constantly, like dashboards and list screens. Not worth overdoing on heavy-write tables.",
    "example": "For the attendance summary query in Zen Campus, I added a non-clustered index on date and class, and included status so the query was fully covered. The key lookup operator disappeared from the execution plan — one of the wins behind the 40% number."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Production Issue",
    "question": "Walk me through how you'd read an execution plan when a query suddenly gets slow.",
    "what": "I pull the actual execution plan in SSMS, not estimated, and look for expensive operators first — table scans, key lookups with high row counts, or costly sorts. Usually one or two operators eat most of the cost.",
    "why": "A query that reads fine in code can still be doing a full table scan, and the plan shows exactly where the time goes instead of guessing.",
    "when": "Whenever a query that used to be fast suddenly isn't, or a new report is slow from day one.",
    "example": "A fee collection report in Zen Campus started timing out past a few thousand records. The plan showed a table scan where I expected a seek, because the WHERE column had no index. Adding the index flipped it to a seek and the report went from 8-9 seconds to under a second."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Production Issue",
    "question": "Describe a deadlock you've dealt with — how did you find the cause and fix it?",
    "what": "A deadlock is two transactions each holding a lock the other needs, so SQL Server kills one as the victim. I find the cause using the app error plus a deadlock graph from Extended Events or the SQL Server error log.",
    "why": "The app error just says a transaction was deadlocked — the deadlock graph shows the actual lock order so I know what to reorder.",
    "when": "Comes up most under concurrent writes to the same rows, like payments or attendance marking during busy periods.",
    "example": "In Zen Campus, two stored procs updated the fee balance and payment log table in opposite order, which occasionally deadlocked during peak collection. I made both procs touch the tables in the same order and shortened the transaction scope. It happened maybe a handful of times a week before the fix."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "What are SQL Server transaction isolation levels and which have you actually used?",
    "what": "Isolation levels control how much one transaction can see of another's in-progress changes — from Read Uncommitted at the loose end to Serializable at the strict end, plus Snapshot isolation using row versioning.",
    "why": "Higher isolation means more correctness but more blocking, so picking the strictest level everywhere tanks throughput.",
    "when": "Read Committed is fine for most screens. I go stricter for financial or balance-sensitive operations where a race condition could cause real damage.",
    "example": "For the bank locker project, OTP validation used explicit transactions with row-level locking so two requests couldn't validate the same OTP at once. For reading student records for display, the default Read Committed was more than enough."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "How do you prevent SQL injection in your data access code?",
    "what": "I parameterize everything and never concatenate user input into a SQL string. Dapper takes an anonymous object or DynamicParameters, and EF Core LINQ is parameterized automatically.",
    "why": "String-concatenated SQL lets user input become part of the query logic, letting someone inject their own SQL.",
    "when": "Every query touching user input, no exceptions — search boxes, login forms, filters.",
    "example": "In the bank locker project, OTP validation and user lookup by mobile number were all parameterized through Dapper's DynamicParameters, plus input validation as a second line of defense. In Zen Campus, the same rule applied to search filters on the student list."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "What is connection pooling and have you ever had issues with it?",
    "what": "ADO.NET keeps a pool of open connections to SQL Server behind the scenes, so opening and closing a SqlConnection usually borrows from the pool instead of opening a new one. It's on by default.",
    "why": "Opening a real connection is expensive, so without pooling every query would pay that cost.",
    "when": "It matters most when connections aren't disposed properly, which can exhaust the pool and cause timeouts.",
    "example": "In Zen Campus, under moderate load, some Dapper calls weren't wrapped in using blocks, so connections weren't returned to the pool fast enough and we saw 'connection pool full' errors. Wrapping every Dapper call in a using statement fixed it."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "How would you paginate a large dataset efficiently — say a list of 50,000 students or attendance records?",
    "what": "OFFSET-FETCH is the standard SQL Server approach, but it slows down on later pages since SQL Server still scans past the skipped rows. Keyset pagination, filtering on 'rows after the last one I saw,' scales better for deep pages but takes more work.",
    "why": "Paginating the whole result set in memory works fine with a few hundred rows and then breaks in production with real data volumes.",
    "when": "OFFSET-FETCH is fine for admin screens where users rarely go past page 10. Keyset pagination is for logs or history screens with very deep scrolling.",
    "example": "The student list and fee reports in Zen Campus used OFFSET-FETCH with a proper index on the sort column, which was plenty since most users stay on the first couple pages. I'd only reach for keyset pagination if we needed infinite-scroll on attendance history."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "How do EF Core migrations work and what's gone wrong for you with them?",
    "what": "I change my entity classes, run Add-Migration to generate a C# migration describing the schema diff, review it, then run Update-Database to apply it. EF tracks applied migrations in a __EFMigrationsHistory table.",
    "why": "It keeps the schema in source control, so a team applies the same migrations in the same order instead of manual scripts.",
    "when": "I always review the generated migration before applying it, since auto-generated migrations can do more than you intended.",
    "example": "I once renamed a property expecting a clean rename, but EF generated a migration that dropped and recreated the column, which would've lost data. I caught it in review and rewrote it with a RenameColumn call instead. Now I always read the generated migration before running Update-Database."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Production Issue",
    "question": "Tell me about a slow report query you had to optimize — what did you actually do, step by step?",
    "what": "I reproduce the issue and get the actual execution plan first, not a guess. Then I check indexes on WHERE, JOIN, and ORDER BY columns, look for scans that should be seeks, and check for stale statistics.",
    "why": "Adding caching before fixing a bad query just delays the pain instead of fixing it.",
    "when": "Any report that's gone from 'a bit slow' to 'users are complaining' or timing out.",
    "example": "The billing summary report in Zen Campus joined student, fee structure, payment, and discount tables and crawled once schools had years of payment history. I added a covering index, converted a correlated subquery into a JOIN, and moved it into a stored proc — it went from about 6 seconds to 1.2 seconds. That, plus similar fixes elsewhere, got us to the 40% overall improvement."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "When and how have you used caching for query results instead of hitting the DB every time?",
    "what": "I use IMemoryCache to cache a query result for a fixed duration or until something invalidates it, so later requests read from memory instead of SQL Server. Cache invalidation is always the tricky part.",
    "why": "Some data barely changes — class lists, fee structure, dropdown lookups — so hitting the DB every request wastes work.",
    "when": "Good for read-heavy, low-change data. I avoid caching transactional or balance-sensitive data, or keep the TTL very short.",
    "example": "In Zen Campus, we cached class list, section list, and fee category lookups. It was part of the work behind the 40% number, though indexing and query rewrites did more — it mainly took pressure off high-traffic screens like admission forms."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "How do you handle bulk inserts or batch updates efficiently — say importing a thousand student records at once?",
    "what": "Row-by-row inserts through Dapper or EF are slow since each one is a separate round trip. For real bulk work I use SqlBulkCopy, batch multiple rows into one INSERT, or pass a table-valued parameter into a stored proc.",
    "why": "Round-trip cost dominates for small operations, so a thousand single-row inserts is far worse than a thousand times the work of one insert.",
    "when": "Anytime there's an import — bulk admission uploads, attendance import from Excel. Not worth it for a handful of records.",
    "example": "For bulk student import in Zen Campus, looping and inserting one by one through Dapper took 20-30 seconds for a thousand rows. Switching to a table-valued parameter into a stored proc for one set-based INSERT dropped it to a couple seconds."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "Explain the core ADO.NET objects — Connection, Command, DataReader — and where Dapper sits on top of them.",
    "what": "SqlConnection is the connection to the database, SqlCommand represents the query or proc plus its parameters, and SqlDataReader streams results back row by row without loading everything into memory. Dapper is built on all three — it runs the command, reads the DataReader, and maps each row into your objects automatically.",
    "why": "Knowing what's underneath Dapper helps when something goes wrong, like a connection not disposing or QueryMultiple needing the reader to fully drain.",
    "when": "I still drop to raw ADO.NET when I need something Dapper doesn't give directly, like streaming a very large export.",
    "example": "On the bank locker project, the audit trail logging code used raw ADO.NET with SqlCommand and parameters directly, since that logging path needed to be lightweight with no ORM overhead for something firing on every OTP event."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "What are the ACID properties and can you tie them to something real you've built?",
    "what": "Atomicity means a transaction is all-or-nothing. Consistency means the database moves between valid states. Isolation means concurrent transactions don't interfere. Durability means a commit survives a crash.",
    "why": "These are why you wrap multi-step operations in a transaction — without atomicity, a crash halfway through leaves data half-updated.",
    "when": "Anywhere money, access control, or security is involved, I'm thinking about this.",
    "example": "In the bank locker project, validating an OTP, marking it used, and logging the attempt had to happen together — if marking-used failed after validation succeeded, someone could reuse the OTP. That whole flow ran inside one transaction with rollback on failure, part of why we had zero unauthorized access incidents."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "Can adding more indexes ever make performance worse? What's the tradeoff?",
    "what": "Yes — every index has to be maintained on every insert, update, or delete, so a table with many indexes and heavy writes pays that cost on every write. Indexes also take storage and can fragment over time.",
    "why": "Reads get faster with the right index, but writes get slower with too many, so it depends on the table's read/write ratio.",
    "when": "I add an index for a query pattern that's clearly the bottleneck. I think twice on write-heavy tables like logs.",
    "example": "On the bank locker audit trail table, I kept indexes minimal since it gets an insert on every OTP event and is only occasionally queried. On the Zen Campus student and attendance tables, which are read far more than written, indexing more aggressively made sense."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "You mentioned a 40% query time reduction on Zen Campus — walk me through what that actually involved end to end.",
    "what": "It was a combination of things over a few sprints once profiling flagged slow spots — rewriting the worst EF LINQ queries into Dapper, adding indexes, fixing N+1 patterns, moving heavy logic into stored procs, and adding in-memory caching for lookup data.",
    "why": "The slowness had multiple root causes — missing indexes, unnecessary round trips, badly structured LINQ — so fixing only one wouldn't have gotten us to 40%.",
    "when": "This came from a general performance push once schools reported real users noticing lag on admission, attendance, and report screens.",
    "example": "The biggest contributors were the attendance report N+1 fix, the billing report going from about 6 seconds to 1.2, and switching list screens from tracked EF queries to AsNoTracking or Dapper. Measured before and after across key screens, it worked out to roughly a 40% cut in average query time."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "You also mentioned reducing OTP validation response time by 50% on the bank locker project — how did you get there?",
    "what": "The original OTP flow made several separate DB round trips — fetch OTP, check user status, check locker status, update, then audit log. I collapsed most of that into one Dapper call with a stored proc, using QueryMultiple where I still needed related data back.",
    "why": "OTP validation is on the critical path for someone standing at a physical locker, so every extra round trip is milliseconds the user feels.",
    "when": "This was during the initial build of the OTP lifecycle APIs, once early testing showed validation was slower than it should be.",
    "example": "Validation was noticeably slow before the change, enough that testers commented on it. After collapsing the round trips into one stored proc call and adding an index on the OTP lookup column, we roughly halved the response time — the 50% figure — on top of sub-3-second SMS delivery."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Technical",
    "question": "What's AsNoTracking in EF Core and when do you always use it?",
    "what": "AsNoTracking tells EF Core to skip snapshotting entities for change tracking, since you're only reading and never calling SaveChanges. It makes materialization lighter.",
    "why": "There's no reason to pay tracking overhead for data you're only displaying and never modifying.",
    "when": "Any read-only query — list screens, reports, dropdowns, detail views you're not editing.",
    "example": "Early EF Core queries in Zen Campus used the default tracked context everywhere, including pure display screens. Applying AsNoTracking to read-only paths noticeably reduced memory pressure under concurrent load. Now it's a habit — if I'm not saving, it's AsNoTracking."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "Describe a multi-table update you handled with Dapper transactions — how did you make sure it stayed consistent?",
    "what": "I open a connection, begin a transaction explicitly, pass that same transaction into every Dapper call, and commit only after every step succeeds, wrapped in a try/catch that rolls back on failure.",
    "why": "Dapper doesn't manage transactions automatically like EF's SaveChanges, so it's on me to make sure every call in the sequence uses the same transaction object.",
    "when": "Any operation touching more than one table where a partial write would leave things inconsistent.",
    "example": "In the Zen Campus fee payment flow, recording the payment, updating the balance, and inserting an audit entry all had to happen together in one SqlTransaction. I once forgot to pass the transaction into the third call, and testing a forced rollback showed the audit entry still appeared even though the payment didn't. I fixed it and now check for this in code review."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Production Issue",
    "question": "A report that used to run fine is now timing out after months in production with more data — what's your first move?",
    "what": "I check if statistics are stale, since SQL Server's optimizer relies on stats to pick a good plan and can pick a bad one after months of data growth. I run UPDATE STATISTICS or check auto-update settings, then compare the execution plan against what I'd expect.",
    "why": "The code didn't change, but the data volume did, and the cached plan is now wrong for the new data shape.",
    "when": "Any time something 'used to be fine' and nobody touched the code — that's the signature of a stats or fragmentation issue.",
    "example": "This happened with the attendance report in Zen Campus after months of active use — the plan showed a scan where I expected a seek, from fragmentation and outdated stats. Rebuilding the index and updating stats fixed it immediately, no code change needed, and we set up scheduled maintenance after that."
  },
  {
    "category": "Dapper, EF Core & SQL Server",
    "type": "Scenario",
    "question": "If you had to explain to a junior dev why their EF Core LINQ query is generating terrible SQL, how would you go about diagnosing it?",
    "what": "I turn on EF Core logging to see the actual generated SQL, since LINQ that looks fine in C# can translate into something ugly, like client-side evaluation or an unnecessary subquery per row.",
    "why": "LINQ is an abstraction that leaks — reasonable-looking C# can generate bad SQL, and you'd never know without checking what SQL comes out.",
    "when": "Any time a LINQ query feels slower than it should for what looks like a simple filter.",
    "example": "A junior teammate's LINQ query used a computed property inside a Where clause that EF Core couldn't translate, so it pulled the whole table into memory and filtered client-side. It looked fine in C# and ran fine on small dev data, then fell over with real data. We looked at the generated SQL together and rewrote the filter so EF could translate it directly."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "When would you still reach for SqlDataAdapter and a DataSet or DataTable instead of Dapper or EF Core, and why hasn't that pattern completely died out?",
    "what": "SqlDataAdapter.Fill() pulls a result into a DataTable in memory and closes the connection. You edit the DataTable offline, and adapter.Update() figures out what changed and pushes inserts, updates, and deletes back, tracking RowState automatically.",
    "why": "It's mostly a dead pattern for web work, but the automatic change-tracking and native DataGridView binding are genuinely useful for desktop grids.",
    "when": "I'd use it on an older WinForms tool needing inline grid editing without hand-rolling dirty-row tracking.",
    "example": "We have a WinForms admin console for the locker hardware that ops staff use locally to review and correct device records. It still fills a DataTable and binds it to a DataGridView, and I call adapter.Update(dataSet) to save. Rewriting it in Dapper wouldn't buy much since only one screen touches it."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "Dapper lets you just pass an anonymous object for parameters. When do you bother creating explicit SqlParameter or DynamicParameters with SqlDbType instead?",
    "what": "Anonymous objects work fine most of the time since Dapper infers the type. That breaks down with decimals needing specific precision, output parameters, table-valued parameters, or strings needing a fixed size.",
    "why": "Inferred NVARCHAR length can vary per call, which makes SQL Server cache a separate execution plan per length and bloat the plan cache on a busy proc.",
    "when": "I go explicit for output parameters, hot-path procs where I've seen plan cache churn, or decimal/money columns.",
    "example": "On the Zen Campus billing module, fee amounts are decimal(18,2). I was passing decimals in an anonymous object at first, but switched to DynamicParameters with explicit SqlDbType.Decimal and precision/scale once I got cautious about rounding on discount calculations."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "What's the actual difference between command timeout and connection timeout, and why does mixing them up cause confusion?",
    "what": "Connection Timeout, set in the connection string, controls how long ADO.NET waits to open a connection, default 15 seconds. Command Timeout, set on the SqlCommand, controls how long to wait for that query to finish once the connection is already open, default 30 seconds.",
    "why": "People bump the wrong one — increasing Connection Timeout does nothing if the connection opens fine but the query is just slow.",
    "when": "I touch CommandTimeout when a specific report or job legitimately needs more time, and Connection Timeout only when opens themselves are slow.",
    "example": "A heavy attendance/billing export report in Zen Campus kept throwing timeout exceptions. A teammate first tried cranking Connection Timeout, which didn't help since the connection opened fine. I set CommandTimeout to 120 on just that one SqlCommand instead."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Scenario",
    "question": "Tell me about a time you used a manual SqlTransaction across several SqlCommands instead of relying on Dapper's transaction overload or TransactionScope.",
    "what": "I open the connection, call BeginTransaction(), and assign that same transaction to every SqlCommand run against it. I Commit() if everything succeeds, Rollback() in the catch, and dispose the connection in a finally.",
    "why": "It gives tight, explicit control when mixing raw ADO.NET calls, without pulling in TransactionScope's ambient transaction, which can escalate to a distributed transaction.",
    "when": "Multi-step writes that must be atomic, especially with an audit trail, where a partial write would be bad.",
    "example": "On the bank locker OTP project, unlocking a locker touched four steps — mark OTP consumed, insert audit log, update locker status, log the hardware command. I wrapped those in one manual SqlTransaction so a failed audit insert would roll back everything, since we couldn't have a locker open with no audit record."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Production Issue",
    "question": "We had a large export report ballooning in memory. Walk me through how you diagnosed whether the fix was DataTable vs DataReader.",
    "what": "A DataTable loads the entire result set into memory before you can use it. A SqlDataReader streams forward-only, one row at a time, so you can write each row out without holding the whole set in RAM — but you lose re-sorting and the connection stays open longer.",
    "why": "Buffering everything in a DataTable before writing a single byte to the response is what blows up memory on a large or unpredictable report.",
    "when": "I default to streaming for exports approaching tens of thousands of rows. Small, bounded result sets are fine as a DataTable.",
    "example": "The attendance and billing export in Zen Campus used SqlDataAdapter.Fill into a DataTable, and memory spiked hard when a bigger school ran a month-end export, killing a couple requests. I rewrote it to stream with a raw SqlDataReader straight into the Excel writer, and memory usage dropped noticeably."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "Explain the difference between Dapper's Execute, Query, QueryFirstOrDefault, and QuerySingleOrDefault — specifically when each one throws.",
    "what": "Execute is for statements with no rows returned, like inserts and updates, and gives back the affected row count. Query<T> returns zero, one, or many rows with no exception. QueryFirstOrDefault takes the first row if any exist, ignoring extras. QuerySingleOrDefault returns default on zero rows but throws if more than one row comes back.",
    "why": "The choice encodes an assumption about the data — for a unique lookup, I want it to fail loudly if that assumption is wrong.",
    "when": "QuerySingleOrDefault for lookups by a unique key, QueryFirstOrDefault for 'give me the latest record' with an ORDER BY, and Query for genuine lists.",
    "example": "I used QuerySingleOrDefault to fetch a student by admission number in Zen Campus, and it actually threw in production once — a bulk import had created two students with the same admission number. QueryFirstOrDefault would have silently returned one and hidden the duplication."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "Have you used Dapper.Contrib or similar extension libraries for basic CRUD? What's the trade-off compared to hand-writing the SQL yourself?",
    "what": "Dapper.Contrib gives Get<T>, GetAll<T>, Insert<T>, Update<T>, Delete<T> based on attributes on your POCO, skipping repetitive SQL for plain entities.",
    "why": "It saves time on simple single-table CRUD but falls apart with joins, projections, soft deletes, or composite keys, which describes most real business logic.",
    "when": "I use it for master/reference data screens with generic CRUD, and go back to hand-written SQL for anything domain-heavy.",
    "example": "In Zen Campus's dynamic form builder and master data screens like fee heads, Insert<T> and Update<T> from Contrib cut out boilerplate. For a table needing a clean soft-delete flag, Contrib wasn't built for that, so I wrote the UPDATE by hand instead."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Production Issue",
    "question": "Have you ever been bitten by a nullable SQL Server column not matching your C# model? What happened?",
    "what": "If a column is nullable in the database but the C# property is a non-nullable value type, reading a real NULL blows up at runtime — Dapper throws a mapping exception, and raw ADO.NET throws unless you check IsDBNull first.",
    "why": "It hides in plain sight because test data almost always has the field populated, so it passes QA and fails on the one real record missing it.",
    "when": "Whenever I'm modeling a table where a column was made nullable later, or legacy data has real gaps.",
    "example": "A student model in Zen Campus had a transfer-certificate date column, nullable in the DB, but the C# property was DateTime instead of DateTime?. It worked in dev with seeded data but blew up in production on a batch of students without a TC date. I patched the model to DateTime? and added null handling on the Dapper and raw ADO.NET reads."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Scenario",
    "question": "Why does async ADO.NET — ExecuteReaderAsync and friends — matter differently in a WinForms desktop app versus an ASP.NET Core web request?",
    "what": "In WinForms, a synchronous DB call on the UI thread freezes the whole form. In a web app, a sync call ties up a thread-pool thread, which under load can exhaust the pool and hurt throughput without any single user noticing a freeze.",
    "why": "One shows up immediately as a frozen window; the other shows up as gradual throughput degradation you only notice under real load.",
    "when": "Any WinForms screen doing more than a trivial local read, and basically every controller action doing DB work on the web side.",
    "example": "The locker admin console had a synchronous SqlDataReader call on a button click that froze the form for a couple seconds once the audit log table grew. Swapping to async/await with ExecuteReaderAsync fixed it. On Zen Campus's Web API, we already default to async Dapper calls everywhere since we serve over a thousand concurrent users."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "How do you read an output parameter or a return value from a stored procedure using raw ADO.NET?",
    "what": "I add a SqlParameter with Direction set to Output or ReturnValue, set CommandType to StoredProcedure, execute it, and read parameter.Value afterward. If I used ExecuteReader, I need to close the reader first before the value is available.",
    "why": "It's how a lot of legacy procs communicate a status code or generated ID without an extra round trip.",
    "when": "Whenever dealing with older stored procs from before Dapper's DynamicParameters, or on the bank locker project where some procs return status via return value.",
    "example": "The OTP generation proc on the locker project returned @OTPId as an output parameter and @ReturnCode as the return value. I first called it with ExecuteReader and tried reading the output before closing the reader, which returned null. Switching to ExecuteNonQuery, since I didn't need a result set, fixed it immediately."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Scenario",
    "question": "Describe a time you batched multiple SQL commands into one round trip instead of firing them one at a time.",
    "what": "Instead of looping one INSERT per row through Dapper, I build a single multi-row INSERT or pass a table-valued parameter into a stored proc that handles the whole set server-side in one call.",
    "why": "Every round trip costs network latency on top of execution time, which adds up fast on real networks even though it's invisible on localhost.",
    "when": "Any bulk write where the row count is more than a handful.",
    "example": "Marking attendance for a class in Zen Campus used to be a loop, one Dapper call per student — 40 round trips for a class of 40, visibly slow on slower school internet. I changed it to one multi-row insert through a stored proc with a table-valued parameter, and it went from a couple seconds to basically instant."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "How do you think about connection string security — integrated security versus SQL auth, and do you ever encrypt the connection string itself?",
    "what": "Integrated Security uses the current Windows identity with no password in config, needing a trusted domain or service account. SQL auth needs a User Id and Password, which I treat as a real secret via environment variables or a secrets manager, never in source control.",
    "why": "A leaked SQL-auth connection string is basically a leaked master key to the database.",
    "when": "Integrated security works when the app and DB are in the same trusted network. SQL auth is basically mandatory once services run in Docker containers.",
    "example": "Zen Campus's microservices run in Docker Compose, so each service reads its connection string from an environment variable injected at container start rather than appsettings.json. I once almost committed a local appsettings.Development.json with a plain SQL auth password, caught it in the diff before pushing, and gitignored it properly after."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Production Issue",
    "question": "Tell me about a production issue caused by transient SQL errors and how you handled retries.",
    "what": "Transient faults like deadlock victims or brief connection drops often succeed if you just retry. The fix is a retry wrapper around the specific DB call with a short backoff and a capped attempt count, only for operations safe to retry.",
    "why": "Without that, a transient blip gets surfaced to the user as a hard failure that would've worked with one more try.",
    "when": "High-concurrency write paths where multiple processes hit the same rows around the same time.",
    "example": "The billing service in Zen Campus threw deadlock exceptions during month-end runs when jobs and live requests hit the same fee tables. I added a Polly-based retry wrapper around that Dapper Execute call, two or three retries with exponential backoff, and almost every deadlock victim succeeded on retry without the user seeing an error."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Technical",
    "question": "If a stored procedure returns three separate result sets, how would you read all of them using SqlDataReader directly, without Dapper's QueryMultiple?",
    "what": "ExecuteReader starts on the first result set. I loop reader.Read() for those rows, call reader.NextResult() to move to the next set, and repeat, re-mapping columns by hand each time.",
    "why": "Forgetting NextResult() is a real bug that silently misreads the wrong columns instead of throwing.",
    "when": "This mostly shows up in legacy code predating Dapper — I'd use QueryMultiple if writing it fresh.",
    "example": "A dashboard proc in Zen Campus returned attendance summary counts, then a top-absentees list. Older inherited ADO.NET code had forgotten the NextResult() call and kept reading the first result set's schema, so student names quietly landed in count fields. I refactored it to Dapper's QueryMultiple once I found it."
  },
  {
    "category": "ADO.NET & Dapper — Deep Dive",
    "type": "Production Issue",
    "question": "Have you ever hit the 'There is already an open DataReader associated with this Command' error? What was causing it and how did you actually fix it?",
    "what": "A SqlDataReader keeps its connection busy until closed, so running a second command on the same connection while the first reader is open throws this exception. The proper fix is closing or materializing the first reader before opening the second, rather than just enabling MultipleActiveResultSets.",
    "why": "It almost always signals a design smell — querying inside a loop against the same open connection — and MARS can mask that instead of fixing it.",
    "when": "Legacy WinForms or ADO.NET code where someone looped over a reader and fired a second query per row on the same connection.",
    "example": "On the locker admin console, inherited code looped over a reader of locker devices and opened a second command per row for each device's heartbeat, throwing the exception once there were two or more devices. Instead of enabling MARS, I pulled the device list into a List<T> first, closed the reader, then queried separately."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Have you worked with table partitioning in SQL Server? Walk me through when you'd actually reach for it.",
    "what": "Partitioning splits one big table into physical chunks, usually by date range, while it still looks like one table to queries. For example, a five-year attendance table can be split by academic year.",
    "why": "Queries and maintenance only touch the relevant partition, and you can switch a partition out instantly for archiving instead of a slow DELETE.",
    "when": "I only consider it once a table has tens of millions of rows with a clear time-based access pattern.",
    "example": "We discussed partitioning for the Zen Campus attendance table since it grows every school day. We never shipped it in production — instead we archived old academic years into a separate history table due to time constraints. I did test partitioning in a sandbox and understand the switch mechanics."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "How do you use ROW_NUMBER, RANK, and OVER/PARTITION BY in your day-to-day queries?",
    "what": "Window functions compute values across a group of rows without collapsing them like GROUP BY does. You get every row back, plus extra context like its rank or position.",
    "why": "The classic use is getting the latest record per group, like the most recent payment per student, without a slow correlated subquery.",
    "when": "I use it anytime I need 'top N per group' or 'latest record per entity' logic.",
    "example": "In the Zen Campus billing dashboard, we needed the latest fee payment per student. The original correlated subquery slowed down as student count grew. I rewrote it with ROW_NUMBER() OVER (PARTITION BY StudentId ORDER BY PaymentDate DESC) and filtered rn = 1 — much faster."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Explain CTEs to me — when do you use a plain one versus a recursive one, and where have you actually used them?",
    "what": "A CTE is a named result set defined with WITH before the main query, mainly for readability instead of nesting subqueries. A recursive CTE has an anchor query plus a part that references itself, used for hierarchical data.",
    "why": "Plain CTEs break a messy report query into readable steps. Recursive CTEs handle tree-shaped data where you don't know how many levels deep it goes.",
    "when": "I use a recursive CTE for parent-child chains of unknown depth, and a plain CTE when a query gets hard to read as one block.",
    "example": "In Zen Campus payroll, staff report up through coordinator, HOD, then principal. I used a recursive CTE to build that whole chain in one query for an approval report. I had to add MAXRECURSION after a bad data row caused an accidental loop."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "When do you reach for a temp table versus a table variable inside a stored procedure?",
    "what": "Both hold intermediate results, but a temp table (#temp) lives in tempdb and gets real statistics, so the optimizer knows its row count. A table variable doesn't get statistics the same way — SQL Server used to assume just one row, which can wreck the plan on anything but tiny data.",
    "why": "Table variables are fine for small lookup sets and are lighter on logging. For larger row counts where the optimizer needs good join decisions, a temp table with real stats wins.",
    "when": "I default to table variables for small data, and switch to temp tables once row count could realistically grow.",
    "example": "In a billing stored proc, I used a table variable to stage filtered records before joining. The optimizer assumed one row, picked a nested loop join, and it fell apart at a few thousand rows. Switching to a #temp table with an index on the join column fixed it instantly."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "What's the difference between a regular view, an indexed view, and have you actually used either in production?",
    "what": "A regular view is just a saved SELECT statement — it runs the query every time. An indexed view actually stores the result on disk with a unique clustered index, but it comes with restrictions like schema binding and no outer joins.",
    "why": "Regular views hide join complexity so my Dapper queries stay simple. Indexed views trade write overhead for faster reads, which only makes sense for stable, heavily-read data.",
    "when": "I use plain views constantly for readability, and indexed views only for a read-heavy aggregate that isn't a good fit for caching.",
    "example": "I use regular views a lot in Zen Campus, like a student summary view that hides three or four joins. I've never shipped an indexed view to production — the restrictions felt too limiting since our billing tables change often, so we used in-memory caching for hot read paths instead."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "When would you use a database trigger, and when do you deliberately avoid them?",
    "what": "A trigger is code that fires automatically on insert, update, or delete — AFTER or INSTEAD OF. It's handy for enforcing something that must happen no matter what touches the table.",
    "why": "The problem is triggers are invisible — a dev looking at application code won't know an insert is quietly writing to another table too, and chained triggers make debugging a scavenger hunt.",
    "when": "I keep logic in the application layer unless it truly needs to run no matter what touches the table.",
    "example": "On the bank locker OTP project, we needed an audit trail for generate, validate, and expire events. I first considered a trigger, but request context like who initiated the action wasn't cleanly available inside one. I logged it explicitly from the Dapper layer instead, keeping it visible in code."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Have you used computed columns? What are they, and any gotchas you've run into?",
    "what": "A computed column is built from an expression using other columns in the same row. You can mark it PERSISTED to store it instead of recalculating every read, and even index it if deterministic.",
    "why": "They save you from repeating the same calculation in every query and getting it slightly wrong somewhere.",
    "when": "I persist and index one when a simple derived value gets filtered or sorted on frequently.",
    "example": "In the billing module, I added a computed TotalAmount column (Fee plus LateFee minus Discount) and made it PERSISTED so I could index it and filter outstanding dues quickly. Before that, reports recalculated it inline with slightly different rounding logic, causing a mismatch that took a while to track down."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "What's a filtered index, and where did that actually help you?",
    "what": "A filtered index is a nonclustered index with a WHERE clause built in, so it only covers a subset of rows instead of the whole table.",
    "why": "It's smaller and its statistics are more accurate, which matters when a column is heavily skewed toward one value.",
    "when": "I use it when a status column has a small fraction of interesting rows, like active versus historical.",
    "example": "On the bank locker project, the OTP table has Pending, Validated, and Expired statuses. Only a handful are Pending at any time, but thousands pile up as Expired. A normal index on Status got bloated, so I switched to a filtered index on Status = 'Pending', and the validate lookup got noticeably faster."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Have you used SQL Server full-text search? How's it different from a plain LIKE query?",
    "what": "Full-text search builds a word-based index and lets you query with CONTAINS or FREETEXT, with stemming and ranking. A LIKE '%keyword%' with a leading wildcard can't use a regular index — it's a full scan every time.",
    "why": "Once a table is big enough, leading-wildcard scans get slow. Full-text search is actually built for free text instead of faking it with string matching.",
    "when": "I use it for genuine free-text search features like notices or complaint descriptions, not exact or prefix matches.",
    "example": "We had a search-notices feature in Zen Campus for circulars and announcements. It started with LIKE '%keyword%', which got sluggish as notice history piled up, so I moved it to full-text search with CONTAINS. The index population schedule caught me off guard at first — new notices weren't showing up right away until the index caught up."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Have you used query hints? What's the risk of relying on them too much?",
    "what": "Hints like OPTION(RECOMPILE), MAXDOP, FORCESEEK, or join hints force the optimizer into a specific plan instead of letting it choose. WITH(NOLOCK) is probably the one everyone's used at least once.",
    "why": "The optimizer usually gets it right, but parameter sniffing or stale stats can push it into a bad plan. A hint fixes that in the moment, but as data changes over time it can quietly become the wrong choice.",
    "when": "I only reach for a hint after confirming it's a plan problem and ruling out stats or missing indexes.",
    "example": "We had an attendance report proc with wildly varying runtime — classic parameter sniffing, where the first-compiled plan was wrong for other date ranges. OPTION(RECOMPILE) fixed it but added CPU overhead under our concurrent load. I rewrote it with OPTIMIZE FOR UNKNOWN instead for a more balanced plan without recompiling every call."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "How do statistics and cardinality estimation affect query performance, and how would you check if stats are stale?",
    "what": "SQL Server keeps a histogram of values per column to estimate how many rows a query will touch, and uses that to decide join type and memory grant. If stats are stale, the estimate can be way off from reality.",
    "why": "A bad estimate can make the optimizer pick the wrong join type or grant too little memory, causing tempdb spills — the query slows down for no obvious reason in the code.",
    "when": "I check this right after a big bulk load or large delete, before auto-update stats has kicked in.",
    "example": "After bulk-importing historical attendance data into Zen Campus, dashboard queries suddenly slowed down. The execution plan showed estimated versus actual row counts were miles apart. Running UPDATE STATISTICS WITH FULLSCAN fixed it, and now updating stats is a standard step after any bulk load."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Production Issue",
    "question": "Tell me about a time tempdb became a bottleneck. How did you actually diagnose and fix it?",
    "what": "Tempdb is shared across the whole instance for temp tables, sorting, spills, and the version store. When many sessions hit it at once, you get contention on internal allocation pages, not the actual data.",
    "why": "The symptom looks like generic slowness or blocking, but the real cause is tempdb getting hammered by concurrent usage, especially with only one data file.",
    "when": "This shows up under high-concurrency load, which we hit since Zen Campus served over a thousand concurrent users at peak.",
    "example": "During morning attendance-marking, when every school hits the system at once, we saw heavy blocking and slow responses. sys.dm_os_waits showed PAGELATCH waits pointing at tempdb, which only had one data file. I worked with our DBA to split it into multiple files matching the core count, and contention eased off noticeably."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Production Issue",
    "question": "What's the difference between blocking and a deadlock, and how do you troubleshoot blocking specifically when there's no error thrown?",
    "what": "Blocking is one session waiting on a lock held by another — no error, it just sits until the blocker finishes or times out. A deadlock is two sessions blocking each other in a circle, and SQL Server kills one as a victim with an error.",
    "why": "Since blocking throws no error, I can't grep logs for it — I check sys.dm_exec_requests or Activity Monitor to find the head blocker everyone is waiting behind.",
    "when": "When users report something 'freezing' with no exception in the logs, that's usually blocking, not a crash.",
    "example": "During a month-end billing close, someone left a big invoice report open in an explicit transaction and forgot to commit it, so fee-payment inserts queued up behind it. Users reported payments 'hanging.' I traced it through sys.dm_exec_requests using blocking_session_id and found that report as the head blocker, then fixed it by shrinking the transaction's scope."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "How would you set up a backup and restore strategy for a production database like the school ERP?",
    "what": "Typically full backups on a schedule, differentials in between to keep restore time reasonable, and transaction log backups for point-in-time restore and to keep the log from growing unbounded.",
    "why": "It's a balance between acceptable data loss and restore time. Log backups are what let you recover to a specific moment instead of just the last full backup.",
    "when": "I do nightly full backups, frequent log backups, and test the restore occasionally instead of just trusting the file exists.",
    "example": "The backup setup for Zen Campus is mostly owned by infra and DBA, but I got pulled in once for an actual restore — someone ran an UPDATE on a fee table without a WHERE clause during a support call. We restored to a point just before the bad update using log backups and manually replayed the legitimate changes. That's why I now double-check WHERE clauses and wrap ad-hoc prod scripts in an explicit transaction."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Do you know when you'd reach for replication versus something like Always On or just a nightly sync job?",
    "what": "Replication (transactional, merge, or snapshot) copies data changes out to another database, for a different purpose like reporting. Always On is about keeping a whole database in sync for failover.",
    "why": "The idea is to take load off the main database by letting reporting queries hit a different copy instead of competing with live transactions.",
    "when": "I'd use it when I need near-real-time data for a genuinely different consumer, not just a failover target.",
    "example": "We discussed transactional replication for Zen Campus so heavy report generation wouldn't compete with live billing and attendance transactions. We backed off since it was more operational overhead than we had DBA bandwidth for. We used a simpler off-peak sync job plus caching on hot dashboard queries instead."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "What do you know about Always On Availability Groups? Have you actually configured one, or just worked around one?",
    "what": "An Always On AG keeps a group of databases in sync across replicas, so if the primary goes down another replica can take over. You can also point read-only reporting traffic at a secondary.",
    "why": "It minimizes downtime for a system that can't afford long outages, and can offload read-heavy reporting from the primary.",
    "when": "I'd use it for anything mission-critical for uptime, which a school ERP running attendance, billing, and payroll kind of is.",
    "example": "I haven't configured an AG from scratch — that's infra and DBA managed for Zen Campus — but I've reasoned about it during incident calls. During a failover event, our connection string used the AG listener name instead of a specific server, so the app kept working with zero code changes. That's when it really clicked why you use the listener instead of hardcoding a server name."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Technical",
    "question": "Walk me through the difference between a SQL login and a database user, and how you handle permissions across services.",
    "what": "A login is server-level — how you authenticate to the instance. A user is database-level, mapped to a login, and gets permissions inside a specific database. Roles like db_datareader group permissions together instead of granting them one by one.",
    "why": "This separation matters for security — if a service account is compromised, it should only have access to what it actually needs, not sysadmin or blanket access everywhere.",
    "when": "Especially with microservices, each service should get its own scoped login and user instead of sharing one account.",
    "example": "As we split Zen Campus into microservices behind Ocelot, each service got its own SQL login and a database user scoped to only the schema it needed — billing couldn't touch payroll tables. We used custom roles with EXECUTE-only permission on specific stored procs instead of handing out broad access everywhere, on top of the JWT and RBAC we already had at the app layer."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Scenario",
    "question": "How do you handle bulk inserts — say importing a few thousand student records at once? Have you used SqlBulkCopy?",
    "what": "SqlBulkCopy is an ADO.NET API that streams rows in using SQL Server's bulk insert mechanism instead of individual INSERT statements. It means far fewer round trips and much less logging overhead.",
    "why": "Looping and inserting one row at a time through Dapper or EF is fine for small counts, but painfully slow for a few thousand rows and holds locks longer than needed.",
    "when": "I use it for bulk imports, data migrations, or any batch load where row-by-row doesn't make sense.",
    "example": "During admission season, schools send us Excel files with a few thousand new student records to import. The first version looped through individual Dapper inserts, which was slow and locked the table while staff were using it. I switched to staging rows in a DataTable and using SqlBulkCopy with a tuned batch size, dropping it from a couple minutes to a few seconds. For the largest batches, I also had to disable and re-enable some non-clustered indexes to avoid slowing the insert."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Scenario",
    "question": "How do you deal with storing and querying JSON or XML data in SQL Server, versus just using MongoDB like you do elsewhere?",
    "what": "SQL Server has a native XML type with XQuery support. For JSON, it's really just NVARCHAR(MAX) with functions like OPENJSON, JSON_VALUE, and FOR JSON — not a dedicated JSON type like Postgres has.",
    "why": "I use SQL Server for semi-structured data when it needs to stay transactionally tied to related relational data. MongoDB makes more sense when data is document-shaped, high volume, and doesn't need joins.",
    "when": "I keep JSON in SQL when it's metadata tied to a relational table that must stay consistent. I use Mongo when it's an independent stream of documents or events.",
    "example": "The dynamic form builder in Zen Campus stores each form's field definitions as JSON in an NVARCHAR(MAX) column, since that config is tied to relational metadata like form owner and needs transactional integrity. We use OPENJSON to query it, while high-volume per-submission data went into MongoDB. That split wasn't obvious at first — I initially put too much into Mongo and had to pull some back into SQL once it needed to join cleanly with relational data."
  },
  {
    "category": "SQL Server — Deep Dive",
    "type": "Scenario",
    "question": "If I gave you a blank slate to design the schema for a new module — say a hostel management module — how would you think about normalization versus denormalization?",
    "what": "I'd start normalized — separate tables for Hostel, Room, Bed, Allocation, Student with proper foreign keys — to avoid update anomalies. Denormalization is something I add deliberately later, once I know which read paths are hot.",
    "why": "Premature denormalization creates duplicate data that can silently drift out of sync. But staying purely normalized can hurt dashboard-style read queries once several joins stack up under load.",
    "when": "I normalize by default, and only denormalize a specific column when there's a real, measured performance problem — documented so it doesn't become a mystery later.",
    "example": "For the hostel module I started fully normalized. The 'current occupancy per hostel' dashboard was hitting multiple joins under load, so I added a denormalized OccupancyCount column on the Hostel table, updated whenever an allocation changes. I was extra careful because a denormalized 'total paid' field in the billing module had drifted out of sync with actual payments with no reconciliation job. I added a nightly reconciliation job and carried that lesson into the hostel field."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "When would you actually pick MongoDB over SQL Server for a project? Walk me through your thinking.",
    "what": "It depends on how rigid the data shape is. Clean relational data with joins and ACID needs goes to SQL Server. Document-shaped data or huge write volume like logs fits Mongo better.",
    "why": "Relational schemas punish you when they keep changing, since every new field means a migration. Mongo lets the document evolve without touching every row.",
    "when": "I reach for Mongo when data is document-shaped, high volume, or mostly simple key lookups. Anything transactional and relational stays in SQL Server.",
    "example": "In Zen Campus, admissions, fees, and payroll stayed in SQL Server with Dapper since they're heavily relational. Activity logs, device pings, and analytics went into MongoDB after the SQL query load got messy."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "Can you explain the document model and BSON, and how that's different from rows in a relational table?",
    "what": "A Mongo document is a JSON-like object stored as BSON, its binary form, which supports extra types like dates and ObjectIds. Each document can have its own fields, unlike SQL rows which all follow one schema.",
    "why": "BSON is faster to parse than plain JSON and keeps type information, so a date stays a date.",
    "when": "I think about this when data naturally nests instead of spreading across several related tables.",
    "example": "We stored analytics snapshots in Zen Campus as one document per event with nested metadata, timestamps, and device info. Normalizing that into SQL Server would've meant four or five tables just to reconstruct one event."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "How do you decide between embedding and referencing when designing a MongoDB schema?",
    "what": "Embedding nests related data right inside the parent document. Referencing stores an ObjectId and looks the data up separately. I embed when child data is always read with the parent and stays bounded, and reference when it's large or updated on its own.",
    "why": "Embedding is fast since it's one query, but an unbounded embedded array can bloat every read. Referencing avoids that but costs an extra round trip.",
    "when": "Small, bounded, always-together data gets embedded. Large or independently-changing data gets referenced.",
    "example": "I embedded log entries inside a parent event document on Zen Campus, thinking it'd be quick to read. It grew too fast and bloated the documents, so I restructured it into its own collection with a reference back."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "What's your approach to indexing in MongoDB — how do you figure out what needs an index?",
    "what": "I index the fields that show up most in filters, sorts, and lookups, same instinct as SQL Server. Without an index, Mongo does a full collection scan.",
    "why": "Every index speeds up reads on that field but slows down writes and uses storage, so I index based on actual query patterns, not guesswork.",
    "when": "I use explain() to check if a query is doing a COLLSCAN or an IXSCAN, similar to checking an execution plan in SQL Server.",
    "example": "Dashboard queries in Zen Campus filtering by date range and category were slow because there was no compound index covering both. Adding one cut the query time down noticeably."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "Explain the aggregation pipeline in MongoDB — how have you used it?",
    "what": "It's a series of stages chained together, like match, group, project, and sort, where each stage feeds off the previous one's output. It runs on the database side instead of pulling everything into memory first.",
    "why": "It's faster because Mongo does the filtering and grouping close to the data instead of dragging a huge dataset over the wire.",
    "when": "I use it any time I need grouped counts, sums, or report-style output straight from a collection.",
    "example": "For a Zen Campus analytics dashboard, I wrote a pipeline with $match to narrow the date range, $group to bucket by day, and $project to shape the output. My first version matched too broadly, so I moved the $match earlier and it fixed the performance."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "How do you do CRUD operations against MongoDB from a .NET application — what does that look like in code?",
    "what": "I use the MongoDB.Driver package to get an IMongoDatabase from a MongoClient, then a typed IMongoCollection<T> for the document class. From there it's InsertOneAsync, Find, UpdateOneAsync, and DeleteOneAsync.",
    "why": "The typed driver with POCOs gives compile-time checking on field names and works well with dependency injection, similar to EF Core or Dapper.",
    "when": "I register MongoClient as a singleton since it's thread-safe and meant to be reused, not created per request.",
    "example": "In Zen Campus, one microservice behind the Ocelot gateway talks to MongoDB for analytics and log data. I registered MongoClient as a singleton in Program.cs and injected a typed repository, structured much like our Dapper repositories."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "Can you explain the CAP theorem in simple terms and where MongoDB fits?",
    "what": "CAP theorem says a distributed system can't fully have Consistency, Availability, and Partition tolerance at once. MongoDB defaults toward consistency, since reads go to the primary, but you can tune toward availability with read preferences.",
    "why": "It shapes how you configure read and write concerns, depending on whether you need the latest data or more uptime.",
    "when": "It matters most if you ever scale across regions or hit real network partition scenarios.",
    "example": "This is more theory than practice for me, since Zen Campus hasn't hit a real partition scenario. I know why the driver has read preference and write concern settings and where to adjust them if needed."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Scenario",
    "question": "Tell me about a time you used MongoDB specifically for real-time analytics or logging. Why not just log to SQL Server?",
    "what": "We needed to capture high-volume events like activity logs and request traces without slowing down the transactional database. MongoDB handled the write volume and let us store events with varying shapes without a migration each time.",
    "why": "SQL Server would work, but not every log event looks the same, and forcing that into rigid tables means lots of nullable columns or extra join tables.",
    "when": "This fits append-heavy, read-for-aggregation workloads, not data that needs strict relational integrity.",
    "example": "In Zen Campus, we routed logging and analytics data into MongoDB instead of SQL Server so it wouldn't compete with transactional load. That separation actually helped cut down incident resolution time."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "What's polyglot persistence, and have you actually worked in a system that used it?",
    "what": "It's the idea of picking the right database per use case instead of forcing one database to do everything. Relational for transactional data, document store for flexible or high-volume data.",
    "why": "No single database is great at everything, so splitting responsibilities plays to each one's strengths.",
    "when": "It's worth the added complexity only when you actually have distinct data patterns, not just for variety.",
    "example": "That's the setup in Zen Campus: SQL Server for admissions, billing, and payroll, MongoDB for analytics and logs. It added overhead like two connection strings and two sets of repositories, but it solved a real problem."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "Does MongoDB support transactions? How does that compare to what you're used to with SQL Server?",
    "what": "Yes, MongoDB supports multi-document ACID transactions since version 4.0 using sessions. Before that it only guaranteed atomicity at the single-document level.",
    "why": "Multi-document transactions have more overhead in Mongo, so the general advice is to design your schema to rarely need them.",
    "when": "I'd only reach for a Mongo transaction when I genuinely can't avoid updating multiple documents atomically.",
    "example": "In Zen Campus, payment processing and fee updates stayed on the SQL Server side with Dapper. Our Mongo data was mostly append-only, so single-document atomicity was already enough."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Technical",
    "question": "Can you explain sharding and replication in MongoDB, and how they're different?",
    "what": "Replication keeps multiple copies of the same data in a replica set for high availability and read scaling. Sharding splits the data itself across servers by a shard key for horizontal scaling.",
    "why": "Replication protects against losing data or availability if a node fails. Sharding handles more data or throughput than one node can manage.",
    "when": "Replication is standard for any production Mongo setup. Sharding only comes in once a replica set genuinely can't keep up.",
    "example": "Zen Campus runs MongoDB as a replica set for availability but hasn't needed sharding yet. If usage kept growing across institutions, sharding by tenant or institution ID would likely be next."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Production Issue",
    "question": "Since MongoDB doesn't enforce a schema the way SQL Server does, have you run into data quality issues? How did you handle it?",
    "what": "Yes, without a rigid schema documents can drift, like a field being a string in one document and a number in another. We hit this on Zen Campus when inconsistent field types broke a query.",
    "why": "The database won't stop you from inserting inconsistent documents, so the discipline has to come from the application layer.",
    "when": "This becomes a real risk once more than one service or code path writes to the same collection.",
    "example": "After that incident, I added stricter model validation in C# before writing to Mongo, plus JSON schema validation on the collection itself. It was just a broken dashboard query, not a big outage, but it was a good lesson."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Production Issue",
    "question": "Walk me through a time you had to tune MongoDB performance — what was slow, and what did you actually do about it?",
    "what": "Analytics queries feeding a Zen Campus dashboard got noticeably slower as event volume grew. Running explain() showed they were doing full collection scans because the filter fields weren't indexed.",
    "why": "Missing indexes hurt a lot more as data volume grows, since every query scans the whole collection instead of jumping to matching documents.",
    "when": "You catch this either proactively by checking query plans, or reactively when something that used to be fast suddenly isn't.",
    "example": "I added a compound index on the date range and category fields the dashboard actually filtered on, and moved the $match stage earlier in the aggregation pipeline. It took a couple of iterations, but query time dropped noticeably."
  },
  {
    "category": "MongoDB & NoSQL",
    "type": "Scenario",
    "question": "Suppose a teammate wants to move the entire Zen Campus student and billing data from SQL Server to MongoDB for 'flexibility.' How would you respond?",
    "what": "I'd push back. Student records, fee structures, and billing are deeply relational and need strong consistency, especially around payments.",
    "why": "Flexibility is only a good tradeoff when data shape actually changes often, and billing and student records don't have that problem.",
    "when": "I'd only reconsider if the relational data itself started genuinely varying in shape across records.",
    "example": "This is basically why Zen Campus is structured the way it is: SQL Server for the relational core, MongoDB for unstructured, high-volume stuff like analytics and logs. I'd point back to that reasoning if someone suggested flipping it."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "What's the actual difference between a Docker image and a container?",
    "what": "An image is the blueprint - a read-only package with your app, dependencies, and runtime baked in. A container is what runs when you start that image, with a writable layer on top for changes.",
    "why": "It tells you what to do when something breaks: rebuild the image if code changed, just restart the container if it only crashed.",
    "when": "It comes up constantly during debugging, deciding whether to rebuild or just restart.",
    "example": "In Zen Campus each microservice - attendance, billing, payroll - had its own Dockerfile and image. I sometimes ran two containers from the same billing image to test parallel instances hitting the same DB."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "Walk me through a typical Dockerfile you'd write for one of your .NET services, and why bother with multi-stage builds?",
    "what": "The first stage uses the SDK image to restore, build, and publish the app. The second stage starts from a lighter runtime-only image and just copies in the published output.",
    "why": "The SDK image is huge with build tools you don't need in production, so multi-stage keeps the final image small.",
    "when": "I do this for pretty much every .NET service, especially with several microservices where image size adds up.",
    "example": "For the Ocelot gateway and API services in Zen Campus, the build stage used the SDK image and the final stage used the aspnet runtime image only. The final image size dropped noticeably."
  },
  {
    "category": "Docker & Containerization",
    "type": "Scenario",
    "question": "Say you need to spin up all the Zen Campus microservices locally for a demo - how would you use docker-compose to orchestrate that?",
    "what": "One compose file lists every service with its build context, ports, environment variables, networks, volumes, and depends_on order. One docker-compose up brings the whole stack up together.",
    "why": "Without it I'd be running many separate docker run commands by hand, and it wouldn't be consistent between machines.",
    "when": "Any time several services need to talk to each other for local dev or a demo.",
    "example": "Our compose file had eight or nine services - gateway, student, attendance, billing, payroll, inventory, plus SQL Server and Mongo containers. I learned that depends_on only waits for the container to start, not for the app inside to be ready, which caused early confusing errors."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "How did you handle environment variables and config differences across dev, staging, and prod for containerized services?",
    "what": "ASP.NET Core lets environment variables override appsettings.json, so I set connection strings and secrets under compose's environment section or an env file kept out of source control.",
    "why": "This lets the same image run in every environment without rebuilding for each one.",
    "when": "Any service that needs different connection strings or keys between dev and prod.",
    "example": "For billing and payroll, connection strings, JWT keys, and SMS credentials came from environment variables in compose, with real values in a local .env file that was never committed. ASP.NET Core picked these up automatically."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "How does networking work between containers - like how does the Ocelot gateway actually reach your backend microservices?",
    "what": "Containers on the same compose network can reach each other by service name through Docker's internal DNS. No hardcoded IPs are needed.",
    "why": "Otherwise container IPs would keep changing on restart and I'd be chasing addresses that don't stay put.",
    "when": "Whenever two or more containers in the same compose stack need to call each other.",
    "example": "All our services sat on one compose network, so Ocelot's routes pointed to something like http://attendance-service:80 using the service name, not localhost. That tripped me up at first since I was used to localhost outside Docker."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "Volumes and persistent data - how did you make sure your SQL Server or Mongo data survived container restarts?",
    "what": "Named volumes map to the database's data folder inside the container, so the data lives outside the container's own writable layer.",
    "why": "Containers are disposable but database data can't be, so the container can come and go while the volume stays.",
    "when": "For any stateful container - mainly databases, but also things like uploaded files or reports that need to persist.",
    "example": "The first time I set up the SQL Server container without a volume, I restarted it to fix a config mistake and lost all my sample student and attendance data. After that I added named volumes for both SQL Server and Mongo."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "What's actually different between a container and a virtual machine under the hood?",
    "what": "A VM virtualizes hardware and runs a full guest OS, so it's heavier and slower to boot. A container shares the host's kernel and just gets isolated, so it's much lighter and starts in seconds.",
    "why": "This matters for resource usage and how fast you can spin things up, which is why containers fit a microservices setup well.",
    "when": "This comes up when explaining why we moved to containers instead of deploying each service on its own VM or IIS site.",
    "example": "Before Zen Campus we mostly deployed on IIS on VMs. Once we containerized, spinning up the whole ten-ish service stack on my laptop took a couple minutes, versus a much slower process with separate VMs."
  },
  {
    "category": "Docker & Containerization",
    "type": "Production Issue",
    "question": "Your service images ended up way bigger than they should've been and deploys were dragging - what did you do about it?",
    "what": "I used a multi-stage build so the SDK layer never shipped, switched the final stage to the slim aspnet runtime image, and added a proper .dockerignore so bin and obj folders weren't copied in.",
    "why": "Bigger images take longer to push and pull and use more registry storage, with no benefit in production.",
    "when": "I noticed it when deploys took noticeably longer or registry storage started climbing.",
    "example": "Some of our services were pulling 700-800MB images because bin and obj were being copied in without a dockerignore. Adding the dockerignore and switching to the slim runtime image dropped the size noticeably."
  },
  {
    "category": "Docker & Containerization",
    "type": "Technical",
    "question": "Did you use container health checks, and what problem do they actually solve?",
    "what": "I added a HEALTHCHECK in the Dockerfile or compose file that hits an endpoint on an interval and marks the container healthy or unhealthy. Compose can then use service_healthy in depends_on instead of just container_started.",
    "why": "A container can show as running even if the app inside has hung, so without a real check, a gateway keeps sending it requests that fail.",
    "when": "For any service behind a gateway or load balancer where it should only get traffic once it's actually ready.",
    "example": "I added a /health endpoint to each API and wired it into compose's healthcheck, then set depends_on to wait on service_healthy. This fixed a flaky issue where Ocelot routed to the attendance service before it was fully up."
  },
  {
    "category": "Docker & Containerization",
    "type": "Scenario",
    "question": "How would you fit Docker images into a CI/CD pipeline for a microservices setup like Zen Campus?",
    "what": "Ideally the pipeline builds the image, tags it with the commit SHA or build number, pushes it to a registry, and the deploy step pulls that exact tagged image.",
    "why": "This ensures the exact thing that was tested is the exact thing that gets deployed.",
    "when": "Anywhere you want repeatable, traceable deployments across more than a couple of services.",
    "example": "At RAX we didn't have a fully automated registry-push pipeline - it was build locally, tag consistently, and compose up on the target server. If I set it up properly, I'd use GitHub Actions or Azure DevOps to build, tag with commit SHA, push to a registry, then deploy from there."
  },
  {
    "category": "Docker & Containerization",
    "type": "Production Issue",
    "question": "One of your containers just won't start - walk me through how you'd debug it.",
    "what": "I start with docker ps -a to see the exit code, then docker logs to see what happened before it died. If that's not enough, I use docker inspect or drop into a shell inside the image.",
    "why": "The exit code and logs usually show right away whether it's an app crash, a missing config value, or a port conflict.",
    "when": "Any time compose up shows a service exiting immediately or stuck in a restart loop.",
    "example": "The payroll service once kept restarting. docker ps -a showed exit code 1, and docker logs pointed to a null connection string caused by a case mismatch in the environment variable name. It took about twenty minutes to spot."
  },
  {
    "category": "Docker & Containerization",
    "type": "Scenario",
    "question": "If one of these microservices needed to handle a lot more load, how would you approach scaling it with Docker?",
    "what": "With plain compose, I'd use the scale option to run multiple containers of the same service behind a load balancer like Ocelot. For real production scale, I'd want an actual orchestrator like Kubernetes or Swarm.",
    "why": "One container has a limit on what it can handle, so replicas spread the load, but only if the service is stateless.",
    "when": "When CPU, memory, or response times show a single instance can't keep up under load.",
    "example": "We never ran true multi-replica production scaling - our user base of 1000-plus was manageable with single containers behind Ocelot. I did test compose's scale flag locally on the attendance service, which showed it needed to be stateless to work correctly."
  },
  {
    "category": "Docker & Containerization",
    "type": "Production Issue",
    "question": "Ever run into the classic 'works fine on my machine but breaks in the container' problem? How'd you debug it?",
    "what": "Usual suspects are base image runtime version mismatches, missing environment variables, Windows-style file paths, or different timezone and culture settings.",
    "why": "Local dev is Windows with the full SDK, but the container is a stripped-down Linux runtime, so small differences don't show up until you actually run it containerized.",
    "when": "This happens right after containerizing something that ran fine in Visual Studio.",
    "example": "A report generation feature worked fine in Visual Studio but threw a file not found error in the container, because of a hardcoded Windows-style path. I fixed it by switching to Path.Combine everywhere."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "What's the actual difference between TCP and UDP, and why did you pick TCP for talking to the locker hardware?",
    "what": "TCP does a handshake and guarantees every packet arrives and in order, resending if needed. UDP just fires packets and doesn't care if they arrive.",
    "why": "With a locker, a dropped unlock command or ack could leave it stuck shut, or worse, open with no clean audit trail.",
    "when": "I'd pick TCP anytime correctness matters more than speed, like banking or hardware control.",
    "example": "On the bank locker project every command between our server and the locker board went over TCP - open request, OTP result, hardware ack, all of it needed guaranteed delivery. We briefly considered UDP for being 'lighter', but dropped that idea once we thought through a missing unlock ack."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "Walk me through how you used the .NET Socket class — did you go with synchronous or async, and why?",
    "what": "The Socket class lets you connect and send/receive bytes directly. Synchronous calls block the thread until data arrives; async calls let the thread do other work while waiting.",
    "why": "Blocking a thread per locker connection would exhaust the thread pool once more than a few lockers were active at once.",
    "when": "Synchronous is fine for a quick one-off test tool, but production code handling multiple connections should go async.",
    "example": "On the locker system I used async socket calls so the backend could keep several locker connections open without a thread per socket. I started with a synchronous prototype to nail down the byte format with the hardware vendor, then switched to async once the protocol worked."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "How does bidirectional real-time communication actually work between your server and the locker hardware — is it just request-response, or something more?",
    "what": "It's not plain request-response. The server pushes commands like 'unlock locker 14', and the hardware also pushes its own events, like a door sensor trip, without being asked. Both sides keep the socket open and can write whenever something happens.",
    "why": "Pure request-response would mean constantly polling the hardware, which wastes time and adds delay.",
    "when": "You need this pattern whenever the remote device has its own events to report, not just answers to your questions.",
    "example": "For the locker board, once OTP validation passed, our server pushed the unlock command down the open socket, and the hardware pushed back a physical-state ack that we logged for the audit trail. That ack mattered because it told us the locker actually opened, not just that we sent the command."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Production Issue",
    "question": "Did you ever have a locker just go silent — connection drops, hardware seems dead — and how did you handle reconnection?",
    "what": "Yes, that happened more than once. TCP connections can die silently from a flaky network or power blip, so we needed a heartbeat that pings periodically and flags the connection dead if it stops responding.",
    "why": "Without a heartbeat, the server could think a socket is fine when it's actually been dead for ten minutes, and nobody would know until a customer complained.",
    "when": "Any long-lived socket connection over a real network needs this, since you can't assume TCP will tell you the moment something breaks.",
    "example": "We sent a heartbeat ping regularly, and if a locker missed a couple of beats, the server flagged it and reconnected with backoff instead of hammering it. One locker kept flapping every few hours from a router issue on-site, but the reconnect logic let it self-heal without anyone restarting the service."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "TCP guarantees ordered delivery, but people still say you can get partial or corrupted data over a socket. How's that possible, and how did you handle it?",
    "what": "TCP guarantees the bytes arrive in order, but not that one Receive call equals one complete message. A single message can arrive split across two reads, or two messages can arrive merged in one read.",
    "why": "Assuming one Receive equals one message means you'll eventually parse garbage from split or merged data.",
    "when": "Anytime you're doing raw socket reads without a higher-level protocol handling message framing for you.",
    "example": "On the locker protocol we added a length prefix - first few bytes tell you the payload length, then you read exactly that many bytes. Early on we didn't have this and got random-looking parsing failures, which a packet sniffer traced to two messages landing in one read. Adding the length prefix and buffering fixed it."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Scenario",
    "question": "Design the OTP lifecycle for a bank locker system — generate, deliver, validate, expire. How would you structure that?",
    "what": "There are four stages: generate a random code tied to the user session and request, deliver it via SMS, validate it against the stored value and request ID, and expire it after a fixed window or one use.",
    "why": "Each stage has its own risk to guard against - unpredictable generation, trackable delivery, replay-proof validation, and a tight expiry window.",
    "when": "This pattern applies to any MFA flow, but the stakes are higher for something physical like a locker.",
    "example": "We built this as REST endpoints - generate, deliver, validate, expire - each writing a row to an audit table with timestamp, locker ID, masked phone number, and status. Validate also rechecked the timestamp on every attempt, so an expired OTP was rejected even if the cleanup job hadn't run yet. That double-check saved us at least once when the expiry job lagged under load."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "How do you actually generate an OTP securely in .NET? Would Random.Next() be good enough?",
    "what": "No, Random isn't cryptographically secure since its output can be predicted. For anything security-sensitive I use RandomNumberGenerator from System.Security.Cryptography.",
    "why": "An OTP is only secure if it's unguessable, so a predictable random generator defeats the whole point.",
    "when": "Always for auth-related values like OTPs, tokens, or session IDs. Random.Next() is fine only for non-security things like shuffling a UI list.",
    "example": "For the locker OTPs we used the crypto-secure generator for a 6-digit code, then stored a hash of it instead of the raw code. I'll admit we stored it in plaintext during early dev, and a code review flagged that we needed to hash it before going near production."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Scenario",
    "question": "How would you design OTP expiry and rate limiting to stop someone from brute-forcing the code?",
    "what": "Expiry kills the code after a short window, like 2 to 5 minutes, no matter what. Rate limiting caps guesses per OTP, like 3 to 5 tries, then locks the request and requires a fresh OTP.",
    "why": "A 6-digit OTP has a million combinations, but without rate limiting an attacker could script through them fast.",
    "when": "Any OTP-based flow needs this, and it matters more the more sensitive the action is.",
    "example": "On the bank locker system we capped failed attempts before invalidating the OTP, and logged every failed attempt with locker ID and timestamp. That logging gave us a clean signal if someone was probing a locker repeatedly, and combined with the short expiry window, it's a big reason we had zero unauthorized access incidents after going live."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "What's involved in integrating a third-party SMS gateway API — what do you actually have to handle beyond just calling their endpoint?",
    "what": "Calling their send endpoint is the easy part. The rest is handling delivery status callbacks, retry logic for transient failures, timeouts, and mapping their error codes to your own logging.",
    "why": "Treating 'API call succeeded' as 'SMS delivered' leaves you with undelivered OTPs and no way to debug what happened.",
    "when": "Anytime you depend on an external delivery channel, you have to assume it can fail, be slow, or lie about success.",
    "example": "For the locker system we integrated a third-party SMS gateway, and I logged every send call's response, including their message ID and status, alongside the OTP record. That let us trace a delayed-message complaint back to the gateway's own reference ID instead of just guessing."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Production Issue",
    "question": "You mention sub-3-second SMS delivery. What actually made SMS delivery slow, and how'd you get it under 3 seconds?",
    "what": "A few things stack up: network latency to the gateway, our own code's processing time, and the gateway's own delay. On our side, the fix was making sure OTP generation and the audit DB write weren't blocking the SMS call.",
    "why": "For a locker unlock flow, every extra second waiting for a text makes people hit resend, which adds load and duplicate OTPs.",
    "when": "Anytime user experience depends on an external call's latency, minimize what runs before and around it.",
    "example": "We found the DB audit write was happening before the SMS call, adding unnecessary delay. Reordering so the SMS request fired first, with logging right after, plus picking a fast gateway, got us consistently under 3 seconds."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "Why is audit trail logging so important in a system like this, and what did you actually log?",
    "what": "For a bank locker, you need a record answering who tried to access what, when, and what happened, for every event, not just successes. That covers OTP generation, delivery, every validation attempt, expiry, and the unlock command and hardware ack.",
    "why": "If a customer disputes access, the audit trail is your only source of truth, and it also helps spot suspicious patterns early.",
    "when": "Anywhere security or compliance matters, though most production systems benefit from this kind of logging.",
    "example": "On the locker project every stage of the OTP lifecycle wrote a row to a SQL Server audit table - locker ID, masked phone number, timestamp, status, and failure reason. That detail is a big reason we could confidently say we had zero unauthorized access incidents."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Production Issue",
    "question": "What happens if the SMS gateway goes down or starts timing out — did you build any failover for that?",
    "what": "You can't let the OTP call hang or throw unhandled if the gateway is down. I added a timeout on the outbound call, retries with short backoff, and a clear failure message to the user.",
    "why": "A locker with no fallback for gateway downtime locks users out the moment a third-party vendor has an outage.",
    "when": "Anytime you depend on a single external vendor for something critical, plan for their downtime as a certainty.",
    "example": "We didn't have a full secondary gateway on that project due to budget and contracts, but we added timeout and retry with backoff, and a clear 'try again' message if it still failed. Looking back, a proper failover provider is the one gap I'd push for now."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "How do you secure a raw TCP channel — isn't it just plaintext bytes over the wire by default?",
    "what": "Yes, plain sockets are unencrypted bytes with no identity check on either end. To secure it, I wrap the stream in SslStream, which does the TLS handshake and encrypts everything after, and I validate the hardware's certificate rather than trusting anything.",
    "why": "For a bank locker, plaintext unlock commands and OTP results are an obvious target for sniffing or replay attacks.",
    "when": "Any socket carrying sensitive data over a network you don't fully control physically needs this.",
    "example": "On the locker system we used TLS over the TCP channel between server and hardware, alongside HTTPS for the REST side. Getting the vendor's firmware to work with our TLS setup took some back-and-forth over cert format quirks, but once sorted, no plaintext commands went over the wire."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Scenario",
    "question": "Two people try to unlock the same locker at almost the same moment — or several lockers get requests simultaneously. How do you handle that concurrency?",
    "what": "Requests to different lockers are fine since async I/O handles them independently. For two requests racing the same locker, I use a lock keyed by locker ID so the second request gets rejected while the first is in progress.",
    "why": "Without a lock, two valid OTPs could both try to unlock the same locker at once, creating a security and audit ambiguity.",
    "when": "Any time a physical resource can only serve one request at a time, even if the backend handles many requests concurrently.",
    "example": "On the locker system, each locker's active request state was tracked, so a second OTP validation for the same locker got rejected with 'request already in progress' instead of racing. We tested this deliberately by firing near-simultaneous requests in a test harness."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Technical",
    "question": "How do you even test a system that's tied to real hardware? You can't exactly automate a physical locker in a CI pipeline.",
    "what": "I separate concerns: the socket protocol and OTP logic get tested with a mock TCP server that mimics the locker, including edge cases like partial reads or dropped connections. A smaller set of tests then run against real hardware for the physical integration.",
    "why": "If everything depends on real hardware being present, your test coverage and CI pipeline grind to a halt, and rare failures become hard to reproduce.",
    "when": "Any hardware-integrated system needs the logic layer testable in isolation, plus a thin layer of hardware-in-the-loop tests.",
    "example": "For the locker project we wrote a mock TCP listener that simulated bad responses, like truncated packets or no response, so we could test reconnect and framing logic without a real locker unit. We kept a smaller set of manual tests against actual hardware to verify the door sensor really reported back correctly."
  },
  {
    "category": "TCP Socket & SMS OTP MFA",
    "type": "Production Issue",
    "question": "Tell me about a bug or incident from this project that actually took you a couple tries to fix properly.",
    "what": "The socket framing issue is the best example - intermittent, random-looking parsing failures on incoming hardware messages. I first suspected a hardware firmware bug and went back and forth with the vendor before looking at our own receive-buffer handling.",
    "why": "It's a good example because the real fix had nothing to do with OTP or SMS logic - it was a gap in how we read from the socket, the kind of bug that only shows up under real network conditions.",
    "when": "This kind of timing-dependent bug tends to surface once you're past initial dev and into real traffic patterns.",
    "example": "Two command messages were occasionally landing in the same TCP read buffer and getting parsed as one garbled message, since we hadn't added length-prefix framing from day one. A packet capture showed two JSON payloads concatenated in one read. Adding the length prefix and a proper buffering loop fixed it for good, but I blamed the wrong thing first."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "Can you walk me through how you designed the centralized exception-handling middleware in your ASP.NET Core microservices?",
    "what": "It's one middleware early in the pipeline that wraps everything in a try-catch. It logs the exception with context — stack trace, request path, correlation ID, user info — and returns a consistent JSON error to the client instead of a raw exception.",
    "why": "Before this, every developer handled errors differently, and some leaked stack traces to clients, which was a security risk. Centralizing it gave us one format and consistent logs across services.",
    "when": "I'd use this in any API with more than a couple of controllers, and it's essential once you're running microservices.",
    "example": "In Zen Campus I built this middleware across our services, and it's tied to our 35% cut in incident resolution time. Before it, support just saw a generic failure and had to dig through IIS logs. After it, every exception came with a correlation ID and a clean stack trace, so I could just search the logs."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "What's structured logging, and how is it actually different from just writing something like logger.Info(\"user logged in\")?",
    "what": "Structured logging means logging data as key-value fields instead of a plain sentence. So instead of 'user 4521 logged in from 10.0.0.5', I log UserId=4521, Ip=10.0.0.5, Module=Auth as separate fields.",
    "why": "Plain text logs are hard to search once you have thousands of lines a day. Structured logs let me filter directly on a field instead of writing regex.",
    "when": "I use it anywhere logs will be searched or alerted on later, which in practice is every production system.",
    "example": "In Zen Campus I moved our exception middleware and service logs to structured fields like CorrelationId, ServiceName, Endpoint, and UserRole. That let me filter by ServiceName and CorrelationId and get the whole request story in seconds instead of scrolling."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "How do correlation IDs help when a request touches four or five different microservices and something breaks?",
    "what": "A correlation ID is a unique GUID generated at the entry point of a request, like the API Gateway. It's passed through every downstream call so every service logs with the same ID.",
    "why": "Without it, you'd have to compare timestamps across separate log sources to trace one request. With it, you just search the ID once and see the whole chain.",
    "when": "This becomes necessary as soon as you split into microservices, and it's useful even in one service with concurrent requests.",
    "example": "In Zen Campus, Ocelot stamps a correlation ID at the gateway, and it flows through headers to every downstream service. Once a parent reported a payment that 'disappeared' — I searched the correlation ID and saw the payment actually succeeded, but the notification service timed out before confirming, so the UI looked wrong."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "When would you use in-memory caching versus something like a distributed cache?",
    "what": "In-memory caching, like IMemoryCache, keeps data inside one process's memory — fast, but only that instance knows about it. A distributed cache like Redis lives outside the app, so every instance shares it and it survives restarts.",
    "why": "In-memory is simple with near-zero latency, but once you scale to multiple instances, in-memory caches go out of sync. That's when a distributed cache is needed.",
    "when": "I use in-memory for reference data that changes rarely and doesn't need to be identical across instances. I'd use Redis for session data or anything that must be consistent everywhere.",
    "example": "On Zen Campus we haven't needed Redis yet, so I used in-memory caching for academic year config, fee category lookups, and class-section mappings. Cutting repeat DB hits for these static lookups was a big part of our 40% performance improvement."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "Cache invalidation is famously one of the hard problems in computer science. What actually makes it hard, and how do you handle it?",
    "what": "The hard part isn't caching data — it's knowing exactly when it's stale and clearing every copy at the same time. Too aggressive and you lose the benefit of caching; too lazy and users see wrong data.",
    "why": "Stale cache bugs are nasty because they don't throw errors — the app just quietly shows wrong data until someone notices.",
    "when": "I care about this most for anything tied to money or attendance, where stale data is actually wrong, not just annoying.",
    "example": "On Zen Campus I cached fee category data in memory, and when an admin changed a fee mid-day, the receipt still showed the old amount for ten minutes. I hadn't wired invalidation on the update path, only on create. I fixed it by clearing that cache key directly inside the update method instead of relying on time-based expiry."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Tell me about a time you had to diagnose a memory leak in production.",
    "what": "A memory leak shows up as memory climbing steadily over hours or days and never coming back down, until the app pool recycles or crashes. Diagnosing it means watching the memory trend, narrowing down the service, then taking a memory dump to see what's holding references.",
    "why": "You can't guess at this — leaks are almost always something holding a reference too long, like an unsubscribed event handler or an ever-growing cache. You need the dump to see what's actually on the heap.",
    "when": "I suspect a leak when memory keeps trending up and doesn't drop after garbage collection.",
    "example": "I haven't had to do a full memory dump on Zen Campus yet — most issues there were DB round trips, not heap growth. I did chase something that looked like a leak during bulk PDF exports; it turned out large byte arrays were living too long before collection. Disposing memory streams explicitly right after the file write fixed it."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Describe a time a service was pegging CPU in production. How did you actually find what was causing it?",
    "what": "High CPU usually means something's doing repeated unnecessary work — a tight loop, inefficient in-memory LINQ instead of pushing filtering to SQL, or a background job firing too often. I check which endpoint correlates with the spike, then profile that code path.",
    "why": "I measure before guessing, because CPU spikes get blamed on 'the database' too often when it's actually wasteful application code.",
    "when": "This shows up especially under load — code that's fine with ten users but eats CPU at a hundred usually has an algorithm that doesn't scale.",
    "example": "On Zen Campus, generating attendance reports for a whole school spiked app pool CPU. The SQL query itself was fine in SSMS. The code was pulling all rows into memory and aggregating with nested loops in C#. Moving that aggregation into the stored procedure fixed the spike."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Walk me through diagnosing a slow API endpoint that only becomes a problem under load.",
    "what": "Load-dependent slowness works fine locally, so I need real production timing data — logs showing request duration and where the time goes: DB call, external API, serialization, or queued waiting for a thread.",
    "why": "Slowness at low traffic is a simple inefficiency to fix. Slowness only under load usually points to contention — connection pool limits or thread pool starvation — which needs a different fix.",
    "when": "I watch for this when support says 'it's slow during peak hours' — that time-of-day pattern is the tell.",
    "example": "Our attendance-marking endpoint on Zen Campus was fine except between 8:45 and 9:15 AM, when every teacher logged in at once — response times went from under a second to eight or ten seconds. Timing logs showed we were opening more connections than the pool allowed, so requests queued. Bumping the pool size and closing connections promptly fixed it."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Tell me about handling a production outage that happened outside work hours — like a 2 AM call.",
    "what": "The first few minutes matter most. Instead of panicking and restarting things, I figure out the scope — one service or everything, all users or some, any recent deploy. Then I stabilize things first and do the root cause after.",
    "why": "Judgment isn't at its best at 2 AM, so good logs and alerts matter even more — that's exactly why the centralized logging exists, so I'm not correlating timestamps across boxes half-asleep.",
    "when": "This is just part of production support, especially for a school ERP where the morning rush is a daily load test.",
    "example": "I got a message around 1:40 AM that Zen Campus billing was throwing 500s on payment confirmation, right before a fee due date. The exception middleware had already logged a null reference tied to a recent deploy. I rolled back that deploy, confirmed payments worked, and fixed the actual null-check bug properly the next morning."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Tell me about an intermittent bug you had to root-cause — the kind that doesn't reproduce reliably.",
    "what": "These are hard because you can't just attach a debugger — it works most of the time. I add more logging around the suspected area, wait for it to happen again, and slowly narrow down the conditions.",
    "why": "Intermittent bugs are almost always about timing or state — race conditions, cache staleness, or request ordering — none of which show up in a normal debug session.",
    "when": "I know I'm in this territory when QA says 'can't reproduce' and the report just says 'sometimes this happens.'",
    "example": "On Zen Campus, a student's attendance occasionally got marked twice, once present and once absent. I first guessed it was a double form submission and added disable-on-click, but that didn't fix it. It turned out two teachers were marking the same class after a section reassignment hadn't propagated yet. Adding a unique constraint and an upsert pattern fixed it."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Have you run into database connection pool exhaustion? What did that look like and how did you fix it?",
    "what": "Connection pool exhaustion is when more requests want a DB connection than the pool has available, so requests wait and eventually time out. It shows up as a burst of 'timeout expired' errors around the same time.",
    "why": "The usual cause isn't needing more connections — it's something holding a connection open too long, like a connection not disposed properly or a long-running transaction.",
    "when": "This shows up under concurrent load, like a morning attendance rush or exam-result-release day.",
    "example": "On Zen Campus, a raw ADO.NET connection wasn't reliably closed on an early-return validation path. It worked fine normally, but under morning peak load it exhausted the pool within minutes. Wrapping every connection in using blocks properly fixed it, and I audited the rest of the codebase for the same pattern."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Tell me about a thread pool starvation or async deadlock issue you've hit.",
    "what": "Thread pool starvation is when all threads are stuck on blocking calls like .Result or .Wait() on async methods, so new requests can't get a thread even though CPU looks idle. A deadlock is when a thread waits synchronously on an async call that needs a context that's already blocked.",
    "why": "The confusing part is the CPU graph looks calm, so your first instinct is that the server is fine — you have to check thread count or queue length instead.",
    "when": "This shows up in ASP.NET code that mixes sync and async, like calling .Result inside a controller action, and it hides fine at low traffic.",
    "example": "On Zen Campus, some ported legacy code called .Result on an async Dapper call instead of awaiting it. It worked fine in dev but piled up under real load, while CPU stayed low the whole time. Checking thread pool queue length instead of CPU made it obvious, and switching to await fixed it immediately."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Scenario",
    "question": "How do you approach setting up monitoring and alerting for a production system?",
    "what": "I think in layers — infrastructure metrics like CPU/memory/disk, application metrics like error rates and response times, and business metrics like 'are payments actually going through.' Alerts should tie to thresholds that actually matter.",
    "why": "Alerting should catch things before a user complains. If you alert on everything, the team tunes it out and finds out about real outages from angry calls instead.",
    "when": "This matters most for customer-facing, time-sensitive flows — for us that's payments and attendance during school hours.",
    "example": "Early on, our 'monitoring' at Zen Campus was really just support tickets coming in. Once centralized logging was in place, I set up log-based alerts, like notifying someone if exception count crossed a threshold in five minutes. That caught issues before they became full tickets, and it's a big part of the 35% resolution-time improvement."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Scenario",
    "question": "Walk me through how you'd load test an application before a release.",
    "what": "First I figure out realistic load, like 'every class teacher marks attendance in a fifteen-minute window.' Then I simulate concurrent requests against key endpoints and watch response times, error rates, and resource usage as load ramps up.",
    "why": "Testing with one or two users doesn't show how the system behaves under real concurrency. Bugs like pool exhaustion and race conditions only show up under load, and it's better to catch them in staging than production.",
    "when": "I'd do this before any release touching a high-traffic path, like exam results or the start of a new term.",
    "example": "Load testing was a weak spot at RAX for a while — most testing was manual, which is part of why the morning attendance-rush slowness caught us out. After that, I pushed for basic load simulation on the attendance and billing endpoints before releases, matching the size of our bigger client schools."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Tell me about a data corruption incident you were involved in — how did you catch it and fix it?",
    "what": "Data corruption is scarier than a crash because the system keeps running with bad data silently. Once caught, I figure out the blast radius first, then find the root cause in code, fix it, and separately clean up the bad data already there.",
    "why": "You have to separate 'stop it happening again' from 'fix the existing bad records' — fixing the code doesn't retroactively fix data already wrong.",
    "when": "I take this seriously the moment I see it, however small, because a silent corruption once could mean more instances I haven't found.",
    "example": "On Zen Campus, two near-simultaneous payment confirmations for the same student could both process, and one would overwrite the other's ledger entry. My first guess was a rounding bug, which was wrong. Tracing it with correlation IDs showed a missing row-lock on the ledger update. I added proper locking and manually reconciled the affected student ledgers."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Describe a time you had to roll back a bad deployment.",
    "what": "The immediate goal is getting users back to a working state, not understanding why it broke. I roll back to the last known-good build, confirm stability, then dig into the root cause afterward.",
    "why": "Trying to hotfix live under pressure is how a small incident turns into a bigger one. I'd rather take the known-working path first and investigate with time to think.",
    "when": "I roll back immediately whenever the blast radius is more than cosmetic — anything touching payments, auth, or attendance data.",
    "example": "The 2 AM billing incident is the clearest example — once the exception logs pointed at a recent payment-gateway-callback change, I rolled that deployment back right away instead of patching it live. I confirmed payments were processing again, then fixed the actual null-check bug properly the next day with tests."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Scenario",
    "question": "How would you approach capacity planning for a system that needs to support 1,000-plus concurrent users?",
    "what": "I start from actual usage patterns instead of a flat number — for a school ERP, concurrency clusters around specific windows like morning attendance or fee due dates. I size for peak concurrent load in those windows, not average traffic.",
    "why": "Planning for average traffic gets you blindsided at exactly the moments that matter most, which are the moments a school actually notices.",
    "when": "This matters most before onboarding a bigger client or when a new academic term starts and usage is about to jump.",
    "example": "For Zen Campus, we designed the microservices architecture with Ocelot partly for this reason, so we could scale attendance or billing independently. The 1,000+ concurrent users figure came from estimating what happens if every teacher and many parents are active in the same fifteen-minute window, and sizing connection pools and caching to hold up under that."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Scenario",
    "question": "Your resume mentions you reduced production incident resolution time by 35%. Can you walk me through exactly how you got that number down?",
    "what": "Before the middleware, someone had to reproduce an issue and hunt across multiple services' unstructured logs on multiple servers just to find where it started. After centralized exception handling and structured logging, every error came with a consistent format, stack trace, and correlation ID tying it to the exact request.",
    "why": "Most incident time is spent finding the bug, not fixing it. Shrinking the finding part drops the whole resolution time even if the fix itself takes the same few minutes.",
    "when": "That number is a rough before-and-after comparison our team noticed over a few months of production support, not something from a fancy dashboard.",
    "example": "Before, a billing error meant pulling logs from billing, the gateway, and notifications separately and lining up timestamps by hand — twenty or thirty minutes before even starting the fix. After, I could search one correlation ID from a support ticket and get the full request path with the exception right there. That step went from half an hour to a couple of minutes across enough incidents to add up to the 35%."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Scenario",
    "question": "What does your postmortem process look like after a production incident?",
    "what": "I write down what actually happened while it's fresh — the timeline, what we saw first, what we tried that didn't work, and the real root cause. Then separately, what we'll change so it doesn't happen the same way again.",
    "why": "If you only write the clean final answer and skip the wrong turns, you lose the useful bit — the wrong turns often reveal a monitoring or logging blind spot.",
    "when": "I do this for anything that impacted users, even if it got fixed fast — the goal is preventing recurrence, not blame.",
    "example": "After the ledger double-write issue on Zen Campus, the postmortem wasn't just 'added a row lock, done.' I flagged that we had no way to detect that inconsistency proactively — we only found it because accounts noticed a wrong number. A follow-up was adding a periodic reconciliation check comparing ledger totals against payment records."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "What's graceful degradation, and have you actually had to implement it?",
    "what": "Graceful degradation means when part of the system fails, the rest keeps working, maybe with reduced functionality, instead of everything going down together. A non-critical dependency failing, like SMS or reporting, shouldn't block the core flow.",
    "why": "Tying everything together tightly means one flaky dependency can take down something completely unrelated and more important.",
    "when": "I apply this to anything that's a 'nice to have' alongside a core action — notifications, SMS, reports — versus the core transaction itself.",
    "example": "On the OTP bank locker system, the SMS gateway occasionally had delays, and OTP generation was originally too tightly coupled to delivery confirmation. I restructured it so OTP generation and the audit trail write succeed independently of the SMS send status, with delivery tracked and retried separately."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "How did you implement rate limiting in your microservices setup, and why does it actually matter?",
    "what": "We used Ocelot's built-in rate limiting at the gateway level, configuring per-route thresholds like requests-per-second, so a client hitting an endpoint too hard gets a 429 instead of slamming the backend.",
    "why": "Without it, one misbehaving client — a buggy retry loop or someone hammering an endpoint — can eat all your capacity and degrade things for everyone else. Doing it at the gateway means individual services don't each need to defend themselves.",
    "when": "I put this on any public-facing endpoint, especially OTP generation or login, where you want to prevent abuse.",
    "example": "On Zen Campus, I configured rate limiting at the Ocelot gateway for login and OTP-related endpoints. It stops a retry-happy frontend bug, or a brute-force attempt, from hammering those services directly. It's also cheap insurance compared to every service defending itself."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "What do health check endpoints actually give you in a microservices setup?",
    "what": "A health check endpoint, usually /health, reports whether a service and its critical dependencies, like its DB connection, are actually able to serve traffic — not just whether the process is running. Gateways can poll it and stop routing to an unhealthy instance.",
    "why": "A process being alive isn't the same as being able to do its job — it could be up but unable to reach its database, and without a health check that's invisible until real requests start failing.",
    "when": "Every service behind a gateway should have one, especially once you're running multiple instances.",
    "example": "On Zen Campus I set up health check endpoints on core services behind Ocelot so the gateway could tell if, say, billing could reach SQL Server. It saved us once when a service's DB connection string got misconfigured — the health check caught it as unhealthy before it failed real payment requests."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Technical",
    "question": "How do you think about log retention and PII redaction, especially working with a system that holds student and parent data?",
    "what": "I keep logs long enough to be useful for debugging and audits, then age them out. For PII, I don't log sensitive fields like phone numbers, addresses, or payment details in plain text — I mask them or leave them out entirely.",
    "why": "We handle sensitive student and parent data, so if logs get exposed to the wrong person, that's a real problem, not just a compliance checkbox.",
    "when": "I think about this at design time when writing logging statements, not as something to bolt on later.",
    "example": "When I built structured logging on Zen Campus, I made sure not to log full phone numbers or payment card details even at debug level. For OTP flows, we log that an OTP was generated and its status, not the OTP value or the full phone number — just a masked version."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Tell me about a cascading failure — where one service going down started taking others with it.",
    "what": "A cascading failure is when one service's slowness or downtime causes its callers to also back up and fail, spreading the problem outward. It usually happens when there's no timeout or circuit breaker on the call to the failing service.",
    "why": "Without a timeout or fallback, a single struggling dependency can take an entire request chain down, turning a contained problem into a system-wide outage.",
    "when": "This risk is highest wherever one service makes a synchronous call to another without a sensible timeout.",
    "example": "On Zen Campus, the notification service slowed down due to a third-party gateway hiccup, and billing, which called it synchronously after a payment, didn't have an aggressive timeout. Billing requests piled up waiting on a non-core service, making billing look down. Adding a strict timeout and making the notification step fire-and-forget with retry fixed it."
  },
  {
    "category": "Performance, Logging & Production Issues",
    "type": "Production Issue",
    "question": "Walk me through a time you profiled and fixed a slow database query or an N+1 query problem in production.",
    "what": "An N+1 problem is running one query for a list of records, then looping through and firing a separate query per record instead of one batched query — so a hundred records means a hundred-and-one round trips. Profiling means turning on query logging to see how many queries a single call triggers.",
    "why": "Each round trip has overhead on top of the query cost, so even fast queries add up fast when you're firing dozens or hundreds of them.",
    "when": "I suspect this when a screen showing a list with related data, like a class roster with attendance, gets slower as the list grows, way out of proportion to what one query should take.",
    "example": "On a student roster screen in Zen Campus, we made a separate Dapper call per student for attendance status — forty students meant forty-one queries. I rewrote it as a single query with a WHERE IN on the student IDs and mapped results back in memory. That's part of what fed into the 40% query-time improvement."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "Can you walk me through the structure of a JWT and what each part actually does?",
    "what": "A JWT is three base64url-encoded parts joined by dots: header, payload, and signature. The header names the signing algorithm, the payload holds claims like user id, role, and expiry, and the signature proves the token wasn't tampered with.",
    "why": "A JWT is encoded, not encrypted, so anyone can read the payload. That means you never put passwords or sensitive data in it.",
    "when": "I use JWT for stateless auth that needs to work across services without a shared session store, which is most of my microservices work.",
    "example": "In Zen Campus, the payload only had userId, role, school context, and exp. Someone once wanted to add the full user profile to skip a DB call, but I pushed back since that bloats the token and leaks data if intercepted. We kept it lean and let each service look up extra details itself."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "What's the difference between an access token and a refresh token, and why do you need both?",
    "what": "An access token is short-lived, around 15-30 minutes, and is sent on every API call. A refresh token lives much longer and is only used to get a new access token without logging in again.",
    "why": "This limits the damage if a token leaks, since a short-lived access token is only useful for a short window.",
    "when": "I use this pattern in any app where I want longer sessions but don't want to force frequent re-logins.",
    "example": "In Zen Campus we used short-lived access tokens and server-side refresh tokens so we could invalidate them if a device was compromised. Our first version reissued refresh tokens on every use, which made tracking messy. We switched to sliding expiry with rotation and stored the current valid refresh token hash per user."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "How do you handle token expiry, and how do you revoke a JWT before it naturally expires?",
    "what": "Expiry is easy, it's just the exp claim checked by middleware. Revocation is harder since JWTs are stateless, so the server doesn't automatically know a token should be dead.",
    "why": "You need revocation for real cases like someone getting fired, a stolen device, or a password reset.",
    "when": "I keep access tokens short by default, and only add a revocation mechanism when the risk justifies the extra complexity, like admin accounts or payments.",
    "example": "In Zen Campus we kept access tokens short-lived, and for refresh tokens we stored a token id with a revoked flag. On logout or a forced logout, we flip that flag and the refresh endpoint rejects it. We accepted the short access-token window instead of building a full blacklist, since checking one on every call across all services would add latency."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "What's claims-based authorization and how is it different from just checking roles?",
    "what": "Claims are key-value pairs on the token, like department or campusId, not just role. Claims-based authorization checks those specific values instead of a single role string.",
    "why": "Plain roles aren't enough when a teacher in one school shouldn't see another school's data, even with the same role name.",
    "when": "I use plain role checks for simple cases, and switch to claims when authorization depends on more than just who the user is.",
    "example": "In Zen Campus, we're multi-school, so we added a schoolId claim and checked it against the requested resource on every action. One early endpoint missed this check, and testing caught a staff user pulling another school's fee report by changing the URL id. I fixed it by enforcing the claim check as a policy instead of relying on each controller."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "When would you use role-based authorization versus policy-based authorization in ASP.NET Core?",
    "what": "Role-based is the [Authorize(Roles = \"Admin\")] attribute, simple and quick. Policy-based registers a named policy that can combine roles, claims, or custom logic.",
    "why": "Role checks scattered as string literals across many controllers become hard to maintain, while a policy centralizes the rule in one place.",
    "when": "I use role attributes for a few simple admin-only pages, and policies once RBAC spans a whole platform with multiple modules.",
    "example": "Zen Campus started with role attributes everywhere, and it got messy once we had six or seven roles across billing, admissions, transport, and hostel. We moved the complex checks to policies that combined role plus the schoolId claim, registered once and reused everywhere."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Scenario",
    "question": "You had multiple microservices behind Ocelot — how did you make sure JWT validation was consistent across all of them?",
    "what": "We validated the JWT at the Ocelot gateway first, then each microservice also had its own JWT bearer middleware with the same signing key and validation settings.",
    "why": "Validating only at the gateway is risky, since a service hit directly could accept unauthenticated calls, so this gives defense in depth.",
    "when": "This matters as soon as you have more than one service that needs to trust the same identity.",
    "example": "We configured Ocelot's authentication per route with the same JWT bearer scheme, and each service had matching issuer, audience, and signing key. The first time we set it up, a mismatched audience claim caused 401s on a valid token, and it turned out to be a config typo, not an auth bug."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "Where do you store the JWT on the client side, and what are the trade-offs?",
    "what": "The main options are localStorage, an HttpOnly cookie, or in-memory app state. localStorage is easy but exposed to XSS, while HttpOnly cookies block that but bring CSRF risk instead.",
    "why": "There's no fully safe option, so the choice depends on which risk you're better prepared to defend against.",
    "when": "For our Razor/MVC modules I leaned toward HttpOnly, Secure cookies since we weren't a pure SPA.",
    "example": "In Zen Campus we stored the token in an HttpOnly, Secure cookie because some pages used third-party JS libraries like chart plugins and PDF viewers, and I didn't want to trust that none of them had an XSS gap. We also added SameSite=Strict to cut down CSRF exposure."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "How do you protect an ASP.NET Core MVC app against XSS and CSRF?",
    "what": "For XSS, Razor auto-encodes output by default as long as you avoid @Html.Raw() on user input, plus a Content-Security-Policy header helps. For CSRF, ASP.NET Core's anti-forgery tokens with [ValidateAntiForgeryToken] handle it.",
    "why": "XSS lets an attacker act as the logged-in user, and CSRF lets a malicious site trigger actions using the victim's session since browsers auto-attach cookies.",
    "when": "This applies to every state-changing form and every place rendering user text, not just the important pages.",
    "example": "We used built-in anti-forgery tokens on all POST forms in Zen Campus, including admissions and fee payment forms. I specifically reviewed our dynamic form builder module, since it renders user-configured labels, to make sure Razor's encoding wasn't being bypassed with Html.Raw."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Scenario",
    "question": "Tell me about a time you had to fix or prevent SQL injection in your codebase.",
    "what": "The main defense is never concatenating user input into a query string, and always using parameterized queries through Dapper, EF Core, or stored procedures.",
    "why": "SQL injection is fully preventable but still happens when someone takes a shortcut with string interpolation to build a query quickly.",
    "when": "I check for this in code review whenever raw SQL is built dynamically, like search filters or report generators.",
    "example": "In one Zen Campus report module, a query was built by concatenating column and value strings for dynamic filtering, which was a real injection risk. I rewrote it using Dapper with parameterized values and a whitelist of allowed filter columns, since column names can't be parameterized like values."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "How do you enforce HTTPS/TLS across your services, and why does it matter even inside an internal network?",
    "what": "In ASP.NET Core that's UseHttpsRedirection and HSTS middleware, plus a valid certificate on Kestrel or IIS. I also made sure service-to-service traffic behind Ocelot used TLS, not just the client-facing edge.",
    "why": "Internal network traffic isn't automatically safe, since someone on the same network segment can sniff plaintext traffic between services.",
    "when": "Every environment, including internal service-to-service calls, with no exceptions.",
    "example": "For the bank locker OTP system, we enforced HTTPS end to end since we were transmitting OTP codes and locker commands. In Zen Campus we enabled HSTS in production and redirected any HTTP hit at the load balancer straight to HTTPS."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "How do you store passwords securely? Walk me through your hashing approach.",
    "what": "Never plaintext, and never fast hashes like MD5/SHA1. We used ASP.NET Core Identity's PasswordHasher, which uses PBKDF2 with a per-user salt and configurable iterations.",
    "why": "An adaptive algorithm lets you slow down brute-force attempts, and a per-user salt stops rainbow table attacks even if two users share a password.",
    "when": "Every credential store, with no exceptions, even for systems that feel low-risk internally.",
    "example": "In Zen Campus we used the standard ASP.NET Core Identity hashing for staff and student logins instead of rolling our own. For OTP codes in the bank locker system, we focused on expiry and one-time validation instead, and made sure OTPs were never logged in plaintext."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Technical",
    "question": "What about encryption at rest — how did you handle sensitive data sitting in the database?",
    "what": "We used SQL Server's Transparent Data Encryption for data files at rest, and added column-level encryption for specific sensitive fields like bank account details or ID numbers.",
    "why": "TDE protects against a stolen database file or backup, but not against someone with legitimate DB access reading sensitive columns directly.",
    "when": "I'd use TDE as a baseline for any production database, and add column-level encryption only for financial, medical, or identity data.",
    "example": "In Zen Campus, most data was academic, so encryption at rest was mainly TDE plus restricted DB access. For the locker system, the audit trail and identity data sat behind stricter access controls. Column-level encryption for specific fields was discussed more than fully implemented; TDE plus tight role-based access was our practical baseline."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Scenario",
    "question": "How familiar are you with OWASP Top 10, and how did you apply it practically in your projects?",
    "what": "I know it well enough to use as a checklist, covering things like broken access control, injection, and cryptographic failures. In practice it maps to what I was already doing, like parameterized queries and RBAC checks.",
    "why": "It's useful as a review lens when designing or reviewing code, catching issues before they reach QA.",
    "when": "I pull it out during design review for new public endpoints, and during code review for auth or data access changes.",
    "example": "Broken access control actually bit us in Zen Campus, when a staff user could access another school's report by tweaking a URL id before we added the schoolId claim check. That's a textbook OWASP issue, and we started writing tests specifically for cross-tenant access after that."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Scenario",
    "question": "Walk me through how you secured the OTP flow in the bank locker system end to end.",
    "what": "The flow was generate, deliver, validate, expire, with a security check at each step. Codes were random, never logged in plaintext, validated against a short expiry window, and locked out after a few failed attempts, with everything written to an audit trail.",
    "why": "A locker system controls physical access, so every step of the OTP pipeline needed its own check, not just relying on HTTPS alone.",
    "when": "This layered approach makes sense whenever the thing being protected is physical or financial access.",
    "example": "We ended up with zero unauthorized access incidents after deployment. Our first OTP expiry of five minutes was too generous, so we tightened it and added attempt lockout. The locker hardware only accepted a validated session token, not the OTP itself, so a replayed OTP alone couldn't trigger the lock."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Scenario",
    "question": "Why did you build audit trail logging for the OTP system, and what did you actually log?",
    "what": "We logged every stage of the OTP lifecycle: generation, who requested it, delivery, every validation attempt, and expiry, all timestamped and tied to the locker id and user id in SQL Server.",
    "why": "For a physical access system, you need to be able to answer who tried to access a locker and when, without ambiguity.",
    "when": "Any system with physical or financial consequences needs this from day one.",
    "example": "The audit table was genuinely useful during testing, letting us trace exactly why an OTP validation failed instead of guessing. One user complained their OTP wasn't working, and the audit trail showed they were retrying an already-expired code, saving us from chasing a phantom bug."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Production Issue",
    "question": "Say a JWT gets stolen — maybe intercepted or leaked in a log. How do you deal with token replay attacks in production?",
    "what": "Short expiry is the first defense, so a stolen token has a limited window. On top of that, we made sure logging middleware scrubbed Authorization headers so tokens were never logged in plaintext.",
    "why": "You can't fully prevent theft, so the goal is limiting damage and catching misuse fast.",
    "when": "This becomes important as soon as an app handles anything beyond low-risk internal data.",
    "example": "While building centralized logging middleware in Zen Campus, I checked that we weren't accidentally logging full Authorization headers or request bodies with tokens. Our first version logged headers wholesale for debugging, which would've been a real problem if that log ever leaked, so we stripped sensitive headers before writing to the log store."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Production Issue",
    "question": "Did you ever run into brute-force login attempts in production? How did rate limiting play into that?",
    "what": "Rate limiting caps how many requests, especially failed login or OTP attempts, a client can make in a window, then blocks further attempts for a cooldown. We configured this at the Ocelot gateway level.",
    "why": "Without rate limiting, a login or OTP endpoint is an open door for scripted guessing, and rate limiting makes that impractical.",
    "when": "Any public-facing auth endpoint needs this from day one, like login, OTP validation, and password reset.",
    "example": "I configured Ocelot's rate limiting on our auth routes in Zen Campus to protect all the services behind it. For bank locker OTP validation, we added an attempt-lockout on top, invalidating the OTP session outright after a few wrong guesses since a locker is physical access."
  },
  {
    "category": "JWT Authentication, RBAC & Security",
    "type": "Production Issue",
    "question": "How do you manage secrets like JWT signing keys, connection strings, and SMS gateway API keys across environments?",
    "what": "Nothing sensitive goes into appsettings.json in source control. We used environment-specific config with secrets from environment variables or a secrets store, and .NET user-secrets for local dev.",
    "why": "Hardcoded secrets in source control end up in git history forever, and separating config by environment prevents a dev from accidentally hitting production data.",
    "when": "From day one on any project, since retrofitting secrets management later is a much bigger job.",
    "example": "In Zen Campus, since we containerized everything with Docker, we passed secrets like the JWT signing key and DB connection strings through environment variables at container runtime. I was especially careful with the SMS gateway API key since it's tied to real money per SMS sent, and I double-checked our .gitignore covered local secrets files."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "Can you walk me through the overall architecture of Zen Campus, the school ERP you built?",
    "what": "Zen Campus isn't one big app. It's a set of ASP.NET Core Web API microservices behind an Ocelot gateway, with a Razor MVC front end that only talks to the gateway. Admissions, attendance, billing, payroll, inventory, and student management are each their own service with their own database — mostly SQL Server, plus MongoDB for a couple of services that needed flexible schemas.",
    "why": "A single bloated app could let one heavy module, like reporting, slow down something critical like attendance marking. Splitting by business capability let us deploy a fix to one service, like billing, without touching others.",
    "when": "This was decided early on, around when I joined the project in August 2023, before most modules were built out.",
    "example": "A senior dev sketched the gateway-and-services design on a whiteboard early on. Once attendance had a bad day from an N+1 query bug, the problem stayed contained to that one service while everything else kept running. That's when I really trusted the architecture."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "How did you design the admissions module — what were the tricky parts?",
    "what": "Admissions is a multi-step form — student details, parent details, documents, previous school records — saved as a draft at every step. It has client-side and server-side validation, then a workflow of pending, verified, approved, rejected, with role-based control over who can move it between states.",
    "why": "Draft-save was added because front-office staff lost data when the browser crashed mid-form. Splitting the workflow into real states also made it easy to add new approval steps later.",
    "when": "I built this in my first two months on the project.",
    "example": "A parent's admission once vanished because our draft-save was keyed to session ID, and the session expired while they stepped away. I switched the draft key to an admission-reference plus student identifiers instead of session state. That fixed it for good."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "Tell me about the attendance module — how did you handle marking and reporting at scale?",
    "what": "Attendance looks simple — mark present or absent — but it also has bulk marking, an edit window so old records need special permission to change, and aggregation for monthly and yearly percentage reports used by other modules. I used Dapper for the marking writes since that's a heavy daily load, and stored procedures for the aggregation queries.",
    "why": "Dapper beat EF Core on the write path because every teacher hits attendance around the same time each morning, and EF's overhead was noticeable in load tests. The edit-window rule came from a compliance request.",
    "when": "Bulk marking and aggregation were built over a few sprints in late 2023; the edit-window rule was added later after a client request.",
    "example": "During load testing, the aggregation endpoint's response time fell off a cliff. It turned out a missing composite index on student ID plus date caused a full table scan. Adding the index dropped response time from about four seconds to under half a second."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "Walk me through how you designed the billing module — fee structures, payments, receipts.",
    "what": "Billing handles fee-structure setup per class or student category, invoice generation, payment gateway integration, and PDF receipts. It also supports partial payments, so invoices track a running balance instead of a simple paid/unpaid flag.",
    "why": "We modeled billing as a ledger because parents often pay in installments, sometimes with mid-year discounts, and a boolean couldn't capture that. PDF receipts were also required as proof of payment.",
    "when": "Core billing was built around the same time as attendance; installment support was added a sprint or two later.",
    "example": "A parent once paid the exact remaining balance, but the invoice stayed 'partially paid' instead of 'paid'. It was a decimal rounding mismatch between our stored amount and the gateway's returned amount. Rounding both sides to two decimals before comparing fixed it."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "What did the payroll module involve, and what made it different from the other modules you built?",
    "what": "Payroll calculates salary using attendance data for leave deductions, plus allowances and deductions, and generates monthly payslips as PDFs. It has its own approval workflow so HR reviews it before it's finalized and locked.",
    "why": "We didn't duplicate leave data into payroll's own database, because that would drift out of sync whenever an attendance record was corrected later. Payroll pulls attendance summaries through an internal API call instead.",
    "when": "Payroll was built about five or six months into the project, once attendance was mature enough to expose reliable data.",
    "example": "Once a month, when the attendance service was under load, payroll finalization would hang waiting on that cross-service call. I added a short cache on payroll's side with a manual refresh button for HR. It wasn't elegant, but it unblocked HR and nobody complained after."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "Tell me about the inventory module — how did you approach stock tracking for a school?",
    "what": "Inventory tracks lab equipment, sports gear, and similar stock — stock-in, stock-out, transfers, and low-stock alerts. Every movement is logged as a transaction record instead of just updating a quantity field, so there's a full audit trail.",
    "why": "Schools kept asking who took an item out after the fact, and a single quantity field couldn't answer that. The transaction log also made reconciliation easier.",
    "when": "Inventory was built around the middle of the project, after billing and attendance were stable.",
    "example": "A lab assistant once claimed a beaker shipment never arrived. We pulled the exact transaction showing it was received and then transferred to another lab the same day. That saved an awkward blame conversation."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "How did you build the dynamic PDF and Excel report generation feature?",
    "what": "Instead of hardcoding a report per school, I built report definitions as metadata — columns, data source, grouping, formatting — stored in the database. A generic engine reads that metadata and renders either a PDF or Excel file from the same dataset.",
    "why": "Hardcoding a new report class for every school request didn't scale once fifteen schools each wanted something slightly different. A data-driven design turned new report requests into configuration instead of new deployments.",
    "when": "This started as a one-off hack for a single school's report and grew into the generic engine over three or four sprints.",
    "example": "The Excel renderer was trickier than the PDF one because of merged cells and header freezing driven from the same metadata. At one point Excel columns came out in the wrong order because I iterated columns differently for PDF versus Excel. Fixing that mapping resolved it."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "Tell me about the dynamic form builder you worked on — how does it actually work under the hood?",
    "what": "The form builder is an admin UI where fields — text, dropdown, date, file upload, checkbox — are defined with label, validation, required flag, and order, stored as structured metadata rather than form markup. The rendering side reads that metadata and builds the form at runtime, and submissions are stored against the field definitions.",
    "why": "Every school wanted different extra fields, and redeploying code for each one wasn't realistic once multiple schools were live. Storing submissions flexibly, more like key-value pairs, is part of why MongoDB fit well here.",
    "when": "This was built around six or seven months in, once a few schools asked for form customization in the same sprint cycle.",
    "example": "Client and server validation had to mirror each other exactly since both read the same metadata. A bug let a required field pass on the client but silently fail on the server when it was hidden by a conditional rule. I fixed it by making server validation respect the same visibility rules as the client."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "How did you approach building dashboards across the different modules?",
    "what": "I built dashboards as a widget-based layout, where each widget calls its own lightweight aggregation endpoint on the relevant service. The dashboard page itself is a shell that composes calls to attendance, billing, and other services.",
    "why": "I avoided one giant dashboard endpoint joining across every service's database, since that breaks service separation and a slow query in one widget shouldn't hang the whole dashboard. Independent widgets are more resilient even with more round trips.",
    "when": "Dashboards came later, after most modules already had their core CRUD and reporting built.",
    "example": "The fee-collection widget was slow enough that people thought the whole system was down. It turned out that query wasn't using an index the equivalent report page already had. Reusing the report's optimized query fixed the dashboard widget too."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Production Issue",
    "question": "What's the trickiest bug you've had to fix on Zen Campus?",
    "what": "Students were intermittently getting marked present for classes they weren't scheduled for, showing up roughly once every couple of days across different schools. It wasn't reproducible on demand.",
    "why": "It looked like a data problem, but it was actually a concurrency issue, so by the time we checked the database there was no obvious trail of how it happened.",
    "when": "This hit production a few weeks after a school with a much bigger student count went live.",
    "example": "I first suspected double-submission and added a button-disable-on-click fix, but it still happened. Detailed logging showed two teachers for the same class but different periods were sharing a cache key scoped only by class and date, not period. Adding the period to the cache key fixed it."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "How did you decide where to draw the boundaries between microservices — why is attendance its own service and not part of student management, for example?",
    "what": "We debated whether attendance should live inside student-management since it's technically about a student. We split them based on data ownership and change frequency instead — attendance is written constantly every day, while enrollment details rarely change.",
    "why": "Our rule of thumb was: if two pieces of data are read and written by different people at very different frequencies, they shouldn't share a database or deployment lifecycle.",
    "when": "This decision happened early, around month two or three, before module boundaries had hardened.",
    "example": "Billing versus student-management was the harder call since billing constantly needs student details. We kept them separate because billing's release cadence — fee changes right before a term — needed to be independent of student-management deploys. Looking back, it was the right call, though it took real debate at the time."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "How did you handle idempotency in the payment processing flow?",
    "what": "When a parent clicks pay, we generate a unique transaction reference before calling the gateway and store it with an 'initiated' status. The gateway callback is matched back to that reference, and if the same callback arrives twice, the second one is a no-op since the transaction is already in a terminal state.",
    "why": "Double-charging a parent destroys trust instantly, and gateway callbacks aren't guaranteed to arrive exactly once. The transaction reference was a more reliable idempotency key than deduping on amount and timestamp.",
    "when": "This was added during payment gateway integration, after a staging test where firing the same callback twice updated the balance twice.",
    "example": "Seeing a duplicate credit in staging was alarming, even though it turned out to be my own test. I added a unique constraint at the database level too, not just an application check. That constraint later blocked a bug that a retry-logic change would have reintroduced."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "How did you go about testing the OTP lifecycle for the bank locker system?",
    "what": "I wrote tests for OTP generation, delivery, validation, and expiry, each with its own failure modes. I mocked the SMS gateway to test delivery failures without burning real SMS credits, and specifically tested expiry boundaries — right at expiry and just after.",
    "why": "An OTP accepted even slightly past expiry is a real security gap for a bank locker, not a minor bug. Mocking the SMS gateway was a practical necessity for automated test runs.",
    "when": "This testing ramped up right before the locker system went live.",
    "example": "One edge case nearly slipped through: requesting a second OTP before the first expired had undefined behavior for whether the first stayed valid. We decided a new OTP always invalidates the previous one, and wrote a test for it. I'm glad we caught that in testing."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Production Issue",
    "question": "How did you handle concurrent access to the same locker — like two requests trying to open it at once?",
    "what": "Two requests could hit the open-locker endpoint for the same locker almost simultaneously. I added a database-level lock on the locker's row during state changes, so only one request can flip the state at a time — the other gets a clear 'locker busy' response.",
    "why": "The physical hardware can't handle two open commands close together gracefully, unlike a web form duplicate. The software needed to be the single source of truth for whether a locker was mid-transition before signaling the hardware.",
    "when": "This became a concern during hardware stress-testing, not initial development.",
    "example": "During a hardware test, a vendor's retrying script sent repeated open requests because the TCP response was slow. The locker started clicking oddly, and we initially thought the hardware was faulty. Adding a row-level lock plus a short cooldown after state changes fixed it."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "Looking back now, is there anything about Zen Campus or the locker system you'd design differently?",
    "what": "I'd introduce an event-driven layer, like a message queue, between services earlier instead of relying so much on direct synchronous calls, such as payroll calling attendance directly. It works, but a slow service ripples into others.",
    "why": "A queue would let services react to changes, like an attendance correction, asynchronously instead of everyone calling and waiting in real time. It probably would've prevented the payroll-attendance latency issue we later patched with caching.",
    "when": "This realization built up gradually over the project rather than hitting me at one moment.",
    "example": "On the locker side, our first TCP protocol was too chatty, with lots of small handshake messages before the actual open/close command. A leaner protocol with fewer round trips would've cut real latency, especially on shakier networks. We never got around to redoing it, but I still think about how I'd fix it."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Scenario",
    "question": "What was it like onboarding into Zen Campus when you joined — how did you get up to speed?",
    "what": "I joined RAX Tech in February 2023 and started on the bank locker project first, then moved to Zen Campus around August 2023. There wasn't a formal onboarding doc — mostly pairing with a senior dev and reading existing services.",
    "why": "Moving from a small, contained locker system to a multi-service ERP with a gateway meant holding a lot more context in my head. Tracing a single request end to end helped me actually understand how the pieces connected.",
    "when": "This was August 2023, when I transitioned from the locker project onto Zen Campus.",
    "example": "My first ticket was a small bug in the attendance report page, and I wasn't sure whether the fix belonged in the MVC controller, the service, or the gateway config. Walking through the whole call chain with a teammate taught me the architecture better than any document. After that, later tickets were much faster to place correctly."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "How do you keep data in sync across the different microservices in Zen Campus — say, when a student's details change?",
    "what": "Zen Campus doesn't fully duplicate data across services. Each service owns its core data, and other services either call across via internal APIs for real-time needs, like payroll pulling attendance, or keep a lightweight cached copy of just the fields they need, like billing caching a student's name and class.",
    "why": "Full duplication is hard to keep consistent, but calling across services on every page render is slow and creates tight coupling. Cached copies were a middle ground, trading some staleness for resilience and speed.",
    "when": "This pattern emerged gradually as more services needed each other's data.",
    "example": "A student's name was corrected in student-management, but the fix never propagated to billing's cached copy, so invoices showed the old name for weeks. We added a lightweight update-notification call so student-management pings services that cache its data whenever a core field changes. It's not a full event bus, but it closed the gap."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "PDF reports often contain sensitive student data — how did you secure that, given it's PII?",
    "what": "Legal flagged that our PDF reports contained student names, dates of birth, and sometimes parent contact info. I added access checks at generation time so a user can only generate reports within their RBAC scope, and started watermarking downloaded or emailed reports with the requesting user's identity and timestamp.",
    "why": "Authorization needed to happen server side, since a hidden UI button doesn't stop someone hitting the report endpoint directly. Watermarking added accountability after the fact, since you can't prevent every screenshot but you can make it traceable.",
    "when": "This tightening happened after the legal review, around when we were preparing to onboard a client with stricter data-handling requirements.",
    "example": "Before the review, some reports checked roles in the controller but the underlying report-generation endpoint didn't re-validate scope — it trusted the filter parameters it received. Our own QA team found this by editing a report URL's query string and pulling data outside their assigned classes. After that, I made it a habit to always re-check authorization at the service layer."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Production Issue",
    "question": "How did you handle academic-year rollover and the data migrations that come with it?",
    "what": "Every year, schools roll over — students get promoted, fee structures reset, attendance counters restart, while old data stays intact. I built a rollover process that creates new academic-year-scoped records instead of overwriting existing ones.",
    "why": "Schools legally need to keep historical academic records, and parents sometimes need old fee receipts or attendance data for transfer certificates. Tagging records by academic year kept things auditable, even though queries got slightly more complex.",
    "when": "The first real rollover happened around April 2024, matching the typical Indian academic year transition.",
    "example": "We ran the first rollover on a weekend with a full backup taken beforehand, since a promotion mistake would be hard to fix. We caught one issue where students marked 'detained' were still getting auto-promoted because the query didn't exclude that status. We fixed it and added a verification report as a permanent step in the rollover checklist."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "Can you get into the specifics of how you configured Ocelot as the API gateway for Zen Campus?",
    "what": "I set up Ocelot route definitions mapping upstream paths to downstream services, each with their own host and port, plus rate limiting on heavier routes like report generation. Authentication was centralized at the gateway, validating the JWT before a request reached any downstream service.",
    "why": "Centralizing JWT validation meant individual services didn't need to reimplement auth logic — they trusted requests coming through the gateway. Rate limiting only heavier endpoints avoided throttling normal usage elsewhere.",
    "when": "The initial gateway setup happened early in the project; rate-limiting rules were tuned later after a report endpoint got hit hard during an exam-result week.",
    "example": "I once fat-fingered a downstream port number in the Ocelot config, and the fee-payment route silently pointed at the wrong service instance. Thankfully it just returned 404s instead of routing somewhere dangerous. After that, we started double-checking route configs specifically during code review."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "Explain how JWT authentication and RBAC work across all the different services in Zen Campus.",
    "what": "Users log in once against an auth service, and the same JWT is used across attendance, billing, payroll, and every other module. The token carries claims — user ID, role, and school/institution ID — and each service independently checks those claims against its own rules.",
    "why": "Validating the token locally in each service, using a shared signing key, avoided a network round trip to a central auth service on every request. Baking the school/tenant ID into claims meant one school's admin couldn't query another school's data even by guessing an ID.",
    "when": "This was foundational, set up early alongside the gateway, since little else could be tested without auth working end to end.",
    "example": "We had a near-miss where one service checked for the claim name 'role' while the token used 'Role', so that service silently treated every request as unauthorized. It still allowed read-only actions by default but would've blocked writes. QA caught it before production, and we standardized claim names in one shared constants file after that."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Production Issue",
    "question": "Your resume mentions a 40% query performance improvement — walk me through that story in detail.",
    "what": "The 40% improvement came from several smaller fixes stacked together, not one silver bullet. I used SQL Profiler and execution plans to find slow reports and list pages, added missing indexes, converted some inefficient EF Core LINQ queries to Dapper or stored procedures, and added in-memory caching for reference data like class lists and fee categories.",
    "why": "EF Core's generated SQL for queries with several joins and filters wasn't always efficient. Moving those hot-path queries to hand-tuned Dapper SQL, plus caching static data, cut unnecessary re-querying.",
    "when": "This was a dedicated performance push about three or four months after multiple schools went live, once slowness turned into real support tickets.",
    "example": "The biggest single win was a student-search query doing a leading-wildcard LIKE search on a non-indexed column. Switching to a full-text index and restructuring the search cut that query's time dramatically. Across all the changes together, average query execution time improved by about 40%."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "Why did you use MongoDB alongside SQL Server in Zen Campus instead of just sticking with one database?",
    "what": "SQL Server was the default for almost everything, but dynamic form submissions from the form builder and some audit logging needed to store whatever fields were relevant without a rigid schema. MongoDB's document model fit those better than relational tables with many nullable columns.",
    "why": "The relational alternative was a giant table with dozens of nullable columns, or an awkward entity-attribute-value pattern, both painful to query and maintain. MongoDB let each submission be a document shaped like that form's own fields, and reporting still worked fine.",
    "when": "This was introduced when the form builder was being designed, and applied to audit logging a bit later.",
    "example": "There was pushback from an architect about adding a second database technology to operate and back up. That concern turned out to be valid, since we had to plan Mongo's backup and monitoring separately from SQL Server. Still, for form-submission data, it was the right call — forcing that variable-shape data into relational tables would've made the form builder messier."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Technical",
    "question": "Tell me about the TCP socket design for communicating with the locker hardware.",
    "what": "We were handed a TCP spec for the locker hardware and had to work out the practical edge cases ourselves. Our backend keeps a persistent TCP connection to each locker controller, sending command messages like open, close, and status-check, and reading back acknowledgment and independent sensor-state messages like door-open and lock-engaged.",
    "why": "Persistent connections avoided the latency of opening a fresh TCP connection per command, which would've felt slow to a user waiting at a physical locker. Reading independent sensor state mattered because a successful command and the door actually opening are two different facts, and treating them as the same would be a security gap.",
    "when": "This was the core of the bank locker project's early phase, roughly February through mid-2023.",
    "example": "Connection drops were the recurring headache — a locker unit on a flaky network would silently disconnect, and our first version only noticed when the next command failed. We added a heartbeat ping to detect dead connections and reconnect proactively. That heartbeat cut down more support complaints than any other single change."
  },
  {
    "category": "Zen Campus ERP & Bank Locker — Project Deep-Dive",
    "type": "Production Issue",
    "question": "Your resume mentions sub-3-second SMS delivery for OTP — how did you actually achieve and verify that?",
    "what": "Sub-3-second delivery came from a few things together: picking an SMS gateway with a reasonable response time, not blocking the OTP-generation API on full delivery confirmation, and returning success once the gateway accepted the request, with retry logic for slow gateway acknowledgment.",
    "why": "We didn't wait for full delivery confirmation from the carrier, since that's outside our control and can take longer, which would've made our API feel slow. Async dispatch with a fast gateway-acceptance check balanced speed with knowing the message was handed off.",
    "when": "This tuning happened during pre-launch performance testing, once functional testing was mostly done.",
    "example": "Our OTP flow initially felt sluggish even though each piece seemed fast alone. It turned out the SMS gateway call was synchronous with an OTP audit log write to SQL Server that had occasional latency spikes. Making the audit log a fire-and-forget background write brought response times consistently under three seconds."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Tell me about yourself.",
    "what": "This is a quick walk through my career so far - where I studied, how I got into .NET, and what I do now at RAX Tech. It's a highlight reel, not my full resume.",
    "why": "It gives the interviewer a structure to ask follow-ups, and shows I can summarize years of work briefly.",
    "when": "This is almost always the opening question, so I keep it under a minute and a half.",
    "example": "I did my B.Tech in ECE in 2018, then taught myself C# and moved into .NET. I've been at RAX Tech International since February 2023, first on a bank locker OTP system, then on Zen Campus, our school ERP built with ASP.NET Core microservices and an Ocelot gateway. I also maintain some older WinForms apps, and I'm now looking to grow more into architecture work."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Why are you looking for a change?",
    "what": "I've plateaued a bit at RAX in scope - I want more architecture-level ownership, not just building modules inside a system someone else designed.",
    "why": "Interviewers listen for negativity about my current employer, so I keep this positive and forward-looking.",
    "when": "This usually comes right after the intro, so I keep it short.",
    "example": "I've learned a lot at RAX, especially on Zen Campus's microservices side. But most big architecture calls, like service boundaries and the Ocelot setup, were made before I had a seat at that table. I want to be closer to that layer, not just implement it. I'd also like a role more focused on the modern stack, since I still spend time on old WinForms apps."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Tell me about a time you had a conflict with a teammate.",
    "what": "This is about a disagreement with a teammate on Zen Campus over whether to use EF Core or Dapper for a report query, and how we resolved it with data.",
    "why": "It shows I can disagree with a colleague without conflict, and that I trust testing over opinions.",
    "when": "I bring this up only if asked directly about conflict or teamwork friction.",
    "example": "A teammate wanted EF Core for a heavy attendance report query; I felt Dapper with a stored procedure would be faster. Instead of arguing, we benchmarked both against production-sized data. Dapper was faster but EF was easier to maintain, so we used Dapper for the heavy read and EF for simpler CRUD."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Tell me about a time you missed a deadline.",
    "what": "I missed a sprint deadline on a billing report because I underestimated how messy the historical fee data was.",
    "why": "This shows accountability - owning the miss and explaining what I changed afterward.",
    "when": "I bring this up only when asked about missing a deadline or handling failure.",
    "example": "I was building PDF billing reports and told my lead I'd finish by sprint end. Partial payments and refunds in old data broke my report logic, so I needed two extra days. I flagged it to my lead as soon as I realized instead of hiding it, and since then I check real data before estimating."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Achievement",
    "question": "What's your biggest achievement so far?",
    "what": "I'm most proud of helping architect the microservices setup for Zen Campus, including configuring the Ocelot gateway for routing, load balancing, and rate limiting.",
    "why": "It's foundational architecture work other modules depend on, not just a single feature.",
    "when": "This is my go-to answer for the open-ended 'biggest achievement' question.",
    "example": "I helped set up the Ocelot API Gateway for routing, load balancing, and rate limiting across services that now handle over a thousand concurrent users during peak admissions. We also containerized everything with Docker Compose so anyone can spin up the full environment locally in minutes."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Tell me about your biggest failure.",
    "what": "Early on Zen Campus, I added an index without testing it against production-scale data, and it made a report slower for some users.",
    "why": "This is a real technical mistake with real consequences, and it shows what I learned about testing at scale.",
    "when": "I bring this up only when asked directly about failure or a mistake.",
    "example": "I added an index for an attendance query that looked good locally. After deploying, a related report got slower for schools with lots of historical data. I had to profile both query paths and restructure the index. Now I always test performance fixes against a production-sized dataset."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Tell me about a time you disagreed with a senior developer or architect.",
    "what": "I disagreed with a senior architect about keeping payment processing inside the same service as student management, over scaling concerns.",
    "why": "It shows I can push back with reasoning and evidence, but still defer once a decision is made.",
    "when": "Good for questions about disagreeing with authority or working with an architect.",
    "example": "A senior wanted payment logic bundled with student APIs to save time. I showed data on how request volumes differed during peak admissions, and after a couple of meetings we agreed to split payments into its own service. Once decided, I just built it - the debate was over."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Environmental/Struggle",
    "question": "Describe a time you had to work under a really tight Agile sprint deadline.",
    "what": "Before an admission cycle, our sprint got compressed for the admissions module, so I cut scope smartly while keeping code coverage above 90 percent.",
    "why": "This shows I can work under a real business deadline without dropping quality standards.",
    "when": "Use this for deadline pressure inside a sprint, not a general missed-deadline story.",
    "example": "The admissions go-live date was fixed, so I worked with my lead to ship the core field types covering 90 percent of use cases and held rare ones for a fast-follow. We kept unit test coverage above 90 percent even under the time crunch. We hit the date, and the rest shipped about a week later."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Problem-Solving",
    "question": "How do you debug a bug you can't reproduce?",
    "what": "I lean on logging and structured data instead of guessing, like when I had intermittent TCP socket drops between the locker hardware and backend I couldn't reproduce on demand.",
    "why": "This shows I use instrumentation and correlation instead of just guessing, which matters in distributed systems.",
    "when": "Good for technical problem-solving rounds that want real debugging methodology.",
    "example": "Locker TCP sockets dropped intermittently, maybe once every few hundred sessions. I added detailed logging around the socket lifecycle instead of trying to reproduce it. After a few days of logs, I saw the drops correlated with a slow SMS gateway response tying up a thread. Once I saw the pattern, the fix was small."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Problem-Solving",
    "question": "How do you approach getting familiar with an unfamiliar codebase?",
    "what": "When I inherited old WinForms apps with no documentation, I traced actual user flows first instead of trying to understand everything upfront.",
    "why": "This shows a practical, incremental strategy instead of claiming to read the whole codebase.",
    "when": "Comes up for onboarding or legacy-system questions.",
    "example": "I ran the app like a real user, clicked through main workflows, and used breakpoints to see what fired when. When I got a bug ticket, I went deep only into that specific flow. It's slower at first, but I understand exactly what I need."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Environmental/Struggle",
    "question": "How do you prioritize when everything feels urgent at once?",
    "what": "I ask what actually breaks the most people versus what just feels loud, and I tell my lead directly when I can't do everything at once.",
    "why": "This shows judgment under pressure instead of just working longer hours.",
    "when": "Bring this up for questions about juggling competing demands.",
    "example": "I often have a sprint task, a production ticket, and a WinForms issue all at once. Production issues affecting live school operations always jump the line for me. I tell my lead directly when something has to slip instead of quietly trying to do all three badly."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Environmental/Struggle",
    "question": "How do you manage maintaining legacy WinForms applications while working on new microservices?",
    "what": "It's a real context-switching challenge - jumping between distributed services thinking and debugging an old monolithic desktop app.",
    "why": "This shows self-awareness about a genuine ongoing struggle instead of pretending it's effortless.",
    "when": "Bring this up when asked about handling legacy systems alongside modern architecture.",
    "example": "In the morning I might think through the Ocelot gateway flow, then after lunch debug an old WinForms event handler. What helps is blocking time - I dedicate a morning or afternoon to legacy work instead of hopping back and forth constantly. Staff still depend on those apps daily, so it matters."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "You come from an ECE background - how did you transition into software development?",
    "what": "Electronics didn't work out the way I expected, so I taught myself C# and .NET and worked my way into software.",
    "why": "Being honest about the uncertainty lands better than a polished story, and shows real initiative.",
    "when": "Comes up if my education is reviewed closely or they're curious about my technical foundation.",
    "example": "I graduated in ECE in 2018, but hardware roles were limited near me at the time. I liked the programming and embedded parts of college more than circuit design, so I taught myself C#, built small projects, and got into RAX Tech as a .NET developer. The logical debugging habits from ECE still help me today."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Problem-Solving",
    "question": "How did you get up to speed on microservices and Ocelot without prior exposure to them?",
    "what": "I hadn't used Ocelot before Zen Campus moved to microservices, so I combined a Pluralsight course with building small test gateway setups myself.",
    "why": "This shows a structured, hands-on approach to learning new technology under deadline pressure.",
    "when": "Good for questions about learning new technology or ramping up fast.",
    "example": "I took a Pluralsight course on microservices with .NET to learn the concepts, and spun up a small two-service demo on my own laptop to configure Ocelot myself. Actually seeing a request get throttled taught me more than the course alone. By the time we built the real gateway, I wasn't starting from zero."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Environmental/Struggle",
    "question": "How do you handle requirements changing in the middle of a sprint?",
    "what": "The admissions team once added a field requirement mid-sprint after a demo, and I flagged the impact instead of quietly absorbing the extra work.",
    "why": "This shows I make tradeoffs visible instead of silently swallowing scope creep.",
    "when": "Use this for questions about Agile flexibility or shifting requirements.",
    "example": "After an early demo, the admin team needed a guardian-relationship field we hadn't scoped, two days from sprint end. I told my lead what adding it would affect, and we moved a lower-priority validation rule to the next sprint instead. Making the tradeoff visible worked better than just eating the extra work."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Environmental/Struggle",
    "question": "How do you balance production support pressure against feature delivery commitments?",
    "what": "On the bank locker system, production issues almost always took priority over feature work, since it affects real people trying to open a locker.",
    "why": "This shows judgment about live user impact versus a roadmap item, and honesty about the real tradeoff.",
    "when": "Bring this up when asked about prioritizing support work versus planned delivery.",
    "example": "If an OTP delivery issue came in mid-sprint, it dropped everything else immediately. I always told my lead right away that a feature would slip because of it, instead of trying to silently do both. Live production issues involving real users win over a feature deadline that can move."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Problem-Solving",
    "question": "Tell me about a time you had to learn a new technology quickly under deadline pressure.",
    "what": "I had no prior MongoDB experience when we brought it into Zen Campus for analytics data, with about a week and a half before it needed to be demoable.",
    "why": "This is a concrete, recent example showing I can get productive fast in new tech without being an expert.",
    "when": "Use this for 'learning under pressure' questions.",
    "example": "I did a focused MongoDB course over a couple of evenings, then started building against it directly in a dev environment. There were a couple of rough days, but leaning on the flexible schema instead of fighting it helped things click. We hit the demo date, and that piece still runs the analytics today."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Achievement",
    "question": "Walk me through the 40% performance improvement you achieved.",
    "what": "On Zen Campus, I optimized Dapper and EF Core data access with proper indexing, stored procedures, and in-memory caching, cutting query execution time by about 40 percent.",
    "why": "This is a specific, numbers-backed story showing real depth in data access performance.",
    "when": "I bring this up whenever asked about performance work or a quantifiable achievement.",
    "example": "As more schools came onto the platform, listing and reporting screens got slow. I checked execution plans, found missing indexes and inefficient EF Core queries, and moved heavy reads to Dapper with tuned stored procedures. I also added caching on endpoints with mostly-static data. Across the pieces I touched, we cut query time by about 40 percent."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Achievement",
    "question": "Tell me about the zero unauthorized access record on the bank locker system.",
    "what": "I built the full OTP lifecycle - generation, SMS delivery, validation, and expiry - with audit logging and TLS for the bank locker system.",
    "why": "This is a strong security story because it shows end-to-end security thinking, not just one auth check.",
    "when": "Bring this up when asked about security work or another achievement example.",
    "example": "I built OTP generation, delivery through an SMS gateway, validation, and expiry, all logged into an audit trail in SQL Server. Everything ran over TLS, including the TCP communication with the locker hardware. Since going live, there's been zero unauthorized access incidents."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Achievement",
    "question": "Tell me about the 35% reduction in production incident resolution time.",
    "what": "I built centralized logging and exception-handling middleware across our services, which cut production incident resolution time by about 35 percent.",
    "why": "This shows I think about operational impact, not just user-facing features, and can quantify it.",
    "when": "Use this when asked about a third achievement, logging, or reducing downtime.",
    "example": "Before this, tracking a production issue meant jumping between inconsistent logs across services. I built centralized logging middleware that captures exceptions with consistent structure and correlation info in one place. After that, average incident resolution time dropped about 35 percent."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "What are your strengths and weaknesses?",
    "what": "My strength is data access and performance work - fixing slow queries properly instead of papering over them. My weakness is I can over-optimize before checking if it's actually the priority.",
    "why": "The strength is backed by a real pattern in my work, and the weakness is genuine, not a disguised humble-brag.",
    "when": "This is a standard mid-interview question, so I keep both halves short.",
    "example": "I enjoy digging into why a query is slow and fixing it at the root, which is why I ended up owning a lot of Zen Campus's performance work. My weakness is I can get too absorbed optimizing something already fast enough. I've gotten better by setting a rough time box before I start, and moving on if I haven't found the fix in that window."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Where do you see yourself in 5 years?",
    "what": "I want to move closer to solutions architecture, owning system design decisions rather than just implementing them, though the exact shape isn't fully mapped out yet.",
    "why": "Showing honest uncertainty reads as more credible than a rehearsed five-point plan, while still showing ambition.",
    "when": "This comes toward the later part of the interview.",
    "example": "I want to move from implementing architecture decisions to being part of making them, like service boundaries and how services talk to each other. I got a taste of that pushing back on design during Zen Campus and liked it. I'm also studying for AZ-900, so cloud architecture is part of that picture too."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "What questions do you have for me?",
    "what": "I usually ask about the team's architecture maturity and the split between new feature work and legacy or support work.",
    "why": "Asking specific, informed questions shows I've been listening and thought about whether the role fits me.",
    "when": "This comes at the end, and I pick two or three questions based on the conversation.",
    "example": "I ask what the day-to-day split looks like between new development and legacy or production support work. I also ask how mature the microservices setup is, and whether it's still evolving. Finally, I ask what the path from senior developer to an architecture-focused role looks like on their team."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "Why should we hire you?",
    "what": "I bring real production microservices experience with Ocelot and Dapper, measurable performance and security wins, and discipline from maintaining legacy systems.",
    "why": "This ties specific, quantified accomplishments to what the role likely needs, instead of a generic answer.",
    "when": "This usually comes near the end as a closing question.",
    "example": "I've helped architect production microservices with Ocelot handling over a thousand concurrent users, cut query times by 40 percent, and brought incident resolution down by 35 percent. I also shipped a security-critical OTP system with zero unauthorized access so far. Maintaining legacy WinForms apps alongside that work has made me more careful and pragmatic."
  },
  {
    "category": "Behavioral, Problem-Solving & Achievements",
    "type": "Behavioral",
    "question": "What is your notice period, and can it be reduced?",
    "what": "My official notice period at RAX Tech is 60 days, and I bring this up early rather than let it surprise anyone later.",
    "why": "Being direct and early builds trust, and shows genuine interest without overpromising.",
    "when": "I mention this toward the end of a first-round conversation, or immediately if asked.",
    "example": "My current notice period is 60 days, which I know is longer than some companies want. I'm generally open to discussing negotiating it down with my employer if a strong offer comes through, though I can't promise a specific number. I'd rather share the real figure now than have it become an issue later."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "Can you walk me through the WinForms event-driven model? How do event handlers and delegates actually work under the hood?",
    "what": "Every WinForms event, like a button click, is really just a multicast delegate. When you wire up a handler in the designer, it subscribes your method to that delegate with +=.",
    "why": "Handlers firing twice or not firing at all almost always trace back to how many times something got subscribed.",
    "when": "This comes up when debugging a handler that fires multiple times or when unsubscribing to avoid a leak.",
    "example": "On our locker management tool, a save handler was firing twice on every click. Someone had wired the same handler in both Designer.cs and the constructor. Removing the duplicate subscription fixed it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Production Issue",
    "question": "Have you run into issues from someone editing the .Designer.cs file directly? What happened?",
    "what": "Designer.cs is auto-generated whenever you drag a control or change a property in design view. If you hand-edit it, the designer can silently overwrite your changes later.",
    "why": "You lose changes with no warning and no compile error — the code just disappears.",
    "when": "I bring this up when I see business logic sitting in Designer.cs instead of the partial class file.",
    "example": "On an inherited form, someone added init logic inside InitializeComponent in Designer.cs. A dev later resized a panel in the designer and the logic vanished. It took an hour of comparing source history to find it, so I made it a team rule: custom code goes in the partial class, never Designer.cs."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "How does data binding work in WinForms — say binding a DataGridView to a DataTable versus a List<T>?",
    "what": "You can bind a DataGridView to a DataTable, which gives change tracking and works with a DataAdapter for updates. Or bind to a List<T> wrapped in a BindingSource, where WinForms uses reflection to build the columns.",
    "why": "The BindingSource syncs data and grid, but the grid won't refresh on list changes unless it's a BindingList<T> that raises notifications.",
    "when": "I use DataTable binding when close to the database, and List<T> with BindingList for plain POCOs from a service call.",
    "example": "On a legacy form, a DataGridView was bound to a plain List<T>, so it wouldn't refresh after a save. I reset the DataSource as a quick fix, then switched the backing collection to BindingList<T> for the real fix."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Production Issue",
    "question": "Tell me about a time you hit the 'cross-thread operation not valid' exception. How did you fix it?",
    "what": "This exception fires when a background thread touches a UI control directly, since WinForms controls aren't thread-safe. The fix is checking InvokeRequired and using Invoke or BeginInvoke to update the UI on the right thread.",
    "why": "It's the most common crash in any WinForms app that does background work like polling a service or reading from a socket.",
    "when": "This comes up with background threads, Timer callbacks, or network callbacks that update the UI.",
    "example": "On the bank locker client, a background thread listening on a TCP socket updated a status label directly and it crashed randomly during testing. Wrapping the update in an InvokeRequired check with BeginInvoke fixed it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "When would you use BackgroundWorker versus Task/async-await for a long-running operation in WinForms?",
    "what": "BackgroundWorker runs work on a thread pool thread and marshals ProgressChanged and RunWorkerCompleted back to the UI automatically. Task with async/await lets you just await the call and the UI resumes on its own.",
    "why": "async/await is cleaner and less code, but many older WinForms apps still use BackgroundWorker everywhere.",
    "when": "I use async/await for new code, and stick with BackgroundWorker when patching an existing form that already uses it.",
    "example": "A report screen used BackgroundWorker with a progress bar. I needed to add an export option, so I extended the existing DoWork logic instead of rewriting it with async/await. It kept the change small and low-risk."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "How would you decide between building a custom user control versus buying/using a third-party control library for a WinForms feature?",
    "what": "A custom UserControl makes sense for behavior specific to our app, like a locker status indicator. A third-party control makes sense for something complex like advanced grids or charts that would take weeks to build.",
    "why": "It's a tradeoff between maintenance cost and dev time — custom controls mean you own every bug, third-party ones tie you to their versioning and licensing.",
    "when": "I lean custom for something simple and app-specific, third-party for something genuinely complex.",
    "example": "We have an old third-party grid control that isn't actively supported and has rendering quirks I can't fix since there's no source. If I started that screen today, I'd build a lightweight custom control instead."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "What's the difference between MDI and SDI in WinForms, and which have you actually worked with?",
    "what": "MDI has one parent form with child forms docked inside it. SDI has each form as its own independent top-level window, which is what most modern apps do.",
    "why": "MDI made sense when screen space was limited, but it complicates modal dialogs, taskbar behavior, and multi-monitor setups.",
    "when": "MDI still shows up in older enterprise tools managing lots of related child windows at once.",
    "example": "Our WinForms app at RAX is SDI. I worked briefly on an older MDI tool, and debugging focus issues between parent and child forms was genuinely painful."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Production Issue",
    "question": "Describe a memory leak you tracked down in a WinForms app. What was causing it?",
    "what": "Classic WinForms leaks come from event handlers that subscribe to a static or long-lived object but never unsubscribe, so the form never gets garbage collected even after it's closed.",
    "why": "These leaks are slow and silent — the app just gets sluggish over hours, and it's hard to trace back to the cause.",
    "when": "I look for this whenever a WinForms app is reported as getting slow after being open a while.",
    "example": "A desktop app got sluggish after a full shift. A memory profiler showed dozens of leaked form instances. A static event on a connection manager was never unsubscribed in FormClosing. Adding the unsubscribe and Dispose call fixed it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "Walk me through the WinForms form lifecycle — Load, Shown, FormClosing, Dispose — and where things commonly go wrong.",
    "what": "Load fires before the form is visible, Shown fires right after it renders, FormClosing fires when closing and can be canceled, and Dispose cleans up resources after Close.",
    "why": "Problems happen when doing UI-dependent work in Load before the handle exists, or assuming Close always means Dispose.",
    "when": "Load versus Shown matters when something needs the form to actually be visible first, like a busy cursor or child dialog.",
    "example": "A loading dialog opened from Load instead of Shown, so on slower machines it appeared before the main form painted, looking broken. Moving that logic to Shown fixed it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "How do you validate user input in a WinForms form — say a data entry screen with several required fields?",
    "what": "WinForms has Validating and Validated events per control, plus an ErrorProvider that shows a red icon with a tooltip. I check the condition in Validating and call SetError if it fails.",
    "why": "It gives field-level feedback right where the problem is, which is better than one big message box at the end.",
    "when": "I use this on any form with several fields where I want to catch mistakes before save.",
    "example": "On an old admission form, ErrorProvider was wired to each required field. The Cancel button's CausesValidation property wasn't set to false, so clicking Cancel triggered validation instead of letting the user back out. Fixing that property solved it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "How would you implement printing in a WinForms app — like printing a receipt or report from a desktop screen?",
    "what": "You use PrintDocument, which raises a PrintPage event with a Graphics object you draw onto directly. You pair it with PrintPreviewDialog and PrintDialog for preview and printer selection.",
    "why": "It's a lower-level API than a PDF library — you calculate X/Y coordinates manually, which gets tedious fast.",
    "when": "I use this when a desktop app needs hard-copy output directly, like a receipt printer at a locker station.",
    "example": "I fixed a bug where a receipt got cut off on certain printers. The code hardcoded the printable area instead of reading e.PageBounds. Calculating against the actual margin bounds fixed it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "What deployment options have you used or seen for WinForms apps — ClickOnce, MSI, or manual XCOPY — and what are the tradeoffs?",
    "what": "ClickOnce handles versioning and auto-updates from a share or URL. MSI gives a proper Windows installer with more control but manual updates. XCOPY is just copying the built files and running the exe.",
    "why": "ClickOnce suits internal apps needing painless updates, MSI suits apps needing installer control or compliance, XCOPY suits quick internal tools.",
    "when": "I'd use ClickOnce for frequent updates to non-technical users, MSI for enterprise installs, and XCOPY for internal utilities.",
    "example": "The internal WinForms app I maintain is deployed via XCOPY — we drop the build on a shared folder and users run it from there. For a dozen internal users it's been fine. For a customer-facing app I'd push for ClickOnce."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "How do you manage configuration in a WinForms app — App.config, user settings versus application settings?",
    "what": "App.config holds appSettings and connection strings. The Settings designer generates typed properties in two scopes: Application scope, read-only and shared, and User scope, per-user and persisted locally.",
    "why": "Putting something in Application scope and expecting it to save at runtime doesn't work — that scope is fixed, not user state.",
    "when": "I use Application scope for shared values like an API URL, and User scope for things like window size or last-used folder.",
    "example": "A user's window layout preference wasn't sticking between sessions. It was stored in Application scope instead of User scope, so Settings.Default.Save() didn't persist it. Moving it to User scope fixed it."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "You need a WinForms app to talk to your ASP.NET Core Web API backend. How would you set that up?",
    "what": "I use a single reused HttpClient instance rather than creating a new one per call, call the Web API endpoints, and deserialize JSON with System.Text.Json. I make the calls async so the UI thread doesn't freeze.",
    "why": "Reusing HttpClient matters because creating a new one per request can exhaust sockets under load.",
    "when": "This comes up when a legacy desktop client needs to talk to newer backend services instead of hitting the database directly.",
    "example": "The bank locker OTP flow went through backend services and a TCP socket, not direct API calls. But I did wire up HttpClient calls in an internal admin form for a lookup screen, making sure to await them so the form didn't freeze."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Production Issue",
    "question": "Have you dealt with a DataGridView that got sluggish or froze the UI with a large dataset? What did you do about it?",
    "what": "DataGridView isn't built for tens of thousands of rows by default, and binding a big dataset on the UI thread can lock things up. Fixes include virtual mode, pagination, or fetching data on a background thread.",
    "why": "A frozen grid makes the whole app look crashed to the user, which generates support tickets fast.",
    "when": "This shows up when a report screen that was fine in testing gets used against real production data with tens of thousands of records.",
    "example": "A report screen hung for several seconds on a wide date range because it queried and bound tens of thousands of rows on the UI thread. I moved the query to a background task and pushed the team to add server-side pagination, which was the real fix."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Production Issue",
    "question": "Walk me through how you'd debug a WinForms app that just hangs or freezes in production.",
    "what": "First I check whether the app is truly frozen or just doing something slow on the UI thread. If I can reproduce it, I attach the debugger and check the call stack. On a customer machine, I take a memory dump and load it in WinDbg or Visual Studio.",
    "why": "Separating 'frozen' from 'slow' matters because many apparent hangs are just synchronous blocking calls on the UI thread, not real crashes, and the fix differs.",
    "when": "I use this approach whenever we get a report that the app just stopped responding with no error message.",
    "example": "An internal tool froze for close to a minute during a save. I reproduced it, broke into the debugger, and found a synchronous SqlCommand.ExecuteNonQuery call with no timeout on the button click handler. Adding a timeout and moving the call off the UI thread fixed the freeze."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "An interviewer asks: why is a company still building or maintaining WinForms apps instead of moving to WPF or a web app? How would you answer that, coming from someone who actually maintains one?",
    "what": "The real answer is that the app already exists, works, and rewriting it isn't worth the risk or cost for an internal tool. WPF has better data binding and styling, but WinForms is simpler and faster to build with when the app is stable.",
    "why": "Interviewers ask this to see if you understand the tradeoff is about cost and risk, not just technical preference.",
    "when": "This mindset applies any time you're weighing a rewrite versus incremental maintenance on legacy code.",
    "example": "At RAX, the WinForms apps I maintain are internal tools, so there's been no push to modernize them. If a tool ever needed a real overhaul, we'd more likely rebuild it as a small web module rather than move to WPF, since that's where the team's skills already are."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Technical",
    "question": "What's actually different between WinForms and WPF/MVVM at a fundamental level, not just 'WPF looks nicer'?",
    "what": "WinForms is a thin wrapper over native Win32/GDI+ controls, with UI logic often mixed into the form's code-behind. WPF renders with its own engine on DirectX, uses XAML, and is built around MVVM, where the view binds to a ViewModel separate from the window class.",
    "why": "That separation matters for testability — with MVVM you can unit test the ViewModel without touching UI controls, unlike WinForms logic buried in event handlers.",
    "when": "This distinction matters when deciding how testable the UI layer needs to be, or when modern styling is required.",
    "example": "In our legacy WinForms code, a lot of business logic sits inside button click handlers, making it hard to unit test without the whole form. In WPF with MVVM, that logic would live in a testable ViewModel instead — a real limitation of our current codebase, even though rewriting it isn't on the table."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Production Issue",
    "question": "Tell me about a bug in the legacy WinForms code that took you a lot longer to fix than you expected. What made it hard?",
    "what": "This is about how legacy code without documentation or tests can hide a simple root cause behind layers of indirection — a swallowed exception, a chain of event handlers, nothing obvious.",
    "why": "The actual fix was trivial once found, but finding it meant tracing execution manually with no logging to point the way.",
    "when": "This shows up in older, undocumented code with empty catch blocks or handlers nobody's touched in years.",
    "example": "A status update on a monitoring form randomly stopped refreshing, with no crash or error. I traced it through three nested event subscriptions to find a Timer's Tick handler throwing an exception swallowed by an empty catch block. Once found, the fix took five minutes — finding it took most of a day."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "If you inherited a messy legacy WinForms codebase with no tests and business logic mixed into the UI code, how would you approach making incremental improvements without breaking things?",
    "what": "I wouldn't restructure everything at once, since that risks new bugs in code nobody fully understands. I'd start by pulling pure logic — like calculations or validation rules — into separate, testable classes, even if the form itself stays messy.",
    "why": "It's about risk management — a big rewrite can break things nobody documented, while small, tested extractions let you improve gradually.",
    "when": "I use this approach whenever I'm fixing a bug or adding a feature to old, undocumented code with no test coverage.",
    "example": "A fee calculation was buried inside a button click handler along with UI updates and a database call. I pulled just the calculation into its own method with unit tests, confirmed it matched the old behavior, then fixed the rounding bug and left the rest alone."
  },
  {
    "category": "WinForms Desktop Development",
    "type": "Scenario",
    "question": "How does maintaining these WinForms apps fit alongside your main work on Zen Campus and the microservices side? How do you context-switch between them?",
    "what": "Zen Campus work is service-to-service — APIs, Dapper queries, scalability across microservices. WinForms maintenance is localized, single-machine, event-driven UI debugging. I pick up WinForms tickets alongside my sprint work.",
    "why": "It's useful to do both, since WinForms keeps me sharp on lower-level things like threading and UI state that stateless API work doesn't require.",
    "when": "This split happens basically every sprint, since I'm one of the few people still comfortable in that codebase.",
    "example": "Last month, a WinForms bug came in about a form not closing properly while I was mid-sprint on a Zen Campus billing story. I paused for half a day, found an undisposed file handle from a report export, fixed it, then went back to the billing work."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "Can you explain value types vs reference types in C#, and has boxing/unboxing ever actually caused you a problem in real code?",
    "what": "Value types like int, bool, and structs get copied when passed around. Reference types like classes just pass a pointer to the same object. Boxing is when a value type gets wrapped into an object on the heap.",
    "why": "Copy vs reference changes behavior — mutating a struct in a method doesn't affect the caller, mutating a class does. Boxing also adds extra heap allocations and GC pressure.",
    "when": "I think about this when choosing struct vs class, or reviewing old code using ArrayList or Hashtable instead of generics.",
    "example": "I found legacy WinForms code at RAX storing attendance counts in an ArrayList, boxing each int on every Add(). I switched it to a generic List<int>, which was faster and cleaner. That's when boxing finally clicked as a real issue, not just an interview definition."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "When do you reach for an abstract class instead of an interface, and have you used default interface methods in any of your recent .NET Core work?",
    "what": "I use abstract classes when I want to share real implementation and state across related types. I use interfaces when I just need a contract, without caring how it's implemented.",
    "why": "Abstract classes save me from copy-pasting shared logic across repositories; interfaces make services swappable behind DI in a microservices setup.",
    "when": "This comes up constantly in Zen Campus, since each module has its own repository and service layer.",
    "example": "In Zen Campus I built an abstract BaseRepository for shared Dapper logic, with interfaces like IStudentRepository sitting on top. I haven't used default interface methods in production — our team convention keeps interfaces as pure contracts and puts shared logic in the abstract base."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "How do you use generics with constraints like where T : class, new(), or IComparable, and give me a real example from your code?",
    "what": "Generics let me write one class or method that works across types without duplicating code. Constraints tell the compiler what T is allowed to do, like being comparable or instantiable.",
    "why": "Without constraints the compiler won't let you call methods like .CompareTo() or new T(). Constraints save me from writing near-identical code for every entity.",
    "when": "I use this mainly in shared infrastructure code like response wrappers and generic repositories, not everyday business logic.",
    "example": "In Zen Campus I built a generic ApiResponse<T> for every microservice endpoint, and a BaseRepository<T> where T : class, new() for generic Get, Insert, and Update methods. I got a compiler error the first time I tried new T() without the constraint — that's how I learned constraints aren't optional."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "What's the practical difference between delegates, events, and Func/Action, and where have you actually used each?",
    "what": "A delegate is a type-safe function pointer. An event is a delegate with extra rules, so only the owning class can raise it. Func and Action are built-in generic delegates so you don't declare your own.",
    "why": "Events fit a publish-subscribe pattern where outsiders can only subscribe, not invoke directly. Func/Action are simpler for passing behavior around as a callback.",
    "when": "I used events in our WinForms desktop app for UI interactions, and Func/Action in the API layer for retry logic and small callbacks.",
    "example": "On the bank locker project, the TCP socket listener raised an OnLockerStatusChanged event that the UI subscribed to. On the SMS gateway integration, I used a Func<bool> inside a retry helper so I could reuse the same retry logic for OTP send, resend, and delivery checks."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Scenario",
    "question": "Tell me about a time LINQ's deferred execution actually bit you — and explain the difference between IEnumerable and List in that context.",
    "what": "LINQ queries on IEnumerable<T> are lazy — they don't run until you enumerate them. A List<T> is already materialized in memory, so looping it doesn't re-run anything.",
    "why": "It matters for correctness, since data can change between two enumerations, and for performance, since each enumeration of a database-backed query means another round trip.",
    "when": "I watch for this now whenever I'm building report or dashboard queries that hit the same result set more than once.",
    "example": "On a Zen Campus attendance report, I returned an IEnumerable<AttendanceRecord> from EF Core, called .Count() to log it, then looped it again to build the Excel export. SQL Profiler showed the same query firing twice. I fixed it with .ToList() right after the query, and now that's a habit for anything I'll touch more than once."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "What are extension methods and have you written any for real use in your codebase?",
    "what": "Extension methods let you add a method to an existing type, even one you don't own, without inheriting from it. It's a static method with `this` before the first parameter, but it feels like part of the type when you call it.",
    "why": "They keep code readable and chainable without cluttering classes with helper methods, especially for repeated tasks like formatting or masking.",
    "when": "I use these for small, reusable, cross-cutting helpers, not for anything with real business logic.",
    "example": "For the bank locker project, I wrote MaskMobileNumber() as a string extension to mask numbers in logs, like 98XXXXX210, for compliance. I called it as customerMobile.MaskMobileNumber() everywhere we logged OTP attempts, instead of repeating the masking logic in five places."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Scenario",
    "question": "Walk me through your approach to exception handling — custom exceptions, when you catch vs rethrow, and finally vs using/IDisposable.",
    "what": "I only catch an exception where I can actually add value — logging with context, wrapping it in a meaningful custom exception, or handling a known failure. Otherwise I let it bubble up or rethrow with `throw;`. I default to `using` for anything IDisposable, since it guarantees Dispose() runs even if an exception happens.",
    "why": "Swallowing exceptions silently leaves you with no clues during production issues. Skipping `using` around connections and sockets causes real problems, which I've seen firsthand.",
    "when": "This became a real focus when we built centralized exception-handling middleware for Zen Campus, since error handling used to be scattered.",
    "example": "Our Zen Campus middleware catches unhandled exceptions at the API boundary, logs them with a correlation ID, and returns a consistent error response — that cut down incident resolution time. On the bank locker project, I created a custom OtpExpiredException to separate 'wrong OTP' from 'expired OTP'. I also once forgot `using` around a raw SqlConnection, which caused connection pool exhaustion under load until I fixed it."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "Can you explain how garbage collection works in .NET — generations, when an object becomes eligible for collection — and how that connects to IDisposable and the Dispose pattern?",
    "what": "The GC organizes objects into generations, collecting gen 0 most often since most objects die young. An object becomes eligible for collection once nothing can reach it anymore. The GC only manages memory, not things like open connections or sockets — that's what IDisposable and Dispose() are for.",
    "why": "Unmanaged resources like connections and sockets don't get cleaned up just because an object is unreachable. Skipping proper disposal causes leaks like connection pool exhaustion, not a normal out-of-memory bug.",
    "when": "This became very real for me on the bank locker project because of the raw TCP socket connections to the locker hardware.",
    "example": "Our TCP socket class didn't implement IDisposable properly at first, so sockets piled up and the app started refusing new connections after a few days. I implemented the proper Dispose pattern and wrapped every usage in a using block, which fixed it. It's my clearest example that the GC only handles managed memory, not live sockets or SQL connections."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Scenario",
    "question": "How have nullable reference types in C# 8+ helped you avoid NullReferenceExceptions in production?",
    "what": "With nullable reference types on, the compiler tracks whether a reference can be null and warns you at compile time if you use it without checking. It's opt-in via project settings or `#nullable enable`.",
    "why": "NullReferenceException used to be the most common runtime crash I'd see, and most of them were preventable if the compiler had warned us earlier.",
    "when": "We started enabling this on newer Zen Campus modules after moving to .NET 6/8, especially for optional data like parent contact info.",
    "example": "In the admissions module, a service assumed a parent's alternate mobile number was always populated and called .Trim() on it, which crashed in production for null values. After enabling nullable reference types on newer modules, the compiler now flags this kind of issue before it ships."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "What's the difference between records and regular classes in C# 9+, and have you used records anywhere in your recent code?",
    "what": "Records give value-based equality out of the box — two records with the same property values are equal, unlike classes which compare by reference. Records also support immutability with the `with` expression, with much less boilerplate.",
    "why": "Records fit data-carrying types where you care about matching values rather than matching object identity, like DTOs and API responses.",
    "when": "I started using them once we moved some Zen Campus services to newer .NET versions, mostly for simple DTOs.",
    "example": "I used a record for a lightweight OtpResult type with Status, Message, and ExpiresAt, which made comparing results in unit tests cleaner without overriding Equals myself. Most existing DTOs are still plain classes since that code predates records."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "How do you use pattern matching and switch expressions in modern C#, and where has it actually cleaned up your code?",
    "what": "Pattern matching lets you check the type and shape of something in one condition instead of chained is-checks and casts. Switch expressions are a compact, expression-based version of switch statements, where each arm returns a value.",
    "why": "It cuts down on long if-else chains for status or type logic, and the compiler can warn you if a case is missing, which if-else can't do.",
    "when": "I reach for it when I have a fixed set of states to handle, like a status enum, and the old if-else was getting long.",
    "example": "On the OTP lifecycle in the bank locker project, I refactored a long if-else chain for Generated, Delivered, Validated, and Expired states into a switch expression. The compiler flagged a case I'd forgotten to handle, which the old if-else never would have caught."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Technical",
    "question": "Explain what actually happens to a thread during await — Task vs Task<T>, and when do you use ConfigureAwait(false)?",
    "what": "Task represents an operation with no return value, Task<T> returns a value. When you await something async, the current thread doesn't block — it's released back to the thread pool and resumes once the work completes. ConfigureAwait(false) skips capturing the original context on resume.",
    "why": "Understanding that await frees the thread rather than blocking it is the difference between an app that scales and one that falls over under load.",
    "when": "This became relevant when designing Zen Campus microservices to handle 1,000+ concurrent users.",
    "example": "In an older .NET Framework service on the bank locker project, a method called .Result on a Task instead of awaiting it, causing thread pool starvation under load. Making the whole call chain properly async, from controller to service to Dapper call, fixed the same load test that used to choke."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Scenario",
    "question": "String immutability in C# — what does it actually mean in practice, and has it ever caused a performance issue you had to fix with StringBuilder?",
    "what": "Every time you 'modify' a string, C# creates a brand new string object rather than changing it in place. StringBuilder uses a mutable internal buffer so repeated modifications don't create a new object each time.",
    "why": "Concatenating strings in a loop creates a new object every iteration, which adds up fast in time and GC pressure for large text.",
    "when": "I ran into this while generating one of the bigger PDF/Excel reports in Zen Campus.",
    "example": "A report-generation method built an HTML string row by row using += over a few thousand records, and it was noticeably slow. I switched it to StringBuilder with Append() in the loop and ToString() once at the end, and generation time dropped significantly."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Scenario",
    "question": "Can you walk me through the SOLID principles using a real example from something you built?",
    "what": "SOLID is five design guidelines — single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion — for keeping code maintainable as it grows. I don't consciously tick off all five on every class, but a few show up naturally in Zen Campus.",
    "why": "Ignoring them is exactly what makes a codebase painful to change later, which I've felt on legacy WinForms code where one class did everything.",
    "when": "This mattered most when we moved Zen Campus toward microservices, since each service had to justify its own single responsibility.",
    "example": "Our exception-handling middleware only handles logging and error formatting, and repository classes only handle data access. Every service depends on an interface like IStudentRepository injected via DI, which made it easier to swap implementations or write unit tests with a fake repository."
  },
  {
    "category": "Core C# Fundamentals",
    "type": "Scenario",
    "question": "What's the actual difference between == and .Equals() in C#, and has object equality ever caused you a confusing bug?",
    "what": "For reference types, == checks if two variables point to the same object, unless overridden — string is a special case that compares content. For value types, .Equals() does a value comparison by default.",
    "why": "Assuming == always means 'same value' breaks the moment you compare custom objects instead of strings or primitives.",
    "when": "This tripped me up on the audit trail side of the bank locker project.",
    "example": "I used == to check if two OTP request objects were duplicates, but since I hadn't overridden Equals, it compared references and always returned false even for identical-looking objects. I fixed it by comparing the specific fields I cared about instead of relying on ==."
  }
];
