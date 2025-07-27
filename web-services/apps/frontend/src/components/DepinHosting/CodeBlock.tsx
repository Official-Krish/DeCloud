import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export const CodeBlock = ({ script }: { script: string }) => (
    <div className="relative group bg-gray-900/70 dark:bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 border border-border/40">
        <pre><code>{script}</code></pre>
        <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => onCopy(script)}
            aria-label="Copy code to clipboard"
        >
            <Copy className="h-4 w-4" />
        </Button>
    </div>
);

const onCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast.success("Code copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
};