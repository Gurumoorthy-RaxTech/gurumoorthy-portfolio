OcelotGatewayDemo - Ocelot API Gateway (.NET 8)
====================================================================

WHAT THIS DEMONSTRATES
  An API Gateway is a single front door that sits in front of a set of
  independent backend services, so callers (browsers, mobile apps, other
  systems) only ever need to know ONE address instead of tracking down
  where every individual service lives. The gateway inspects the incoming
  URL and forwards ("routes") the request on to whichever backend actually
  owns that data, then hands the response straight back. This is exactly
  the shape of a real microservices setup (like the Zen Campus / SSMS
  services on the resume - StudentService, BillService, HostelService,
  etc. all sitting behind Ocelot), just scaled down to two toy services so
  the whole thing can be spun up and proven working in under a minute for
  a live-coding interview.

  This solution has THREE separate ASP.NET Core 8 projects that only talk
  to each other over plain HTTP:

    ServiceA.Products   - "backend" Web API #1, port 5301
    ServiceB.Orders      - "backend" Web API #2, port 5302
    ApiGateway            - Ocelot gateway, port 5300 - the only address a
                            caller needs to know

  Both backend services are fully self-contained with in-memory sample
  data (a hard-coded List<T> inside each controller) - there is
  deliberately NO database anywhere in this sample. The point being
  demonstrated is gateway ROUTING, and a database would just be noise
  that has nothing to do with that.

WHY THREE PROJECTS INSTEAD OF ONE
  A gateway only means something if there's more than one thing behind it
  to route to. ServiceA.Products and ServiceB.Orders are intentionally
  trivial (one controller each, four in-memory records) because the
  interesting code in this sample is entirely inside ApiGateway/ocelot.json
  - that's the file that turns three otherwise-unrelated ASP.NET Core apps
  into "a gateway in front of two microservices."

  All three run on FIXED, HTTP-only ports (5300/5301/5302, see each
  project's Properties/launchSettings.json) so the ports never shift
  between runs and Ocelot's ocelot.json (which hard-codes the downstream
  host/ports) always finds them.

