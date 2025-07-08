import type { ServerWebSocket } from "bun";
import { Client as SSHClient } from "ssh2";
import { verify, type JwtPayload } from "jsonwebtoken";

const connections = new Map();

const userSessions = new Map<string, {
    userId: string;
    allowedVMs: string[];
    privateKey: string;
    expiresAt: number;
}>();

type incomingMessage = {
    type: 'authenticate' | 'connect' | 'command' | 'disconnect';
    token?: string;
    config?: {
        host: string;
        port?: number;
        username: string;
    };
    command?: string;
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

Bun.serve({
    fetch(req, server) {
        if (server.upgrade(req)) {
            return;
        }
        return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws, message) {
            try {
                const data: incomingMessage = JSON.parse(message.toString());
                
                if (data.type === 'authenticate') {
                    authenticateUser(ws as ServerWebSocket<undefined>, data.token!);
                } else if (data.type === 'connect') {
                    connectToVM(ws as ServerWebSocket<undefined>, data.config!);
                } else if (data.type === 'command') {
                    sendCommand(ws as ServerWebSocket<undefined>, data.command!);
                } else if (data.type === 'disconnect') {
                    disconnectFromVM(ws as ServerWebSocket<undefined>);
                }
            } catch (err) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
            }
        },
        open(ws) {
            console.log("WebSocket connection opened");
            ws.send(JSON.stringify({ 
                type: 'status', 
                message: 'Connected to WebSocket. Please authenticate.' 
            }));
        },
        close(ws) {
            console.log("WebSocket connection closed");
            disconnectFromVM(ws as ServerWebSocket<undefined>);
        },
    },
    port: 9093
});

function authenticateUser(ws: ServerWebSocket<undefined>, token: string) {
    try {
        const decoded = verify(token, JWT_SECRET) as JwtPayload;
        if (!decoded || !decoded.userId || !decoded.privateKey || !decoded.exp) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            return;
        }
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            ws.send(JSON.stringify({ type: 'error', message: 'Token expired' }));
            return;
        }
        
        userSessions.set(ws as any, {
            userId: decoded.userId,
            allowedVMs: decoded.allowedVMs || [],
            privateKey: decoded.privateKey,
            expiresAt: decoded.exp * 1000
        });
        
        ws.send(JSON.stringify({ 
            type: 'authenticated', 
            message: 'Authentication successful',
            allowedVMs: decoded.allowedVMs
        }));
        
    } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
    }
}

function isAuthenticated(ws: ServerWebSocket<undefined>): boolean {
    const session = userSessions.get(ws as unknown as string);
    if (!session) return false;
    
    // Check if session is expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
        userSessions.delete(ws as any);
        return false;
    }
    
    return true;
}

function canAccessVM(ws: ServerWebSocket<undefined>, vmHost: string): boolean {
    const session = userSessions.get(ws as any);
    if (!session) return false;
    
    // Check if user has access to this VM
    return session.allowedVMs.includes(vmHost) || session.allowedVMs.includes('*');
}

function connectToVM(ws: ServerWebSocket<undefined>, config: {
    host: string;
    port?: number;
    username: string;
}) {
    if (!isAuthenticated(ws)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
        return;
    }
    
    if (!canAccessVM(ws, config.host)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Access denied to this VM' }));
        return;
    }
    
    const session = userSessions.get(ws as unknown as string)!;
    const ssh = new SSHClient();
    
    ssh.on('ready', () => {
        console.log(`SSH connection established for user ${session.userId} to ${config.host}`);
        ws.send(JSON.stringify({ type: 'status', message: 'SSH connected' }));
        
        // Create a shell session
        ssh.shell((err, stream) => {
            if (err) {
                ws.send(JSON.stringify({ type: 'error', message: err.message }));
                return;
            }
            
            // Store the connection
            connections.set(ws, { ssh, stream });
            
            // Handle data from SSH stream (VM output)
            stream.on('data', (data: any) => {
                ws.send(JSON.stringify({ 
                    type: 'output', 
                    data: data.toString() 
                }));
            });
            
            stream.on('close', () => {
                ws.send(JSON.stringify({ type: 'status', message: 'SSH session closed' }));
                connections.delete(ws);
            });
            
            stream.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ 
                    type: 'error', 
                    data: data.toString() 
                }));
            });
        });
    });
    
    ssh.on('error', (err) => {
        console.error('SSH connection error:', err);
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
    });
    
    ssh.on('close', () => {
        console.log('SSH connection closed');
        connections.delete(ws);
    });
    
    // Connect to the VM using the user's private key
    ssh.connect({
        host: config.host,
        port: config.port || 22,
        username: config.username,
        privateKey: session.privateKey,
    });
}

function sendCommand(ws: ServerWebSocket, command: string) {
    if (!isAuthenticated(ws)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
        return;
    }
    
    const connection = connections.get(ws);
    if (!connection?.stream || connection.stream.destroyed) {
        ws.send(JSON.stringify({ type: 'error', message: 'No active SSH connection' }));
        return;
    }
    
    connection.stream.write(command + '\n');
}

function disconnectFromVM(ws: ServerWebSocket) {
    const connection = connections.get(ws);
    if (connection) {
        if (connection.stream) {
            connection.stream.end();
        }
        if (connection.ssh) {
            connection.ssh.end();
        }
        connections.delete(ws);
    }
    
    userSessions.delete(ws as any);
}