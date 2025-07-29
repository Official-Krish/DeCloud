import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"

interface CostEstimationProps {
    PerHourPrice: number;
}

export const CostEstimation = ({ PerHourPrice }: CostEstimationProps) => {
    return (
        <div>
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <span>Cost Estimation</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-sm">1 Hour Cost</span>
                            <span className="text-sm">{PerHourPrice} SOL</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">24 Hour Cost</span>
                            <span className="text-sm">{PerHourPrice * 24} SOL</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">30 Days Cost</span>
                            <span className="text-sm">{PerHourPrice * 24 * 30} SOL</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}