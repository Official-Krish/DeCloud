
import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, HardDrive, MemoryStick, Clock } from "lucide-react";

export function PricingCalculator() {
  const [cpu, setCpu] = useState([2]);
  const [memory, setMemory] = useState([4]);
  const [storage, setStorage] = useState([50]);
  const [duration, setDuration] = useState([24]);

  // Calculate cost based on configuration
  const calculateCost = () => {
    const baseCost = 0.01; // Base cost per hour
    const cpuMultiplier = cpu[0] * 0.01;
    const memoryMultiplier = memory[0] * 0.005;
    const storageMultiplier = storage[0] * 0.001;
    const hourlyRate = baseCost + cpuMultiplier + memoryMultiplier + storageMultiplier;
    const totalCost = hourlyRate * duration[0];
    return { hourlyRate, totalCost };
  };

  const { hourlyRate, totalCost } = calculateCost();

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Transparent Pricing Calculator
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    See exactly what you'll pay before you deploy. No hidden fees, no surprises.
                </p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <Card className="border border-border/50 bg-accent/30">
                    <CardContent className="p-8">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Configuration */}
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="flex items-center space-x-2">
                                            <Cpu className="h-4 w-4 text-cyan-600" />
                                            <span>CPU Cores</span>
                                        </Label>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {cpu[0]} vCPU{cpu[0] > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <Slider
                                        value={cpu}
                                        onValueChange={setCpu}
                                        max={16}
                                        min={1}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="flex items-center space-x-2">
                                            <MemoryStick className="h-4 w-4 text-cyan-600" />
                                            <span>Memory</span>
                                        </Label>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {memory[0]} GB RAM
                                        </span>
                                    </div>
                                    <Slider
                                        value={memory}
                                        onValueChange={setMemory}
                                        max={64}
                                        min={1}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                    <Label className="flex items-center space-x-2">
                                        <HardDrive className="h-4 w-4 text-cyan-600" />
                                        <span>Storage</span>
                                    </Label>
                                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                        {storage[0]} GB SSD
                                    </span>
                                    </div>
                                    <Slider
                                        value={storage}
                                        onValueChange={setStorage}
                                        max={500}
                                        min={20}
                                        step={10}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                    <Label className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-cyan-600" />
                                        <span>Duration</span>
                                    </Label>
                                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                        {duration[0]} hour{duration[0] > 1 ? 's' : ''}
                                    </span>
                                    </div>
                                    <Slider
                                        value={duration}
                                        onValueChange={setDuration}
                                        max={168}
                                        min={1}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Pricing Display */}
                            <div className="flex flex-col justify-center">
                                <div className="text-center space-y-6">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-2">Hourly Rate</div>
                                        <div className="text-2xl font-mono font-bold">
                                            {hourlyRate.toFixed(3)} SOL
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ≈ ${(hourlyRate * 145.2).toFixed(2)} USD
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-border/50 w-full" />
                                    
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-2">Total Cost</div>
                                        <motion.div
                                            key={totalCost}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            className="text-4xl font-mono font-bold text-foreground"
                                        >
                                            {totalCost.toFixed(3)} SOL
                                        </motion.div>
                                        <div className="text-lg text-muted-foreground">
                                            ≈ ${(totalCost * 145.2).toFixed(2)} USD
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">
                                            for {duration[0]} hours
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
