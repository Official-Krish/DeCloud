
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  ArrowLeft, 
  Terminal, 
  Copy, 
  Trash2,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";
import { type VM } from "../../types/vm";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";

export function VMDetails() {
  const wallet = useWallet();
  const { id } = useParams();
  const [vm, setVm] = useState<VM>();
  const navigate = useNavigate();

  useEffect(()=> {
    const fetchVMDetails = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/vmInstnace/${id}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        setVm(response.data);
      } catch (error) {
        console.error("Error fetching VM details:", error);
      }
    };

    fetchVMDetails();
  },[])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    
  };

  const handleDelete = async () => {
    try {
        const res = await axios.delete(`${BACKEND_URL}/vmInstnace/destroy/vmId=${id}&instanceId=${vm?.instanceId}&zone=${vm?.region}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          navigate("/dashboard");
        } else {
            alert("Failed to delete VM");
        }
    } catch (error) {
        console.error("Error deleting VM:", error);
    }
  };

  if (!vm) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-muted-foreground">Loading VM details...</p>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/dashboard">
            <Button variant="outline" className="cursor-pointer" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">{vm.name}</h1>
            <StatusBadge status={vm.status} />
          </div>
          
          <div className="flex items-center space-x-2">
            
            <Button variant="destructive" size="sm" className="cursor-pointer" onClick={() => handleDelete()}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground mt-2">
          Instance ID: {vm.id} • Created {vm.createdAt}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Instance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-xs text-muted-foreground">Machine Type</Label>
                    <div className="font-medium">{vm.cpu}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Zone</Label>
                    <div className="font-medium">{vm.region}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Operating System</Label>
                    <div className="font-medium">{vm.os}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">IP Address</Label>
                    <div className="font-mono text-sm flex items-center space-x-2">
                      <span>{vm.ipAddress}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(vm.ipAddress)}
                        className="h-6 w-6 p-0 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Time Left</Label>
                    <div className="font-mono text-sm">{Number(Date.now()) - Number(vm.endTime)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Uptime</Label>
                    <div className="font-medium">{Number(Date.now()) - Number(vm.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hardware Specs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Hardware Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-xl mb-3 mx-auto">
                      <Cpu className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{vm.cpu}</div>
                    <div className="text-sm text-muted-foreground">Processing Power</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl mb-3 mx-auto">
                      <MemoryStick className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{vm.diskSize}</div>
                    <div className="text-sm text-muted-foreground">System Memory</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-3 mx-auto">
                      <HardDrive className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{vm.diskSize}</div>
                    <div className="text-sm text-muted-foreground">SSD Storage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SSH Access */}
          {vm.sshEnabled && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5" />
                    <span>SSH Access</span>
                  </CardTitle>
                  <CardDescription>
                    Connect to your instance using SSH
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>SSH Command</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => copyToClipboard(`ssh ubuntu@${vm.ipAddress}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                      ssh ubuntu@{vm.ipAddress}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>With Private Key</Label>
                      <div className="flex space-x-2">
                        <Button 
                        className="cursor-pointer"
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`ssh -i ${vm.name}-key.pem ubuntu@${vm.ipAddress}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                      ssh -i {vm.name}-key.pem ubuntu@{vm.ipAddress}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => copyToClipboard(vm.ipAddress)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy IP Address
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(`/${vm.instanceId}`, '_blank')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                    Open in Browser
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}