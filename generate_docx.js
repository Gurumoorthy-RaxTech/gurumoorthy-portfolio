const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  TabStopType, TabStopLeader, UnderlineType, ExternalHyperlink,
  PageOrientation, convertInchesToTwip, LevelFormat, PageBorderDisplay,
  PageBorderOffsetFrom, PageBorderZOrder,
  Header, Footer, PageNumber, NumberFormat
} = require('docx');
const fs = require('fs');

const NAVY  = '1B4F8A';
const WHITE = 'FFFFFF';
const DARK  = '1a1a2e';
const GREY  = '555555';
const LGREY = 'f4f7fb';

// ── helpers ──────────────────────────────────────────────────────────────
function sectionTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: 'Calibri' })],
    shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
    spacing: { before: 90, after: 60 },
    indent: { left: 80, right: 80 },
  });
}

function bullet(text, bold_parts = []) {
  const runs = [];
  let remaining = text;
  for (const bp of bold_parts) {
    const idx = remaining.indexOf(bp);
    if (idx > -1) {
      if (idx > 0) runs.push(new TextRun({ text: remaining.slice(0, idx), size: 18, font: 'Calibri', color: DARK }));
      runs.push(new TextRun({ text: bp, bold: true, size: 18, font: 'Calibri', color: DARK }));
      remaining = remaining.slice(idx + bp.length);
    }
  }
  if (remaining) runs.push(new TextRun({ text: remaining, size: 18, font: 'Calibri', color: DARK }));
  return new Paragraph({
    bullet: { level: 0 },
    children: runs.length ? runs : [new TextRun({ text, size: 18, font: 'Calibri', color: DARK })],
    spacing: { before: 14, after: 14 },
  });
}

function plain(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: opts.size || 19, font: 'Calibri', color: opts.color || DARK, bold: opts.bold, italic: opts.italic })],
    spacing: { before: opts.before || 0, after: opts.after || 0 },
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function noBorder() {
  const b = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return { top: b, bottom: b, left: b, right: b, insideH: b, insideV: b };
}

function thinBorder() {
  return { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'eeeeee' }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
}

function skillRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: NAVY, size: 17, font: 'Calibri' })], spacing: { before: 20, after: 20 } })],
        width: { size: 28, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 17, font: 'Calibri', color: DARK })], spacing: { before: 20, after: 20 } })],
        borders: thinBorder(),
      }),
    ]
  });
}

function compItem(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 17, font: 'Calibri', color: DARK })],
    spacing: { before: 16, after: 16 },
  });
}

