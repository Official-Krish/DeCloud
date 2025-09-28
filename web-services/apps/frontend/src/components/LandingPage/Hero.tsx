import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <motion.div 
        className="relative w-full h-screen overflow-hidden bg-black"
        initial={{ 
            opacity: 0, 
            filter: "blur(5px)",
        }}
        animate={{ 
            opacity: 1, 
            filter: "blur(0px)",
        }}
        transition={{ 
            duration: 1.5, 
            ease: "easeInOut"
        }}
    >
        {/* Video background */}
        <video
            src="https://assets.krishdev.xyz/DeCloud/decloud-hero.png"
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover z-0 left-20"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10" />
        {/* Text content */}
        <div className="relative z-20 flex flex-col justify-center h-full pl-6 pr-6 md:pl-24 md:pr-0 max-w-2xl">
            <motion.div
                className="flex justify-start mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <HoverBorderGradient>
                    <div className="flex items-center">
                    <motion.img
                        src="./solana.png"
                        className="w-10 h-10 rounded-full mr-1"
                    />
                    <span>Powered by Solana</span>
                    </div>
                </HoverBorderGradient>
            </motion.div>
            <motion.h1
                className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-left text-white drop-shadow-2xl"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                    duration: 1.2, 
                    delay: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
                <motion.span
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="block text-white"
                >
                    Your Credit Card
                </motion.span>
                <motion.span
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="block text-white"
                >
                    Declined?
                </motion.span>
                <motion.span
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="block text-white"
                >
                    We Got You Covered!
                </motion.span>
            </motion.h1>
            <motion.p
                className="text-lg sm:text-xl md:text-2xl text-neutral-300 mb-10 max-w-xl text-left leading-relaxed drop-shadow-lg"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                    duration: 1, 
                    delay: 1.1,
                    ease: "easeOut"
                }}
            >
                Rent AWS, GCP, or decentralized machines in seconds. Or become a host
                and earn Solana for sharing your compute power.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                    duration: 0.8, 
                    delay: 1.3,
                    ease: "easeOut"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    size="lg"
                    className="rounded-full px-8 py-5 text-lg font-medium bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white shadow-2xl hover:shadow-white/20 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                    Get started
                </Button>
            </motion.div>
        </div>
    </motion.div>
  );
}