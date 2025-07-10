import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";

interface NavigationButtonProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    canProceedToStep2: string;
    isConfirmOpen: boolean;
    setIsConfirmOpen: (open: boolean) => void;
    costPerHour: string;
    duration: number;
    handlePayment: () => void;
}

export const NavigationButton = ({
    currentStep,
    setCurrentStep,
    canProceedToStep2,
    isConfirmOpen,
    setIsConfirmOpen,
    costPerHour,
    duration,
    handlePayment,
}: NavigationButtonProps) => {
    return (
        <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            {currentStep < 2 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToStep2}
                className="flex items-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Deploy Instance</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deployment</DialogTitle>
                    <DialogDescription>
                      You're about to deploy your VM instance with the following cost.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold font-mono mb-2">
                        {Number(costPerHour) * duration} SOL
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        For{duration} hour(s) at {costPerHour} SOL/hr
                      </div>
                    </div>
                    <Button className="w-full" onClick={handlePayment}>
                      Confirm & Pay with Solana
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
        </div>
    );
}