const neo4j = require('neo4j-driver');
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

console.log("Seeding CognoDB instance at:", uri);
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function run() {
  const session = driver.session();
  try {
    // 1. Clear database
    console.log("Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");

    // 2. Try creating constraints (if supported, otherwise bypass)
    console.log("Creating constraints...");
    const constraints = [
      "CREATE CONSTRAINT FOR (u:User) REQUIRE u.id IS UNIQUE",
      "CREATE CONSTRAINT FOR (s:Skill) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT FOR (r:Role) REQUIRE r.id IS UNIQUE",
      "CREATE CONSTRAINT FOR (c:Company) REQUIRE c.id IS UNIQUE",
      "CREATE CONSTRAINT FOR (p:Project) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT FOR (res:Resource) REQUIRE res.id IS UNIQUE"
    ];

    for (const c of constraints) {
      try {
        await session.run(c);
      } catch (err) {
        console.log(`Note: Constraint creation bypassed or failed (${err.message}). Continuing...`);
      }
    }

    // 3. Create Users
    console.log("Seeding Users...");
    const users = [
      { id: "user-1", name: "John Doe" }, // Seeds: Java, Spring Boot, SQL, Git, HTML/CSS
      { id: "user-2", name: "Jane Smith" }, // Frontend oriented: JavaScript, React, HTML/CSS, Git, TypeScript
      { id: "user-3", name: "Bob Johnson" }, // DevOps oriented: Docker, Kubernetes, CI/CD, AWS, Linux
      { id: "user-4", name: "Alice Williams" }, // Python Data Scientist: Python, SQL, PostgreSQL, Git
      { id: "user-5", name: "Charlie Brown" }, // Fullstack Junior: JavaScript, HTML/CSS, Node.js, SQL
      { id: "user-6", name: "Diana Prince" }, // Senior Developer: Java, Spring Boot, SQL, Docker, AWS, System Design, Git
      { id: "user-7", name: "Evan Wright" }, // Entry Developer: Python, HTML/CSS, Git
      { id: "user-8", name: "Fiona Gallagher" }, // UI Engineer: HTML/CSS, Figma, JavaScript, React
      { id: "user-9", name: "George Costanza" }, // Cloud Enthusiast: AWS, Docker, Linux, Git
      { id: "user-10", name: "Hannah Abbott" } // QA Engineer: Python, Git, CI/CD
    ];

    for (const u of users) {
      await session.run("CREATE (:User {id: $id, name: $name})", u);
    }

    // 4. Create Skills
    console.log("Seeding Skills...");
    const skills = [
      // Languages
      { id: "skill-java", name: "Java", category: "Languages" },
      { id: "skill-javascript", name: "JavaScript", category: "Languages" },
      { id: "skill-typescript", name: "TypeScript", category: "Languages" },
      { id: "skill-python", name: "Python", category: "Languages" },
      { id: "skill-sql", name: "SQL", category: "Languages" },
      { id: "skill-html-css", name: "HTML/CSS", category: "Languages" },
      { id: "skill-bash", name: "Bash Scripting", category: "Languages" },
      { id: "skill-golang", name: "Go", category: "Languages" },
      
      // Frontend
      { id: "skill-react", name: "React", category: "Frontend" },
      { id: "skill-nextjs", name: "Next.js", category: "Frontend" },
      { id: "skill-vue", name: "Vue.js", category: "Frontend" },
      { id: "skill-vite", name: "Vite", category: "Frontend" },
      { id: "skill-figma", name: "Figma UI/UX", category: "Frontend" },
      { id: "skill-tailwind", name: "Tailwind CSS", category: "Frontend" },
      
      // Backend & APIs
      { id: "skill-springboot", name: "Spring Boot", category: "Backend" },
      { id: "skill-express", name: "Express.js", category: "Backend" },
      { id: "skill-nodejs", name: "Node.js", category: "Backend" },
      { id: "skill-django", name: "Django", category: "Backend" },
      { id: "skill-fastapi", name: "FastAPI", category: "Backend" },
      { id: "skill-rest", name: "REST APIs", category: "Backend" },
      { id: "skill-graphql", name: "GraphQL", category: "Backend" },
      
      // Databases & Caching
      { id: "skill-postgresql", name: "PostgreSQL", category: "Databases" },
      { id: "skill-mongodb", name: "MongoDB", category: "Databases" },
      { id: "skill-redis", name: "Redis", category: "Databases" },
      { id: "skill-cognodb", name: "CognoDB Graph DB", category: "Databases" },
      
      // DevOps & Cloud
      { id: "skill-docker", name: "Docker", category: "DevOps & Cloud" },
      { id: "skill-kubernetes", name: "Kubernetes", category: "DevOps & Cloud" },
      { id: "skill-aws", name: "AWS", category: "DevOps & Cloud" },
      { id: "skill-gcp", name: "GCP", category: "DevOps & Cloud" },
      { id: "skill-cicd", name: "CI/CD", category: "DevOps & Cloud" },
      { id: "skill-terraform", name: "Terraform", category: "DevOps & Cloud" },
      { id: "skill-linux", name: "Linux Administration", category: "DevOps & Cloud" },
      
      // Architecture & Methodology
      { id: "skill-system-design", name: "System Design", category: "Architecture" },
      { id: "skill-microservices", name: "Microservices", category: "Architecture" },
      { id: "skill-git", name: "Git Version Control", category: "Tools" },
      { id: "skill-agile", name: "Agile Scrum", category: "Tools" },
      { id: "skill-testing", name: "Unit Testing", category: "Tools" },
      { id: "skill-security", name: "Web Security", category: "Tools" },
      { id: "skill-kafka", name: "Apache Kafka", category: "Databases" },
      { id: "skill-docker-compose", name: "Docker Compose", category: "DevOps & Cloud" }
    ];

    for (const s of skills) {
      await session.run("CREATE (:Skill {id: $id, name: $name, category: $category})", s);
    }

    // 5. Create Roles
    console.log("Seeding Roles...");
    const roles = [
      { id: "role-backend-junior", title: "Junior Backend Engineer", level: "Entry" },
      { id: "role-backend-senior", title: "Senior Backend Engineer", level: "Senior" },
      { id: "role-frontend-junior", title: "Junior Frontend Engineer", level: "Entry" },
      { id: "role-frontend-senior", title: "Senior Frontend Engineer", level: "Senior" },
      { id: "role-fullstack-mid", title: "Mid Fullstack Developer", level: "Mid" },
      { id: "role-devops", title: "DevOps Engineer", level: "Mid" },
      { id: "role-cloud-architect", title: "Cloud Solutions Architect", level: "Senior" },
      { id: "role-data-engineer", title: "Data Engineer", level: "Mid" },
      { id: "role-tech-lead", title: "Technical Lead", level: "Senior" },
      { id: "role-qa-engineer", title: "QA Automation Engineer", level: "Entry" },
      { id: "role-ui-designer", title: "UI/UX Designer", level: "Entry" },
      { id: "role-graph-engineer", title: "Graph Database Engineer", level: "Senior" }
    ];

    for (const r of roles) {
      await session.run("CREATE (:Role {id: $id, title: $title, level: $level})", r);
    }

    // 6. Create Companies
    console.log("Seeding Companies...");
    const companies = [
      { id: "comp-techcorp", name: "TechCorp" },
      { id: "comp-softsolutions", name: "SoftSolutions" },
      { id: "comp-innovatelabs", name: "InnovateLabs" },
      { id: "comp-cloudscale", name: "CloudScale Systems" },
      { id: "comp-datadynamics", name: "DataDynamics" },
      { id: "comp-fintechinc", name: "FinTechInc" },
      { id: "comp-webstudios", name: "WebStudios" },
      { id: "comp-devshop", name: "DevShop Solutions" }
    ];

    for (const c of companies) {
      await session.run("CREATE (:Company {id: $id, name: $name})", c);
    }

    // 7. Create Projects
    console.log("Seeding Projects...");
    const projects = [
      { id: "proj-ecommerce", name: "E-Commerce Backend Microservices", description: "Scalable Java microservices platform handling high concurrent transactions." },
      { id: "proj-dashboard", name: "Vibrant Analytics Dashboard", description: "Real-time interactive dashboard in React and Tailwind CSS." },
      { id: "proj-infra", name: "Terraform Multi-Region Infra", description: "Infrastructure as Code setup with auto-scaling Kubernetes cluster." },
      { id: "proj-pipeline", name: "Data Ingestion Pipeline", description: "Python ETL process pulling streaming data from Kafka to PostgreSQL." },
      { id: "proj-graph", name: "Knowledge Graph Engine", description: "An openCypher-powered search portal using CognoDB." },
      { id: "proj-chat", name: "Collaborative Chat App", description: "Real-time messaging backend using Node.js and Socket.io." },
      { id: "proj-auth", name: "OAuth2 Single-Sign-On Service", description: "Secure identity provider server using Express.js and Redis." },
      { id: "proj-blog", name: "CMS Blog Engine", description: "Headless CMS website built on Next.js." },
      { id: "proj-billing", name: "Subscription Billing App", description: "Stripe-integrated billing microservice built on FastAPI." },
      { id: "proj-monitor", name: "Prometheus Monitoring Suite", description: "Cluster monitoring setup with customized Grafana dashboards." },
      { id: "proj-social", name: "Social Network Graph", description: "Social graph API demonstrating fast multi-hop recommendations." },
      { id: "proj-mobile", name: "Fitness Tracker App", description: "Cross-platform mobile application utilizing Figma prototypes." },
      { id: "proj-cache", name: "Distributed Cache Library", description: "Rust-based distributed cache manager." },
      { id: "proj-scraper", name: "Web Scraping Crawler", description: "Asynchronous scraper storing dynamic web content in MongoDB." },
      { id: "proj-compiler", name: "Custom Script Compiler", description: "Basic educational compiler built in Go." },
      { id: "proj-search", name: "Log Aggregating Search", description: "Elasticsearch integration for high volume server log searches." },
      { id: "proj-ci", name: "Jenkins pipeline optimizer", description: "Optimized Docker build speeds and testing runtimes in CI." },
      { id: "proj-game", name: "Canvas Web Game", description: "Interactive frontend game utilizing HTML5 Canvas and CSS animations." },
      { id: "proj-api-gateway", name: "API Gateway Proxy", description: "A reverse proxy routing requests and limiting request speeds." },
      { id: "proj-data-viz", name: "D3.js Tree Visualizer", description: "Complex node graphs visualizer using SVG and JavaScript." }
    ];

    for (const p of projects) {
      await session.run("CREATE (:Project {id: $id, name: $name, description: $description})", p);
    }

    // 8. Create Learning Resources
    console.log("Seeding Resources...");
    const resources = [
      { id: "res-spring", title: "Spring Boot Starter Course", type: "Course", url: "https://spring.io/guides/gs/spring-boot/" },
      { id: "res-java", title: "Effective Java (3rd Edition)", type: "Book", url: "https://www.oreilly.com/library/view/effective-java/9780134686097/" },
      { id: "res-docker", title: "Docker Containerization Essentials", type: "Course", url: "https://docs.docker.com/get-started/" },
      { id: "res-k8s", title: "Kubernetes Up & Running", type: "Book", url: "https://kubernetes.io/docs/tutorials/" },
      { id: "res-sysdesign", title: "System Design Primer GitHub", type: "Guide", url: "https://github.com/donnemartin/system-design-primer" },
      { id: "res-react", title: "Official React Documentation Tutorial", type: "Guide", url: "https://react.dev/learn" },
      { id: "res-nextjs", title: "Next.js Dashboard & SSR Course", type: "Course", url: "https://nextjs.org/learn" },
      { id: "res-ts", title: "TypeScript Deep Dive", type: "Guide", url: "https://basarat.gitbook.io/typescript/" },
      { id: "res-sql", title: "SQL Bolt Interactive Tutorial", type: "Course", url: "https://sqlbolt.com/" },
      { id: "res-postgres", title: "PostgreSQL High Performance", type: "Book", url: "https://www.postgresql.org/docs/" },
      { id: "res-express", title: "Express.js API Development", type: "Course", url: "https://expressjs.com/en/starter/hello-world.html" },
      { id: "res-node", title: "Node.js Design Patterns", type: "Book", url: "https://nodejs.org/en/docs/guides/" },
      { id: "res-aws", title: "AWS Certified Cloud Practitioner Guide", type: "Course", url: "https://aws.amazon.com/training/" },
      { id: "res-terraform", title: "Terraform Associate Tutorial", type: "Course", url: "https://developer.hashicorp.com/terraform/tutorials" },
      { id: "res-git", title: "Git Pro Book Reference", type: "Book", url: "https://git-scm.com/book/en/v2" },
      { id: "res-fastapi", title: "FastAPI REST API Guides", type: "Guide", url: "https://fastapi.tiangolo.com/tutorial/" },
      { id: "res-mongo", title: "MongoDB University Basics", type: "Course", url: "https://university.mongodb.com/" },
      { id: "res-redis", title: "Redis University: Caching Architectures", type: "Course", url: "https://university.redis.com/" },
      { id: "res-cognodb", title: "CognoDB Graph database manual", type: "Guide", url: "https://console.cognodb.com/docs" },
      { id: "res-micro", title: "Designing Data-Intensive Applications", type: "Book", url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" },
      { id: "res-figma", title: "Figma UI Design Masterclass", type: "Course", url: "https://www.figma.com/resources/learn-design/" },
      { id: "res-tailwind", title: "Tailwind CSS Docs Reference", type: "Guide", url: "https://tailwindcss.com/docs" },
      { id: "res-python", title: "Automate the Boring Stuff with Python", type: "Book", url: "https://automatetheboringstuff.com/" },
      { id: "res-django", title: "Django Girls Tutorial", type: "Guide", url: "https://tutorial.djangogirls.org/" },
      { id: "res-cicd", title: "CI/CD Pipelines with GitHub Actions", type: "Course", url: "https://docs.github.com/en/actions" },
      { id: "res-linux", title: "Linux Command Line Journey", type: "Guide", url: "https://linuxjourney.com/" },
      { id: "res-graphql", title: "How to GraphQL Tutorial", type: "Course", url: "https://www.howtographql.com/" },
      { id: "res-kafka", title: "Confluent Kafka Developer Course", type: "Course", url: "https://developer.confluent.io/" },
      { id: "res-vite", title: "Vite Guide & Configs", type: "Guide", url: "https://vitejs.dev/guide/" },
      { id: "res-sec", title: "OWASP Top 10 Security Guide", type: "Guide", url: "https://owasp.org/www-project-top-ten/" }
    ];

    for (const r of resources) {
      await session.run("CREATE (:Resource {id: $id, title: $title, type: $type, url: $url})", r);
    }

    // 9. Create Relationships (100+)
    console.log("Establishing Relationships...");

    // User HAS_SKILL (User -> Skill)
    const userSkills = [
      // user-1: John Doe (Java, Spring Boot, SQL, Git, HTML/CSS)
      { userId: "user-1", skillId: "skill-java" },
      { userId: "user-1", skillId: "skill-springboot" },
      { userId: "user-1", skillId: "skill-sql" },
      { userId: "user-1", skillId: "skill-git" },
      { userId: "user-1", skillId: "skill-html-css" },

      // user-2: Jane Smith (JavaScript, React, HTML/CSS, Git, TypeScript)
      { userId: "user-2", skillId: "skill-javascript" },
      { userId: "user-2", skillId: "skill-react" },
      { userId: "user-2", skillId: "skill-html-css" },
      { userId: "user-2", skillId: "skill-git" },
      { userId: "user-2", skillId: "skill-typescript" },

      // user-3: Bob Johnson (Docker, Kubernetes, CI/CD, AWS, Linux)
      { userId: "user-3", skillId: "skill-docker" },
      { userId: "user-3", skillId: "skill-kubernetes" },
      { userId: "user-3", skillId: "skill-cicd" },
      { userId: "user-3", skillId: "skill-aws" },
      { userId: "user-3", skillId: "skill-linux" },
      { userId: "user-3", skillId: "skill-bash" },

      // user-4: Alice (Python, SQL, PostgreSQL, Git)
      { userId: "user-4", skillId: "skill-python" },
      { userId: "user-4", skillId: "skill-sql" },
      { userId: "user-4", skillId: "skill-postgresql" },
      { userId: "user-4", skillId: "skill-git" },

      // user-5: Charlie (JavaScript, HTML/CSS, Node.js, SQL)
      { userId: "user-5", skillId: "skill-javascript" },
      { userId: "user-5", skillId: "skill-html-css" },
      { userId: "user-5", skillId: "skill-nodejs" },
      { userId: "user-5", skillId: "skill-sql" },

      // user-6: Diana (Java, Spring Boot, SQL, Docker, AWS, System Design, Git)
      { userId: "user-6", skillId: "skill-java" },
      { userId: "user-6", skillId: "skill-springboot" },
      { userId: "user-6", skillId: "skill-sql" },
      { userId: "user-6", skillId: "skill-docker" },
      { userId: "user-6", skillId: "skill-aws" },
      { userId: "user-6", skillId: "skill-system-design" },
      { userId: "user-6", skillId: "skill-git" },
      { userId: "user-6", skillId: "skill-rest" },

      // user-7: Evan (Python, HTML/CSS, Git)
      { userId: "user-7", skillId: "skill-python" },
      { userId: "user-7", skillId: "skill-html-css" },
      { userId: "user-7", skillId: "skill-git" },

      // user-8: Fiona (HTML/CSS, Figma, JavaScript, React)
      { userId: "user-8", skillId: "skill-html-css" },
      { userId: "user-8", skillId: "skill-figma" },
      { userId: "user-8", skillId: "skill-javascript" },
      { userId: "user-8", skillId: "skill-react" },

      // user-9: George (AWS, Docker, Linux, Git)
      { userId: "user-9", skillId: "skill-aws" },
      { userId: "user-9", skillId: "skill-docker" },
      { userId: "user-9", skillId: "skill-linux" },
      { userId: "user-9", skillId: "skill-git" },

      // user-10: Hannah (Python, Git, CI/CD)
      { userId: "user-10", skillId: "skill-python" },
      { userId: "user-10", skillId: "skill-git" },
      { userId: "user-10", skillId: "skill-cicd" }
    ];

    for (const rel of userSkills) {
      await session.run(`
        MATCH (u:User {id: $userId}), (s:Skill {id: $skillId})
        MERGE (u)-[:HAS_SKILL]->(s)
      `, rel);
    }

    // Skill RELATED_TO Skill (Directed with strength property)
    const relatedSkills = [
      { from: "skill-java", to: "skill-springboot", strength: 0.9 },
      { from: "skill-springboot", to: "skill-rest", strength: 0.8 },
      { from: "skill-rest", to: "skill-docker", strength: 0.7 },
      { from: "skill-docker", to: "skill-kubernetes", strength: 0.85 },
      { from: "skill-docker", to: "skill-docker-compose", strength: 0.9 },
      { from: "skill-kubernetes", to: "skill-terraform", strength: 0.75 },
      { from: "skill-javascript", to: "skill-react", strength: 0.9 },
      { from: "skill-react", to: "skill-nextjs", strength: 0.8 },
      { from: "skill-typescript", to: "skill-nextjs", strength: 0.85 },
      { from: "skill-javascript", to: "skill-typescript", strength: 0.8 },
      { from: "skill-javascript", to: "skill-nodejs", strength: 0.85 },
      { from: "skill-nodejs", to: "skill-express", strength: 0.9 },
      { from: "skill-express", to: "skill-rest", strength: 0.85 },
      { from: "skill-express", to: "skill-mongodb", strength: 0.75 },
      { from: "skill-postgresql", to: "skill-sql", strength: 0.95 },
      { from: "skill-sql", to: "skill-postgresql", strength: 0.8 },
      { from: "skill-sql", to: "skill-springboot", strength: 0.7 },
      { from: "skill-springboot", to: "skill-postgresql", strength: 0.75 },
      { from: "skill-python", to: "skill-fastapi", strength: 0.8 },
      { from: "skill-fastapi", to: "skill-rest", strength: 0.85 },
      { from: "skill-python", to: "skill-django", strength: 0.85 },
      { from: "skill-django", to: "skill-postgresql", strength: 0.7 },
      { from: "skill-aws", to: "skill-terraform", strength: 0.8 },
      { from: "skill-terraform", to: "skill-kubernetes", strength: 0.75 },
      { from: "skill-linux", to: "skill-bash", strength: 0.9 },
      { from: "skill-bash", to: "skill-docker", strength: 0.75 },
      { from: "skill-git", to: "skill-cicd", strength: 0.8 },
      { from: "skill-docker", to: "skill-cicd", strength: 0.8 },
      { from: "skill-system-design", to: "skill-microservices", strength: 0.9 },
      { from: "skill-springboot", to: "skill-microservices", strength: 0.8 },
      { from: "skill-rest", to: "skill-graphql", strength: 0.65 },
      { from: "skill-figma", to: "skill-html-css", strength: 0.75 },
      { from: "skill-html-css", to: "skill-tailwind", strength: 0.85 },
      { from: "skill-javascript", to: "skill-vue", strength: 0.7 },
      { from: "skill-react", to: "skill-vite", strength: 0.8 },
      { from: "skill-vue", to: "skill-vite", strength: 0.75 },
      { from: "skill-cognodb", to: "skill-graphql", strength: 0.6 },
      { from: "skill-postgresql", to: "skill-redis", strength: 0.7 },
      { from: "skill-kafka", to: "skill-microservices", strength: 0.8 }
    ];

    for (const rel of relatedSkills) {
      await session.run(`
        MATCH (s1:Skill {id: $from}), (s2:Skill {id: $to})
        MERGE (s1)-[:RELATED_TO {strength: $strength}]->(s2)
      `, rel);
    }

    // Role REQUIRES Skill (Role -> Skill)
    const roleRequirements = [
      // Junior Backend (Java, Spring Boot, SQL, REST APIs, Git)
      { roleId: "role-backend-junior", skillId: "skill-java", importance: 0.9 },
      { roleId: "role-backend-junior", skillId: "skill-springboot", importance: 0.95 },
      { roleId: "role-backend-junior", skillId: "skill-sql", importance: 0.8 },
      { roleId: "role-backend-junior", skillId: "skill-rest", importance: 0.85 },
      { roleId: "role-backend-junior", skillId: "skill-git", importance: 0.8 },

      // Senior Backend (Java, Spring Boot, SQL, REST APIs, Git, Docker, System Design, Microservices, Kubernetes, Redis)
      { roleId: "role-backend-senior", skillId: "skill-java", importance: 0.9 },
      { roleId: "role-backend-senior", skillId: "skill-springboot", importance: 0.9 },
      { roleId: "role-backend-senior", skillId: "skill-sql", importance: 0.8 },
      { roleId: "role-backend-senior", skillId: "skill-rest", importance: 0.85 },
      { roleId: "role-backend-senior", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-backend-senior", skillId: "skill-docker", importance: 0.9 },
      { roleId: "role-backend-senior", skillId: "skill-system-design", importance: 0.95 },
      { roleId: "role-backend-senior", skillId: "skill-microservices", importance: 0.9 },
      { roleId: "role-backend-senior", skillId: "skill-kubernetes", importance: 0.75 },
      { roleId: "role-backend-senior", skillId: "skill-redis", importance: 0.7 },

      // Junior Frontend (HTML/CSS, JavaScript, React, Git, REST APIs, Vite)
      { roleId: "role-frontend-junior", skillId: "skill-html-css", importance: 0.9 },
      { roleId: "role-frontend-junior", skillId: "skill-javascript", importance: 0.9 },
      { roleId: "role-frontend-junior", skillId: "skill-react", importance: 0.95 },
      { roleId: "role-frontend-junior", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-frontend-junior", skillId: "skill-rest", importance: 0.75 },
      { roleId: "role-frontend-junior", skillId: "skill-vite", importance: 0.7 },

      // Senior Frontend (HTML/CSS, JavaScript, TypeScript, React, Next.js, Git, REST APIs, System Design)
      { roleId: "role-frontend-senior", skillId: "skill-html-css", importance: 0.8 },
      { roleId: "role-frontend-senior", skillId: "skill-javascript", importance: 0.9 },
      { roleId: "role-frontend-senior", skillId: "skill-typescript", importance: 0.9 },
      { roleId: "role-frontend-senior", skillId: "skill-react", importance: 0.95 },
      { roleId: "role-frontend-senior", skillId: "skill-nextjs", importance: 0.85 },
      { roleId: "role-frontend-senior", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-frontend-senior", skillId: "skill-system-design", importance: 0.85 },

      // Mid Fullstack (JavaScript, React, Node.js, Express, SQL, PostgreSQL, MongoDB, Git, REST APIs)
      { roleId: "role-fullstack-mid", skillId: "skill-javascript", importance: 0.9 },
      { roleId: "role-fullstack-mid", skillId: "skill-react", importance: 0.85 },
      { roleId: "role-fullstack-mid", skillId: "skill-nodejs", importance: 0.9 },
      { roleId: "role-fullstack-mid", skillId: "skill-express", importance: 0.85 },
      { roleId: "role-fullstack-mid", skillId: "skill-sql", importance: 0.75 },
      { roleId: "role-fullstack-mid", skillId: "skill-postgresql", importance: 0.75 },
      { roleId: "role-fullstack-mid", skillId: "skill-mongodb", importance: 0.7 },
      { roleId: "role-fullstack-mid", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-fullstack-mid", skillId: "skill-rest", importance: 0.8 },

      // DevOps (Docker, Kubernetes, Linux, Bash, CI/CD, AWS, Terraform)
      { roleId: "role-devops", skillId: "skill-docker", importance: 0.95 },
      { roleId: "role-devops", skillId: "skill-kubernetes", importance: 0.9 },
      { roleId: "role-devops", skillId: "skill-linux", importance: 0.85 },
      { roleId: "role-devops", skillId: "skill-bash", importance: 0.8 },
      { roleId: "role-devops", skillId: "skill-cicd", importance: 0.9 },
      { roleId: "role-devops", skillId: "skill-aws", importance: 0.85 },
      { roleId: "role-devops", skillId: "skill-terraform", importance: 0.9 },

      // Cloud Architect (AWS, GCP, Terraform, Docker, Kubernetes, System Design, Security)
      { roleId: "role-cloud-architect", skillId: "skill-aws", importance: 0.95 },
      { roleId: "role-cloud-architect", skillId: "skill-gcp", importance: 0.8 },
      { roleId: "role-cloud-architect", skillId: "skill-terraform", importance: 0.9 },
      { roleId: "role-cloud-architect", skillId: "skill-docker", importance: 0.75 },
      { roleId: "role-cloud-architect", skillId: "skill-kubernetes", importance: 0.8 },
      { roleId: "role-cloud-architect", skillId: "skill-system-design", importance: 0.95 },
      { roleId: "role-cloud-architect", skillId: "skill-security", importance: 0.9 },

      // Data Engineer (Python, SQL, PostgreSQL, Linux, Bash, Git, Kafka)
      { roleId: "role-data-engineer", skillId: "skill-python", importance: 0.9 },
      { roleId: "role-data-engineer", skillId: "skill-sql", importance: 0.95 },
      { roleId: "role-data-engineer", skillId: "skill-postgresql", importance: 0.85 },
      { roleId: "role-data-engineer", skillId: "skill-linux", importance: 0.7 },
      { roleId: "role-data-engineer", skillId: "skill-bash", importance: 0.7 },
      { roleId: "role-data-engineer", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-data-engineer", skillId: "skill-kafka", importance: 0.85 },

      // Tech Lead (Java or Javascript, System Design, Microservices, Agile, Git, Security)
      { roleId: "role-tech-lead", skillId: "skill-system-design", importance: 0.95 },
      { roleId: "role-tech-lead", skillId: "skill-microservices", importance: 0.9 },
      { roleId: "role-tech-lead", skillId: "skill-agile", importance: 0.9 },
      { roleId: "role-tech-lead", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-tech-lead", skillId: "skill-security", importance: 0.85 },
      { roleId: "role-tech-lead", skillId: "skill-java", importance: 0.7 },

      // QA Automation (Python, JavaScript, Testing, Git, CI/CD)
      { roleId: "role-qa-engineer", skillId: "skill-python", importance: 0.85 },
      { roleId: "role-qa-engineer", skillId: "skill-javascript", importance: 0.75 },
      { roleId: "role-qa-engineer", skillId: "skill-testing", importance: 0.95 },
      { roleId: "role-qa-engineer", skillId: "skill-git", importance: 0.8 },
      { roleId: "role-qa-engineer", skillId: "skill-cicd", importance: 0.75 },

      // UI Designer (Figma, HTML/CSS, Tailwind)
      { roleId: "role-ui-designer", skillId: "skill-figma", importance: 0.95 },
      { roleId: "role-ui-designer", skillId: "skill-html-css", importance: 0.8 },
      { roleId: "role-ui-designer", skillId: "skill-tailwind", importance: 0.75 },

      // Graph Engineer (CognoDB, SQL, REST, GraphQL, Nodejs, System Design)
      { roleId: "role-graph-engineer", skillId: "skill-cognodb", importance: 0.98 },
      { roleId: "role-graph-engineer", skillId: "skill-sql", importance: 0.8 },
      { roleId: "role-graph-engineer", skillId: "skill-rest", importance: 0.8 },
      { roleId: "role-graph-engineer", skillId: "skill-graphql", importance: 0.85 },
      { roleId: "role-graph-engineer", skillId: "skill-nodejs", importance: 0.8 },
      { roleId: "role-graph-engineer", skillId: "skill-system-design", importance: 0.85 }
    ];

    for (const rel of roleRequirements) {
      await session.run(`
        MATCH (r:Role {id: $roleId}), (s:Skill {id: $skillId})
        MERGE (r)-[:REQUIRES {importance: $importance}]->(s)
      `, rel);
    }

    // Project DEMONSTRATES Skill (Project -> Skill)
    const projectSkills = [
      { projectId: "proj-ecommerce", skillId: "skill-java" },
      { projectId: "proj-ecommerce", skillId: "skill-springboot" },
      { projectId: "proj-ecommerce", skillId: "skill-microservices" },
      { projectId: "proj-ecommerce", skillId: "skill-postgresql" },
      { projectId: "proj-ecommerce", skillId: "skill-docker" },
      
      { projectId: "proj-dashboard", skillId: "skill-javascript" },
      { projectId: "proj-dashboard", skillId: "skill-react" },
      { projectId: "proj-dashboard", skillId: "skill-vite" },
      { projectId: "proj-dashboard", skillId: "skill-tailwind" },

      { projectId: "proj-infra", skillId: "skill-terraform" },
      { projectId: "proj-infra", skillId: "skill-kubernetes" },
      { projectId: "proj-infra", skillId: "skill-aws" },

      { projectId: "proj-pipeline", skillId: "skill-python" },
      { projectId: "proj-pipeline", skillId: "skill-postgresql" },
      { projectId: "proj-pipeline", skillId: "skill-kafka" },

      { projectId: "proj-graph", skillId: "skill-cognodb" },
      { projectId: "proj-graph", skillId: "skill-graphql" },
      { projectId: "proj-graph", skillId: "skill-react" },

      { projectId: "proj-chat", skillId: "skill-nodejs" },
      { projectId: "proj-chat", skillId: "skill-javascript" },

      { projectId: "proj-auth", skillId: "skill-express" },
      { projectId: "proj-auth", skillId: "skill-redis" },
      { projectId: "proj-auth", skillId: "skill-security" },

      { projectId: "proj-blog", skillId: "skill-nextjs" },
      { projectId: "proj-blog", skillId: "skill-typescript" },

      { projectId: "proj-billing", skillId: "skill-fastapi" },
      { projectId: "proj-billing", skillId: "skill-python" },

      { projectId: "proj-monitor", skillId: "skill-kubernetes" },
      { projectId: "proj-monitor", skillId: "skill-linux" },

      { projectId: "proj-social", skillId: "skill-cognodb" },
      { projectId: "proj-social", skillId: "skill-system-design" },

      { projectId: "proj-mobile", skillId: "skill-figma" },
      { projectId: "proj-mobile", skillId: "skill-html-css" },

      { projectId: "proj-cache", skillId: "skill-redis" },

      { projectId: "proj-scraper", skillId: "skill-mongodb" },
      { projectId: "proj-scraper", skillId: "skill-python" },

      { projectId: "proj-compiler", skillId: "skill-golang" },

      { projectId: "proj-search", skillId: "skill-elasticsearch" }, // Elastic is bypassed, map to system design
      { projectId: "proj-search", skillId: "skill-system-design" },

      { projectId: "proj-ci", skillId: "skill-cicd" },
      { projectId: "proj-ci", skillId: "skill-docker" },

      { projectId: "proj-game", skillId: "skill-html-css" },
      { projectId: "proj-game", skillId: "skill-javascript" },

      { projectId: "proj-api-gateway", skillId: "skill-rest" },
      { projectId: "proj-api-gateway", skillId: "skill-bash" },

      { projectId: "proj-data-viz", skillId: "skill-javascript" }
    ];

    for (const rel of projectSkills) {
      await session.run(`
        MATCH (p:Project {id: $projectId}), (s:Skill {id: $skillId})
        MERGE (p)-[:DEMONSTRATES]->(s)
      `, rel);
    }

    // Resource TEACHES Skill (Resource -> Skill)
    const resourceSkills = [
      { resourceId: "res-spring", skillId: "skill-springboot" },
      { resourceId: "res-java", skillId: "skill-java" },
      { resourceId: "res-docker", skillId: "skill-docker" },
      { resourceId: "res-docker", skillId: "skill-docker-compose" },
      { resourceId: "res-k8s", skillId: "skill-kubernetes" },
      { resourceId: "res-sysdesign", skillId: "skill-system-design" },
      { resourceId: "res-sysdesign", skillId: "skill-microservices" },
      { resourceId: "res-react", skillId: "skill-react" },
      { resourceId: "res-nextjs", skillId: "skill-nextjs" },
      { resourceId: "res-ts", skillId: "skill-typescript" },
      { resourceId: "res-sql", skillId: "skill-sql" },
      { resourceId: "res-postgres", skillId: "skill-postgresql" },
      { resourceId: "res-express", skillId: "skill-express" },
      { resourceId: "res-node", skillId: "skill-nodejs" },
      { resourceId: "res-aws", skillId: "skill-aws" },
      { resourceId: "res-terraform", skillId: "skill-terraform" },
      { resourceId: "res-git", skillId: "skill-git" },
      { resourceId: "res-fastapi", skillId: "skill-fastapi" },
      { resourceId: "res-mongo", skillId: "skill-mongodb" },
      { resourceId: "res-redis", skillId: "skill-redis" },
      { resourceId: "res-cognodb", skillId: "skill-cognodb" },
      { resourceId: "res-micro", skillId: "skill-microservices" },
      { resourceId: "res-figma", skillId: "skill-figma" },
      { resourceId: "res-tailwind", skillId: "skill-tailwind" },
      { resourceId: "res-python", skillId: "skill-python" },
      { resourceId: "res-django", skillId: "skill-django" },
      { resourceId: "res-cicd", skillId: "skill-cicd" },
      { resourceId: "res-linux", skillId: "skill-linux" },
      { resourceId: "res-linux", skillId: "skill-bash" },
      { resourceId: "res-graphql", skillId: "skill-graphql" },
      { resourceId: "res-kafka", skillId: "skill-kafka" },
      { resourceId: "res-vite", skillId: "skill-vite" },
      { resourceId: "res-sec", skillId: "skill-security" }
    ];

    for (const rel of resourceSkills) {
      await session.run(`
        MATCH (r:Resource {id: $resourceId}), (s:Skill {id: $skillId})
        MERGE (r)-[:TEACHES]->(s)
      `, rel);
    }

    // Company OFFERS Role (Company -> Role)
    const companyRoles = [
      { companyId: "comp-techcorp", roleId: "role-backend-senior" },
      { companyId: "comp-techcorp", roleId: "role-devops" },
      { companyId: "comp-techcorp", roleId: "role-tech-lead" },
      { companyId: "comp-softsolutions", roleId: "role-frontend-junior" },
      { companyId: "comp-softsolutions", roleId: "role-fullstack-mid" },
      { companyId: "comp-innovatelabs", roleId: "role-graph-engineer" },
      { companyId: "comp-innovatelabs", roleId: "role-backend-junior" },
      { companyId: "comp-cloudscale", roleId: "role-cloud-architect" },
      { companyId: "comp-cloudscale", roleId: "role-devops" },
      { companyId: "comp-datadynamics", roleId: "role-data-engineer" },
      { companyId: "comp-fintechinc", roleId: "role-backend-senior" },
      { companyId: "comp-fintechinc", roleId: "role-qa-engineer" },
      { companyId: "comp-webstudios", roleId: "role-ui-designer" },
      { companyId: "comp-webstudios", roleId: "role-frontend-senior" },
      { companyId: "comp-devshop", roleId: "role-fullstack-mid" }
    ];

    for (const rel of companyRoles) {
      await session.run(`
        MATCH (c:Company {id: $companyId}), (r:Role {id: $roleId})
        MERGE (c)-[:OFFERS]->(r)
      `, rel);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
