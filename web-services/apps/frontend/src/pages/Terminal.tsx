import { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal as TerminalIcon, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/components/themeProvider';

const SSHTerminal = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [vmHost, setVmHost] = useState('');
  const [error, setError] = useState('');
  const { theme } = useTheme();
  
  const terminalRef = useRef(null);
  const wsRef = useRef<WebSocket | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    // Initialize xterm
    if (terminalRef.current && !xtermRef.current) {
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: isDark ? 'hsl(var(--background))' : '#ffffff',
                foreground: isDark ? 'hsl(var(--foreground))' : '#000000',
                cursor: isDark ? 'hsl(var(--primary))' : '#000000',
            },
            rows: 24,
            cols: 80
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(terminalRef.current);
        fitAddon.fit();
      
        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

      // Handle terminal input
        terminal.onData((data) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isConnected) {
                wsRef.current.send(JSON.stringify({
                    type: 'command',
                    command: data
                }));
            }
        });

        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
            }
        };
      
        window.addEventListener('resize', handleResize);
      
        return () => {
            window.removeEventListener('resize', handleResize);
            terminal.dispose();
        };
    }
  }, [theme]);

    const connect = () => {
        if (!token.trim()) {
            setError('Please enter a token');
            return;
        }

        setError('');
        
        const ws = new WebSocket('ws://localhost:9093');
        wsRef.current = ws;

        ws.onopen = () => {
            // Authenticate immediately
            ws.send(JSON.stringify({
                type: 'authenticate',
                token: token
            }));
        };

        ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'authenticated':
            setIsAuthenticated(true);
            setVmHost(data.allowedVMs[0]); 
            // Auto-connect to the VM
            ws.send(JSON.stringify({
                type: 'connect',
                config: {
                    host: data.allowedVMs[0],
                    username: 'decloud',
                    port: 22
                }
            }));
            break;
            
            case 'status':
            if (data.message === 'SSH connected') {
                setIsConnected(true);
                if (xtermRef.current) {
                    xtermRef.current.focus();
                }
            }
            break;
            
            case 'output':
                if (xtermRef.current) {
                    xtermRef.current.write(data.data);
                }
            break;
            
            case 'error':
            setError(data.message);
            break;
        }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setIsAuthenticated(false);
            setError('Connection closed');
        };

        ws.onerror = () => {
            setError('Connection failed');
        };
    };

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                            <TerminalIcon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">SSH Terminal</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="token">Access Token</Label>
                            <Input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Enter your access token"
                                onKeyUp={(e) => e.key === 'Enter' && connect()}
                            />
                        </div>
                    
                        <Button
                            onClick={connect}
                            disabled={!token.trim()}
                            className="w-full"
                        >
                            Connect
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="h-5 w-5 text-primary" />
                        <h1 className="text-lg font-medium">SSH Terminal</h1>
                    </div>
                    <span className="text-sm text-muted-foreground">{vmHost}</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
                        {isConnected ? (
                            <>
                                <Wifi className="h-3 w-3" />
                                Connected
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-3 w-3" />
                                Connecting...
                            </>
                        )}
                    </Badge>
                    
                    <Button
                        onClick={disconnect}
                        variant="destructive"
                        size="sm"
                    >
                        Disconnect
                    </Button>
                </div>
            </div>

            {/* Terminal */}
            <div className="flex-1 p-4">
                <div 
                    ref={terminalRef}
                    className="w-full h-full bg-card rounded-lg border shadow-sm"
                />
            </div>
        </div>
    );
};

export default SSHTerminal;