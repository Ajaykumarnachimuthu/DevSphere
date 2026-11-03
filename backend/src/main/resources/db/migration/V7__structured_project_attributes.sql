-- =============================================================================
-- V7: Structured Project Presentation Attributes & Comprehensive 8-Project Backfill
-- Authored by AJAYKUMAR N with production-grade engineering narratives
-- =============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_features TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quickstart_cmd VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_demo_url VARCHAR(500);

-- Project 1: DevSphere
UPDATE projects
SET tagline = 'Modern developer community platform for technical blogging, interactive project showcases, and peer code reviews.',
    problem_statement = 'Modern developer platforms are heavily polarized. Algorithmic social feeds prioritize engagement-bait and shallow snippets over in-depth engineering breakdowns, while static documentation sites and disconnected Git repositories fail to provide interactive previews, structured peer review loops, or live runtime telemetry. Developers lack a unified platform where technical writing, project architecture showcases, and community discussions naturally coexist with low-latency responsiveness.',
    proposed_solution = 'DevSphere addresses this fragmentation by pairing an enterprise-grade Spring Boot 3 reactive REST backend with a modern, high-performance React client. It delivers a dedicated developer hub featuring structured Markdown publishing with live split-screen preview, full project X-ray showcases with clone automation, and stateless HMAC-SHA512 authenticated community interactions. HikariCP connection pooling and Supabase PostgreSQL ensure sub-second response times across cloud cold starts.',
    key_features = '- Stateless JWT HMAC-SHA512 authentication with BCrypt password encryption and role-based permissions
- High-throughput HikariCP connection pooling optimized for cloud-native PostgreSQL queries
- Structured Project Showcases with live demo launchpad, one-click clone snippets, and architecture deep dives
- Rich Markdown technical blog editor featuring split-screen live preview, heading navigation, and syntax highlighting
- Peer feedback and review system with nested discussions and bookmark collections',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/DevSphere.git && cd DevSphere && npm install && npm run dev',
    live_demo_url = 'https://dev-sphere-eight.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/DevSphere',
    architecture_summary = 'Multi-tier architecture: Spring Boot 3 REST controllers receive validated DTOs, service layer enforces transaction boundaries and optimistic locking, and Spring Data JPA executes index-optimized SQL queries on Supabase PostgreSQL. Frontend is built with React and Vite, utilizing context-driven state management and accessible WCAG-compliant styling.',
    description = 'DevSphere is an end-to-end community platform engineered for developers to articulate their software architecture, author rich technical publications, and collaborate through peer code reviews. Built on Spring Boot 3 and React, the system emphasizes developer experience with instantaneous search, dark/light theme switching, and live markdown preview.',
    cover_image = '/images/devsphere-logo.png',
    author_name = 'AJAYKUMAR N',
    category = 'Web Development',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%DevSphere%';

-- Project 2: INGRIS CHATBOT
UPDATE projects
SET tagline = 'AI-Driven Groundwater & Hydrogeological Assistant engineered with Central Ground Water Board (CGWB) report insights and RAG pipeline.',
    problem_statement = 'Critical groundwater level surveys, aquifer recharge metrics, and district extraction assessments published by India Central Ground Water Board (CGWB) are locked away in hundreds of dense PDF reports, multi-page statistical tables, and static geospatial gazettes. Hydrologists, agricultural planners, and local authorities face severe friction extracting immediate, actionable insights on seasonal water table fluctuations or critical overdraft thresholds.',
    proposed_solution = 'INGRIS Chatbot transforms these unstructured hydrogeological documents into an intelligent conversational assistant. Utilizing an advanced Retrieval-Augmented Generation (RAG) pipeline, the system ingests statutory district water tables, indexes them into high-dimensional vector embeddings, and leverages a multi-provider LLM priority matrix (Groq Llama-3-70B, OpenRouter, and Gemini Multimodal) with automated fallback to guarantee continuous availability and cited factual answers.',
    key_features = '- Multi-provider LLM fallback matrix (Groq Llama-3-70B, OpenRouter, and Google Gemini) ensuring 99.9% query reliability
