-- =============================================================================
-- V7: Structured Project Presentation Attributes & Rich Backfill
-- Adds key_features, quickstart_cmd, and video_demo_url to projects table.
-- Backfills real engineering problem statements, solutions, key features,
-- and live URLs for existing projects.
-- =============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_features TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quickstart_cmd VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_demo_url VARCHAR(500);

-- Backfill 1: INGRIS CHATBOT
UPDATE projects
SET problem_statement = 'Hydrogeological data published by the Central Ground Water Board (CGWB) exists across thousands of heterogeneous PDF surveys, static tables, and regional monitoring wells, making it difficult for researchers, farmers, and policymakers to assess local water table depletion in real time.',
    proposed_solution = 'An AI-powered hydrogeological assistant combining Retrieval-Augmented Generation (RAG) with low-latency LLM inference (Groq Llama-3-70B, OpenRouter, and Gemini fallback) to deliver grounded aquifer analytics, seasonal water table depth (m bgl), and statutory extraction compliance metrics.',
    key_features = '• Multi-provider LLM priority fallback matrix (Groq LPU primary, OpenRouter secondary, Gemini multimodal fallback)
• Real-time Central Ground Water Board (CGWB) statutory report synthesis
• Automated District Extraction Stress classification (Safe, Semi-Critical, Critical, Over-Exploited)
• Geospatial water table variance estimation across seasonal pre/post-monsoon telemetry
• Interactive hydrogeological knowledge explorer with citation grounding',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT.git && cd INGRIS-CHATBOT && pip install -r requirements.txt',
    live_demo_url = 'https://ingris-chatbot.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT',
    architecture_summary = 'FastAPI asynchronous core routing queries through BGE-small vector embeddings in Supabase pgvector, with table-aware chunking for dense hydrological data and WebSocket streaming responses.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%INGRIS%';

-- Backfill 2: FleetWatch / Vehicle Telemetry
UPDATE projects
SET problem_statement = 'Connected vehicle fleets suffer from catastrophic mechanical breakdowns and safety violations because traditional OBD-II telematics systems rely either on slow post-trip batch processing or simplistic hardcoded alerts that produce high false-alarm rates.',
    proposed_solution = 'A high-velocity streaming telemetry platform that unites deterministic physical boundaries (instant overheat and overspeed safety triggers) with unsupervised Machine Learning (Isolation Forest anomaly score estimation) for sub-50ms fault detection.',
    key_features = '• Sub-50ms CAN-bus sensor packet evaluation over bidirectional WebSockets
• Dual-layer anomaly detection: physical threshold gates + multivariate Isolation Forest scoring
• Interactive simulation control center with live speed, temperature, RPM, battery, and fuel sliders
• Priority incident logging (Critical, High, Medium, Low) with statistical confidence metrics
• Automated automated emergency warning alerts before mechanical engine seizure',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System.git && docker-compose up --build',
    github_url = 'https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System',
    architecture_summary = 'Event-driven reactive telemetry pipeline built with Python FastAPI, scikit-learn Isolation Forest model, and React dashboard with visual gauge telemetry and state management.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Vehicle Telemetry%';

-- Backfill 3: Personal Finance Tracker
UPDATE projects
SET problem_statement = 'Individuals and households frequently overshoot monthly budgets due to fragmented expense tracking across multiple bank statements and lack of real-time category spending limits.',
    proposed_solution = 'A full-stack financial management platform with high-performance MongoDB aggregation pipelines, dynamic categorical budget progress indicators, and interactive analytics charts.',
    key_features = '• Real-time financial dashboard displaying Total Income, Net Balance, and Global Budget Limit
• Customizable spending categories with individual budget caps and color-coded progress bars
• High-performance MongoDB aggregation analytics for expense breakdown percentages
• Chronological transaction ledger with date-based sorting and category tagging
• Built-in financial calculator for instant budget arithmetic',
    quickstart_cmd = 'docker run -d -p 8080:8080 -e MONGODB_URI="your_mongodb_uri" ajaykumar/finance-tracker',
    live_demo_url = 'https://personalfinancetracker-swag.onrender.com',
    github_url = 'https://github.com/Ajaykumarnachimuthu/Personal-Finance-Tracker',
    architecture_summary = 'Java Server Pages (JSP) and Servlet 5.0 backend running on Apache Tomcat with MongoDB Atlas cloud document storage, containerized with Docker.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Personal Finance Tracker%';

-- Backfill 4: DevSphere
UPDATE projects
SET problem_statement = 'Modern developer ecosystems are either cluttered with algorithmic social noise or fragmented into disjointed blogs and code repositories without structured technical inspection or verified architecture deep dives.',
    proposed_solution = 'A unified developer platform combining high-throughput Spring Boot REST microservices, Supabase cloud PostgreSQL, and a responsive React client for publishing technical articles, showcasing projects with deep architecture breakdowns, and peer code discussions.',
    key_features = '• Layered Spring Boot 3 backend with stateless JWT HMAC-SHA512 authentication
• HikariCP connection pooling optimized for cloud PostgreSQL and sub-second cold starts
• Interactive Project Showcases with live demo launchpad, clone snippets, and architecture inspection
• Rich markdown technical blog publishing engine with tagging and difficulty tiers
• Full dark/light theme engine with high-contrast accessibility compliance',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/DevSphere.git && npm install && npm run dev',
    live_demo_url = 'https://dev-sphere-eight.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/DevSphere',
    architecture_summary = 'Domain-driven layering: Spring Boot 3 controllers receive validated DTOs, service layer enforces transaction boundaries and optimistic locking, and Spring Data JPA executes index-optimized SQL queries.',
    updated_at = CURRENT_TIMESTAMP
WHERE title = 'DevSphere';

-- Backfill 5: YatraAI
UPDATE projects
SET problem_statement = 'Travelers struggle with disconnected multi-modal transit bookings and rigid travel itineraries that do not adapt dynamically to passenger budget constraints or weather conditions.',
    proposed_solution = 'An intelligent multi-modal travel journey orchestration engine utilizing greedy search heuristics and microeconomic preference modeling to generate optimal transit itineraries.',
    key_features = '• Multi-modal transit route optimization across air, rail, and road networks
• Dynamic budget and time-constraint preference optimization
• AI-assisted travel itinerary generation with local attraction clustering
• Real-time route rerouting based on transit disruption feeds',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/YatraAI.git && npm install && npm start',
    github_url = 'https://github.com/Ajaykumarnachimuthu/YatraAI',
    architecture_summary = 'Microservices architecture with Node.js and Python optimization engines interfacing with travel schedule APIs and graph-based route search.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%YatraAI%';
