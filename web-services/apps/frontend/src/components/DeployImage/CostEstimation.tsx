import { DollarSign } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"

interface CostEstimationProps {
    formData: {
        cpu: string;
        ram: string;     
        diskSize: string;
    };  
}

export const CostEstimation = ({ formData }: CostEstimationProps) => {
    const estimatedCost = (
        parseFloat(formData.cpu) * 0.02 + 
        parseFloat(formData.ram) * 0.01 + 
        parseFloat(formData.diskSize) * 0.001
    ) * 24;
    return (
        <div>
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Cost Estimation</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-sm">CPU ({formData.cpu} cores)</span>
                            <span className="text-sm">{(parseFloat(formData.cpu) * 0.02 * 24).toFixed(2)} SOL/day</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Memory ({formData.ram} GB)</span>
                            <span className="text-sm">{(parseFloat(formData.ram) * 0.01 * 24).toFixed(2)} SOL/day</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Storage ({formData.diskSize} GB)</span>
                            <span className="text-sm">{(parseFloat(formData.diskSize) * 0.001 * 24).toFixed(2)} SOL/day</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Total Estimated Cost</span>
                            <span className="text-blue-600">{estimatedCost.toFixed(2)} SOL/day</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}