- Table-aware RAG vector search indexing statutory Central Ground Water Board (CGWB) reports
- Automated District Extraction Stress classification across Safe, Semi-Critical, Critical, and Over-Exploited zones
- Pre-monsoon vs. post-monsoon water table depth variance calculations (in meters below ground level - m bgl)
- Citations and verifiable statutory source grounding for every generated hydrogeological response',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT.git && cd INGRIS-CHATBOT && pip install -r requirements.txt && uvicorn main:app --reload',
    live_demo_url = 'https://ingris-chatbot.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT',
    architecture_summary = 'Python FastAPI asynchronous backend utilizing BGE-small embeddings stored in Supabase pgvector with cosine distance indexing. Bidirectional WebSocket streams power real-time chat tokens directly to a responsive React UI.',
    description = 'An AI-driven conversational hydrogeological assistant designed to democratize access to groundwater data. INGRIS parses official Central Ground Water Board (CGWB) reports, processes district-level water table depths, and provides real-time conversational intelligence for hydrologists, farmers, and municipal planners.',
    cover_image = '/images/projects/ingris-groundwater.jpg',
    author_name = 'AJAYKUMAR N',
    category = 'AI/ML',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%INGRIS%';

-- Project 3: FleetWatch / Vehicle Telemetry
UPDATE projects
SET tagline = 'FleetWatch: Real-time vehicle telemetry monitoring with sub-50ms fault detection using rule thresholds and Isolation Forest ML anomaly model.',
    problem_statement = 'Modern fleet operators face catastrophic mechanical failures and expensive transit downtimes because conventional vehicle telematics systems rely on batch-processed log uploads or simple threshold alarms that generate overwhelming false-positive alerts. Sensor spikes in engine temperature, battery voltage dips, and transient RPM surges require intelligent contextual discrimination to prevent road breakdowns without fatiguing operators.',
    proposed_solution = 'FleetWatch implements a real-time dual-tier telemetry processing engine. Incoming high-frequency sensor streams (speed, engine temperature, RPM, battery voltage, fuel level) pass through an instant physical boundary validation layer before being evaluated by an unsupervised Isolation Forest machine learning model. This hybrid approach enables sub-50ms anomaly detection, automated confidence scoring, and instantaneous emergency alert broadcasts across bidirectional WebSockets.',
    key_features = '- Sub-50ms CAN-bus sensor telemetry packet processing over real-time bidirectional WebSockets
- Dual-tier anomaly detection: deterministic physical boundaries combined with Isolation Forest machine learning scoring
- Interactive operator simulation dashboard featuring dynamic speed, temperature, RPM, battery, and fuel controls
- Automated incident severity classification (Critical, High, Medium, Low) with ML confidence metrics
- Real-time audible and visual alarms with immediate incident history logging',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System.git && docker-compose up --build',
    live_demo_url = 'https://fleetwatch-telemetry.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System',
    architecture_summary = 'Python FastAPI backend executing scikit-learn Isolation Forest estimators on streaming telemetry streams. Frontend is an interactive React dashboard with SVG gauge meters, status badges, and WebSocket state synchronization.',
    description = 'A real-time vehicle telemetry monitoring and fault detection system built to protect commercial fleets. FleetWatch analyzes continuous sensor streams to detect overheating, overspeeding, voltage anomalies, and mechanical stress before failures occur.',
    cover_image = '/images/projects/fleetwatch-telemetry.png',
    author_name = 'AJAYKUMAR N',
    category = 'AI/ML',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Vehicle Telemetry%';

-- Project 4: Personal Finance Tracker
UPDATE projects
SET tagline = 'Personal budget management, income & expense logging, category spending limits, and real-time financial health analytics.',
    problem_statement = 'Individuals frequently struggle with chronic budget overruns and unexpected month-end shortfalls because their financial records are fragmented across multiple banking apps, credit card statements, and offline cash transactions. Existing budgeting tools are either overloaded with unnecessary banking integrations or lack intuitive category-level spending limits and rapid visual indicators of expenditure velocity.',
    proposed_solution = 'Personal Finance Tracker delivers a clean, focused full-stack budgeting system that centralizes income and expenditure logging. Users define customizable spending categories with strict budget caps, track net balance in real time, and inspect interactive charts powered by MongoDB aggregation pipelines. An integrated financial calculator facilitates instant loan and projection modeling directly inside the dashboard.',
    key_features = '- Real-time financial dashboard with Total Income, Total Expenses, and Net Balance summaries
