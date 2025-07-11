import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { BackgroundBeams } from '../ui/background-beams';
import  { HoverBorderGradient }  from '@/components/ui/hover-border-gradient';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100">
      <BackgroundBeams/>
      <div className="absolute inset-0" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-64 bg-gradient-to-br from-accent/20 to-muted/20 rounded-3xl blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <HoverBorderGradient>
              <div className='flex items-center'>
                <img
                  src="./solana.png"
                  className="w-10 h-10 rounded-full mr-1"
                />
                <span>Powered by Solana</span>
              </div>
            </HoverBorderGradient>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Your Credit Card
            <br />
            <span className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent">
              Declined?
            </span>{' '}
            <span className="text-foreground">Good.</span>
            <br />
            <span className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent">
              We Take SOL.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Rent AWS, GCP, or decentralized machines in seconds. Or become a host
            and earn Solana for sharing your compute power.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-lg px-8 py-6 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 cursor-pointer">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}