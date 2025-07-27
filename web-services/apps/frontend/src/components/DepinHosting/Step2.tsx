import { CardHeader, CardTitle, CardDescription, CardContent, Card } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';
import { Button } from '../ui/button';
import { Loader2, Shield } from 'lucide-react';
import { verificationScript } from './constants/scripts';

interface Step2Props {
    handleStep2Verify: () => Promise<void>;
    isLoading: boolean;
}

export const Step2 = ({ handleStep2Verify, isLoading }: Step2Props) => {
    return (
        <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-cyan-500" />
                        <span>Run Verification Script</span>
                    </CardTitle>
                    <CardDescription>
                        Copy and run this command on your machine. This allows us to verify its specs and availability before adding it to the network.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CodeBlock script={verificationScript} />
                    <p className="text-sm text-muted-foreground">
                        After running the script, click the button below. We'll check for a successful connection from your machine.
                    </p>
                    <Button
                        onClick={handleStep2Verify}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg cursor-pointer"
                        size="lg"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Verifying...' : 'I Have Run the Script'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};