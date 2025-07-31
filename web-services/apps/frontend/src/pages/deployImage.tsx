import { motion } from "framer-motion";
import { useState } from "react";
import { Container } from "lucide-react";
import { Form } from "@/components/DeployImage/Form";
import { CostEstimation } from "@/components/DeployImage/CostEstimation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Machine } from "types/depinMachines";
import { PayementGateway } from "@/components/DeployImage/PaymentGateway";

export function DeployApp() {
    const [vm, setVm] = useState<Machine>();
    const [escrowAmount, setEscrowAmount] = useState(0.1);
    const [step, setStep] = useState(0);

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
                className="text-center"
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

            <div className={`${vm ? "grid lg:grid-cols-3 transisition duration-300 ease-in-out": "flex justify-center items-center w-full"}`}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${vm ? "lg:col-span-2" : "w-4xl"}`}
                >
                    {step === 0 && <Form formData={formData} setFormData={setFormData} setVm={setVm} setStep={setStep}/>}
                    {(step === 1 && vm) && <PayementGateway escrowAmount={escrowAmount} setEscrowAmount={setEscrowAmount} vmId={vm?.id} form={formData} PricePerHour={vm?.PerHourPrice} setVm={setVm}/>}
                </motion.div>

                {vm && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <CostEstimation PerHourPrice={vm.PerHourPrice || 0} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}