- Dynamic category management with custom budget limits and color-coded threshold warnings
- High-performance MongoDB aggregation pipelines computing monthly expenditure breakdowns
- Chronological transaction history ledger with date-based filtering and instant keyword search
- Integrated financial calculator for quick amortization estimates and balance adjustments',
    quickstart_cmd = 'docker run -d -p 8080:8080 -e MONGODB_URI="your_mongodb_uri" ajaykumar/finance-tracker',
    live_demo_url = 'https://personalfinancetracker-swag.onrender.com',
    github_url = 'https://github.com/Ajaykumarnachimuthu/Personal-Finance-Tracker',
    architecture_summary = 'Java Servlets and JSP architecture running on Apache Tomcat containerized with Docker, paired with MongoDB Atlas cloud document database and responsive CSS Grid UI.',
    description = 'An intuitive personal budget management system designed to help users track expenses, set categorical spending caps, and visualize month-over-month financial trends through clear visual analytics.',
    author_name = 'AJAYKUMAR N',
    category = 'Web Development',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Personal Finance Tracker%';

-- Project 5: YatraAI
UPDATE projects
SET tagline = 'Intelligent travel journey recommendation and multi-modal transit network orchestration engine with dynamic preference scoring.',
    problem_statement = 'Planning complex multi-city journeys across diverse transit modes (connecting buses, regional trains, and commercial flights) is an exhausting manual process. Travelers must toggle between disparate booking portals, reconcile conflicting arrival schedules, guess safe transfer layover windows, and estimate whether cheap combinations justify inconvenient connections.',
    proposed_solution = 'YatraAI solves multi-modal transit planning using heuristic pathfinding combined with a machine-learning passenger preference model. The engine models national transit networks as an interconnected graph, automatically calculating realistic transfer buffers, optimizing total journey cost and travel time, and ranking itineraries according to individual traveler preferences.',
    key_features = '- Multi-modal route optimization combining interconnected air, rail, and road transit networks
- Dynamic budget and travel duration constraint solver generating cost-efficient transfer combinations
- Personalized itinerary scoring aligning options with individual traveler travel priorities
- Intelligent transfer window calculation to ensure safe flight-to-rail interconnections
- Interactive journey timeline displaying departure schedules, transfer stations, and baggage recommendations',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/YatraAI.git && cd YatraAI && npm install && npm start',
    live_demo_url = 'https://yatra-ai.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/YatraAI',
    architecture_summary = 'Distributed architecture featuring a Node.js API gateway, Python graph pathfinding service, and modern React interface with interactive journey maps.',
    description = 'An intelligent multi-modal journey planning platform that simplifies cross-country travel by automatically synthesizing interconnected bus, train, and flight schedules into optimized, stress-free itineraries.',
    author_name = 'AJAYKUMAR N',
    category = 'AI/ML',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%YatraAI%';

-- Project 6: Smart Shopping Mall Navigator TSP App
UPDATE projects
SET tagline = 'Indoor store navigation and walking route optimization web app applying Traveling Salesperson Problem (TSP) heuristics to multi-floor mall maps.',
    problem_statement = 'Navigating massive multi-level shopping centers with hundreds of retailers leads to excessive walking, repetitive backtracking, and wasted time. Traditional mall directories display static floor diagrams that show where individual stores are located, but provide no assistance for shoppers who have a list of multiple stores and need the shortest, most efficient route across elevators, escalators, and sprawling corridors.',
    proposed_solution = 'The Mall Navigator application models the shopping centers walkways and store entrances as a weighted indoor graph. When a user selects their shopping destinations, the app solves the Traveling Salesperson Problem (TSP) using dynamic 2-Opt and Nearest-Neighbor heuristics to compute the optimal walking sequence, generating turn-by-turn guidance and floor-to-floor elevator transitions on an interactive HTML5 canvas.',
    key_features = '- Shortest walking route optimization across multiple mall destinations using 2-Opt and Nearest Neighbor TSP algorithms
