import { motion } from "framer-motion";
import { useState } from "react";
import { Container } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/components/DeployImage/Form";
import { CostEstimation } from "@/components/DeployImage/CostEstimation";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { BACKEND_URL } from "@/config";

export function DeployApp() {
    const [endTime, setEndTime] = useState<number | null>(null);
    const navigate = useNavigate();
    const wallet = useWallet();
    const [formData, setFormData] = useState({
        appName: "",
        dockerImage: "",
        description: "",
        cpu: "",
        ram: "",
        diskSize: "",
        ports: "",
        envVars: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BACKEND_URL}/depin/user/deploy`, {
                ...formData,
                endTime: endTime,
            }, {
                headers: {
                    Authorization: `${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                toast(
                    <div>
                        <strong>Application Deployed!</strong>
                        <p>Your Docker container is being deployed across the DePIN network.</p>
                    </div>
                );
                navigate("/dashboard");
                return;

            }
             else {
                console.error("Failed to deploy application:", res.data);
                toast.error(res.data.error || "Failed to deploy application. Please try again.");
                return;
            }

        } catch (error) {
            console.error("Error deploying application:", error);
            toast.error("Failed to deploy application. Please try again.");
            return;
        }
    };

    if (!wallet || !localStorage.getItem("token")) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold mb-4">Please SignIn</h1>
                    <p className="text-muted-foreground mb-6">Please connect your wallet and signInto manage your virtual machines.</p>
                    <Link to="/signin">
                        <Button className="cursor-pointer">SignIn</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full px-4 py-2 text-sm font-medium mb-6">
                    <Container className="h-4 w-4" />
                    <span>DePIN App Deployment</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                    Deploy Your <span className="gradient-text">Docker App</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Deploy your containerized applications across our decentralized infrastructure 
                    network for maximum reliability and cost efficiency.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <Form handleSubmit={handleSubmit} formData={formData} setFormData={setFormData}/>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <CostEstimation formData={formData} />
                </motion.div>
            </div>
        </div>
    );
}