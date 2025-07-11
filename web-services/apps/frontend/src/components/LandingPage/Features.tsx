import { cn } from "@/lib/utils";
import { Globe, Code, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
    const features = [
        {
          icon: Zap,
          title: "Deploy in Seconds",
          description: "Spin up virtual machines instantly with our streamlined deployment process"
        },
        {
          icon: Shield,
          title: "Crypto Native",
          description: "Pay with SOL tokens - no credit cards or lengthy verification processes"
        },
        {
          icon: Globe,
          title: "Global Infrastructure",
          description: "Deploy across multiple regions with low-latency access worldwide"
        },
        {
          icon: Code,
          title: "Developer First",
          description: "Built by developers, for developers with APIs and CLI tools"
        }
    ];
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 dark:bg-gradient-to-br from-background via-background to-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Why Choose DeCloud?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Experience the future of cloud computing with our decentralized, crypto-native platform
                </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
                <Feature key={feature.title} {...feature} index={index} icon={<feature.icon/>}/>
            ))}
        </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
        <div
            className={cn(
                "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
                (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
                index < 4 && "lg:border-b dark:border-neutral-800"
            )}
        >
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
            )}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
            )}
            <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
                {icon}
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
                {title}
                </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
  );
};
