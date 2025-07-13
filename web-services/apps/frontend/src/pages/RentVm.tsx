
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { FinalConfig, VMTypes } from "types/vm";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { calculatePrice } from "@/lib/vm";
import { Step1 } from "@/components/RentVm/Step1";
import { Step2 } from "@/components/RentVm/Step2";
import { NavigationButton } from "@/components/RentVm/NavigationButton";
import { CostSummary } from "@/components/RentVm/CostSummary";
import { CredentialModal } from "@/components/RentVm/CredentialModal";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TransferToVaultAndStartRental } from "@/lib/contract";
import { generateUUID } from "three/src/math/MathUtils.js";

export const RentVM = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vmName, setVmName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [os, setOs] = useState("");
  const [region, setRegion] = useState("");
  const [duration, setDuration] = useState(24);
  const [diskSize, setDiskSize] = useState(10);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [vms, setVms] = useState<VMTypes[]>([]);
  const [finalConfig, setFinalConfig] = useState<FinalConfig>();
  const wallet = useAnchorWallet();

  const steps = [
    { number: 1, title: "Instance Configuration", description: "Choose your VM configuration and basic settings" },
    { number: 2, title: "Review & Deploy", description: "Review configuration and deploy your VM" }
  ];

  useEffect(() => {
    const fetchVMConfigs = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/vm/getVMTypes`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        setVms(res.data);
      } catch (error) {
        console.error("Error fetching VM configurations:", error);
      }
    }
    fetchVMConfigs();
  }, [])

  const selectedVMConfig = vms.find(config => config.id === selectedConfig);
  const [costPerMin, setCostPerMin] = useState(0);

  useEffect(() => {
    const fetchCostPerMin = async () => {
      if (selectedVMConfig) {
        const price = await calculatePrice(selectedVMConfig.machineType, diskSize, 1);
        setCostPerMin(Number(price));
      }
    };
    fetchCostPerMin();
  }, [selectedVMConfig, diskSize]);

  const canProceedToStep2 = (vmName && selectedConfig && region && os);

  const handlePayment = async () => {
    setIsConfirmOpen(false);
    const id = generateUUID();
    const tx = await TransferToVaultAndStartRental(costPerMin * duration, duration, id ,wallet!)
    if (!tx) {
      toast.error("Transaction failed. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/vmInstance/create`, {
        name: vmName,
        price: costPerMin * duration,
        region,
        os,
        diskSize,
        endTime: duration,
        machineType: selectedVMConfig?.machineType,
        provider: "GCP", // Assuming GCP for now, can be dynamic based on selectedConfig
      }, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      if (res.status === 200) {
        toast.success("VM instance created successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setFinalConfig({
          vmId: res.data.vmId,
          instanceId: res.data.instanceId,
          ipAddress: res.data.ip,
          privateKey: res.data.privateKey,
        });
        setIsCredentialsOpen(true);
      } else {
        toast.error("Failed to create VM instance. Please try again.", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        console.error("Failed to create VM instance:", res.data);
      }
    } catch (error) {
      console.error("Error creating VM instance:", error);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Rent VM Instance</h1>
        <p className="text-muted-foreground">Deploy your virtual machine with predefined configurations</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-8 mb-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep === step.number 
                  ? 'bg-primary text-primary-foreground' 
                  : currentStep > step.number
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.number ? '✓' : step.number}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-muted-foreground text-sm">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <Step1
              vms={vms}
              vmName={vmName}
              setVmName={setVmName}
              diskSize={diskSize}
              setDiskSize={setDiskSize}
              region={region}
              setRegion={setRegion}
              os={os}
              setOs={setOs}
              duration={duration}
              setDuration={setDuration}
              selectedVMConfig={selectedVMConfig || null}
              setSelectedVMConfig={(config) => setSelectedConfig(config?.id || "")}
              setStep={setCurrentStep}
              selectedConfig={selectedConfig}
              setSelectedConfig={setSelectedConfig}
            />
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && (
            <Step2
              vmName={vmName}
              selectedVMConfig={selectedVMConfig || null}
              diskSize={diskSize}
              region={region}
              os={os}
              duration={duration}
            />
          )}

          {/* Navigation Buttons */}
          <NavigationButton
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            canProceedToStep2={canProceedToStep2}
            isConfirmOpen={isConfirmOpen}
            setIsConfirmOpen={setIsConfirmOpen}
            costPerMin={costPerMin}
            duration={duration}
            handlePayment={() => {
              handlePayment();
            }}
          />
        </div>

        {/* Cost Summary Sidebar */}
        <CostSummary  
          selectedVMConfig={selectedVMConfig || null}
          costPerMin={costPerMin}
          duration={duration}
        />
      </div>

      {/* VM Credentials Modal */}
      <CredentialModal
        isCredentialsOpen={isCredentialsOpen}
        setIsCredentialsOpen={setIsCredentialsOpen}
        vmName={vmName}
        region={region}
        finalConfig={finalConfig} 
      />
    </div>
  );
}