HOW OCELOT ROUTING WORKS (ApiGateway/ocelot.json, explained line by line)
  Ocelot's whole configuration is a JSON file (ocelot.json), loaded in
  Program.cs via builder.Configuration.AddJsonFile("ocelot.json", ...) and
  wired into DI via builder.Services.AddOcelot(builder.Configuration). The
  file has a "Routes" array - one entry per route rule - plus a
  "GlobalConfiguration" section for settings that apply gateway-wide.

  Each route entry has the same shape:

    UpstreamPathTemplate   - the URL pattern the CALLER hits, on the
                              gateway's own address (port 5300).
    UpstreamHttpMethod     - which HTTP verb(s) this route matches.
    DownstreamPathTemplate - the URL path Ocelot rewrites the request to
                              before forwarding it to the real backend.
    DownstreamScheme /
    DownstreamHostAndPorts - where that backend actually lives (host +
                              port). This is the part that's doing the
                              "gateway" job - the caller never sees this.

  Concretely, this file defines four routes:

    /gateway/products             -> http://localhost:5301/api/products
    /gateway/products/{everything} -> http://localhost:5301/api/products/{everything}
    /gateway/orders                -> http://localhost:5302/api/orders
    /gateway/orders/{everything}   -> http://localhost:5302/api/orders/{everything}

  Two routes per service (a plain one and a "/{everything}" one) are
  needed because Ocelot matches an UpstreamPathTemplate literally: a
  template ending in "/{everything}" (Ocelot's catch-all placeholder)
  will NOT match the bare "/gateway/products" URL with nothing after it,
  so a separate route without the placeholder handles GET
  api/products (the list), while the "/{everything}" route handles GET
  api/products/{id} (and anything else appended after the slash) by
  forwarding whatever comes after "/gateway/products/" straight onto the
  downstream path in the same position.

  GlobalConfiguration.BaseUrl is just the gateway's own externally-visible
  base address (http://localhost:5300) - Ocelot uses it when generating
  any links back to itself.

RATE LIMITING (the resume line "...routing, load balancing, and rate
limiting" - this is the rate-limiting half, demonstrated on purpose)
  The two /gateway/products routes each carry a RateLimitOptions block:

    "RateLimitOptions": {
      "ClientWhitelist": [],
      "EnableRateLimiting": true,
      "Period": "10s",
      "PeriodTimespan": 5,
      "Limit": 5
    }

    EnableRateLimiting - turns rate limiting ON for this specific route.
    Period              - the size of the rolling window ("10s" = 10
                           seconds).
    Limit                - how many requests a single client may make
                           inside that window (5).
    PeriodTimespan       - how many seconds a client stays BLOCKED once it
                           goes over the limit (5s of cooldown here).
    ClientWhitelist      - client IDs listed here are exempt from the
                           limit entirely (left empty - nobody's exempt in
                           this demo).

  Rate limiting has to be able to tell callers apart, so it needs a
  "client ID" to count requests per-client rather than one global count
  for everybody. That's configured once, gateway-wide, in
  GlobalConfiguration.RateLimitOptions.ClientIdHeader. This demo sets it
  to "User-Agent" specifically so the basic "just curl/browse it and see
  it work" test below succeeds with zero extra setup - every browser and
  every curl call already sends a User-Agent header automatically, so
  Ocelot can bucket requests per caller without you having to invent and
  attach a custom header by hand. (In a real system you'd normally point
  ClientIdHeader at something like an API key or auth-derived client ID
  instead - User-Agent is a demo-friendly stand-in chosen so the gateway
  "just works" the moment you hit it.)

  The /gateway/orders routes explicitly set "EnableRateLimiting": false so
  they are NOT throttled - this is deliberate, to prove the rate limit is
  scoped to a single route (products) rather than applied gateway-wide.
  (Worth knowing if you ever build this yourself: once
  GlobalConfiguration.RateLimitOptions exists in the file at all, Ocelot's
  rate-limit middleware becomes active for every route unless that route
  opts out with EnableRateLimiting:false - it is NOT purely opt-in per
  route the way you'd expect. This was confirmed empirically while
  building this sample: without the explicit "false" on the orders
  routes, they were unexpectedly rate-limited too.)

  To SEE it trip: hit http://localhost:5300/gateway/products six times in
  a row within 10 seconds (a quick loop, or just mash refresh fast enough)
  - the first five return 200 with the product list, the sixth (and any
  more inside that window) return HTTP 429 with the body "Rate limit
  exceeded on the gateway. Try again shortly." Wait past the window and it
  opens back up.

HOW TO RUN
  1. Open OcelotGatewayDemo.sln in Visual Studio.

  2. Start ServiceA.Products FIRST and leave it running:
       - Right-click ServiceA.Products -> Debug -> Start New Instance.
       - It comes up at http://localhost:5301/swagger - try
         GET api/products and GET api/products/2 there directly.

  3. Start ServiceB.Orders AS A SECOND INSTANCE, while ServiceA is still
     running:
       - Right-click ServiceB.Orders -> Debug -> Start New Instance.
       - It comes up at http://localhost:5302/swagger - try
         GET api/orders and GET api/orders/103 there directly.

  4. Start ApiGateway AS A THIRD INSTANCE, while both services above are
     still running:
       - Right-click ApiGateway -> Debug -> Start New Instance.
       - It listens on http://localhost:5300 (no browser auto-launches
         for this one - it's plumbing, not a UI).
     (You can also configure all three as multiple startup projects in
     the solution's Properties if you'd rather they all launch together
     with one F5, same as sibling project 03's pattern.)

  5. With all three running, open a browser (or curl) and hit:
       http://localhost:5300/gateway/products
       http://localhost:5300/gateway/orders
     Compare the JSON against hitting the backends directly:
       http://localhost:5301/api/products
       http://localhost:5302/api/orders
     The gateway responses are byte-for-byte the same data - proving
     /gateway/products never touched a database or its own logic, it just
     forwarded the call to ServiceA.Products and relayed the answer back.
     Also try single-item routes: /gateway/products/2 and
     /gateway/orders/103.

  6. To see rate limiting trip: refresh/curl
     http://localhost:5300/gateway/products six-plus times quickly (within
     10 seconds). Calls 1-5 return 200; call 6 onward returns HTTP 429
     until the window resets. /gateway/orders never does this, no matter
     how many times you hit it, because its routes explicitly disable
     rate limiting.

PROJECT LAYOUT
  OcelotGatewayDemo.sln
  ServiceA.Products/
    Properties/launchSettings.json  - fixed HTTP-only port 5301
    Models/Product.cs               - Id, Name, Category, Price, StockQty
    Controllers/ProductsController.cs
                                     - GET api/products (4 in-memory items)
                                     - GET api/products/{id}
  ServiceB.Orders/
    Properties/launchSettings.json  - fixed HTTP-only port 5302
    Models/Order.cs                 - Id, CustomerName, Status,
                                       TotalAmount, OrderDate
    Controllers/OrdersController.cs
                                     - GET api/orders (4 in-memory items)
                                     - GET api/orders/{id}
  ApiGateway/
    Properties/launchSettings.json  - fixed HTTP-only port 5300
    ocelot.json                     - all routing + rate-limit config (see
                                       above); copied to the output folder
                                       on every build via the
                                       CopyToOutputDirectory setting in
                                       ApiGateway.csproj
    Program.cs                      - loads ocelot.json into
                                       configuration, AddOcelot(), then
                                       "await app.UseOcelot();" (Ocelot
                                       24.1.0's UseOcelot() is async - the
                                       older ".Wait()" pattern from many
                                       older tutorials is not needed with
                                       this package version)

BUILD / PACKAGE VERSION NOTES
  Built and verified against the .NET 8 SDK with Ocelot NuGet package
  version 24.1.0 (the latest net8.0-compatible version at the time this
  sample was built). `dotnet build OcelotGatewayDemo.sln` succeeds with 0
  warnings, 0 errors. All routing and rate-limiting behaviour above was
  verified by actually running all three services together and hitting
  the gateway with curl, not just by inspecting the code - including the
  GlobalConfiguration.RateLimitOptions gotcha called out above, which
  only shows up at runtime.
