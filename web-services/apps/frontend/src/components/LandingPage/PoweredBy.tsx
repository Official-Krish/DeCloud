import { Globe, Layers, Shield, Zap } from "lucide-react"

export const PoweredBy = () => {
    return (
        <section id="technology" className="relative z-10 px-6 py-30 max-w-7xl mx-auto">
            <div className="bg-slate-900/30 border border-slate-700 rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl">
                            Powered by <span className="text-blue-400">Solana</span>
                        </h2>
                        <p className="text-xl text-slate-300">
                            Experience lightning-fast transactions, minimal fees, and seamless global payments 
                            with the world's most performant blockchain.
                        </p>
                    
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Transaction Speed", value: "<1s" },
                                { label: "Network Fee", value: "$0.001" },
                                { label: "Throughput", value: "65K TPS" },
                                { label: "Uptime", value: "99.9%" }
                                ].map((metric, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="text-2xl font-bold text-blue-400">{metric.value}</div>
                                    <div className="text-sm text-slate-400">{metric.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: Layers, title: "DePIN Infrastructure", desc: "Decentralized Physical Infrastructure Network" },
                            { icon: Shield, title: "Smart Contracts", desc: "Trustless execution and automatic payments" },
                            { icon: Globe, title: "Global Network", desc: "Distributed compute across 127 countries" },
                            { icon: Zap, title: "Instant Settlement", desc: "Real-time SOL payments and escrow" }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-800/50 rounded-2xl">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">{feature.title}</h4>
                                    <p className="text-sm text-slate-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}