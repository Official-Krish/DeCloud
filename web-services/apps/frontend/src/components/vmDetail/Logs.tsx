import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Log {
    timestamp: string;
    level: string;
    message: string;
}

export const Logs = ( { Logs }: { Logs: Log[] }) => {
    const getLogLevelColor = (level: string) => {
        switch (level) {
          case 'INFO': return 'text-blue-600';
          case 'WARN': return 'text-yellow-600';
          case 'ERROR': return 'text-red-600';
          default: return 'text-gray-600';
        }
    };
    return (
        <div>
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Real time logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Logs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start space-x-3 p-2 text-sm font-mono hover:bg-muted/50 rounded"
                    >
                      <span className="text-muted-foreground whitespace-nowrap">
                        {log.timestamp}
                      </span>
                      <span className={`font-semibold whitespace-nowrap ${getLogLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
    )
}