import { motion } from "framer-motion";
import { Server, Zap, Shield, User } from "lucide-react";
import { ModeToggle } from "./toggle-theme";

const Appbar = () => {
    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Server },
        { name: "Rent VM", href: "/rent", icon: Zap },
        { name: "DePIN Hosting", href: "/hosting", icon: Shield },
        { name: "Admin", href: "/admin", icon: User },
    ];
    return (
        <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky border-b glass-effect"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">DeCloud</span>
            </a>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors relative ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-accent rounded-md"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <span className="relative flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <ModeToggle />
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                Profile
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    )
}

export default Appbar;