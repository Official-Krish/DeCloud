import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";

interface NavigationButtonProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    canProceedToStep2: string;
    isConfirmOpen: boolean;
    setIsConfirmOpen: (open: boolean) => void;
    costPerMin: Number;
    duration: number;
    handlePayment: () => void;
    paymentStatus: "Failed" | "Success" | "Pending" | "not_started";
}

export const NavigationButton = ({
  currentStep,
  setCurrentStep,
  canProceedToStep2,
  isConfirmOpen,
  setIsConfirmOpen,
  costPerMin,
  duration,
  handlePayment,
  paymentStatus
}: NavigationButtonProps) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      {currentStep < 2 ? (
        <Button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={!canProceedToStep2}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <span>Continue</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Dialog open={isConfirmOpen} 
          onOpenChange={(open) => {
            if (paymentStatus !== "Pending") {
              setIsConfirmOpen(open);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 cursor-pointer">
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
                  {(Number(costPerMin) * duration).toFixed(6)} SOL
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  For {duration} Min(s) at {(Number(costPerMin) * 60).toFixed(6)} SOL/hr
                </div>
              </div>
              {paymentStatus === "Pending" ? (
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">
                    Checking payment status...
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full cursor-pointer"
                  onClick={handlePayment}
                  disabled={paymentStatus === "Failed"}
                >
                  {paymentStatus === "Failed" ? "Retry Deployment" : "Confirm Deployment"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}