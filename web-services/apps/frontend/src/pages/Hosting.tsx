import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Download, Shield, User } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";

export function Hosting() {
    const wallet = useWallet();

    const steps = [
        {
            icon: User,
            title: "Register as Host",
            description: "Sign up to become a compute provider in our decentralized network",
            command: "Join our hosting network"
        },
        {
            icon: Download,
            title: "Install Host CLI",
            description: "Download and install the decloud host CLI on your machine",
            command: "curl -sSL https://assets.krishdev.xyz/DeCloud/verification_script.sh | bash"
        },
        {
            icon: Shield,
            title: "Verification",
            description: "Our system will verify your machine's resources and capabilities",
            command: "Run the verification command provided after installation"
        }
    ];

    if (!wallet.connected || !localStorage.getItem("token")) {
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
        <div className="dark:bg-gradient-to-br from-background via-background to-muted/30 w-full h-full">
            <ComingSoon isDepin={true}/>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Server className="h-4 w-4" />
                        <span>DePIN Hosting Network</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Become a <span className="gradient-text">Compute Provider</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Join our decentralized physical infrastructure network and earn SOL by providing 
                        computing resources to developers and businesses worldwide.
                    </p>
                </motion.div>

                {/* Getting Started Steps */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="my-16"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">How to Get Started</h2>
                        <p className="text-lg text-muted-foreground">
                            Join our hosting network in three simple steps
                        </p>
                    </div>

                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="relative"
                            >
                                <Card className="border-border/50 bg-card/30">
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                                    <step.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        Step {index + 1}
                                                    </Badge>
                                                    <h3 className="text-xl font-semibold">{step.title}</h3>
                                                </div>
                                            
                                                <p className="text-muted-foreground mb-4 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            
                                {/* Connecting line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-8 top-full h-8 w-px bg-gradient-to-b from-emerald-500/30 to-transparent" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}