import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface CostSummaryProps {
  selectedVMConfig: { machineType: string } | null;
  costPerHour: string;
  duration: number;
}

export const CostSummary = ( { selectedVMConfig, costPerHour, duration }: CostSummaryProps ) => {
    return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedVMConfig ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Instance ({selectedVMConfig.machineType})</span>
                      <span className="font-mono">{costPerHour} SOL/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration</span>
                      <span>{duration} hours</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Cost</span>
                    <span className="font-mono">{Number(costPerHour) * duration} SOL</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Select a machine configuration to see pricing
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
    )
}