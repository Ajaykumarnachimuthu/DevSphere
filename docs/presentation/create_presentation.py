import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Tokens
    BG_DARK = RGBColor(11, 17, 32)         # #0B1120 Deep Navy
    BG_CARD = RGBColor(26, 36, 56)         # #1A2438 Slate Card
    BG_CARD_ALT = RGBColor(18, 26, 43)     # #121A2B Darker Slate
    BG_CARD_INNER = RGBColor(15, 23, 42)   # #0F172A Inner Card
    BORDER_COLOR = RGBColor(51, 65, 85)    # #334155 Slate Border
    BORDER_CYAN = RGBColor(14, 116, 144)   # #0E7490 Cyan Border
    
    TEXT_WHITE = RGBColor(248, 250, 252)   # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8
    TEXT_LIGHT = RGBColor(203, 213, 225)   # #CBD5E1
    
    ACCENT_CYAN = RGBColor(56, 189, 248)   # #38BDF8 Sky 400
    ACCENT_BLUE = RGBColor(14, 165, 233)   # #0EA5E9 Sky 500
    ACCENT_GREEN = RGBColor(52, 211, 153)  # #34D399 Emerald 400
    ACCENT_AMBER = RGBColor(251, 191, 36)  # #FBBF24 Amber 400
    ACCENT_PURPLE = RGBColor(192, 132, 252)# #C084FC Purple 400
    ACCENT_ROSE = RGBColor(251, 113, 133)  # #FB7185 Rose 400

    def add_slide_base(prs):
        slide = prs.slides.add_slide(blank_layout)
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return slide

    def add_header(slide, category_text, title_text, subtitle_text):
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.40), Inches(3.8), Inches(0.28))
        pill.fill.solid()
        pill.fill.fore_color.rgb = BG_CARD_ALT
        pill.line.color.rgb = ACCENT_CYAN
        pill.line.width = Pt(1)
        tf = pill.text_frame
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        p.alignment = PP_ALIGN.CENTER

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.70), Inches(11.733), Inches(0.5))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(21)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.20), Inches(11.733), Inches(0.32))
        tf = sub_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = subtitle_text
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MUTED

        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.54), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_COLOR
        line.line.fill.background()

    def add_footer(slide, current_slide, total_slides=17):
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_COLOR
        line.line.fill.background()

        box = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(6.0), Inches(0.3))
        tf = box.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "DevSphere — Full Stack Web Application Presentation | Course Code: 21CSE354T"
        p.font.size = Pt(8.5)
        p.font.color.rgb = TEXT_MUTED

        box2 = slide.shapes.add_textbox(Inches(7.5), Inches(7.1), Inches(5.033), Inches(0.3))
        tf = box2.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"SRM Institute of Science and Technology • Dept. of CSE   |   Slide {current_slide:02d} of {total_slides:02d}"
        p.font.size = Pt(8.5)
        p.font.color.rgb = TEXT_MUTED
        p.alignment = PP_ALIGN.RIGHT

    def add_card(slide, left, top, width, height, bg_color=BG_CARD, border_color=BORDER_COLOR, border_width=1):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(border_width)
        else:
            card.line.fill.background()
        return card

    def add_badge(slide, left, top, width, height, text, bg_color, text_color, font_size=9):
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        badge.fill.solid()
        badge.fill.fore_color.rgb = bg_color
        badge.line.fill.background()
        tf = badge.text_frame
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.text = text
        p.font.size = Pt(font_size)
        p.font.bold = True
        p.font.color.rgb = text_color
        p.alignment = PP_ALIGN.CENTER
        return badge

    # =============================================================
    # SLIDE 1 — TITLE
    # =============================================================
    print("Building Slide 1: Title...")
    slide1 = add_slide_base(prs)
    add_card(slide1, Inches(0.8), Inches(0.6), Inches(11.733), Inches(6.3), bg_color=BG_CARD_ALT, border_color=ACCENT_CYAN, border_width=1.5)
    add_badge(slide1, Inches(1.3), Inches(0.95), Inches(4.5), Inches(0.35), "FULL STACK WEB DEVELOPMENT — 21CSE354T", BG_CARD, ACCENT_CYAN, 10)
    add_badge(slide1, Inches(6.0), Inches(0.95), Inches(3.2), Inches(0.35), "SPRING BOOT FRAMEWORK – PART 1", BG_CARD, ACCENT_AMBER, 10)

    tbox = slide1.shapes.add_textbox(Inches(1.3), Inches(1.45), Inches(10.7), Inches(1.3))
    tf = tbox.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "DevSphere"
    p.font.size = Pt(46)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    
    p2 = tf.add_paragraph()
    p2.text = "Developer Community & Showcase Platform"
    p2.font.size = Pt(21)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    
    p3 = tf.add_paragraph()
    p3.text = "A production-grade, full-stack developer ecosystem integrating profiles, technical blogs, project showcases, and peer networking."
    p3.font.size = Pt(11.5)
    p3.font.color.rgb = TEXT_MUTED

    add_card(slide1, Inches(1.3), Inches(3.3), Inches(5.1), Inches(2.7), bg_color=BG_CARD, border_color=BORDER_COLOR)
    st_box = slide1.shapes.add_textbox(Inches(1.5), Inches(3.45), Inches(4.7), Inches(2.4))
    tf = st_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "ACADEMIC SUBMISSION DETAILS"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    
    items = [
        ("Student Name:", "AJAYKUMAR N"),
        ("Register Number:", "RA2411003012107"),
        ("Department:", "Department of Computer Science & Engineering"),
        ("Institution:", "SRM Institute of Science and Technology"),
        ("Academic Year:", "2026–2027"),
        ("Course & Code:", "Full Stack Web Development (21CSE354T)"),
    ]
    for label, val in items:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{label} "
        r1.font.size = Pt(10)
        r1.font.bold = True
        r1.font.color.rgb = TEXT_LIGHT
        r2 = p.add_run()
        r2.text = val
        r2.font.size = Pt(10)
        r2.font.color.rgb = TEXT_WHITE

    add_card(slide1, Inches(6.7), Inches(3.3), Inches(5.3), Inches(2.7), bg_color=BG_CARD, border_color=BORDER_COLOR)
    arch_box = slide1.shapes.add_textbox(Inches(6.9), Inches(3.45), Inches(4.9), Inches(2.4))
    tf = arch_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "ARCHITECTURE & EMPIRICAL EVIDENCE"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    specs = [
        ("Core Backend:", "Java 21 LTS | Spring Boot 3.4.3 | Spring Data JPA"),
        ("Architecture:", "Decoupled 3-Layer (Controller -> Service -> Repository)"),
        ("Domain Entities:", "6 JPA Entities (User, Profile, Blog, Project, Likes, Connections)"),
        ("REST API Layer:", "15 Versioned REST Endpoints (/api/v1/*) with JJWT Auth"),
        ("Automated Tests:", "35 Automated Tests (Unit, Slice, Concurrency, E2E) — 100% Pass"),
        ("Frontend Client:", "React 18 SPA + Islands | Vite 6 | Chart.js 4.4 | Fetch API"),
    ]
    for label, val in specs:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{label} "
        r1.font.size = Pt(10)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = val
        r2.font.size = Pt(10)
        r2.font.color.rgb = TEXT_LIGHT
    add_footer(slide1, 1)

    # =============================================================
    # SLIDE 2 — PROBLEM STATEMENT
    # =============================================================
    print("Building Slide 2: Problem Statement...")
    slide2 = add_slide_base(prs)
    add_header(slide2, "PROBLEM CONTEXT", "The Problem: Fragmented Developer Identity & Technical Isolation", 
               "Modern software engineers face severe friction managing scattered professional footprints across isolated web services.")
    
    silos = [
        ("Code Repositories", "GitHub / GitLab", "Houses raw code and commit trees, but lacks high-level problem context, architecture decisions, and live interactive previews.", ACCENT_CYAN),
        ("Technical Blogs", "Medium / Dev.to", "Hosts tutorials and articles, but remains detached from author portfolios and verified repository implementations.", ACCENT_PURPLE),
        ("Static Portfolios", "Personal Websites", "High maintenance, static presentation, lacks peer networking, verified live metrics, and centralized skill discovery.", ACCENT_AMBER),
        ("Professional Networks", "LinkedIn", "Text-heavy resumes with inflated buzzwords that fail to demonstrate actual technical execution or code quality.", ACCENT_ROSE)
    ]
    for i, (title, sub, desc, acc) in enumerate(silos):
        x = Inches(0.8 + i * 2.98)
        add_card(slide2, x, Inches(1.75), Inches(2.83), Inches(2.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide2, x + Inches(0.15), Inches(1.9), Inches(2.53), Inches(0.28), sub, BG_CARD_ALT, acc, 8.5)
        
        tbox = slide2.shapes.add_textbox(x + Inches(0.15), Inches(2.25), Inches(2.53), Inches(1.5))
        tf = tbox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_MUTED

    add_card(slide2, Inches(0.8), Inches(4.05), Inches(11.733), Inches(2.75), bg_color=BG_CARD_ALT, border_color=BORDER_CYAN)
    ch_box = slide2.shapes.add_textbox(Inches(1.05), Inches(4.15), Inches(11.2), Inches(2.5))
    tf = ch_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CORE CHALLENGES IDENTIFIED & THE UNIFIED SOLUTION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    challenges = [
        ("1. Fragmented Developer Identity:", "Developers must maintain 3-4 separate profiles, creating inconsistency and review fatigue for recruiters."),
        ("2. Scattered Technical Projects:", "Repositories lack unified showcasing, categorisation, verified like counts, and live demonstration links."),
        ("3. Separated Technical Knowledge:", "Insights written during development remain isolated from the actual project code they explain."),
        ("4. Discovery & Collaboration Friction:", "No unified mechanism exists to filter developers by real verified skill sets and initiate peer connections."),
        ("5. Academic Architectural Flaws:", "Foundational student web apps commonly mix business logic inside controllers without layer separation."),
    ]
    for ch_title, ch_desc in challenges:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{ch_title} "
        r1.font.size = Pt(9.5)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_AMBER
        r2 = p.add_run()
        r2.text = ch_desc
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = TEXT_LIGHT

    p_sol = tf.add_paragraph()
    rs1 = p_sol.add_run()
    rs1.text = "THE DEVSPHERE SOLUTION: "
    rs1.font.size = Pt(10)
    rs1.font.bold = True
    rs1.font.color.rgb = ACCENT_GREEN
    rs2 = p_sol.add_run()
    rs2.text = "A cohesive, high-performance platform fusing developer profiles, engineering blogs, project showcases, and peer networking into an enterprise-grade Spring Boot 3-layer architecture."
    rs2.font.size = Pt(10)
    rs2.font.bold = True
    rs2.font.color.rgb = TEXT_WHITE
    add_footer(slide2, 2)

    # =============================================================
    # SLIDE 3 — PROPOSED SOLUTION & OBJECTIVES
    # =============================================================
    print("Building Slide 3: Proposed Solution and Objectives...")
    slide3 = add_slide_base(prs)
    add_header(slide3, "PLATFORM VISION", "Proposed Solution: DevSphere & Core Academic Objectives", 
               "Unifying the developer workflow while strictly fulfilling the technical requirements of the Spring Boot Part 1 curriculum.")

    add_card(slide3, Inches(4.7), Inches(1.8), Inches(3.933), Inches(4.95), bg_color=BG_CARD_ALT, border_color=ACCENT_CYAN, border_width=1.5)
    hub_box = slide3.shapes.add_textbox(Inches(4.9), Inches(2.0), Inches(3.533), Inches(4.5))
    tf = hub_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "DevSphere Core Hub"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    p.alignment = PP_ALIGN.CENTER
    
    p2 = tf.add_paragraph()
    p2.text = "Unified Collaboration Ecosystem"
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_LIGHT
    p2.alignment = PP_ALIGN.CENTER

    hub_bullets = [
        "Single Sign-On & JWT Security",
        "Developer Discovery & Networking",
        "Technical Story Composition & Drafts",
        "Engineering Project Showcase & Likes",
        "Dynamic Chart.js Profile Telemetry",
        "Real-Time Platform Analytics",
        "Stateless 3-Layer Decoupling",
        "Full Spring Boot Auto-Configuration"
    ]
    for b in hub_bullets:
        p = tf.add_paragraph()
        r = p.add_run()
        r.text = f"•  {b}"
        r.font.size = Pt(9.5)
        r.font.color.rgb = TEXT_WHITE

    left_objs = [
        ("1. Java 21 & Spring Boot 3.4.3", "Bootstrap an executable web application leveraging Spring Boot starters, Maven build automation, and embedded Tomcat on port 8080 without XML boilerplate.", ACCENT_CYAN),
        ("2. Three-Layer Decoupling", "Enforce strict architectural separation between Presentation (@RestController), Business Logic (@Service), and Data Access (@Repository) tiers.", ACCENT_BLUE),
        ("3. Relational Domain Modeling", "Design a normalized database schema with 6 JPA entities, UUID primary keys, foreign key constraints, and @ElementCollection mappings.", ACCENT_PURPLE)
    ]
    for i, (title, desc, acc) in enumerate(left_objs):
        y = Inches(1.8 + i * 1.68)
        add_card(slide3, Inches(0.8), y, Inches(3.7), Inches(1.55), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide3, Inches(0.95), y + Inches(0.12), Inches(3.4), Inches(0.24), title, BG_CARD_ALT, acc, 8.5)
        tbox = slide3.shapes.add_textbox(Inches(0.95), y + Inches(0.42), Inches(3.4), Inches(1.0))
        tf = tbox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(9)
        p.font.color.rgb = TEXT_LIGHT

    right_objs = [
        ("4. Service-Layer Business Logic", "Implement non-trivial domain rules: author ownership validation, duplicate prevention, idempotent like toggling, and reading time formulas.", ACCENT_AMBER),
        ("5. Stateless REST API Architecture", "Expose 15 versioned REST endpoints (/api/v1/*) consuming and producing JSON, secured with JJWT Bearer tokens and Bean Validation.", ACCENT_ROSE),
        ("6. Comprehensive Test Pyramid", "Develop unit, slice, concurrency, and integration test suites using JUnit 5 and Mockito, verifying 100% build success across 35 automated tests.", ACCENT_GREEN)
    ]
    for i, (title, desc, acc) in enumerate(right_objs):
        y = Inches(1.8 + i * 1.68)
        add_card(slide3, Inches(8.833), y, Inches(3.7), Inches(1.55), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide3, Inches(8.983), y + Inches(0.12), Inches(3.4), Inches(0.24), title, BG_CARD_ALT, acc, 8.5)
        tbox = slide3.shapes.add_textbox(Inches(8.983), y + Inches(0.42), Inches(3.4), Inches(1.0))
        tf = tbox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(9)
        p.font.color.rgb = TEXT_LIGHT
    add_footer(slide3, 3)

    # =============================================================
    # SLIDE 4 — APPLICATION OVERVIEW (6 MODULES WITH REAL SCREENSHOTS)
    # =============================================================
    print("Building Slide 4: Application Overview...")
    slide4 = add_slide_base(prs)
    add_header(slide4, "FUNCTIONAL DECOMPOSITION", "Application Overview: 6 Core Engineering Modules", 
               "DevSphere delivers six cohesive modules featuring actual application screens, verified flows, and user capabilities.")

    modules_data = [
        ("1. Authentication", "JWT & BCrypt Sessions", "page2_login.png", ACCENT_CYAN,
         "• Stateless JWT auth (HMAC-SHA512)\n• Salted BCrypt password encryption\n• Auto-creates developer profile on signup\n• Resolves active user via /api/v1/auth/me"),
        ("2. Developer Directory", "Discovery & Networking", "page6_developers.png", ACCENT_BLUE,
         "• Searchable roster filterable by skill tags\n• Interactive peer connect/disconnect\n• Displays projects & articles count\n• Instant route to full developer profiles"),
        ("3. Blog Platform", "Engineering Publishing", "page4_blogs.png", ACCENT_PURPLE,
         "• Technical story studio with draft saving\n• Live markdown preview editor\n• Dynamic read time: max(1, ceil(words/200))\n• Author ownership guard on updates"),
        ("4. Project Showcase", "Engineering Portfolios", "page8_projects.png", ACCENT_AMBER,
         "• Multi-category portfolio showcase\n• Sorting: 'Latest', 'Most Liked', 'Views'\n• Atomic like/unlike toggle via unique UK\n• View counter increments dynamically"),
        ("5. Developer Profiles", "Identity & Telemetry", "page7_developer_profile.png", ACCENT_ROSE,
         "• Displays bio, role, location, avatar\n• Interactive Chart.js activity charts\n• Filterable author's projects & blogs\n• Live peer connection status indicator"),
        ("6. Platform Intelligence", "Community Telemetry", "page9_about.png", ACCENT_GREEN,
         "• High-speed telemetry: GET /api/v1/stats/overview\n• Aggregated platform metrics (10K+ Devs)\n• Country distribution across 50+ nations\n• Sub-millisecond response caching")
    ]

    for i, (m_title, m_sub, m_img, acc, m_bullets) in enumerate(modules_data):
        col = i % 3
        row = i // 3
        x = Inches(0.8 + col * 3.98)
        y = Inches(1.75 + row * 2.55)
        
        add_card(slide4, x, y, Inches(3.8), Inches(2.4), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide4, x + Inches(0.12), y + Inches(0.1), Inches(3.56), Inches(0.24), m_sub, BG_CARD_ALT, acc, 8)
        
        # Left side: image thumbnail
        img_path = os.path.join("docs", "react_page_tables", m_img)
        if os.path.exists(img_path):
            slide4.shapes.add_picture(img_path, x + Inches(0.12), y + Inches(0.42), width=Inches(1.35), height=Inches(1.85))
        
        # Right side: text
        tbox = slide4.shapes.add_textbox(x + Inches(1.52), y + Inches(0.40), Inches(2.16), Inches(1.9))
        tf = tbox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = m_title
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p2 = tf.add_paragraph()
        p2.text = m_bullets
        p2.font.size = Pt(7.5)
        p2.font.color.rgb = TEXT_LIGHT

    add_footer(slide4, 4)

    # =============================================================
    # SLIDE 5 — TECHNOLOGY STACK
    # =============================================================
    print("Building Slide 5: Technology Stack...")
    slide5 = add_slide_base(prs)
    add_header(slide5, "TECHNICAL FOUNDATION", "Technology Stack: Empirically Verified Full-Stack Ecosystem", 
               "Every framework, library, and tool version has been verified against backend pom.xml, package.json, and runtime configs.")

    tech_cols = [
        ("Frontend Architecture", ACCENT_CYAN, [
            ("Core Framework", "React 18.3.1 (Concurrent Root)"),
            ("DOM Renderer", "React DOM 18.3.1"),
            ("Build System", "Vite 6.0.1 (ESM Dev Server & HMR)"),
            ("Client Routing", "React Router DOM 6.28.0 (9 Routes)"),
            ("Data Visualization", "Chart.js 4.4.8 (Dynamic Canvas)"),
            ("Markup & Styling", "Semantic HTML5 + CSS3 Grid/Flexbox"),
            ("HTTP Client", "Centralized Fetch API (src/services/api.js)"),
            ("Token Management", "localStorage JWT Injection")
        ]),
        ("Backend Framework", ACCENT_BLUE, [
            ("Language Runtime", "Java 21 LTS (release 21 in pom.xml)"),
            ("Framework Core", "Spring Boot 3.4.3 (Latest Stable)"),
            ("Web Framework", "Spring MVC (RESTful Web Services)"),
            ("Persistence ORM", "Spring Data JPA / Hibernate 6.6.8"),
            ("Security Engine", "Spring Security 6.4 (Stateless Filter)"),
            ("Embedded Server", "Apache Tomcat 10.1.36 (Port 8080)"),
            ("Build Automation", "Apache Maven 3.9.6"),
            ("Architecture", "Strict 3-Layer Decoupled Pattern")
        ]),
        ("Database & Storage", ACCENT_PURPLE, [
            ("Test Database", "H2 In-Memory (PostgreSQL Mode)"),
            ("Production Target", "PostgreSQL 14+ (Supabase Cloud Pooler)"),
            ("Connection Pool", "HikariCP 5.1 (Tuned min-idle=2, max=6)"),
            ("Schema Migration", "Flyway 10.20 (db/migration scripts)"),
            ("Primary Key Strategy", "UUID v4 (java.util.UUID / GenType.UUID)"),
            ("Entity Relationships", "@OneToOne, @ManyToOne, @OneToMany"),
            ("Collection Tables", "@ElementCollection (skills, tech, tags)"),
            ("DDL Management", "hibernate.ddl-auto=none (Flyway controlled)")
        ]),
        ("Security & Testing", ACCENT_GREEN, [
            ("JWT Cryptography", "JJWT 0.12.6 (HMAC-SHA512 Signatures)"),
            ("Password Hashing", "BCryptPasswordEncoder (Strength 10)"),
            ("Bean Validation", "Jakarta Validation 3.0.2 (@Valid, @Size)"),
            ("API Documentation", "SpringDoc OpenAPI 2.8.5 (Swagger UI)"),
            ("Unit Testing", "JUnit 5 + Mockito 5 (MockitoExtension)"),
            ("Slice Testing", "Spring Boot Test (@WebMvcTest, MockMvc)"),
            ("Integration Testing", "Spring Boot Test (@SpringBootTest, H2)"),
            ("Pass Rate", "35 Automated Tests (100% Pass Rate)")
        ])
    ]

    for i, (col_title, acc, items) in enumerate(tech_cols):
        x = Inches(0.8 + i * 2.98)
        add_card(slide5, x, Inches(1.75), Inches(2.83), Inches(5.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide5, x + Inches(0.15), Inches(1.9), Inches(2.53), Inches(0.28), col_title, BG_CARD_ALT, acc, 9)
        
        tbox = slide5.shapes.add_textbox(x + Inches(0.15), Inches(2.3), Inches(2.53), Inches(4.45))
        tf = tbox.text_frame
        tf.word_wrap = True
        for j, (k, v) in enumerate(items):
            p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
            run_k = p.add_run()
            run_k.text = f"{k}:\n"
            run_k.font.size = Pt(8.5)
            run_k.font.bold = True
            run_k.font.color.rgb = acc
            run_v = p.add_run()
            run_v.text = f"{v}\n"
            run_v.font.size = Pt(8)
            run_v.font.color.rgb = TEXT_LIGHT
    add_footer(slide5, 5)

    # =============================================================
    # SLIDE 6 — OVERALL SYSTEM ARCHITECTURE
    # =============================================================
    print("Building Slide 6: Overall System Architecture...")
    slide6 = add_slide_base(prs)
    add_header(slide6, "SYSTEM ARCHITECTURE", "Overall System Architecture: End-to-End Multi-Tier Pipeline", 
               "Strict architectural flow from React client through Spring Security, Controller, Service, and Repository tiers to database.")

    layers = [
        ("React 18 Client Application", "Semantic HTML5 landmarks, React SPA & Islands, Chart.js visualizations, centralized api.js client", ACCENT_CYAN, Inches(1.75)),
        ("HTTP REST / JSON Boundary", "Port 8080 | Versioned routes (/api/v1/*) | Bearer JWT attached in Authorization header", ACCENT_BLUE, Inches(2.45)),
        ("Spring Security Filter Chain", "JwtAuthenticationFilter intercepts request, validates HMAC-SHA512 token, populates SecurityContext", ACCENT_PURPLE, Inches(3.15)),
        ("Presentation Layer (@RestController)", "AuthController, BlogController, DeveloperController, ProjectController, StatsController | Validates DTOs", ACCENT_ROSE, Inches(3.85)),
        ("Business Service Layer (@Service)", "AuthServiceImpl, BlogServiceImpl, DeveloperServiceImpl, ProjectServiceImpl | Enforces business rules & @Transactional", ACCENT_AMBER, Inches(4.55)),
        ("Data Access Layer (@Repository)", "Spring Data JpaRepository interfaces: UserRepository, BlogRepository, ProjectRepository | Custom JPQL", ACCENT_CYAN, Inches(5.25)),
        ("Database Storage Tier", "PostgreSQL 14+ (Supabase Cloud Target) & H2 In-Memory (Test) | Tables: users, profiles, blogs, projects, likes", ACCENT_GREEN, Inches(5.95)),
    ]

    for title, desc, acc, y in layers:
        add_card(slide6, Inches(0.8), y, Inches(7.5), Inches(0.6), bg_color=BG_CARD, border_color=acc, border_width=1)
        tb = slide6.shapes.add_textbox(Inches(0.95), y + Inches(0.05), Inches(7.2), Inches(0.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{title} — "
        r1.font.size = Pt(9.5)
        r1.font.bold = True
        r1.font.color.rgb = acc
        r2 = p.add_run()
        r2.text = desc
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = TEXT_LIGHT

    add_card(slide6, Inches(8.55), Inches(1.75), Inches(3.983), Inches(4.8), bg_color=BG_CARD_ALT, border_color=BORDER_COLOR)
    r_box = slide6.shapes.add_textbox(Inches(8.75), Inches(1.9), Inches(3.583), Inches(4.5))
    tf = r_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CORE ARCHITECTURAL PRINCIPLES"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    principles = [
        ("Strict Separation of Concerns:", "The presentation layer never interacts directly with database repositories. All data operations are mediated by domain services."),
        ("Stateless Authentication:", "No server-side HTTP session state. Every incoming request must provide a valid HMAC-SHA512 signed JWT Bearer token."),
        ("Transactional Integrity:", "Business operations mutating database state execute within @Transactional boundaries to prevent inconsistent partial writes."),
        ("Exception Centralization:", "Zero try-catch boilerplate in controllers. All domain exceptions are caught and formatted uniformly by @RestControllerAdvice."),
        ("Microservices Clarification:", "Standalone experimental services exist in the repository as future architectural evolution; academic evaluation strictly focuses on this integrated Spring Boot core.")
    ]
    for p_title, p_desc in principles:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{p_title}\n"
        r1.font.size = Pt(9)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = f"{p_desc}\n"
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = TEXT_LIGHT
    add_footer(slide6, 6)

    # =============================================================
    # SLIDE 7 — SPRING BOOT SETUP & AUTO-CONFIGURATION
    # =============================================================
    print("Building Slide 7: Spring Boot Setup and Auto-Configuration...")
    slide7 = add_slide_base(prs)
    add_header(slide7, "FRAMEWORK MECHANICS", "Spring Boot Application Setup & Auto-Configuration", 
               "Bootstrapping the DevSphere backend: main entry point, auto-configuration mechanics, and embedded server initialization.")

    add_card(slide7, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
    add_badge(slide7, Inches(0.95), Inches(1.9), Inches(5.3), Inches(0.28), "APPLICATION ENTRY POINT & ANNOTATIONS", BG_CARD_ALT, ACCENT_CYAN, 9)

    code_box = slide7.shapes.add_textbox(Inches(0.95), Inches(2.25), Inches(5.3), Inches(1.7))
    tf = code_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "// DevSphereApplication.java\npackage com.devsphere;\n\n@SpringBootApplication\npublic class DevSphereApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(DevSphereApplication.class, args);\n    }\n}"
    p.font.name = "Consolas"
    p.font.size = Pt(8.5)
    p.font.color.rgb = ACCENT_GREEN

    ann_box = slide7.shapes.add_textbox(Inches(0.95), Inches(4.0), Inches(5.3), Inches(2.75))
    tf = ann_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "@SpringBootApplication METADATA COMPOSITION:"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    anns = [
        ("@Configuration:", "Marks the class as a configuration source for Spring beans and factory methods."),
        ("@EnableAutoConfiguration:", "Enables Spring Boot's opinionated auto-configuration, inspecting classpath dependencies to provision Tomcat, JPA, and Jackson automatically."),
        ("@ComponentScan:", "Automatically discovers and registers @RestController, @Service, and @Repository components within the com.devsphere package hierarchy.")
    ]
    for an_t, an_d in anns:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{an_t} "
        r1.font.size = Pt(8.5)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = an_d
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = TEXT_LIGHT

    add_card(slide7, Inches(6.6), Inches(1.75), Inches(5.933), Inches(5.1), bg_color=BG_CARD_ALT, border_color=BORDER_COLOR)
    add_badge(slide7, Inches(6.75), Inches(1.9), Inches(5.633), Inches(0.28), "STARTUP LIFECYCLE & AUTO-CONFIGURED BEANS", BG_CARD, ACCENT_GREEN, 9)

    r_box = slide7.shapes.add_textbox(Inches(6.75), Inches(2.22), Inches(5.633), Inches(3.2))
    tf = r_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "APPLICATION INITIALIZATION SEQUENCE:"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    steps = [
        "1. JVM invokes main() in DevSphereApplication.java",
        "2. SpringApplication.run() initializes ApplicationContext",
        "3. ComponentScan registers 5 Controllers, 6 Services, 12 Repositories",
        "4. Auto-configuration activates TomcatServletWebServerFactory",
        "5. Embedded Apache Tomcat 10.1.36 binds to port 8080",
        "6. HikariCP initializes pool; Hibernate validates entities",
        "7. REST endpoints live & accessible at http://localhost:8080/api/v1/*"
    ]
    for s in steps:
        p = tf.add_paragraph()
        r = p.add_run()
        r.text = f"•  {s}"
        r.font.size = Pt(8)
        r.font.color.rgb = TEXT_LIGHT

    p2 = tf.add_paragraph()
    p2.text = "\nWHAT SPRING BOOT AUTO-CONFIGURES (ZERO XML):"
    p2.font.size = Pt(9)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_CYAN

    auto_items = [
        ("Embedded Tomcat:", "Provisions servlet container without external WAR deployment."),
        ("Spring MVC:", "Registers DispatcherServlet, Jackson ObjectMapper, JSON serializers."),
        ("Data Source:", "Configures HikariDataSource connection pool with tuned timeouts."),
        ("JPA / Hibernate:", "Creates LocalContainerEntityManagerFactoryBean & TransactionManager.")
    ]
    for ak, av in auto_items:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"• {ak} "
        r1.font.size = Pt(8)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_AMBER
        r2 = p.add_run()
        r2.text = av
        r2.font.size = Pt(8)
        r2.font.color.rgb = TEXT_LIGHT

    img_path = "docs/assignment-evidence/01_backend_running.png"
    if os.path.exists(img_path):
        slide7.shapes.add_picture(img_path, Inches(6.75), Inches(5.48), width=Inches(5.633), height=Inches(1.25))
    add_footer(slide7, 7)

    # =============================================================
    # SLIDE 8 — THREE-LAYER ARCHITECTURE
    # =============================================================
    print("Building Slide 8: Three-Layer Architecture...")
    slide8 = add_slide_base(prs)
    add_header(slide8, "CORE ARCHITECTURE REQUIREMENT", "Three-Layer Architecture: Presentation, Business & Data Access", 
               "Strict architectural decoupling: Controllers handle HTTP, Services enforce business rules, Repositories manage persistence.")

    tiers = [
        ("1. PRESENTATION LAYER", "@RestController", ACCENT_CYAN, [
            ("Core Role:", "Receives HTTP requests, binds route variables, validates DTOs, returns response envelopes."),
            ("Validation:", "Applies @Valid to DTO request bodies. Rejects malformed payloads with 400 Bad Request."),
            ("Layer Decoupling:", "ZERO business logic, ZERO database calls. Directly delegates to Service methods."),
            ("Response Handling:", "Wraps payloads in ResponseEntity<T> with explicit HTTP status codes (200, 201, 204)."),
            ("Implemented Classes:", "AuthController, BlogController, DeveloperController, ProjectController, StatsController")
        ]),
        ("2. BUSINESS LOGIC LAYER", "@Service & @Transactional", ACCENT_AMBER, [
            ("Core Role:", "Executes application rules, ownership validation, domain algorithms, and data coordination."),
            ("Transaction Control:", "Defines ACID transaction boundaries using Spring's declarative @Transactional."),
            ("Authorization Guards:", "Enforces author identity verification before allowing blog updates or deletions."),
            ("DTO Mapping:", "Translates raw database entities to clean, client-safe response DTOs using EntityDtoMapper."),
            ("Implemented Classes:", "AuthServiceImpl, BlogServiceImpl, DeveloperServiceImpl, ProjectServiceImpl, StatsServiceImpl")
        ]),
        ("3. DATA ACCESS LAYER", "Spring Data JpaRepository", ACCENT_GREEN, [
            ("Core Role:", "Communicates with database, manages entity lifecycle, persists updates, executes queries."),
            ("Type Safety:", "Extends JpaRepository<T, UUID> providing out-of-the-box CRUD and pagination support."),
            ("Derived Queries:", "Executes queries generated from method names: findByEmail, existsByUsername."),
            ("Custom JPQL:", "Defines complex search queries with dynamic sorting and category/skill filters."),
            ("Implemented Interfaces:", "UserRepository, BlogRepository, ProjectRepository, DeveloperProfileRepository, ProjectLikeRepository")
        ])
    ]

    for i, (tier_title, tier_sub, acc, items) in enumerate(tiers):
        x = Inches(0.8 + i * 3.98)
        add_card(slide8, x, Inches(1.75), Inches(3.8), Inches(4.3), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide8, x + Inches(0.15), Inches(1.9), Inches(3.5), Inches(0.28), tier_sub, BG_CARD_ALT, acc, 8.5)
        
        tb = slide8.shapes.add_textbox(x + Inches(0.15), Inches(2.25), Inches(3.5), Inches(3.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = tier_title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        for k, v in items:
            p = tf.add_paragraph()
            r1 = p.add_run()
            r1.text = f"{k} "
            r1.font.size = Pt(8.5)
            r1.font.bold = True
            r1.font.color.rgb = acc
            r2 = p.add_run()
            r2.text = v
            r2.font.size = Pt(8.5)
            r2.font.color.rgb = TEXT_LIGHT

    add_card(slide8, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.8), bg_color=BG_CARD_ALT, border_color=ACCENT_CYAN)
    why_box = slide8.shapes.add_textbox(Inches(0.95), Inches(6.2), Inches(11.4), Inches(0.7))
    tf = why_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    rw1 = p.add_run()
    rw1.text = "ARCHITECTURAL RULE — WHY BUSINESS LOGIC NEVER BELONGS IN CONTROLLERS:\n"
    rw1.font.size = Pt(9)
    rw1.font.bold = True
    rw1.font.color.rgb = ACCENT_CYAN
    rw2 = p.add_run()
    rw2.text = "Controllers are protocol adapters for HTTP. Embedding business rules in controllers destroys unit testability, bypasses transaction rollback boundaries, tightly couples the domain to the web servlet API, and leads to duplicated validation across endpoints."
    rw2.font.size = Pt(8.5)
    rw2.font.color.rgb = TEXT_LIGHT
    add_footer(slide8, 8)

    # =============================================================
    # SLIDE 9 — DOMAIN MODEL & DATABASE DESIGN
    # =============================================================
    print("Building Slide 9: Domain Model and Database Design...")
    slide9 = add_slide_base(prs)
    add_header(slide9, "PERSISTENCE MODEL", "Domain Model & Relational Database Design: 6 JPA Entities", 
               "Fully normalized relational domain model featuring UUID keys, foreign key constraints, and collection mappings.")

    # 6 Formatted Entity Cards in 3x2 Grid
    entity_cards = [
        ("User", "TABLE: users", ACCENT_CYAN, [
            ("PK: id", "UUID (GenType.UUID)"),
            ("UK: username", "VARCHAR(50) [NOT NULL]"),
            ("UK: email", "VARCHAR(100) [NOT NULL]"),
            ("password", "VARCHAR(255) [BCrypt hash]"),
            ("role", "ENUM [ROLE_USER, ROLE_ADMIN]"),
            ("Rel: 1-to-1", "DeveloperProfile (mappedBy)")
        ]),
        ("DeveloperProfile", "TABLE: developer_profiles", ACCENT_BLUE, [
            ("PK: id", "UUID (GenType.UUID)"),
            ("FK: user_id", "UUID -> users.id (@OneToOne)"),
            ("name / role", "VARCHAR(100)"),
            ("bio / location", "TEXT / VARCHAR(100)"),
            ("avatar", "VARCHAR(50)"),
            ("Collection:", "@ElementCollection skills")
        ]),
        ("DeveloperConnection", "TABLE: developer_connections", ACCENT_PURPLE, [
            ("PK: id", "UUID (GenType.UUID)"),
            ("FK: developer_id", "UUID -> developer_profiles.id"),
            ("FK: user_id", "UUID -> users.id"),
            ("Constraint:", "UNIQUE(developer_id, user_id)"),
            ("Purpose:", "Peer networking relationship"),
            ("Cascades:", "Managed by JPA Service")
        ]),
        ("Blog", "TABLE: blogs", ACCENT_AMBER, [
            ("PK: id", "UUID (GenType.UUID)"),
            ("FK: author_id", "UUID -> users.id (@ManyToOne)"),
            ("title / category", "VARCHAR(200) / VARCHAR(50)"),
            ("content / read_time", "TEXT / VARCHAR(20)"),
            ("status", "ENUM [PUBLISHED, DRAFT]"),
            ("Collection:", "@ElementCollection tags")
        ]),
        ("Project", "TABLE: projects", ACCENT_GREEN, [
            ("PK: id", "UUID (GenType.UUID)"),
            ("FK: author_id", "UUID -> users.id (@ManyToOne)"),
            ("title / category", "VARCHAR(150) / VARCHAR(50)"),
            ("description", "TEXT [Comprehensive specs]"),
            ("likes / views", "INTEGER (Atomic counters)"),
            ("Collection:", "@ElementCollection technologies")
        ]),
        ("ProjectLike", "TABLE: project_likes", ACCENT_ROSE, [
            ("PK: id", "UUID (GenType.UUID)"),
            ("FK: project_id", "UUID -> projects.id"),
            ("FK: user_id", "UUID -> users.id"),
            ("Constraint:", "UNIQUE(project_id, user_id)"),
            ("Concurrency:", "Guarantees idempotent likes"),
            ("Sync:", "Updates Project.likes atomically")
        ])
    ]

    for i, (e_name, e_tbl, acc, e_fields) in enumerate(entity_cards):
        col = i % 3
        row = i // 3
        x = Inches(0.8 + col * 3.98)
        y = Inches(1.75 + row * 2.55)

        add_card(slide9, x, y, Inches(3.8), Inches(2.4), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide9, x + Inches(0.12), y + Inches(0.12), Inches(3.56), Inches(0.24), e_tbl, BG_CARD_ALT, acc, 8)

        tb = slide9.shapes.add_textbox(x + Inches(0.12), y + Inches(0.42), Inches(3.56), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"@Entity {e_name}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        for k, v in e_fields:
            p = tf.add_paragraph()
            r1 = p.add_run()
            r1.text = f"• {k}: "
            r1.font.size = Pt(8)
            r1.font.bold = True
            r1.font.color.rgb = acc
            r2 = p.add_run()
            r2.text = v
            r2.font.size = Pt(8)
            r2.font.color.rgb = TEXT_LIGHT

    add_footer(slide9, 9)

    # =============================================================
    # SLIDE 10 — BUSINESS LOGIC AND IMPLEMENTED ALGORITHMS
    # =============================================================
    print("Building Slide 10: Business Logic and Implemented Algorithms...")
    slide10 = add_slide_base(prs)
    add_header(slide10, "BUSINESS ALGORITHMS", "Business Logic & Implemented Algorithms: Service Tier Deep Dive", 
               "Structured breakdown: problem statement, inputs, execution flow, key conditions/formulas, outputs, and necessity.")

    algos = [
        ("Algorithm 1: User Registration & Identity Guard", "AuthServiceImpl.java", ACCENT_CYAN, [
            ("1. Problem Solved:", "Prevent duplicate user accounts and ensure every registered user possesses a linked profile."),
            ("2. Inputs:", "RegisterRequest DTO (username, email, raw password)."),
            ("3. Processing Flow:", "Verify email & username uniqueness -> Salt & hash password via BCrypt -> Save User entity -> Auto-provision DeveloperProfile -> Generate JWT token."),
            ("4. Key Condition:", "findByEmailIgnoreCaseOrUsernameIgnoreCase() -> throws 409 DuplicateResourceException."),
            ("5. Output:", "AuthResponse DTO containing signed HMAC-SHA512 JWT and UserResponse DTO."),
            ("6. Why Needed:", "Guarantees zero orphaned accounts and ensures strict database uniqueness integrity.")
        ]),
        ("Algorithm 2: Dynamic Blog Reading-Time Calculation", "BlogServiceImpl.java", ACCENT_AMBER, [
            ("1. Problem Solved:", "Compute accurate reading time commitment for technical articles upon creation or update."),
            ("2. Inputs:", "Raw markdown article content string."),
            ("3. Processing Flow:", "Sanitize text -> Tokenize content using whitespace regex \\s+ -> Compute word count -> Divide by 200 WPM industry reading speed -> Compute ceiling."),
            ("4. Key Formula:", "Reading Time = max(1, ceil(Total Words / 200)) min read (e.g., 850 words -> 5 min read)."),
            ("5. Output:", "Formatted reading time string stored directly in Blog entity (e.g. '5 min read')."),
            ("6. Why Needed:", "Informs reader commitment dynamically without storing static manual estimates.")
        ]),
        ("Algorithm 3: Atomic Project Like / Unlike Toggle", "ProjectServiceImpl.java", ACCENT_GREEN, [
            ("1. Problem Solved:", "Guarantee idempotent project liking, preventing duplicate votes and race conditions."),
            ("2. Inputs:", "Project UUID (path variable) and authenticated User UUID (UserPrincipal)."),
            ("3. Processing Flow:", "Query project_likes table -> If like exists: delete record & decrement count -> If like absent: insert record & increment count -> Return updated Project."),
            ("4. Key Condition:", "Enforced by DB compound unique constraint UNIQUE(project_id, user_id) + @Transactional."),
            ("5. Output:", "Updated ProjectResponse DTO reflecting synchronized likes counter and liked boolean."),
            ("6. Why Needed:", "Eliminates duplicate likes from double-clicks and ensures atomic counter updates.")
        ]),
        ("Algorithm 4: Developer Discovery & Skill Search", "DeveloperServiceImpl.java", ACCENT_PURPLE, [
            ("1. Problem Solved:", "Provide sub-second multi-attribute search and skill-based talent discovery across the community."),
            ("2. Inputs:", "Query search string, Pageable page/size parameters."),
            ("3. Processing Flow:", "Search across developer name, role, bio, and skills via custom JPQL query -> Calculate live connections and project counts -> Return paginated response."),
            ("4. Key Condition:", "Spring Data JPA Pageable optimization with Page<DeveloperProfile> pagination."),
            ("5. Output:", "PagedResponse<DeveloperResponse> containing elements, page index, and total pages."),
            ("6. Why Needed:", "Prevents full-table memory loading and enables efficient peer networking discovery.")
        ])
    ]

    for i, (a_title, a_file, acc, items) in enumerate(algos):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.75 + row * 2.55)

        add_card(slide10, x, y, Inches(5.75), Inches(2.4), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide10, x + Inches(0.15), y + Inches(0.12), Inches(5.45), Inches(0.24), a_file, BG_CARD_ALT, acc, 8)

        tb = slide10.shapes.add_textbox(x + Inches(0.15), y + Inches(0.40), Inches(5.45), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = a_title
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        for k, v in items:
            p = tf.add_paragraph()
            r1 = p.add_run()
            r1.text = f"{k} "
            r1.font.size = Pt(7.8)
            r1.font.bold = True
            r1.font.color.rgb = acc
            r2 = p.add_run()
            r2.text = v
            r2.font.size = Pt(7.8)
            r2.font.color.rgb = TEXT_LIGHT

    add_footer(slide10, 10)

    # =============================================================
    # SLIDE 11 — REST API IMPLEMENTATION
    # =============================================================
    print("Building Slide 11: REST API Implementation...")
    slide11 = add_slide_base(prs)
    add_header(slide11, "RESTFUL INTERFACE", "REST API Implementation: 15 Versioned Endpoints (/api/v1/*)", 
               "Standard HTTP methods, resource-oriented URI design, Bearer authentication, and verified JSON payload contracts.")

    add_card(slide11, Inches(0.8), Inches(1.75), Inches(6.8), Inches(5.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
    add_badge(slide11, Inches(0.95), Inches(1.9), Inches(6.5), Inches(0.28), "ENDPOINT INVENTORY (5 REST CONTROLLERS)", BG_CARD_ALT, ACCENT_CYAN, 9)

    table_shape = slide11.shapes.add_table(16, 4, Inches(0.95), Inches(2.25), Inches(6.5), Inches(4.45))
    table = table_shape.table
    table.columns[0].width = Inches(0.8)   # Method
    table.columns[1].width = Inches(2.4)   # Path
    table.columns[2].width = Inches(1.5)   # Controller
    table.columns[3].width = Inches(1.8)   # Description

    headers = ["METHOD", "URI PATH", "CONTROLLER", "PURPOSE"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_CARD_INNER
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(8)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER

    api_rows = [
        ("POST", "/api/v1/auth/register", "AuthController", "Register user & seed profile"),
        ("POST", "/api/v1/auth/login", "AuthController", "Authenticate & issue JWT"),
        ("GET",  "/api/v1/auth/me", "AuthController", "Current authenticated user"),
        ("POST", "/api/v1/auth/logout", "AuthController", "Terminate session"),
        ("GET",  "/api/v1/blogs", "BlogController", "Get published blogs (search/filter)"),
        ("GET",  "/api/v1/blogs/{id}", "BlogController", "Get single blog by UUID"),
        ("POST", "/api/v1/blogs", "BlogController", "Publish blog or save draft"),
        ("GET",  "/api/v1/blogs/drafts", "BlogController", "Get personal author drafts"),
        ("PUT",  "/api/v1/blogs/{id}", "BlogController", "Update blog (Owner guard)"),
        ("DELETE","/api/v1/blogs/{id}", "BlogController", "Delete blog (Owner guard)"),
        ("GET",  "/api/v1/developers", "DeveloperController", "Paginated developer list"),
        ("GET",  "/api/v1/developers/{id}", "DeveloperController", "Developer profile by UUID"),
        ("POST", "/api/v1/developers/{id}/connect", "DeveloperController", "Toggle peer connection"),
        ("GET",  "/api/v1/projects", "ProjectController", "Explore projects (sort/filter)"),
        ("POST", "/api/v1/projects/{id}/like", "ProjectController", "Atomic like/unlike toggle")
    ]
    for row_idx, (m, pth, ctrl, desc) in enumerate(api_rows, start=1):
        row_vals = [m, pth, ctrl, desc]
        m_color = ACCENT_GREEN if m == "GET" else (ACCENT_BLUE if m == "POST" else (ACCENT_AMBER if m == "PUT" else ACCENT_ROSE))
        for col_idx, val in enumerate(row_vals):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = BG_CARD if row_idx % 2 == 1 else BG_CARD_ALT
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(7)
            if col_idx == 0:
                p.font.bold = True
                p.font.color.rgb = m_color
            elif col_idx == 1:
                p.font.name = "Consolas"
                p.font.color.rgb = TEXT_WHITE
            else:
                p.font.color.rgb = TEXT_LIGHT

    add_card(slide11, Inches(7.8), Inches(1.75), Inches(4.733), Inches(5.1), bg_color=BG_CARD_ALT, border_color=BORDER_COLOR)
    add_badge(slide11, Inches(7.95), Inches(1.9), Inches(4.433), Inches(0.28), "LIVE REST ENDPOINT EXECUTION", BG_CARD, ACCENT_GREEN, 9)

    out_box = slide11.shapes.add_textbox(Inches(7.95), Inches(2.25), Inches(4.433), Inches(1.8))
    tf = out_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "HTTP GET /api/v1/stats/overview\nStatus: 200 OK | Content-Type: application/json"
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    p2 = tf.add_paragraph()
    p2.text = '{\n  "developersCount": 10000,\n  "blogsCount": 2500,\n  "projectsCount": 1200,\n  "countriesCount": 50\n}'
    p2.font.name = "Consolas"
    p2.font.size = Pt(8.5)
    p2.font.color.rgb = ACCENT_GREEN

    rest_img = "docs/assignment-evidence/02_rest_endpoint_output.png"
    if os.path.exists(rest_img):
        slide11.shapes.add_picture(rest_img, Inches(7.95), Inches(4.1), width=Inches(4.433), height=Inches(2.65))
    add_footer(slide11, 11)

    # =============================================================
    # SLIDE 12 — AUTHENTICATION, VALIDATION & EXCEPTION HANDLING
    # =============================================================
    print("Building Slide 12: Authentication, Validation and Exception Handling...")
    slide12 = add_slide_base(prs)
    add_header(slide12, "DEFENSE IN DEPTH", "Authentication, Validation & Centralized Exception Handling", 
               "Stateless JWT security architecture, declarative Jakarta validation, and unified @RestControllerAdvice error envelopes.")

    cols12 = [
        ("1. STATELESS JWT SECURITY", "Spring Security 6.4", ACCENT_CYAN, [
            ("BCrypt Password Hashing:", "Passwords hashed using BCryptPasswordEncoder with 10 salt rounds. Plaintext is never stored."),
            ("Digital Signatures:", "JJWT 0.12.6 issues HMAC-SHA512 signed tokens containing user claims with a 24-hour expiration window."),
            ("JwtAuthenticationFilter:", "Intercepts incoming requests, extracts Authorization: Bearer <token>, verifies signature and validity."),
            ("SecurityContext:", "Builds UsernamePasswordAuthenticationToken and populates SecurityContextHolder for authenticated routing."),
            ("Stateless Session:", "Configured with SessionCreationPolicy.STATELESS, eliminating server-side session memory consumption.")
        ]),
        ("2. DECLARATIVE VALIDATION", "Jakarta Validation 3.0.2", ACCENT_AMBER, [
            ("@Valid Annotation:", "Triggers automatic bean validation on incoming DTO payloads at the controller layer boundary."),
            ("@NotBlank & @Email:", "Enforces non-empty strings and valid RFC 5322 email syntax on LoginRequest and RegisterRequest."),
            ("@Size Constraints:", "Restricts username (3-50 chars), password (6-100 chars), blog title (max 200 chars), content (max 10K)."),
            ("Immediate Guard:", "Invalid payloads fail before entering the service layer, preventing SQL injection and corrupt state."),
            ("Validation Mapping:", "MethodArgumentNotValidException is captured and mapped into individual field error maps.")
        ]),
        ("3. GLOBAL EXCEPTION ADVICE", "@RestControllerAdvice", ACCENT_ROSE, [
            ("Centralized Advice:", "GlobalExceptionHandler intercepts all thrown domain exceptions across all 5 REST controllers."),
            ("Standard ApiError:", "Uniform JSON response envelope: {timestamp, status, error, message, path, details}."),
            ("400 Bad Request:", "MethodArgumentNotValidException, BadRequestException, IllegalArgumentException."),
            ("401 Unauthorized:", "BadCredentialsException, UnauthorizedException (invalid or missing Bearer token)."),
            ("403 Forbidden:", "ForbiddenException (author ownership guard mismatch)."),
            ("404 Not Found:", "ResourceNotFoundException (user, blog, or project UUID not present in database)."),
            ("409 Conflict:", "DuplicateResourceException (email or username already registered in database).")
        ])
    ]

    for i, (title, sub, acc, items) in enumerate(cols12):
        x = Inches(0.8 + i * 3.98)
        add_card(slide12, x, Inches(1.75), Inches(3.8), Inches(5.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide12, x + Inches(0.15), Inches(1.9), Inches(3.5), Inches(0.28), sub, BG_CARD_ALT, acc, 8.5)

        tb = slide12.shapes.add_textbox(x + Inches(0.15), Inches(2.25), Inches(3.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        for k, v in items:
            p = tf.add_paragraph()
            r1 = p.add_run()
            r1.text = f"{k} "
            r1.font.size = Pt(8.5)
            r1.font.bold = True
            r1.font.color.rgb = acc
            r2 = p.add_run()
            r2.text = v
            r2.font.size = Pt(8.5)
            r2.font.color.rgb = TEXT_LIGHT
    add_footer(slide12, 12)

    # =============================================================
    # SLIDE 13 — END-TO-END APPLICATION DATA FLOW
    # =============================================================
    print("Building Slide 13: End-to-End Application Data Flow...")
    slide13 = add_slide_base(prs)
    add_header(slide13, "DATA FLOW TRACE", "End-to-End Application Data Flow: Live Round-Trip Trace", 
               "Step-by-step lifecycle of an authenticated request: Outbound Request (Steps 1-5) and Inbound Response (Steps 6-10).")

    flow_steps_left = [
        ("Step 1: User Triggers Interaction in React Client", "User clicks heart icon on <ProjectsIsland />. Component optimistically toggles like state and heart color.", ACCENT_CYAN),
        ("Step 2: Centralized API Client Injects JWT Bearer", "projectsApi.toggleLike(id) in src/services/api.js extracts jwt_token from localStorage and attaches Authorization: Bearer <token>.", ACCENT_BLUE),
        ("Step 3: HTTP POST Request Dispatched across Network", "Browser sends HTTP POST to http://localhost:8080/api/v1/projects/{id}/like with Content-Type: application/json.", ACCENT_PURPLE),
        ("Step 4: JwtAuthenticationFilter Intercepts & Authorizes", "Security filter intercepts request, validates HMAC-SHA512 signature and expiry, builds UserPrincipal, sets SecurityContext.", ACCENT_AMBER),
        ("Step 5: ProjectController Receives & Dispatches", "Spring MVC maps URL to ProjectController.toggleLike(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal user). Zero business logic.", ACCENT_ROSE)
    ]

    flow_steps_right = [
        ("Step 6: ProjectServiceImpl Enforces Business Invariant", "Service checks ProjectLikeRepository.findByProjectIdAndUserId(). If found: deletes like and decrements count; if not: inserts like and increments count.", ACCENT_GREEN),
        ("Step 7: Spring Data JPA Repository Generates Query", "ProjectLikeRepository executes derived query methods. ProjectRepository dirty checks project entity within @Transactional boundary.", ACCENT_CYAN),
        ("Step 8: Hibernate ORM Generates SQL & Commits to DB", "Hibernate generates parameterized SQL INSERT/DELETE and UPDATE statements. PostgreSQL commits transaction atomically.", ACCENT_BLUE),
        ("Step 9: EntityDtoMapper Serializes Response Payload", "Service converts mutated Project entity into clean ProjectResponse DTO with liked=true/false and updated counter.", ACCENT_AMBER),
        ("Step 10: Client Receives 200 OK & Renders UI State", "Controller wraps DTO in ResponseEntity.ok(). React receives JSON response, confirms optimistic update, and synchronizes state.", ACCENT_GREEN)
    ]

    for i, (title, desc, acc) in enumerate(flow_steps_left):
        y = Inches(1.75 + i * 1.02)
        add_card(slide13, Inches(0.8), y, Inches(5.7), Inches(0.92), bg_color=BG_CARD, border_color=acc)
        tb = slide13.shapes.add_textbox(Inches(0.95), y + Inches(0.06), Inches(5.4), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{title}\n"
        r1.font.size = Pt(9)
        r1.font.bold = True
        r1.font.color.rgb = acc
        r2 = p.add_run()
        r2.text = desc
        r2.font.size = Pt(8)
        r2.font.color.rgb = TEXT_LIGHT

    for i, (title, desc, acc) in enumerate(flow_steps_right):
        y = Inches(1.75 + i * 1.02)
        add_card(slide13, Inches(6.8), y, Inches(5.733), Inches(0.92), bg_color=BG_CARD, border_color=acc)
        tb = slide13.shapes.add_textbox(Inches(6.95), y + Inches(0.06), Inches(5.433), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{title}\n"
        r1.font.size = Pt(9)
        r1.font.bold = True
        r1.font.color.rgb = acc
        r2 = p.add_run()
        r2.text = desc
        r2.font.size = Pt(8)
        r2.font.color.rgb = TEXT_LIGHT
    add_footer(slide13, 13)

    # =============================================================
    # SLIDE 14 — TESTING AND VERIFICATION
    # =============================================================
    print("Building Slide 14: Testing and Quality Assurance...")
    slide14 = add_slide_base(prs)
    add_header(slide14, "EMPIRICAL QUALITY ASSURANCE", "Testing Methodology & Verification: 35 Automated Tests (100% Pass)", 
               "Empirically verified test pyramid covering unit, slice, concurrency, and integration testing, alongside structured manual tests.")

    add_card(slide14, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
    add_badge(slide14, Inches(0.95), Inches(1.9), Inches(5.4), Inches(0.28), "AUTOMATED TEST SUITE: 35 TESTS (100% BUILD SUCCESS)", BG_CARD_ALT, ACCENT_GREEN, 9)

    t_box = slide14.shapes.add_textbox(Inches(0.95), Inches(2.25), Inches(5.4), Inches(2.6))
    tf = t_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "EMPIRICAL SUREFIRE TEST BREAKDOWN:"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    test_breakdown = [
        ("Controller Slice Tests (15 Tests):", "@WebMvcTest with MockMvc checking routing, validation, and JSON responses.\n• AuthControllerTest (4), BlogControllerTest (4), DeveloperControllerTest (4), ProjectControllerTest (3)"),
        ("Service Unit Tests (13 Tests):", "JUnit 5 + Mockito verifying business rules in complete isolation.\n• AuthServiceTest (5), BlogServiceTest (4), ProjectServiceTest (4)"),
        ("Concurrency Tests (6 Tests):", "Multi-threaded stress testing in ProjectConcurrencyTest verifying atomic likes, views, bookmarks, and thread safety under concurrent requests."),
        ("E2E Integration Test (1 Test):", "@SpringBootTest in DevSphereIntegrationTest verifying full ApplicationContext startup and bean dependency wiring.")
    ]
    for tk, tv in test_breakdown:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{tk}\n"
        r1.font.size = Pt(8.5)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = f"{tv}\n"
        r2.font.size = Pt(7.5)
        r2.font.color.rgb = TEXT_LIGHT

    junit_img = "docs/assignment-evidence/03_junit_test_results.png"
    if os.path.exists(junit_img):
        slide14.shapes.add_picture(junit_img, Inches(0.95), Inches(5.1), width=Inches(5.4), height=Inches(1.65))

    add_card(slide14, Inches(6.7), Inches(1.75), Inches(5.833), Inches(5.1), bg_color=BG_CARD_ALT, border_color=BORDER_COLOR)
    add_badge(slide14, Inches(6.85), Inches(1.9), Inches(5.533), Inches(0.28), "STRUCTURED MANUAL TEST MATRIX (TC-01 TO TC-05)", BG_CARD, ACCENT_AMBER, 9)

    tbl2_shape = slide14.shapes.add_table(6, 4, Inches(6.85), Inches(2.25), Inches(5.533), Inches(4.5))
    tbl2 = tbl2_shape.table
    tbl2.columns[0].width = Inches(0.8)   # Test ID
    tbl2.columns[1].width = Inches(1.5)   # Feature
    tbl2.columns[2].width = Inches(2.4)   # Expected vs Actual
    tbl2.columns[3].width = Inches(0.833) # Status

    headers2 = ["ID", "FEATURE UNDER TEST", "EXPECTED VS ACTUAL BEHAVIOR", "RESULT"]
    for j, h in enumerate(headers2):
        cell = tbl2.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_CARD_INNER
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(7.5)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER

    manual_cases = [
        ("TC-01", "User Registration & Auto Profile", "Valid payload returns 201 Created, JWT token, and auto-provisions DeveloperProfile record in database.", "PASS"),
        ("TC-02", "Duplicate Email Rejection Guard", "Submitting already-registered email returns 409 Conflict with 'Email is already registered' error.", "PASS"),
        ("TC-03", "Blog Author Ownership Guard", "User B attempting to edit User A's article returns 403 Forbidden with ownership violation exception.", "PASS"),
        ("TC-04", "Platform Telemetry Overview", "HTTP GET /api/v1/stats/overview returns 200 OK with live telemetry counts for devs, blogs, projects.", "PASS"),
        ("TC-05", "Idempotent Project Like Counter", "1st click: likes=11 (liked=true). 2nd click: likes=10 (liked=false). Zero duplicate entries allowed in DB.", "PASS")
    ]
    for row_idx, (tid, feat, exp, res) in enumerate(manual_cases, start=1):
        vals = [tid, feat, exp, res]
        for col_idx, val in enumerate(vals):
            cell = tbl2.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = BG_CARD if row_idx % 2 == 1 else BG_CARD_ALT
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(7)
            if col_idx == 0:
                p.font.bold = True
                p.font.color.rgb = ACCENT_CYAN
            elif col_idx == 3:
                p.font.bold = True
                p.font.color.rgb = ACCENT_GREEN
            else:
                p.font.color.rgb = TEXT_LIGHT
    add_footer(slide14, 14)

    # =============================================================
    # SLIDE 15 — APPLICATION DEMONSTRATION & USER JOURNEY
    # =============================================================
    print("Building Slide 15: Application Demonstration...")
    slide15 = add_slide_base(prs)
    add_header(slide15, "VISUAL VERIFICATION", "Application Demonstration: UI Gallery & End-to-End User Journey", 
               "Verified screenshots from the running DevSphere application and step-by-step user journey.")

    screens = [
        ("Home Portal", "page1_home.png", Inches(0.8)),
        ("Developers Directory", "page6_developers.png", Inches(3.78)),
        ("Engineering Blogs", "page4_blogs.png", Inches(6.76)),
        ("Project Showcase", "page8_projects.png", Inches(9.74))
    ]
    for s_title, s_file, x in screens:
        path = os.path.join("docs", "react_page_tables", s_file)
        add_card(slide15, x, Inches(1.75), Inches(2.78), Inches(2.75), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide15, x + Inches(0.1), Inches(1.85), Inches(2.58), Inches(0.24), s_title, BG_CARD_ALT, ACCENT_CYAN, 8)
        if os.path.exists(path):
            slide15.shapes.add_picture(path, x + Inches(0.1), Inches(2.15), width=Inches(2.58), height=Inches(2.25))

    add_card(slide15, Inches(0.8), Inches(4.65), Inches(11.733), Inches(2.2), bg_color=BG_CARD_ALT, border_color=BORDER_CYAN)
    j_box = slide15.shapes.add_textbox(Inches(1.05), Inches(4.75), Inches(11.2), Inches(2.0))
    tf = j_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "COMPLETE END-TO-END USER JOURNEY WALKTHROUGH"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    journey = [
        ("1. Registration & Profile Seeding:", "User signs up on /signup. Backend salts password with BCrypt, saves User, automatically provisions linked DeveloperProfile, and generates JWT."),
        ("2. Community Discovery & Networking:", "User navigates to /developers, filters peers by technical skill tags (e.g. 'React', 'Spring Boot'), views detailed profile on /developer-profile with Chart.js activity charts, and toggles peer connection."),
        ("3. Technical Story Publishing:", "User navigates to /write-blog, enters title, category, and markdown content. Previews live formatting in editor, publishes article; backend calculates read-time formula (5 min read) and posts to /blogs feed."),
        ("4. Project Showcase & Atomic Likes:", "User explores /projects, sorts by 'Most Liked', inspects project details, and clicks heart icon. Backend executes atomic like toggle within @Transactional boundary, incrementing counter and preventing duplicate votes.")
    ]
    for j_t, j_d in journey:
        p = tf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"{j_t} "
        r1.font.size = Pt(8.5)
        r1.font.bold = True
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = j_d
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = TEXT_LIGHT
    add_footer(slide15, 15)

    # =============================================================
    # SLIDE 16 — ASSIGNMENT REQUIREMENT COMPLIANCE
    # =============================================================
    print("Building Slide 16: Assignment Requirement Compliance Matrix...")
    slide16 = add_slide_base(prs)
    add_header(slide16, "CURRICULUM COMPLIANCE", "Assignment Requirement Compliance Matrix: 21CSE354T Part 1", 
               "Empirically audited compliance matrix proving 100% satisfaction of all Spring Boot Framework Part 1 requirements.")

    add_card(slide16, Inches(0.8), Inches(1.75), Inches(11.733), Inches(5.1), bg_color=BG_CARD, border_color=BORDER_COLOR)
    add_badge(slide16, Inches(0.95), Inches(1.9), Inches(11.433), Inches(0.28), "14 AUDITED EVALUATION METRICS — ALL VERIFIED AND PASSING", BG_CARD_ALT, ACCENT_GREEN, 9)

    tbl_shape = slide16.shapes.add_table(15, 4, Inches(0.95), Inches(2.25), Inches(11.433), Inches(4.45))
    tbl = tbl_shape.table
    tbl.columns[0].width = Inches(0.6)   # Req #
    tbl.columns[1].width = Inches(2.8)   # Requirement
    tbl.columns[2].width = Inches(7.0)   # Implementation Evidence
    tbl.columns[3].width = Inches(1.033) # Status

    headers3 = ["REQ #", "ASSIGNMENT REQUIREMENT", "DEVSPHERE IMPLEMENTATION & EMPIRICAL EVIDENCE", "STATUS"]
    for j, h in enumerate(headers3):
        cell = tbl.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_CARD_INNER
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(8)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER

    comp_rows = [
        ("1", "Java & Spring Boot Framework", "Java 21 LTS runtime (release 21 in pom.xml); Spring Boot 3.4.3 parent starter.", "PASS"),
        ("2", "Maven Build Tool & Packaging", "Apache Maven 3.9.6; spring-boot-maven-plugin packages executable Fat JAR.", "PASS"),
        ("3", "Executable Web Application", "Embedded Apache Tomcat 10.1.36 runs on port 8080. Zero external WAR deployment.", "PASS"),
        ("4", "Working RESTful Endpoints", "15 REST endpoints exposed across 5 controllers; GET /api/v1/stats/overview verified.", "PASS"),
        ("5", "Spring Boot Auto-Configuration", "@SpringBootApplication configures HikariCP, Tomcat, Jackson, and Hibernate.", "PASS"),
        ("6", "Three-Layer Architecture", "Strict decoupling: Controller (@RestController) -> Service (@Service) -> Repository (@Repository).", "PASS"),
        ("7", "Domain Entities & Modeling", "6 JPA Entities (User, DeveloperProfile, Blog, Project, Connection, Like) with @ElementCollection.", "PASS"),
        ("8", "Service-Layer Business Rules", "Enforces author ownership, email uniqueness, atomic like toggle, and reading-time formula.", "PASS"),
        ("9", "REST Presentation Layer", "Versioned /api/v1 routes with DTO validation (@Valid) and clean JSON envelopes.", "PASS"),
        ("10", "Documented Manual Tests", "5 structured manual test cases (TC-01 to TC-05) verified with Expected and Actual outputs.", "PASS"),
        ("11", "Automated Testing Suite", "35 automated tests (Unit, Slice, Concurrency, E2E) run via Surefire; 100% pass rate.", "PASS"),
        ("12", "Application Data Flow", "Verified trace from React UI through Security, Controller, Service, and Repository to DB.", "PASS"),
        ("13", "Architecture & ER Diagrams", "Multi-tier pipeline diagram, 3-layer architecture diagrams, and relational ER schema.", "PASS"),
        ("14", "Runtime & REST Evidence", "Console startup screenshot (01_backend_running.png) and REST JSON screenshot (02_rest_endpoint_output.png).", "PASS")
    ]

    for row_idx, (r_num, r_req, r_ev, r_st) in enumerate(comp_rows, start=1):
        vals = [r_num, r_req, r_ev, r_st]
        for col_idx, val in enumerate(vals):
            cell = tbl.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = BG_CARD if row_idx % 2 == 1 else BG_CARD_ALT
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(7.5)
            if col_idx == 0:
                p.font.bold = True
                p.font.color.rgb = ACCENT_CYAN
            elif col_idx == 1:
                p.font.bold = True
                p.font.color.rgb = TEXT_WHITE
            elif col_idx == 3:
                p.font.bold = True
                p.font.color.rgb = ACCENT_GREEN
            else:
                p.font.color.rgb = TEXT_LIGHT
    add_footer(slide16, 16)

    # =============================================================
    # SLIDE 17 — CONCLUSION AND FUTURE SCOPE
    # =============================================================
    print("Building Slide 17: Conclusion and Future Scope...")
    slide17 = add_slide_base(prs)
    add_header(slide17, "ACADEMIC SUMMARY", "Conclusion & Future Scope: Architectural Accomplishments", 
               "DevSphere successfully proves how modern enterprise Spring Boot architecture unifies developer collaboration.")

    cols17 = [
        ("CORE DELIVERABLES", ACCENT_CYAN, [
            ("Enterprise Backend:", "Full Spring Boot 3.4.3 backend with Java 21 LTS and zero XML boilerplate."),
            ("Three-Layer Decoupling:", "Impenetrable separation between Controller, Service, and Repository layers."),
            ("Stateless Security:", "JJWT HMAC-SHA512 token issuing with BCrypt salted password encryption."),
            ("Relational Modeling:", "6 normalized JPA entities with UUID keys and @ElementCollection tables."),
            ("100% Quality Assurance:", "35 automated tests passing with zero failures, alongside 5 manual test cases.")
        ]),
        ("ACADEMIC LEARNINGS", ACCENT_AMBER, [
            ("Auto-Configuration:", "In-depth understanding of how Spring Boot bootstraps Tomcat, Hikari, and Hibernate."),
            ("Transaction Management:", "Mastery of ACID boundaries using declarative @Transactional annotations."),
            ("Relational Persistence:", "Nuanced entity mapping, collection tables, and compound unique constraints."),
            ("Centralized Exception Handling:", "Formatting clean, standardized error responses using @RestControllerAdvice."),
            ("Test-Driven Verification:", "Leveraging MockMvc and Mockito to verify business invariants in isolation.")
        ]),
        ("FUTURE ROADMAP", ACCENT_GREEN, [
            ("OAuth2 Social Login:", "Integrate GitHub and Google OAuth2 for instant one-click developer onboarding."),
            ("Code Execution Sandbox:", "Embed an interactive in-browser compiler for code snippets inside blog articles."),
            ("WebSocket Messaging:", "Implement real-time peer-to-peer developer chat using Spring WebSocket STOMP."),
            ("Cloud Containerization:", "Containerize frontend and backend using Docker and deploy to Kubernetes."),
            ("AI Knowledge Trail:", "Leverage LLM embeddings to automatically recommend related projects and blogs.")
        ])
    ]

    for i, (col_title, acc, items) in enumerate(cols17):
        x = Inches(0.8 + i * 3.98)
        add_card(slide17, x, Inches(1.75), Inches(3.8), Inches(4.0), bg_color=BG_CARD, border_color=BORDER_COLOR)
        add_badge(slide17, x + Inches(0.15), Inches(1.9), Inches(3.5), Inches(0.28), col_title, BG_CARD_ALT, acc, 8.5)

        tb = slide17.shapes.add_textbox(x + Inches(0.15), Inches(2.25), Inches(3.5), Inches(3.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = col_title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        for k, v in items:
            p = tf.add_paragraph()
            r1 = p.add_run()
            r1.text = f"{k} "
            r1.font.size = Pt(8.5)
            r1.font.bold = True
            r1.font.color.rgb = acc
            r2 = p.add_run()
            r2.text = v
            r2.font.size = Pt(8.5)
            r2.font.color.rgb = TEXT_LIGHT

    add_card(slide17, Inches(0.8), Inches(5.9), Inches(11.733), Inches(1.05), bg_color=BG_CARD_ALT, border_color=ACCENT_CYAN)
    motto_box = slide17.shapes.add_textbox(Inches(1.0), Inches(5.95), Inches(11.333), Inches(0.95))
    tf = motto_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "DevSphere — Connecting Developers, Showcasing Innovation, Sharing Knowledge."
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    p.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "Thank you! Questions and Discussion."
    p2.font.size = Pt(11)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.alignment = PP_ALIGN.CENTER

    add_footer(slide17, 17)

    output_path = "DevSphere_Application_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully updated and saved to {output_path} ({len(prs.slides)} slides)!")

if __name__ == "__main__":
    create_deck()
