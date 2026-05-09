import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import {Button} from "../../components/ui/Button";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tars - AI Architectural Visualizer" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);
    const [showDemo, setShowDemo] = useState(false);

    const handleUploadComplete = async (base64Image: string) => {
        try {
            if(isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const newId = Date.now().toString();
            const name =`Residence ${newId}`;

            const newItem = {
                id: newId, name, sourceImage: base64Image,
                renderedImage: undefined,
                timestamp: Date.now()
            }

            console.log("Creating project...");
            const saved = await createProject({ item: newItem, visibility: 'private' });
            console.log('Save result:', saved);

            if (!saved) {
                console.error("Failed to create project");
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            // Persist the base64Image into localStorage
            // const existingUploadsJson = localStorage.getItem("uploads");
            // const existingUploads = existingUploadsJson ? JSON.parse(existingUploadsJson) : [];
            //
            // const newUpload = {
            //     id: newId,
            //     image: base64Image,
            //     timestamp: Date.now()
            // };

            // existingUploads.push(newUpload);
            // localStorage.setItem("uploads", JSON.stringify(existingUploads));

            navigate(`/visualizer/${newId}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRender: saved.renderedImage || null,
                    name: saved.name,
                }
            });

            return true;
        } finally {
            isCreatingProjectRef.current = false;
        }
    }

    useEffect(() => {
        const fetchProjects = async () => {
            const items = await getProjects();

            setProjects(items)
        }

        fetchProjects()
    }, []);

  return (
      <div className = "home">
        <Navbar />

          <section className="hero">
              <div className="announce">
                  <div className="dot">
                      <div className="pulse"></div>
                  </div>

                  <p>Introducing Tars 3.0</p>
              </div>

              <h1>Build exquisite spaces at speed of thought with Tars</h1>

             <p className="subtitle">
                 Tars is an AI-first design environment that helps you visualize, render and ship architectural products faster than ever.
             </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Start Building <ArrowRight className="icon"/>

                  </a>

                  <Button variant="outline" size="lg" className="demo"  onClick={() => setShowDemo(true)}>
                      Watch Demo
                  </Button>
              </div>

              <div id="upload" className="upload-shell">
                  <div className="grid-overlay" />

                      <div className="upload-card">
                          <div className="upload-head">
                              <div className="upload-icon">
                                  <Layers className="icon" />
                              </div>

                              <h3>Upload your floor plan</h3>
                              <p>Supports JPG, PNG, formats upto 10MB</p>
                          </div>

                          <Upload onComplete={handleUploadComplete} />
                      </div>
              </div>
          </section>

          <section className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projects</h2>
                          <p>Your latest work and community projects, all at one place.</p>
                      </div>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp}) => (
                          <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                            <div className="preview">
                                <img src= {renderedImage || sourceImage}
                                    alt="project"
                                />

                                <div className="badge">
                                    <span>Community</span>
                                </div>
                            </div>

                            <div className="card-body">
                                <div>
                                    <h3>{name}</h3>

                                    <div className="meta">
                                        <Clock size={12} />
                                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                                        <span>By Anonymous_03</span>
                                    </div>
                                </div>
                                <div className="arrow">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
          {showDemo && (
              <div
                  style={{
                      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
                      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onClick={() => setShowDemo(false)}
              >
                  <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '900px', aspectRatio: '16/9', position: 'relative' }}>
                      <iframe
                          width="100%"
                          height="100%"
                          src="https://www.youtube.com/embed/XaQKKO3xV6U?autoplay=1"
                          title="Demo Video"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                      />
                  </div>
              </div>
          )}
      </div>
  )
}