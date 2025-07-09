import { FeaturesSection } from "@/components/LandingPage/Features";
import { Hero } from "@/components/LandingPage/Hero";
import { PricingCalculator } from "@/components/LandingPage/PricingCalculator";
import Steps from "@/components/LandingPage/Steps";
import WaitList from "@/components/LandingPage/waitlist";

const Landing = () => {
    return (
        <div className="dark:bg-neutral-950 bg-neutral-100 w-full min-h-screen">
            <Hero />
            <FeaturesSection />
            <PricingCalculator />
            <Steps />
            <WaitList />
        </div>
    )
}
export default Landing;