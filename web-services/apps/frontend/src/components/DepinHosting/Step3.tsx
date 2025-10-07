import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { onboardingScript } from './constants/scripts';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export const Step3 = () => {
    const navigate = useNavigate();
    return (
        <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <CardTitle className='mb-2'>
                        Verification Successful!
                    </CardTitle>
                    <CardDescription>
                        Your machine is verified. Run this final script to install the SolNet agent, and start earning SOL.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CodeBlock script={onboardingScript}/>
                    <Button 
                        onClick={() => navigate("/depin/host/dashboard")} 
                        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg cursor-pointer" 
                        size="lg"
                    >
                        Complete Onboarding & Go to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}