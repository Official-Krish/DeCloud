import { FeaturesSection } from "@/components/LandingPage/Features";
import Hero from "@/components/LandingPage/Hero";
import { PricingCalculator } from "@/components/LandingPage/PricingCalculator";
import Steps from "@/components/LandingPage/Steps";
import WaitList from "@/components/LandingPage/waitlist";
import { motion } from "framer-motion";

const Landing = () => {
    return (
        <motion.div className="dark:bg-neutral-950 bg-neutral-100 min-h-screen realtive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
        >
            <Hero/>
            <FeaturesSection />
            <PricingCalculator />
            <Steps />
            <WaitList />
        </motion.div>
    )
}
export default Landing;