package com.devsphere.projectservice;

import com.devsphere.projectservice.entity.Project;
import com.devsphere.projectservice.repository.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ProjectDataInitializer implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(ProjectDataInitializer.class);

        private final ProjectRepository projectRepository;
        private final JdbcTemplate jdbcTemplate;

        public ProjectDataInitializer(ProjectRepository projectRepository, JdbcTemplate jdbcTemplate) {
                this.projectRepository = projectRepository;
                this.jdbcTemplate = jdbcTemplate;
        }

        @Override
        public void run(String... args) {
                // Ensure text columns support large content (Base64 images, long scripts and narratives)
                try {
                        jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN cover_image SET DATA TYPE TEXT");
                        jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN tagline SET DATA TYPE TEXT");
                        jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN quickstart_cmd SET DATA TYPE TEXT");
                        log.info("Ensured projects table columns (cover_image, tagline, quickstart_cmd) are TEXT type.");
                } catch (Exception e) {
                        try {
                                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN cover_image TYPE TEXT");
                                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN tagline TYPE TEXT");
                                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN quickstart_cmd TYPE TEXT");
                        } catch (Exception ignored) {
                                log.debug("Schema adjustment skipped or already applied: {}", ignored.getMessage());
                        }
                }

                if (projectRepository.count() == 0) {
                        log.info("Seeding initial authentic DevSphere engineering projects into Project Service database...");

                        UUID ajayId = UUID.fromString("fb6a1933-9f43-4e96-9be2-5ce2c1b747d7");

                        // Project 1: DevSphere Platform
                        Project p1 = new Project(
                                        "DevSphere Developer Platform",
                                        "Web Development",
                                        "An enterprise-grade developer platform combining technical blogging, interactive project showcases, and peer code reviews.",
                                        "AJAYKUMAR N",
                                        List.of("Java", "Spring Boot", "React", "PostgreSQL", "Docker", "TailwindCSS"),
                                        215,
                                        3420);
                        p1.setId(UUID.fromString("c1000000-0000-0000-0000-000000000001"));
                        p1.setAuthorId(ajayId);
                        p1.setTagline("Modern developer community platform for technical blogging, interactive project showcases, and peer code reviews.");
                        p1.setProblemStatement(
                                        "Modern developer platforms are fragmented between algorithmic social feeds that prioritize shallow snippets and static documentation sites without interactive review loops.");
                        p1.setProposedSolution(
                                        "DevSphere pairs an enterprise Spring Boot backend with a modern React client, delivering structured Markdown publishing, project showcases, and live engagement.");
                        p1.setKeyFeatures(
                                        "- Hybrid microservices architecture with autonomous domain ownership\n- Markdown blog publishing engine with live KaTeX math and code highlighting\n- Interactive project showcase with atomic likes and view counters\n- Centralized JWT authentication and internal cryptographically signed identity propagation");
                        p1.setQuickstartCmd(
                                        "git clone https://github.com/Ajaykumarnachimuthu/DevSphere.git && cd DevSphere && npm run dev");
                        p1.setLiveDemoUrl("https://dev-sphere-eight.vercel.app");
                        p1.setGithubUrl("https://github.com/Ajaykumarnachimuthu/DevSphere");
                        p1.setArchitectureSummary(
                                        "Spring Boot 3 modular monolith and independent microservices paired with a Vite React SPA frontend.");
                        projectRepository.save(p1);

                        // Project 2: INGRIS Chatbot
                        Project p2 = new Project(
                                        "INGRIS Chatbot: AI Hydrogeological Groundwater Intelligence",
                                        "AI/ML",
                                        "An AI-driven conversational hydrogeological assistant designed to democratize access to groundwater data from CGWB statutory records.",
                                        "AJAYKUMAR N",
                                        List.of("Python", "FastAPI", "RAG", "pgvector", "LangChain", "React"),
                                        184,
                                        2890);
                        p2.setId(UUID.fromString("c2000000-0000-0000-0000-000000000002"));
                        p2.setAuthorId(ajayId);
                        p2.setTagline("Conversational hydrogeological assistant parsing official Central Ground Water Board reports with vector search.");
                        p2.setProblemStatement(
                                        "Statutory groundwater reports are published as massive unstructured PDF tables, making historical water table trends inaccessible to farmers and hydrologists.");
                        p2.setProposedSolution(
                                        "INGRIS parses CGWB documents into vector embeddings and leverages a multi-provider LLM priority matrix to guarantee continuous cited answers.");
                        p2.setKeyFeatures(
                                        "- Multi-provider LLM fallback matrix (Groq Llama-3-70B, OpenRouter, Google Gemini)\n- Table-aware RAG vector search indexing statutory CGWB reports\n- Automated stress classification (Safe, Semi-Critical, Critical, Over-Exploited)\n- Pre-monsoon vs. post-monsoon water table depth variance calculations");
                        p2.setQuickstartCmd(
                                        "git clone https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT.git && cd INGRIS-CHATBOT && pip install -r requirements.txt && uvicorn main:app --reload");
                        p2.setLiveDemoUrl("https://ingris-chatbot.vercel.app");
                        p2.setGithubUrl("https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT");
                        p2.setCoverImage("/images/projects/ingris-groundwater.jpg");
                        projectRepository.save(p2);

                        // Project 3: FleetWatch Telemetry
                        Project p3 = new Project(
                                        "FleetWatch: Real-Time Vehicle Telemetry & Fault Detection",
                                        "AI/ML",
                                        "A real-time vehicle telemetry monitoring and fault detection system built to protect commercial fleets using dual-tier anomaly estimation.",
                                        "AJAYKUMAR N",
                                        List.of("Python", "FastAPI", "Isolation Forest", "WebSockets", "React",
                                                        "Docker"),
                                        142,
                                        2150);
                        p3.setId(UUID.fromString("c3000000-0000-0000-0000-000000000003"));
                        p3.setAuthorId(ajayId);
                        p3.setTagline("Real-time vehicle telemetry monitoring with sub-50ms fault detection using rule thresholds and Isolation Forest ML anomaly model.");
                        p3.setProblemStatement(
                                        "Fleet operators face costly roadside mechanical failures due to batch-processed log uploads or simple alarm thresholds with high false-positive rates.");
                        p3.setProposedSolution(
                                        "FleetWatch combines sub-5ms physical boundary checks with unsupervised Isolation Forest estimators, streaming sub-50ms fault alerts over WebSockets.");
                        p3.setKeyFeatures(
                                        "- Sub-50ms CAN-bus sensor telemetry packet processing over real-time bidirectional WebSockets\n- Dual-tier anomaly detection: deterministic rules combined with ML scoring\n- Interactive operator simulation dashboard with dynamic speed, temperature, and RPM controls\n- Automated incident severity classification with audible alarms");
                        p3.setQuickstartCmd(
                                        "git clone https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System.git && docker-compose up --build");
                        p3.setLiveDemoUrl("https://fleetwatch-telemetry.vercel.app");
                        p3.setGithubUrl("https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System");
                        p3.setCoverImage("/images/projects/fleetwatch-telemetry.png");
                        projectRepository.save(p3);

                        // Project 4: Personal Finance Tracker
                        Project p4 = new Project(
                                        "Personal Finance Tracker",
                                        "Web Development",
                                        "A full-stack web application to track income, expenses, budgets, and actionable financial insights with charts.",
                                        "AJAYKUMAR N",
                                        List.of("React", "Spring Boot", "PostgreSQL", "Chart.js"),
                                        128,
                                        2400);
                        p4.setId(UUID.fromString("c0000000-0000-0000-0000-000000000001"));
                        p4.setAuthorId(ajayId);
                        p4.setTagline("Track recurring expenses, visualize budget burn-down, and forecast monthly savings.");
                        projectRepository.save(p4);

                        // Project 5: DevPulse
                        Project p5 = new Project(
                                        "DevPulse: Team Velocity & Code Review Tracker",
                                        "DevOps",
                                        "A developer metrics dashboard aggregating pull-request cycle times, review throughput, and deployment frequency.",
                                        "AJAYKUMAR N",
                                        List.of("TypeScript", "Next.js", "GraphQL", "PostgreSQL"),
                                        96,
                                        1820);
                        p5.setId(UUID.fromString("c0000000-0000-0000-0000-000000000002"));
                        p5.setAuthorId(ajayId);
                        p5.setTagline("Actionable DORA velocity metrics for agile engineering teams.");
                        projectRepository.save(p5);

                        // Project 6: AlgoVisualizer
                        Project p6 = new Project(
                                        "AlgoVisualizer: Interactive DSA Playground",
                                        "Education",
                                        "Interactive step-by-step visualizations of graph traversals, dynamic programming matrices, and sorting algorithms.",
                                        "AJAYKUMAR N",
                                        List.of("React", "D3.js", "WebAssembly", "TypeScript"),
                                        175,
                                        3100);
                        p6.setId(UUID.fromString("c0000000-0000-0000-0000-000000000003"));
                        p6.setAuthorId(ajayId);
                        p6.setTagline("Visualize complex data structures and graph algorithms frame-by-frame.");
                        projectRepository.save(p6);

                        log.info("Project Service seeded with 6 authentic engineering showcases.");
                }
        }
}