// ── document ─────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullet-list',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '▸',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } }, run: { color: NAVY, size: 16 } }
      }]
    }]
  },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 19, color: DARK } }
    }
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top:    convertInchesToTwip(0.6),
          right:  convertInchesToTwip(0.7),
          bottom: convertInchesToTwip(0.5),
          left:   convertInchesToTwip(0.7),
          header: convertInchesToTwip(0.25),
          footer: convertInchesToTwip(0.25),
        },
        borders: {
          pageBorderTop:    { style: BorderStyle.SINGLE, size: 12, color: '1B4F8A', space: 4 },
          pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: '1B4F8A', space: 4 },
          pageBorderLeft:   { style: BorderStyle.SINGLE, size: 12, color: '1B4F8A', space: 4 },
          pageBorderRight:  { style: BorderStyle.SINGLE, size: 12, color: '1B4F8A', space: 4 },
          display: PageBorderDisplay.ALL_PAGES,
          offsetFrom: PageBorderOffsetFrom.TEXT,
          zOrder: PageBorderZOrder.FRONT,
        },
      }
    },

    // ══ PAGE HEADER — empty space only ══
    headers: {
      default: new Header({
        children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
      }),
    },

    // ══ PAGE FOOTER — page number only ══
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 0 },
            children: [
              new TextRun({ text: 'Page ', bold: true, size: 16, color: NAVY, font: 'Calibri' }),
              new TextRun({ children: [PageNumber.CURRENT], bold: true, size: 16, color: NAVY, font: 'Calibri' }),
              new TextRun({ text: ' of ', bold: true, size: 16, color: NAVY, font: 'Calibri' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], bold: true, size: 16, color: NAVY, font: 'Calibri' }),
            ],
          }),
        ],
      }),
    },

    children: [

      // ══ HEADER ══
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorder(),
        rows: [new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: noBorder(),
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'GURUMOORTHY M', bold: true, color: NAVY, size: 44, font: 'Calibri' })],
                  spacing: { after: 30 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: '.NET Developer  ·  ASP.NET Core  ·  Web API  ·  Microservices  ·  SQL Server  ·  MongoDB  ·  Docker', size: 16, color: GREY, bold: true, font: 'Calibri' })],
                  spacing: { after: 0 },
                }),
              ]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: noBorder(),
              children: [
                new Paragraph({ children: [new TextRun({ text: '✉  gurumoorthymurugan@gmail.com', size: 17, font: 'Calibri', color: DARK })], alignment: AlignmentType.RIGHT }),
                new Paragraph({ children: [new TextRun({ text: '☎  +91 8122448785', size: 17, font: 'Calibri', color: DARK })], alignment: AlignmentType.RIGHT }),
                new Paragraph({ children: [new TextRun({ text: '⌖  Ramapuram, Chennai – 600089, Tamil Nadu', size: 17, font: 'Calibri', color: DARK })], alignment: AlignmentType.RIGHT }),
                new Paragraph({ children: [new TextRun({ text: '⏱  3 Yrs 3 Mos  ·  60 Days Notice', size: 17, font: 'Calibri', color: DARK })], alignment: AlignmentType.RIGHT }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'in  ', size: 17, bold: true, color: NAVY, font: 'Calibri' }),
                    new ExternalHyperlink({
                      link: 'https://www.linkedin.com/in/gurumoorthy-m-s2166445/',
                      children: [new TextRun({ text: 'linkedin.com/in/gurumoorthy-m-s2166445', size: 17, color: NAVY, underline: { type: UnderlineType.SINGLE }, font: 'Calibri' })]
                    })
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ]
            }),
          ]
        })]
      }),

      new Paragraph({ children: [new TextRun({ text: '' })], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY } }, spacing: { before: 80, after: 100 } }),

      // ══ SUMMARY ══
      sectionTitle('PROFESSIONAL SUMMARY'),
      new Paragraph({
        children: [
          new TextRun({ text: 'Results-driven ', size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: '.NET Developer', bold: true, size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: ' with ', size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: '3 years 3 months', bold: true, size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: ' of experience delivering high-performance, enterprise-grade web applications and RESTful APIs. Proficient in ', size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: 'ASP.NET Core, Web API, Microservices, Ocelot API Gateway, Dapper, Entity Framework, SQL Server, MongoDB,', bold: true, size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: ' and ', size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: 'Docker', bold: true, size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: '. Proven success architecting microservices solutions, reducing DB query time by ', size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: '40%', bold: true, size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: ', cutting incident resolution by ', size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: '35%', bold: true, size: 19, font: 'Calibri', color: DARK }),
          new TextRun({ text: ', and implementing JWT-secured, role-based authentication frameworks. Committed to clean code, Agile delivery, and measurable business value.', size: 19, font: 'Calibri', color: DARK }),
        ],
        spacing: { before: 60, after: 60 },
        alignment: AlignmentType.JUSTIFIED,
      }),

      // ══ CORE COMPETENCIES ══
      sectionTitle('CORE COMPETENCIES'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorder(),
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('Microservices Architecture')] }),
            new TableCell({ borders: noBorder(), children: [compItem('RESTful API Design & Development')] }),
            new TableCell({ borders: noBorder(), children: [compItem('Database Design & Optimization')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('Ocelot API Gateway & Routing')] }),
            new TableCell({ borders: noBorder(), children: [compItem('JWT Authentication & Authorization')] }),
            new TableCell({ borders: noBorder(), children: [compItem('Performance Tuning & Caching')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('Dapper & Entity Framework Core')] }),
            new TableCell({ borders: noBorder(), children: [compItem('Docker & Containerization')] }),
            new TableCell({ borders: noBorder(), children: [compItem('Agile / Scrum Methodology')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('SQL Server Query Optimization')] }),
            new TableCell({ borders: noBorder(), children: [compItem('MongoDB & NoSQL Databases')] }),
            new TableCell({ borders: noBorder(), children: [compItem('Windows Application Development')] }),
          ]}),
        ]
      }),

      // ══ TECHNICAL SKILLS ══
      sectionTitle('TECHNICAL SKILLS'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorder(),
        rows: [
          new TableRow({ children: [
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorder(), children: [
              new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(), rows: [
                skillRow('Languages', 'C#, JavaScript, SQL, HTML5, CSS3'),
                skillRow('Backend Frameworks', 'ASP.NET Core (v5/6/8), ASP.NET MVC (v4.8), Web API, WCF'),
                skillRow('Microservices & Gateway', 'Microservices Architecture, Ocelot API Gateway, REST API'),
                skillRow('ORM & Data Access', 'Dapper, Entity Framework Core (EF Core), ADO.NET'),
                skillRow('Databases', 'SQL Server (2016+), MySQL (v8), MongoDB'),
                skillRow('Containerization', 'Docker, Docker Compose, Docker Desktop'),
              ]})
            ]}),
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorder(), children: [
              new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(), rows: [
                skillRow('Frontend', 'Bootstrap 4/5, jQuery, JavaScript, HTML5, CSS3'),
                skillRow('Security', 'JWT Auth, OTP-based MFA, SQL Injection Prevention, HTTPS'),
                skillRow('Communication', 'HTTP/HTTPS, TCP Socket, SMS Gateway Integration'),
                skillRow('Dev Tools', 'Visual Studio 2022, VS Code, Postman, Swagger'),
                skillRow('Version Control', 'Git (GitHub, GitLab), TFS'),
                skillRow('Project Mgmt', 'Jira, Trello, Agile/Scrum'),
              ]})
            ]}),
          ]}),
        ]
      }),

      // ══ EXPERIENCE ══
      sectionTitle('PROFESSIONAL EXPERIENCE'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorder(),
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'RAX Tech International — Chennai, India', bold: true, color: NAVY, size: 21, font: 'Calibri' })], spacing: { after: 20 } }),
            new Paragraph({ children: [new TextRun({ text: 'Software Developer (.NET)', bold: true, size: 19, font: 'Calibri', color: DARK })], spacing: { after: 0 } }),
          ]}),
          new TableCell({ borders: noBorder(), width: { size: 28, type: WidthType.PERCENTAGE }, children: [
            new Paragraph({ children: [new TextRun({ text: 'Feb 2023 – Present', size: 18, font: 'Calibri', color: GREY })], alignment: AlignmentType.RIGHT }),
            new Paragraph({ children: [new TextRun({ text: '3 Years 3 Months', size: 17, font: 'Calibri', color: '999999', italic: true })], alignment: AlignmentType.RIGHT }),
          ]}),
        ]})]
      }),
      bullet('Designed enterprise-grade ASP.NET Core Web API microservices solutions serving 1,000+ concurrent users.', ['ASP.NET Core Web API', '1,000+ concurrent users']),
      bullet('Configured Ocelot API Gateway for request routing, load balancing, and rate limiting across distributed microservices.', ['Ocelot API Gateway']),
      bullet('Optimized Dapper / EF Core data-access layers with indexing and stored procedures, cutting query execution time by 40%.', ['Dapper / EF Core', '40%']),
      bullet('Integrated MongoDB for unstructured/high-volume data, enabling real-time analytics and flexible document schemas.', ['MongoDB']),
      bullet('Containerized all microservices with Docker & Docker Compose for consistent, repeatable cross-environment deployments.', ['Docker & Docker Compose']),
      bullet('Implemented JWT-based authentication & RBAC across all API endpoints for institutional data protection.', ['JWT-based authentication & RBAC']),
      bullet('Developed centralized logging & exception-handling middleware, reducing production incident resolution time by 35%.', ['35%']),
      bullet('Integrated third-party SMS gateway APIs for OTP-based MFA in a bank locker system — zero unauthorized access incidents.', ['SMS gateway APIs', 'zero unauthorized access incidents']),
      bullet('Built TCP socket communication for real-time bi-directional exchange between IoT locker hardware and backend server.', ['TCP socket communication']),
      bullet('Led module development for payment processing, PDF/Excel report generation, dynamic form builders, and dashboards.', ['payment processing, PDF/Excel report generation']),
      bullet('Maintained C# WinForms desktop applications; participated in Agile sprints with >90% code coverage.', ['C# WinForms', '>90% code coverage']),

      // ══ KEY PROJECTS ══
      sectionTitle('KEY PROJECTS'),

      // Project 1
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(),
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: '1. SmartSchool-Web – School ERP Platform', bold: true, size: 20, font: 'Calibri', color: DARK })], spacing: { after: 0 } }),
          ]}),
          new TableCell({ borders: noBorder(), width: { size: 35, type: WidthType.PERCENTAGE }, children: [
            new Paragraph({ children: [new TextRun({ text: 'RAX Tech International  |  Aug 2023 – Present', size: 16, color: GREY, font: 'Calibri' })], alignment: AlignmentType.RIGHT }),
          ]}),
        ]})]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Stack: ', bold: true, size: 16, color: NAVY, font: 'Calibri' }),
          new TextRun({ text: 'ASP.NET Core  ·  Web API  ·  Microservices  ·  Ocelot API Gateway  ·  Dapper  ·  SQL Server  ·  MongoDB  ·  Docker  ·  Bootstrap  ·  JWT', size: 16, color: GREY, font: 'Calibri' }),
        ],
        spacing: { before: 30, after: 40 },
      }),
      bullet('Architected microservices .NET Core Web API ecosystem for school ERP; improved scalability and independent deployments.', ['microservices .NET Core Web API']),
      bullet('Boosted performance by 40% via query optimization, in-memory caching, and concurrent DB request management.', ['40%']),
      bullet('Built modular CRUD layers for admissions, attendance, billing, payroll; developed payment integration & PDF/Excel reports.', ['payment integration & PDF/Excel reports']),
      bullet('Implemented JWT RBAC, parameterized queries, structured logging, and centralized error handling across all services.', ['JWT RBAC']),
      bullet('Containerized all services with Docker Compose; conducted unit testing, bug triage, and performance profiling in production.', ['Docker Compose']),

      plain('', { after: 60 }),

      // Project 2
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(),
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: '2. Access Control System – Bank Locker OTP Authentication', bold: true, size: 20, font: 'Calibri', color: DARK })], spacing: { after: 0 } }),
          ]}),
          new TableCell({ borders: noBorder(), width: { size: 35, type: WidthType.PERCENTAGE }, children: [
            new Paragraph({ children: [new TextRun({ text: 'RAX Tech International  |  Feb 2023 – Jan 2024', size: 16, color: GREY, font: 'Calibri' })], alignment: AlignmentType.RIGHT }),
          ]}),
        ]})]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Stack: ', bold: true, size: 16, color: NAVY, font: 'Calibri' }),
          new TextRun({ text: '.NET Framework  ·  REST API  ·  Entity Framework  ·  Dapper  ·  SQL Server  ·  TCP Socket  ·  SMS Gateway  ·  TLS/HTTPS', size: 16, color: GREY, font: 'Calibri' }),
        ],
        spacing: { before: 30, after: 40 },
      }),
      bullet('Developed OTP-based MFA bank locker access system — zero unauthorized access incidents post-deployment.', ['zero unauthorized access incidents']),
      bullet('Built RESTful APIs for full OTP lifecycle (generate, deliver, validate, expire) with audit trail logging in SQL Server.', ['audit trail logging']),
      bullet('Reduced OTP validation response by 50% with Dapper optimization; achieved sub-3-second SMS delivery.', ['50%', 'sub-3-second SMS delivery']),
      bullet('Implemented TCP socket communication for real-time bidirectional interaction with physical locker hardware.', ['TCP socket communication']),

      // ══ EDUCATION ══
      sectionTitle('EDUCATION'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(),
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [
              new Paragraph({ children: [new TextRun({ text: 'Bachelor of Technology (B.Tech) – Electronics & Communication Engineering', bold: true, size: 18, font: 'Calibri', color: DARK })], spacing: { after: 16 } }),
              new Paragraph({ children: [new TextRun({ text: 'Pondicherry University Affiliated Institution  |  Puducherry, India', size: 17, color: GREY, font: 'Calibri' })], spacing: { after: 0 } }),
            ]}),
            new TableCell({ borders: noBorder(), width: { size: 22, type: WidthType.PERCENTAGE }, children: [
              new Paragraph({ children: [new TextRun({ text: '2014 – 2018', size: 17, color: GREY, font: 'Calibri' })], alignment: AlignmentType.RIGHT }),
              new Paragraph({ children: [new TextRun({ text: 'CGPA: 7.8 / 10', bold: true, size: 17, color: NAVY, font: 'Calibri' })], alignment: AlignmentType.RIGHT }),
            ]}),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [
              new Paragraph({ children: [new TextRun({ text: 'Higher Secondary Certificate (HSC – Science)', bold: true, size: 18, font: 'Calibri', color: DARK })], spacing: { before: 60, after: 16 } }),
              new Paragraph({ children: [new TextRun({ text: 'Tamil Nadu State Board', size: 17, color: GREY, font: 'Calibri' })] }),
            ]}),
            new TableCell({ borders: noBorder(), width: { size: 22, type: WidthType.PERCENTAGE }, children: [
              new Paragraph({ children: [new TextRun({ text: '2014  |  72.5%', bold: true, size: 17, color: NAVY, font: 'Calibri' })], alignment: AlignmentType.RIGHT, spacing: { before: 60 } }),
            ]}),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [
              new Paragraph({ children: [new TextRun({ text: 'Secondary School Leaving Certificate (SSLC)', bold: true, size: 18, font: 'Calibri', color: DARK })], spacing: { before: 60, after: 16 } }),
              new Paragraph({ children: [new TextRun({ text: 'Tamil Nadu State Board', size: 17, color: GREY, font: 'Calibri' })] }),
            ]}),
            new TableCell({ borders: noBorder(), width: { size: 22, type: WidthType.PERCENTAGE }, children: [
              new Paragraph({ children: [new TextRun({ text: '2012  |  83.6%', bold: true, size: 17, color: NAVY, font: 'Calibri' })], alignment: AlignmentType.RIGHT, spacing: { before: 60 } }),
            ]}),
          ]}),
        ]
      }),

      // ══ CERTIFICATIONS ══
      sectionTitle('CERTIFICATIONS & PROFESSIONAL DEVELOPMENT'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(),
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('Microsoft Certified: Azure Fundamentals (AZ-900) – In Progress')] }),
            new TableCell({ borders: noBorder(), children: [compItem('ASP.NET Core Web API Development – Udemy / Coursera')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('Microservices Architecture with .NET – Online Professional Course')] }),
            new TableCell({ borders: noBorder(), children: [compItem('Docker for .NET Developers – Online Professional Course')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorder(), children: [compItem('MongoDB for Developers – MongoDB University')] }),
            new TableCell({ borders: noBorder(), children: [compItem('SQL Server Performance Tuning & Query Optimization – Pluralsight')] }),
          ]}),
        ]
      }),

      // ══ ADDITIONAL INFO ══
      sectionTitle('ADDITIONAL INFORMATION'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(),
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'Languages', bold: true, size: 16, color: NAVY, font: 'Calibri' })], spacing: { after: 10 } }),
            new Paragraph({ children: [new TextRun({ text: 'English & Tamil', size: 17, font: 'Calibri', color: DARK })] }),
          ]}),
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'Date of Birth', bold: true, size: 16, color: NAVY, font: 'Calibri' })], spacing: { after: 10 } }),
            new Paragraph({ children: [new TextRun({ text: '07 July 1997', size: 17, font: 'Calibri', color: DARK })] }),
          ]}),
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'Marital Status', bold: true, size: 16, color: NAVY, font: 'Calibri' })], spacing: { after: 10 } }),
            new Paragraph({ children: [new TextRun({ text: 'Married', size: 17, font: 'Calibri', color: DARK })] }),
          ]}),
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'Availability', bold: true, size: 16, color: NAVY, font: 'Calibri' })], spacing: { after: 10 } }),
            new Paragraph({ children: [new TextRun({ text: '60 Days Notice', size: 17, font: 'Calibri', color: DARK })] }),
          ]}),
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'Location', bold: true, size: 16, color: NAVY, font: 'Calibri' })], spacing: { after: 10 } }),
            new Paragraph({ children: [new TextRun({ text: 'Chennai – 600089', size: 17, font: 'Calibri', color: DARK })] }),
          ]}),
        ]})]
      }),

      // ══ DECLARATION ══
      new Paragraph({ children: [new TextRun({ text: '' })], border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'dddddd' } }, spacing: { before: 120, after: 80 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorder(),
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorder(), children: [
            new Paragraph({ children: [new TextRun({ text: 'I hereby declare that all the information furnished above is true and accurate to the best of my knowledge.', size: 16, italic: true, color: '777777', font: 'Calibri' })] }),
          ]}),
          new TableCell({ borders: noBorder(), width: { size: 38, type: WidthType.PERCENTAGE }, children: [
            new Paragraph({ children: [new TextRun({ text: 'Place: Chennai    Date: ___________    (Gurumoorthy M)', bold: true, size: 16, color: NAVY, font: 'Calibri' })], alignment: AlignmentType.RIGHT }),
          ]}),
        ]})]
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:\\Users\\Admin\\Downloads\\Gurumoorthy_Resume_ATS_Optimized.docx', buffer);
  console.log('DOCX saved successfully.');
}).catch(e => console.error('Error:', e));
