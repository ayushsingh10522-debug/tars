import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "../../components/ui/Button";

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        const existingUploadsJson = localStorage.getItem("uploads");
        if (existingUploadsJson) {
            const uploads = JSON.parse(existingUploadsJson);
            const found = uploads.find((u: any) => u.id === id);
            if (found) {
                setProject(found);
            }
        }
    }, [id]);

    if (!project) {
        return (
            <div className="visualizer-route loading">
                <p>Loading project {id}...</p>
            </div>
        );
    }

    return (
        <div className="visualizer">
            <Navbar />
            
            <div className="topbar mt-16">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="exit"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="icon" />
                    Back to Gallery
                </Button>

                <div className="panel-actions">
                    <Button variant="outline" size="sm" className="share">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button size="sm" className="export">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <main className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project ID: {id}</p>
                            <h2>Visualizer Output</h2>
                            <div className="note">
                                Created on {new Date(project.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="render-area">
                        {project.image ? (
                            <img 
                                src={project.image} 
                                alt="Project Visualizer" 
                                className="render-img"
                            />
                        ) : (
                            <div className="render-placeholder">
                                <p>No image found for this project.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VisualizerId;