import type { VMTypes } from "types/vm";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { calculatePrice } from "@/lib/vm";
import { operatingSystems, regions } from "@/lib/constants";

export const Step1 = ({
    vmName,
    setVmName,
    vms,
    selectedConfig,
    setSelectedConfig,
    diskSize,
    setDiskSize,
    region,
    setRegion,
    os,
    setOs,
    duration = 1, 
    setDuration
}: {
    selectedVMConfig: VMTypes | null;
    setSelectedVMConfig: (config: VMTypes | null) => void;
    setStep: (step: number) => void;
    vmName: string;
    setVmName: (name: string) => void;
    vms: VMTypes[];
    selectedConfig?: string;
    setSelectedConfig: (configId: string) => void;
    diskSize: number;
    setDiskSize: (size: number) => void;
    region: string;
    setRegion: (region: string) => void;
    os: string;
    setOs: (os: string) => void;
    duration: number; 
    setDuration: (duration: number) => void;
}) => {
    return (
        <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* VM Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Instance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="vm-name">Instance Name</Label>
                    <Input
                      id="vm-name"
                      placeholder="my-vm-instance"
                      value={vmName}
                      onChange={(e) => setVmName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Machine Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Machine Configuration</CardTitle>
                  <CardDescription>Choose a predefined machine type for your workload</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {vms.map((config) => (
                      <div
                        key={config.id as React.Key}
                        onClick={() => setSelectedConfig(config.id as string)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                          selectedConfig === config.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-background'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{config.machineType}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                                <span>{Number(config.cpu)} vCPU{Number(config.cpu) > 1 ? 's' : ''}</span>
                                <span>{Number(config.ram)} GB RAM</span>
                                <span>10 GB Disk Size</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-medium">{calculatePrice(config.machineType, diskSize)} SOL/hr</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Region & OS */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Region</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((regionOption) => (
                          <SelectItem key={regionOption.value} value={regionOption.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{regionOption.label}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {regionOption.latency}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operating System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {operatingSystems.map((osOption) => (
                        <div
                          key={osOption.value}
                          onClick={() => setOs(osOption.value)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                            os === osOption.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{osOption.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{osOption.label}</div>
                              <div className="text-xs text-muted-foreground">{osOption.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SSH & Duration */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Disk Size (Gb)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="20"
                      value={diskSize}
                      onChange={(e) => setDiskSize(parseInt(e.target.value) || 1)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        </div>
    )
};