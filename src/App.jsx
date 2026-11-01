import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Blogs } from "./pages/Blogs";
import { BlogDetail } from "./pages/BlogDetail";
import { KnowledgeTrails } from "./pages/KnowledgeTrails";
import { WriteBlog } from "./pages/WriteBlog";
import { Developers } from "./pages/Developers";
import { DeveloperProfile } from "./pages/DeveloperProfile";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { About } from "./pages/About";
import "./styles.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/knowledge-trails" element={<KnowledgeTrails />} />
        <Route path="/write-blog" element={<WriteBlog />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/developer-profile" element={<DeveloperProfile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