- Interactive multi-level floorplan with dynamic waypoint visualization and turn-by-turn path rendering
- Categorized retail directory (Fashion, Tech, Dining, Services) with instant location search
- Smart floor-to-floor transition routing utilizing escalators and elevator hubs
- Real-time route recalculation when stores are added, rearranged, or marked as visited',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/Smart-Shopping-Mall-Navigator-TSP-App.git && cd Smart-Shopping-Mall-Navigator-TSP-App && npm install && npm run dev',
    live_demo_url = 'https://mall-navigator-tsp.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/Smart-Shopping-Mall-Navigator-TSP-App',
    architecture_summary = 'Client-side JavaScript graph algorithms coupled with HTML5 Canvas coordinate rendering, paired with a lightweight REST backend for spatial coordinate management.',
    description = 'An indoor walking route optimizer designed for large shopping malls. By applying graph theory and Traveling Salesperson Problem (TSP) algorithms, the app computes the shortest path between multiple destination stores across all floors.',
    author_name = 'AJAYKUMAR N',
    category = 'Tools',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Smart Shopping Mall Navigator%';

-- Project 7: Indian Art Form
UPDATE projects
SET tagline = 'Digital cultural heritage exhibition and interactive gallery exploring traditional Indian art forms, pigments, and regional histories.',
    problem_statement = 'Centuries of classical and folk Indian art traditions (such as Warli, Madhubani, Kalamkari, Pattachitra, and Tanjore) risk fading from modern cultural awareness. Existing online archives are largely static, text-heavy databases that lack immersive visual exploration, pigment technique demonstrations, and interactive educational tools designed for international and next-generation audiences.',
    proposed_solution = 'Indian Art Form is an immersive digital cultural heritage exhibition that celebrates the diversity of traditional Indian art. The web application pairs curated high-resolution masterworks with interactive state provenance maps, historical timelines, and artisanal breakdowns of natural organic binders and earth pigments, accompanied by an interactive motif canvas studio.',
    key_features = '- High-resolution digital curation of regional folk and classical art styles (Warli, Madhubani, Kalamkari, Gond, Tanjore)
- Interactive geographic provenance map linking art traditions to their historical Indian states
- Detailed technical documentation of natural mineral pigments, plant dyes, and canvas preparation
- Interactive pattern canvas allowing users to inspect geometric symmetry and folk motifs
- Curated chronological timelines contextualizing regional artistic movements across Indian history',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/Indian-Art-Form.git && cd Indian-Art-Form && npm install && npm run dev',
    live_demo_url = 'https://indian-art-form.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/Indian-Art-Form',
    architecture_summary = 'Jamstack frontend built with React, CSS Grid animations, and cloud asset distribution optimized for responsive, high-density image display across all devices.',
    description = 'A curated digital exhibition celebrating traditional Indian art forms. The platform combines visual storytelling, interactive geographic maps, and artisanal material guides to preserve and celebrate Indias rich cultural heritage.',
    author_name = 'AJAYKUMAR N',
    category = 'UI/UX',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Indian Art Form%';

-- Project 8: ViewSimilarImages
UPDATE projects
SET tagline = 'Deep visual similarity search engine retrieving visually and semantically related images using neural feature embeddings.',
    problem_statement = 'Conventional search engines rely heavily on textual keywords, metadata tags, and file names to find images. However, when users want to find products with specific geometric patterns, textures, or stylistic aesthetics, text queries often fail to describe subtle visual nuances, leading to irrelevant or empty search results in e-commerce and creative catalogs.',
    proposed_solution = 'ViewSimilarImages delivers a deep visual similarity retrieval engine. When a user uploads or selects an image, the backend extracts high-dimensional feature vectors using a convolutional neural network (CNN) and performs high-speed cosine distance nearest-neighbor queries against the image catalog in PostgreSQL, returning visually and semantically related items in under 100ms.',
    key_features = '- Drag-and-drop visual search processing user photos and generating deep feature vectors
- High-dimensional cosine distance similarity ranking returning top-k matching catalog items
- Category and color-palette subfiltering refining visual search results
- Sub-100ms vector index query response times across multi-thousand image datasets
- Responsive gallery interface with similarity confidence percentage badges',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/ViewSimilarImages.git && cd ViewSimilarImages && pip install -r requirements.txt && npm run dev',
    live_demo_url = 'https://view-similar-images.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/ViewSimilarImages',
    architecture_summary = 'FastAPI microservice extracting neural embeddings with PyTorch/scikit-learn, storing feature vectors in PostgreSQL with pgvector, and communicating with a responsive React (TypeScript + Vite) frontend.',
    description = 'A deep visual similarity search application that enables users to discover visually comparable items without keyword constraints. Powered by neural feature embeddings and vector similarity indexing.',
    author_name = 'AJAYKUMAR N',
    category = 'AI/ML',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%ViewSimilarImages%';
