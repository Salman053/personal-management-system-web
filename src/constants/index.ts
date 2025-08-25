export const getPredefinedTemplates = () => [
  {
    id: "frontend-web-dev",
    title: "Frontend Web Development",
    description:
      "Master modern frontend development with React, JavaScript, and essential web technologies. Build responsive, interactive web applications from scratch.",
    difficulty: "Intermediate",
    estimatedDuration: "12-16 weeks",
    category: "Web Development",
    featured: true,
    topics: [
      {
        title: "HTML & CSS Fundamentals",
        subtopics: [
          "Semantic HTML5 Elements",
          "CSS Grid & Flexbox",
          "Responsive Design & Media Queries",
          "CSS Preprocessors (Sass/SCSS)",
          "CSS-in-JS Solutions",
          "Web Accessibility (a11y)",
          "CSS Animations & Transitions",
          "Modern CSS Features (Custom Properties, Container Queries)"
        ],
        resources: [
          { label: "MDN HTML Reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { label: "CSS Grid Complete Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
          { label: "Flexbox Froggy Game", url: "https://flexboxfroggy.com/" },
          { label: "Sass Documentation", url: "https://sass-lang.com/documentation" }
        ]
      },
      {
        title: "JavaScript Essentials",
        subtopics: [
          "ES6+ Features (Arrow Functions, Destructuring, Modules)",
          "DOM Manipulation & Events",
          "Async Programming (Promises, Async/Await)",
          "Error Handling & Debugging",
          "Functional Programming Concepts",
          "Object-Oriented Programming in JS",
          "Regular Expressions",
          "Browser APIs (Fetch, LocalStorage, WebSockets)"
        ],
        resources: [
          { label: "JavaScript.info", url: "https://javascript.info/" },
          { label: "You Don't Know JS Book Series", url: "https://github.com/getify/You-Dont-Know-JS" },
          { label: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
          { label: "Eloquent JavaScript", url: "https://eloquentjavascript.net/" }
        ]
      },
      {
        title: "React Development",
        subtopics: [
          "Components & JSX",
          "State Management with useState & useReducer",
          "React Hooks (useEffect, useContext, Custom Hooks)",
          "React Router for Navigation",
          "Form Handling & Validation",
          "Performance Optimization (React.memo, useMemo)",
          "Testing React Components",
          "Error Boundaries & Error Handling"
        ],
        resources: [
          { label: "React Official Documentation", url: "https://react.dev/" },
          { label: "React Hooks Guide", url: "https://react.dev/reference/react" },
          { label: "React Router Documentation", url: "https://reactrouter.com/" },
          { label: "Testing Library React", url: "https://testing-library.com/docs/react-testing-library/intro/" }
        ]
      },
      {
        title: "Modern Tooling & Build Systems",
        subtopics: [
          "Vite & Webpack Configuration",
          "Package Managers (npm, yarn, pnpm)",
          "Code Quality (ESLint, Prettier)",
          "Testing Frameworks (Jest, Vitest)",
          "Version Control with Git",
          "CI/CD Pipelines",
          "Deployment Strategies",
          "Performance Monitoring"
        ],
        resources: [
          { label: "Vite Documentation", url: "https://vitejs.dev/" },
          { label: "Jest Testing Framework", url: "https://jestjs.io/" },
          { label: "Git Interactive Tutorial", url: "https://learngitbranching.js.org/" },
          { label: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions" }
        ]
      }
    ]
  },
  {
    id: "react-native-mobile",
    title: "React Native Mobile Development",
    description:
      "Build native mobile applications for iOS and Android using React Native. Learn cross-platform development with native performance.",
    difficulty: "Advanced",
    estimatedDuration: "16-20 weeks",
    category: "Mobile Development",
    featured: true,
    topics: [
      {
        title: "React Native Fundamentals",
        subtopics: [
          "Development Environment Setup (Expo CLI vs React Native CLI)",
          "Core Components (View, Text, ScrollView, FlatList)",
          "Navigation (React Navigation, Stack & Tab Navigation)",
          "Platform-Specific Code (iOS vs Android)",
          "Debugging & Development Tools",
          "Styling with StyleSheet & Flexbox",
          "Handling User Input & Gestures",
          "Image & Media Handling"
        ],
        resources: [
          { label: "React Native Documentation", url: "https://reactnative.dev/" },
          { label: "Expo Documentation", url: "https://docs.expo.dev/" },
          { label: "React Navigation", url: "https://reactnavigation.org/" },
          { label: "React Native Elements", url: "https://react-native-elements.github.io/react-native-elements/" }
        ]
      },
      {
        title: "State Management & Data Flow",
        subtopics: [
          "React Context API for Global State",
          "Redux Toolkit for Complex State",
          "Async Storage for Local Data",
          "API Integration & HTTP Requests",
          "Real-time Data with WebSockets",
          "Offline Data Synchronization",
          "Caching Strategies",
          "State Persistence & Hydration"
        ],
        resources: [
          { label: "Redux Toolkit Documentation", url: "https://redux-toolkit.js.org/" },
          { label: "React Native Async Storage", url: "https://react-native-async-storage.github.io/async-storage/" },
          { label: "React Query for React Native", url: "https://tanstack.com/query/latest" },
          { label: "WatermelonDB (SQLite)", url: "https://watermelondb.dev/" }
        ]
      },
      {
        title: "Native Features & APIs",
        subtopics: [
          "Camera & Photo Library Integration",
          "Push Notifications (Local & Remote)",
          "Geolocation & Maps Integration",
          "Device Sensors (Accelerometer, Gyroscope)",
          "Biometric Authentication",
          "File System & Document Picker",
          "Background Tasks & App State",
          "Deep Linking & Universal Links"
        ],
        resources: [
          { label: "React Native Camera", url: "https://github.com/react-native-camera/react-native-camera" },
          { label: "Expo Notifications", url: "https://docs.expo.dev/versions/latest/sdk/notifications/" },
          { label: "React Native Maps", url: "https://github.com/react-native-maps/react-native-maps" },
          { label: "React Native Keychain", url: "https://github.com/oblador/react-native-keychain" }
        ]
      },
      {
        title: "Performance & Deployment",
        subtopics: [
          "Performance Optimization Techniques",
          "Memory Management & Profiling",
          "Code Splitting & Lazy Loading",
          "App Store Deployment (iOS)",
          "Google Play Store Deployment (Android)",
          "Over-the-Air Updates",
          "Crash Reporting & Analytics",
          "Security Best Practices"
        ],
        resources: [
          { label: "React Native Performance", url: "https://reactnative.dev/docs/performance" },
          { label: "Expo Application Services", url: "https://expo.dev/eas" },
          { label: "Sentry for React Native", url: "https://docs.sentry.io/platforms/react-native/" },
          { label: "Firebase for React Native", url: "https://rnfirebase.io/" }
        ]
      }
    ]
  },
  {
    id: "nodejs-backend",
    title: "Backend Development with Node.js",
    description:
      "Master server-side development with Node.js and Express. Build scalable APIs, handle databases, and implement authentication systems.",
    difficulty: "Intermediate",
    estimatedDuration: "14-18 weeks",
    category: "Backend Development",
    featured: false,
    topics: [
      {
        title: "Node.js Core Concepts",
        subtopics: [
          "Event Loop & Non-blocking I/O",
          "Modules & CommonJS/ES Modules",
          "File System Operations",
          "Streams & Buffers",
          "Child Processes & Clustering",
          "Error Handling Patterns",
          "Environment Variables & Configuration",
          "Package Management & npm Scripts"
        ],
        resources: [
          { label: "Node.js Official Documentation", url: "https://nodejs.org/en/docs/" },
          { label: "Node.js Best Practices", url: "https://github.com/goldbergyoni/nodebestpractices" },
          { label: "Node.js Design Patterns Book", url: "https://www.nodejsdesignpatterns.com/" },
          { label: "Event Loop Explained", url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/" }
        ]
      },
      {
        title: "Express.js Framework",
        subtopics: [
          "Routing & Route Parameters",
          "Middleware Functions & Error Handling",
          "Request/Response Object Manipulation",
          "Template Engines (EJS, Handlebars)",
          "Static File Serving",
          "CORS & Security Headers",
          "Rate Limiting & DDoS Protection",
          "Session Management & Cookies"
        ],
        resources: [
          { label: "Express.js Documentation", url: "https://expressjs.com/" },
          { label: "Express Security Best Practices", url: "https://expressjs.com/en/advanced/best-practice-security.html" },
          { label: "Helmet.js Security", url: "https://helmetjs.github.io/" },
          { label: "Express Rate Limit", url: "https://github.com/nfriedly/express-rate-limit" }
        ]
      },
      {
        title: "Database Integration",
        subtopics: [
          "MongoDB with Mongoose ODM",
          "PostgreSQL with Sequelize/Prisma ORM",
          "Redis for Caching & Sessions",
          "Database Design & Schema Modeling",
          "Query Optimization & Indexing",
          "Database Migrations & Seeds",
          "Connection Pooling",
          "Database Security & Encryption"
        ],
        resources: [
          { label: "Mongoose Documentation", url: "https://mongoosejs.com/" },
          { label: "Prisma ORM", url: "https://www.prisma.io/" },
          { label: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/" },
          { label: "Redis Documentation", url: "https://redis.io/documentation" }
        ]
      },
      {
        title: "API Development & Security",
        subtopics: [
          "RESTful API Design Principles",
          "GraphQL with Apollo Server",
          "JWT Authentication & Authorization",
          "OAuth 2.0 & Social Login",
          "API Documentation with Swagger",
          "Input Validation & Sanitization",
          "API Testing & Monitoring",
          "Microservices Architecture"
        ],
        resources: [
          { label: "REST API Design Guide", url: "https://restfulapi.net/" },
          { label: "Apollo GraphQL Server", url: "https://www.apollographql.com/docs/apollo-server/" },
          { label: "JSON Web Tokens", url: "https://jwt.io/" },
          { label: "Swagger/OpenAPI", url: "https://swagger.io/specification/" }
        ]
      }
    ]
  },
  {
    id: "nextjs-fullstack",
    title: "Full-Stack Development with Next.js",
    description:
      "Build modern full-stack applications with Next.js. Learn SSR, SSG, API routes, and deploy production-ready applications.",
    difficulty: "Advanced",
    estimatedDuration: "16-20 weeks",
    category: "Full-Stack Development",
    featured: true,
    topics: [
      {
        title: "Next.js Fundamentals",
        subtopics: [
          "Pages & File-based Routing",
          "App Router vs Pages Router",
          "Server-Side Rendering (SSR)",
          "Static Site Generation (SSG)",
          "Incremental Static Regeneration (ISR)",
          "Client-Side Navigation",
          "Image Optimization",
          "Font Optimization"
        ],
        resources: [
          { label: "Next.js Documentation", url: "https://nextjs.org/docs" },
          { label: "Next.js Learn Course", url: "https://nextjs.org/learn" },
          { label: "Vercel Platform", url: "https://vercel.com/docs" },
          { label: "Next.js Examples", url: "https://github.com/vercel/next.js/tree/canary/examples" }
        ]
      },
      {
        title: "API Routes & Backend Integration",
        subtopics: [
          "API Routes & Serverless Functions",
          "Middleware & Request Handling",
          "Database Integration (Prisma, MongoDB)",
          "Authentication (NextAuth.js)",
          "File Uploads & Storage",
          "Third-party API Integration",
          "Webhook Handling",
          "Background Jobs & Cron"
        ],
        resources: [
          { label: "Next.js API Routes", url: "https://nextjs.org/docs/api-routes/introduction" },
          { label: "NextAuth.js", url: "https://next-auth.js.org/" },
          { label: "Prisma with Next.js", url: "https://www.prisma.io/nextjs" },
          { label: "Uploadcare for File Uploads", url: "https://uploadcare.com/" }
        ]
      },
      {
        title: "Advanced Features & Performance",
        subtopics: [
          "Advanced Routing (Dynamic, Nested)",
          "Internationalization (i18n)",
          "Progressive Web App (PWA)",
          "Performance Optimization",
          "Bundle Analysis & Code Splitting",
          "SEO Optimization & Meta Tags",
          "Analytics Integration",
          "Error Tracking & Monitoring"
        ],
        resources: [
          { label: "Next.js Internationalization", url: "https://nextjs.org/docs/advanced-features/i18n" },
          { label: "PWA with Next.js", url: "https://github.com/shadowwalker/next-pwa" },
          { label: "Next.js Analytics", url: "https://nextjs.org/analytics" },
          { label: "Sentry Error Tracking", url: "https://docs.sentry.io/platforms/javascript/guides/nextjs/" }
        ]
      },
      {
        title: "Styling & UI Development",
        subtopics: [
          "CSS Modules & Styled Components",
          "Tailwind CSS Integration",
          "Component Libraries (Chakra UI, Material-UI)",
          "Dark Mode Implementation",
          "Responsive Design Patterns",
          "Animation Libraries (Framer Motion)",
          "Design System Development",
          "Accessibility Best Practices"
        ],
        resources: [
          { label: "Tailwind CSS with Next.js", url: "https://tailwindcss.com/docs/guides/nextjs" },
          { label: "Chakra UI", url: "https://chakra-ui.com/" },
          { label: "Framer Motion", url: "https://www.framer.com/motion/" },
          { label: "Radix UI Primitives", url: "https://www.radix-ui.com/" }
        ]
      }
    ]
  },
  {
    id: "nestjs-enterprise",
    title: "Enterprise Backend with NestJS",
    description:
      "Build scalable, enterprise-grade backend applications with NestJS. Learn TypeScript, decorators, dependency injection, and microservices architecture.",
    difficulty: "Advanced",
    estimatedDuration: "18-22 weeks",
    category: "Backend Development",
    featured: false,
    topics: [
      {
        title: "NestJS Architecture & Core Concepts",
        subtopics: [
          "Dependency Injection & IoC Container",
          "Modules, Controllers, & Services",
          "Decorators & Metadata",
          "Middleware & Interceptors",
          "Guards & Authentication",
          "Pipes & Data Validation",
          "Exception Filters",
          "Custom Providers & Dynamic Modules"
        ],
        resources: [
          { label: "NestJS Documentation", url: "https://docs.nestjs.com/" },
          { label: "NestJS Fundamentals Course", url: "https://learn.nestjs.com/" },
          { label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
          { label: "Reflect Metadata", url: "https://github.com/rbuckton/reflect-metadata" }
        ]
      },
      {
        title: "Database & ORM Integration",
        subtopics: [
          "TypeORM with PostgreSQL/MySQL",
          "Prisma ORM Integration",
          "MongoDB with Mongoose",
          "Database Migrations & Seeding",
          "Query Builder & Raw Queries",
          "Transactions & Connection Pooling",
          "Database Testing Strategies",
          "Multi-database Support"
        ],
        resources: [
          { label: "NestJS TypeORM", url: "https://docs.nestjs.com/techniques/database" },
          { label: "NestJS Prisma", url: "https://docs.nestjs.com/recipes/prisma" },
          { label: "TypeORM Documentation", url: "https://typeorm.io/" },
          { label: "NestJS Mongoose", url: "https://docs.nestjs.com/techniques/mongodb" }
        ]
      },
      {
        title: "API Development & Documentation",
        subtopics: [
          "RESTful API with OpenAPI/Swagger",
          "GraphQL with Apollo Server",
          "Real-time APIs with WebSockets",
          "API Versioning Strategies",
          "Request/Response Transformation",
          "Caching with Redis",
          "Rate Limiting & Throttling",
          "API Testing & E2E Tests"
        ],
        resources: [
          { label: "NestJS Swagger", url: "https://docs.nestjs.com/openapi/introduction" },
          { label: "NestJS GraphQL", url: "https://docs.nestjs.com/graphql/quick-start" },
          { label: "NestJS WebSockets", url: "https://docs.nestjs.com/websockets/gateways" },
          { label: "NestJS Testing", url: "https://docs.nestjs.com/fundamentals/testing" }
        ]
      },
      {
        title: "Security & Production Deployment",
        subtopics: [
          "Authentication (JWT, Passport, Auth0)",
          "Authorization & Role-based Access",
          "Input Validation & Sanitization",
          "CORS & Security Headers",
          "File Upload & Storage Security",
          "Logging & Monitoring",
          "Docker Containerization",
          "Kubernetes Deployment"
        ],
        resources: [
          { label: "NestJS Authentication", url: "https://docs.nestjs.com/security/authentication" },
          { label: "NestJS Authorization", url: "https://docs.nestjs.com/security/authorization" },
          { label: "Helmet Security", url: "https://github.com/helmetjs/helmet" },
          { label: "Winston Logger", url: "https://github.com/winstonjs/winston" }
        ]
      }
    ]
  },
  {
    id: "rust-systems",
    title: "Systems Programming with Rust",
    description:
      "Master systems programming with Rust. Learn memory safety, concurrency, and build high-performance applications without garbage collection.",
    difficulty: "Advanced",
    estimatedDuration: "20-24 weeks",
    category: "Systems Programming",
    featured: false,
    topics: [
      {
        title: "Rust Fundamentals",
        subtopics: [
          "Ownership & Borrowing System",
          "Memory Safety & Zero-Cost Abstractions",
          "Pattern Matching & Enums",
          "Structs & Methods",
          "Traits & Generics",
          "Error Handling (Result & Option)",
          "Modules & Crate System",
          "Cargo Package Manager"
        ],
        resources: [
          { label: "The Rust Book", url: "https://doc.rust-lang.org/book/" },
          { label: "Rust by Example", url: "https://doc.rust-lang.org/rust-by-example/" },
          { label: "Rustlings Exercises", url: "https://github.com/rust-lang/rustlings" },
          { label: "Rust Reference", url: "https://doc.rust-lang.org/reference/" }
        ]
      },
      {
        title: "Advanced Rust Concepts",
        subtopics: [
          "Lifetimes & Advanced References",
          "Smart Pointers (Box, Rc, RefCell)",
          "Concurrency & Threading",
          "Async Programming & Futures",
          "Unsafe Rust & FFI",
          "Macros & Procedural Macros",
          "Custom Allocators",
          "Performance Optimization"
        ],
        resources: [
          { label: "Async Rust Book", url: "https://rust-lang.github.io/async-book/" },
          { label: "Rust Nomicon (Unsafe)", url: "https://doc.rust-lang.org/nomicon/" },
          { label: "Tokio Async Runtime", url: "https://tokio.rs/" },
          { label: "Rayon Data Parallelism", url: "https://github.com/rayon-rs/rayon" }
        ]
      },
      {
        title: "Web Development with Rust",
        subtopics: [
          "Actix-web Framework",
          "Warp & Hyper HTTP Libraries",
          "Database Integration (SQLx, Diesel)",
          "Authentication & Security",
          "JSON & Serde Serialization",
          "WebAssembly (WASM) Development",
          "CLI Applications with Clap",
          "Testing & Benchmarking"
        ],
        resources: [
          { label: "Actix Web Framework", url: "https://actix.rs/" },
          { label: "SQLx Database Library", url: "https://github.com/launchbadge/sqlx" },
          { label: "Serde Serialization", url: "https://serde.rs/" },
          { label: "wasm-pack WebAssembly", url: "https://rustwasm.github.io/wasm-pack/" }
        ]
      },
      {
        title: "Systems & Performance Programming",
        subtopics: [
          "Operating System Interfaces",
          "Network Programming",
          "File I/O & System Calls",
          "Memory-mapped Files",
          "Cross-platform Development",
          "Embedded Systems Programming",
          "Game Engine Development",
          "Blockchain & Cryptocurrency"
        ],
        resources: [
          { label: "Rust OSDev", url: "https://os.phil-opp.com/" },
          { label: "Embedded Rust Book", url: "https://docs.rust-embedded.org/book/" },
          { label: "Bevy Game Engine", url: "https://bevyengine.org/" },
          { label: "Substrate Blockchain", url: "https://substrate.io/" }
        ]
      }
    ]
  },
  {
    id: "golang-backend",
    title: "Backend Development with Go",
    description:
      "Build high-performance backend systems with Go. Learn concurrency, microservices, and cloud-native development patterns.",
    difficulty: "Intermediate",
    estimatedDuration: "16-20 weeks",
    category: "Backend Development",
    featured: false,
    topics: [
      {
        title: "Go Language Fundamentals",
        subtopics: [
          "Syntax & Basic Types",
          "Functions & Methods",
          "Structs & Interfaces",
          "Pointers & Memory Management",
          "Error Handling Patterns",
          "Packages & Modules",
          "Go Routines & Channels",
          "Select Statement & Concurrency"
        ],
        resources: [
          { label: "Go Official Documentation", url: "https://golang.org/doc/" },
          { label: "A Tour of Go", url: "https://tour.golang.org/" },
          { label: "Effective Go", url: "https://golang.org/doc/effective_go" },
          { label: "Go by Example", url: "https://gobyexample.com/" }
        ]
      },
      {
        title: "Web Development with Go",
        subtopics: [
          "HTTP Server & Client",
          "Gin Web Framework",
          "Echo Framework",
          "Middleware & Authentication",
          "Template Engines",
          "JSON & XML Processing",
          "File Upload & Static Files",
          "WebSocket Implementation"
        ],
        resources: [
          { label: "Gin Web Framework", url: "https://gin-gonic.com/" },
          { label: "Echo Framework", url: "https://echo.labstack.com/" },
          { label: "Go HTTP Package", url: "https://golang.org/pkg/net/http/" },
          { label: "Gorilla WebSocket", url: "https://github.com/gorilla/websocket" }
        ]
      },
      {
        title: "Database & Data Persistence",
        subtopics: [
          "SQL Database Integration",
          "GORM ORM Framework",
          "Raw SQL with database/sql",
          "MongoDB Integration",
          "Redis Caching",
          "Database Migrations",
          "Connection Pooling",
          "Database Testing"
        ],
        resources: [
          { label: "GORM ORM", url: "https://gorm.io/" },
          { label: "Go MongoDB Driver", url: "https://github.com/mongodb/mongo-go-driver" },
          { label: "Go Redis Client", url: "https://github.com/go-redis/redis" },
          { label: "Migrate Tool", url: "https://github.com/golang-migrate/migrate" }
        ]
      },
      {
        title: "Microservices & Cloud Native",
        subtopics: [
          "Microservices Architecture",
          "gRPC & Protocol Buffers",
          "Service Discovery",
          "Load Balancing",
          "Circuit Breaker Pattern",
          "Distributed Tracing",
          "Container Deployment (Docker)",
          "Kubernetes Integration"
        ],
        resources: [
          { label: "gRPC Go", url: "https://grpc.io/docs/languages/go/" },
          { label: "Consul Service Discovery", url: "https://www.consul.io/" },
          { label: "Istio Service Mesh", url: "https://istio.io/" },
          { label: "Prometheus Monitoring", url: "https://prometheus.io/" }
        ]
      }
    ]
  },
  {
    id: "web3-blockchain",
    title: "Web3 & Blockchain Development",
    description:
      "Master decentralized application development. Learn Solidity, smart contracts, DeFi protocols, and build on Ethereum and other blockchains.",
    difficulty: "Advanced",
    estimatedDuration: "20-24 weeks",
    category: "Blockchain",
    featured: true,
    topics: [
      {
        title: "Blockchain Fundamentals",
        subtopics: [
          "Blockchain Technology Basics",
          "Cryptographic Hash Functions",
          "Digital Signatures & Public Key Cryptography",
          "Consensus Mechanisms (PoW, PoS, DPoS)",
          "Merkle Trees & Data Structures",
          "Bitcoin & Cryptocurrency Basics",
          "Ethereum Virtual Machine (EVM)",
          "Gas Fees & Transaction Mechanics"
        ],
        resources: [
          { label: "Mastering Bitcoin Book", url: "https://github.com/bitcoinbook/bitcoinbook" },
          { label: "Ethereum Whitepaper", url: "https://ethereum.org/en/whitepaper/" },
          { label: "Blockchain Demo", url: "https://andersbrownworth.com/blockchain/" },
          { label: "Ethereum Yellow Paper", url: "https://ethereum.github.io/yellowpaper/paper.pdf" }
        ]
      },
      {
        title: "Smart Contract Development",
        subtopics: [
          "Solidity Programming Language",
          "Smart Contract Architecture",
          "Contract Deployment & Upgrades",
          "Security Best Practices",
          "Common Vulnerabilities (Reentrancy, Overflow)",
          "Testing with Hardhat & Truffle",
          "Gas Optimization Techniques",
          "Contract Interaction Patterns"
        ],
        resources: [
          { label: "Solidity Documentation", url: "https://docs.soliditylang.org/" },
          { label: "Hardhat Development", url: "https://hardhat.org/" },
          { label: "OpenZeppelin Contracts", url: "https://openzeppelin.com/contracts/" },
          { label: "Consensys Smart Contract Security", url: "https://consensys.github.io/smart-contract-best-practices/" }
        ]
      },
      {
        title: "DeFi & Protocol Development",
        subtopics: [
          "Decentralized Exchanges (DEX)",
          "Automated Market Makers (AMM)",
          "Lending & Borrowing Protocols",
          "Yield Farming & Liquidity Mining",
          "Governance Tokens & DAOs",
          "Flash Loans & Arbitrage",
          "Price Oracles & Data Feeds",
          "Cross-chain Bridges"
        ],
        resources: [
          { label: "Uniswap V3 Documentation", url: "https://docs.uniswap.org/" },
          { label: "Compound Protocol", url: "https://compound.finance/docs" },
          { label: "Chainlink Oracles", url: "https://docs.chain.link/" },
          { label: "Aave Protocol", url: "https://docs.aave.com/developers/" }
        ]
      },
      {
        title: "dApp Frontend Development",
        subtopics: [
          "Web3.js & Ethers.js Libraries",
          "Wallet Integration (MetaMask, WalletConnect)",
          "React with Web3 Hooks",
          "IPFS for Decentralized Storage",
          "The Graph for Data Indexing",
          "ENS (Ethereum Name Service)",
          "Multi-chain Development",
          "Mobile dApp Development"
        ],
        resources: [
          { label: "Ethers.js Documentation", url: "https://docs.ethers.io/" },
          { label: "WalletConnect Integration", url: "https://walletconnect.com/" },
          { label: "IPFS Documentation", url: "https://docs.ipfs.io/" },
          { label: "The Graph Protocol", url: "https://thegraph.com/docs/" }
        ]
      }
    ]
  },
  {
    id: "data-science-python",
    title: "Data Science with Python",
    description:
      "Master data analysis, machine learning, and AI development with Python. Build predictive models and extract insights from complex datasets.",
    difficulty: "Intermediate",
    estimatedDuration: "18-22 weeks",
    category: "Data Science",
    featured: true,
    topics: [
      {
        title: "Python for Data Science",
        subtopics: [
          "Python Fundamentals & Jupyter Notebooks",
          "NumPy for Numerical Computing",
          "Pandas for Data Manipulation",
          "Data Cleaning & Preprocessing",
          "Working with APIs & Web Scraping",
          "File Formats (CSV, JSON, Parquet, HDF5)",
          "Regular Expressions for Text Processing",
          "Datetime Handling & Time Series"
        ],
        resources: [
          { label: "Python Data Science Handbook", url: "https://jakevdp.github.io/PythonDataScienceHandbook/" },
          { label: "Pandas Documentation", url: "https://pandas.pydata.org/docs/" },
          { label: "NumPy Documentation", url: "https://numpy.org/doc/" },
          { label: "Jupyter Notebook Guide", url: "https://jupyter-notebook.readthedocs.io/" }
        ]
      },
      {
        title: "Data Visualization",
        subtopics: [
          "Matplotlib Fundamentals",
          "Seaborn Statistical Plotting",
          "Plotly Interactive Visualizations",
          "Bokeh for Web Applications",
          "Geographic Data Visualization",
          "Dashboard Creation with Streamlit",
          "Advanced Plotting Techniques",
          "Data Storytelling Principles"
        ],
        resources: [
          { label: "Matplotlib Tutorials", url: "https://matplotlib.org/stable/tutorials/" },
          { label: "Seaborn Documentation", url: "https://seaborn.pydata.org/" },
          { label: "Plotly Python", url: "https://plotly.com/python/" },
          { label: "Streamlit Documentation", url: "https://docs.streamlit.io/" }
        ]
      },
      {
        title: "Machine Learning & Statistics",
        subtopics: [
          "Statistical Analysis & Hypothesis Testing",
          "Supervised Learning (Classification, Regression)",
          "Unsupervised Learning (Clustering, PCA)",
          "Feature Engineering & Selection",
          "Model Evaluation & Cross Validation",
          "Ensemble Methods (Random Forest, XGBoost)",
          "Time Series Forecasting",
          "Natural Language Processing (NLP)"
        ],
        resources: [
          { label: "Scikit-learn Documentation", url: "https://scikit-learn.org/stable/" },
          { label: "XGBoost Documentation", url: "https://xgboost.readthedocs.io/" },
          { label: "NLTK Natural Language Toolkit", url: "https://www.nltk.org/" },
          { label: "StatsModels Documentation", url: "https://www.statsmodels.org/" }
        ]
      },
      {
        title: "Deep Learning & AI",
        subtopics: [
          "Neural Networks Fundamentals",
          "TensorFlow & Keras Framework",
          "PyTorch Deep Learning",
          "Computer Vision with CNNs",
          "Natural Language Processing with RNNs/Transformers",
          "Generative AI & Large Language Models",
          "MLOps & Model Deployment",
          "GPU Computing with CUDA"
        ],
        resources: [
          { label: "TensorFlow Documentation", url: "https://www.tensorflow.org/" },
          { label: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/" },
          { label: "Hugging Face Transformers", url: "https://huggingface.co/transformers/" },
          { label: "MLflow for MLOps", url: "https://mlflow.org/" }
        ]
      }
    ]
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Engineering",
    description:
      "Master modern infrastructure, CI/CD pipelines, containerization, and cloud platforms. Build scalable and reliable systems.",
    difficulty: "Advanced",
    estimatedDuration: "20-24 weeks",
    category: "DevOps",
    featured: false,
    topics: [
      {
        title: "Infrastructure Fundamentals",
        subtopics: [
          "Linux System Administration",
          "Networking & Security Basics",
          "Shell Scripting & Automation",
          "Package Management & Services",
          "Monitoring & Logging Systems",
          "Performance Tuning & Optimization",
          "Backup & Disaster Recovery",
          "Infrastructure as Code (IaC) Concepts"
        ],
        resources: [
          { label: "Linux Command Line Guide", url: "https://linuxcommand.org/" },
          { label: "Bash Scripting Tutorial", url: "https://ryanstutorials.net/bash-scripting-tutorial/" },
          { label: "Prometheus Monitoring", url: "https://prometheus.io/docs/" },
          { label: "ELK Stack Documentation", url: "https://www.elastic.co/guide/" }
        ]
      },
      {
        title: "Containerization & Orchestration",
        subtopics: [
          "Docker Fundamentals & Best Practices",
          "Container Image Optimization",
          "Docker Compose for Multi-container Apps",
          "Kubernetes Architecture & Components",
          "Pod, Service, & Ingress Management",
          "ConfigMaps, Secrets, & Storage",
          "Helm Package Manager",
          "Service Mesh (Istio, Linkerd)"
        ],
        resources: [
          { label: "Docker Documentation", url: "https://docs.docker.com/" },
          { label: "Kubernetes Documentation", url: "https://kubernetes.io/docs/" },
          { label: "Helm Documentation", url: "https://helm.sh/docs/" },
          { label: "Istio Service Mesh", url: "https://istio.io/latest/docs/" }
        ]
      },
      {
        title: "CI/CD & Automation",
        subtopics: [
          "Git Workflows & Branch Strategies",
          "Jenkins Pipeline Development",
          "GitHub Actions & GitLab CI",
          "Automated Testing Strategies",
          "Blue-Green & Canary Deployments",
          "Infrastructure Testing",
          "Security in CI/CD Pipelines",
          "Deployment Rollback Strategies"
        ],
        resources: [
          { label: "Jenkins Documentation", url: "https://www.jenkins.io/doc/" },
          { label: "GitHub Actions", url: "https://docs.github.com/en/actions" },
          { label: "GitLab CI/CD", url: "https://docs.gitlab.com/ee/ci/" },
          { label: "Terraform Testing", url: "https://www.terraform.io/docs/extend/testing/" }
        ]
      },
      {
        title: "Cloud Platforms & Services",
        subtopics: [
          "AWS Core Services (EC2, S3, RDS, Lambda)",
          "Azure Infrastructure & PaaS Services",
          "Google Cloud Platform (GCP) Services",
          "Serverless Architecture Patterns",
          "Cloud Security & IAM",
          "Cost Optimization Strategies",
          "Multi-cloud & Hybrid Deployments",
          "Cloud Migration Strategies"
        ],
        resources: [
          { label: "AWS Documentation", url: "https://docs.aws.amazon.com/" },
          { label: "Azure Documentation", url: "https://docs.microsoft.com/en-us/azure/" },
          { label: "Google Cloud Documentation", url: "https://cloud.google.com/docs" },
          { label: "Serverless Framework", url: "https://www.serverless.com/framework/docs/" }
        ]
      }
    ]
  },
  {
    id: "mobile-flutter",
    title: "Cross-Platform Mobile with Flutter",
    description:
      "Build beautiful native mobile apps for iOS and Android with Flutter and Dart. Learn widget composition and platform-specific features.",
    difficulty: "Intermediate",
    estimatedDuration: "14-18 weeks",
    category: "Mobile Development",
    featured: false,
    topics: [
      {
        title: "Flutter & Dart Fundamentals",
        subtopics: [
          "Dart Language Basics",
          "Flutter Widget Tree",
          "Stateless vs Stateful Widgets",
          "Layout & Positioning Widgets",
          "Navigation & Routing",
          "Theme & Styling",
          "Animation & Gestures",
          "Platform Channel Integration"
        ],
        resources: [
          { label: "Flutter Documentation", url: "https://docs.flutter.dev/" },
          { label: "Dart Language Tour", url: "https://dart.dev/guides/language/language-tour" },
          { label: "Flutter Widget Catalog", url: "https://docs.flutter.dev/development/ui/widgets" },
          { label: "Flutter Animations", url: "https://docs.flutter.dev/development/ui/animations" }
        ]
      },
      {
        title: "State Management",
        subtopics: [
          "Provider State Management",
          "BLoC Pattern & Cubit",
          "Riverpod for Advanced State",
          "Redux Pattern in Flutter",
          "Local State vs Global State",
          "State Persistence",
          "Form State Management",
          "Performance Optimization"
        ],
        resources: [
          { label: "Provider Package", url: "https://pub.dev/packages/provider" },
          { label: "BLoC Library", url: "https://bloclibrary.dev/" },
          { label: "Riverpod Documentation", url: "https://riverpod.dev/" },
          { label: "Flutter State Management", url: "https://docs.flutter.dev/development/data-and-backend/state-mgmt" }
        ]
      },
      {
        title: "Backend Integration",
        subtopics: [
          "HTTP Requests & REST APIs",
          "JSON Serialization",
          "Local Database (SQLite, Hive)",
          "Firebase Integration",
          "Authentication & Security",
          "Push Notifications",
          "File Upload & Storage",
          "Offline Data Synchronization"
        ],
        resources: [
          { label: "HTTP Package", url: "https://pub.dev/packages/http" },
          { label: "Firebase for Flutter", url: "https://firebase.flutter.dev/" },
          { label: "Hive Database", url: "https://docs.hivedb.dev/" },
          { label: "Dio HTTP Client", url: "https://pub.dev/packages/dio" }
        ]
      },
      {
        title: "Platform Features & Deployment",
        subtopics: [
          "Camera & Gallery Integration",
          "Location & GPS Services",
          "Device Sensors & Hardware",
          "Platform-Specific UI",
          "App Store Deployment (iOS)",
          "Play Store Deployment (Android)",
          "App Signing & Security",
          "Performance Monitoring"
        ],
        resources: [
          { label: "Flutter Platform Integration", url: "https://docs.flutter.dev/development/platform-integration" },
          { label: "Image Picker Plugin", url: "https://pub.dev/packages/image_picker" },
          { label: "Geolocator Package", url: "https://pub.dev/packages/geolocator" },
          { label: "Flutter Deployment Guide", url: "https://docs.flutter.dev/deployment" }
        ]
      }
    ]
  },
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity & Ethical Hacking",
    description:
      "Master cybersecurity fundamentals, penetration testing, and ethical hacking. Learn to secure systems and identify vulnerabilities.",
    difficulty: "Advanced",
    estimatedDuration: "22-26 weeks",
    category: "Security",
    featured: false,
    topics: [
      {
        title: "Security Fundamentals",
        subtopics: [
          "Cybersecurity Principles & CIA Triad",
          "Risk Assessment & Management",
          "Cryptography & Encryption",
          "Network Security Protocols",
          "Identity & Access Management",
          "Security Frameworks (NIST, ISO 27001)",
          "Compliance & Regulations (GDPR, HIPAA)",
          "Security Awareness & Training"
        ],
        resources: [
          { label: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
          { label: "OWASP Security Guide", url: "https://owasp.org/" },
          { label: "Cryptography Crash Course", url: "https://www.coursera.org/learn/crypto" },
          { label: "CompTIA Security+ Guide", url: "https://www.comptia.org/certifications/security" }
        ]
      },
      {
        title: "Penetration Testing",
        subtopics: [
          "Reconnaissance & Information Gathering",
          "Vulnerability Scanning & Assessment",
          "Exploitation Techniques",
          "Post-Exploitation & Persistence",
          "Web Application Security Testing",
          "Network Penetration Testing",
          "Wireless Security Assessment",
          "Social Engineering Attacks"
        ],
        resources: [
          { label: "Kali Linux Documentation", url: "https://www.kali.org/docs/" },
          { label: "Metasploit Framework", url: "https://www.metasploit.com/" },
          { label: "Burp Suite Tutorial", url: "https://portswigger.net/burp/documentation" },
          { label: "PTES Standard", url: "http://www.pentest-standard.org/" }
        ]
      },
      {
        title: "Web Application Security",
        subtopics: [
          "OWASP Top 10 Vulnerabilities",
          "SQL Injection & NoSQL Injection",
          "Cross-Site Scripting (XSS)",
          "Cross-Site Request Forgery (CSRF)",
          "Authentication & Authorization Flaws",
          "File Upload Vulnerabilities",
          "API Security Testing",
          "Secure Code Review"
        ],
        resources: [
          { label: "OWASP Web Security Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/" },
          { label: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" },
          { label: "OWASP ZAP Proxy", url: "https://www.zaproxy.org/" },
          { label: "SQLMap Tutorial", url: "https://github.com/sqlmapproject/sqlmap" }
        ]
      },
      {
        title: "Incident Response & Forensics",
        subtopics: [
          "Incident Response Planning",
          "Digital Forensics Fundamentals",
          "Malware Analysis & Reverse Engineering",
          "Network Traffic Analysis",
          "Log Analysis & SIEM",
          "Memory & Disk Forensics",
          "Mobile Device Forensics",
          "Threat Intelligence & IOCs"
        ],
        resources: [
          { label: "SANS Incident Response Guide", url: "https://www.sans.org/white-papers/901/" },
          { label: "Volatility Framework", url: "https://www.volatilityfoundation.org/" },
          { label: "Wireshark Network Analysis", url: "https://www.wireshark.org/" },
          { label: "The Sleuth Kit", url: "https://www.sleuthkit.org/" }
        ]
      }
    ]
  },
  {
    id: "game-development-unity",
    title: "Game Development with Unity",
    description:
      "Create engaging 2D and 3D games with Unity engine. Learn C# scripting, game physics, animation, and publishing to multiple platforms.",
    difficulty: "Intermediate",
    estimatedDuration: "16-20 weeks",
    category: "Game Development",
    featured: false,
    topics: [
      {
        title: "Unity Engine Basics",
        subtopics: [
          "Unity Editor Interface & Workflow",
          "GameObjects & Components System",
          "Scene Management & Hierarchy",
          "Prefabs & Asset Management",
          "Unity Package Manager",
          "Version Control Integration",
          "Build Settings & Target Platforms",
          "Unity Hub & Project Templates"
        ],
        resources: [
          { label: "Unity Learn Platform", url: "https://learn.unity.com/" },
          { label: "Unity Documentation", url: "https://docs.unity3d.com/" },
          { label: "Unity Manual", url: "https://docs.unity3d.com/Manual/" },
          { label: "Unity Scripting Reference", url: "https://docs.unity3d.com/ScriptReference/" }
        ]
      },
      {
        title: "C# Scripting for Unity",
        subtopics: [
          "C# Fundamentals for Game Development",
          "MonoBehaviour Lifecycle Methods",
          "Input System & Player Controls",
          "Collision Detection & Physics",
          "Coroutines & Async Programming",
          "Event Systems & Delegates",
          "ScriptableObjects for Data",
          "Performance Optimization"
        ],
        resources: [
          { label: "C# Programming Guide", url: "https://docs.microsoft.com/en-us/dotnet/csharp/" },
          { label: "Unity Input System", url: "https://docs.unity3d.com/Packages/com.unity.inputsystem@1.0/manual/" },
          { label: "Unity Physics Tutorial", url: "https://learn.unity.com/tutorial/physics-challenges" },
          { label: "ScriptableObjects Guide", url: "https://unity.com/how-to/architect-game-code-scriptable-objects" }
        ]
      },
      {
        title: "Game Design & Mechanics",
        subtopics: [
          "2D Game Development Techniques",
          "3D Game Development & Modeling",
          "Animation & Animator Controller",
          "Particle Systems & Visual Effects",
          "Audio Integration & Sound Design",
          "UI/UX Design for Games",
          "Level Design & Scene Composition",
          "Game Balancing & Player Testing"
        ],
        resources: [
          { label: "Unity 2D Game Development", url: "https://learn.unity.com/pathway/2d-game-development" },
          { label: "Unity Animation System", url: "https://docs.unity3d.com/Manual/AnimationSection.html" },
          { label: "Unity Visual Effects Graph", url: "https://unity.com/visual-effect-graph" },
          { label: "Unity Audio Documentation", url: "https://docs.unity3d.com/Manual/Audio.html" }
        ]
      },
      {
        title: "Publishing & Monetization",
        subtopics: [
          "Building for Mobile Platforms",
          "PC & Console Deployment",
          "Web Publishing with WebGL",
          "App Store Optimization (ASO)",
          "In-App Purchases & Monetization",
          "Analytics & Player Behavior",
          "Multiplayer Networking Basics",
          "Post-Launch Updates & Patches"
        ],
        resources: [
          { label: "Unity Cloud Build", url: "https://unity.com/products/cloud-build" },
          { label: "Unity Analytics", url: "https://unity.com/products/unity-analytics" },
          { label: "Unity Netcode for GameObjects", url: "https://docs-multiplayer.unity3d.com/" },
          { label: "Unity IAP Documentation", url: "https://docs.unity3d.com/Manual/UnityIAP.html" }
        ]
      }
    ]
  }
];