import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Container, Cpu, HardDrive } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormProps {
    handleSubmit: (e: React.FormEvent) => void;
    formData: {
        appName: string;
        dockerImage: string;
        description: string;
        cpu: string;
        memory: string;
        storage: string;
        ports: string;
        envVars: string;
        regions: string[];
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        appName: string;
        dockerImage: string;
        description: string;        
        cpu: string;
        memory: string;
        storage: string;
        ports: string;
        envVars: string;
        regions: string[];
    }>>;
}

export const Form = ({ handleSubmit, formData, setFormData }: FormProps) => {
    return (
        <div>
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Container className="h-5 w-5" />
                        <span>Application Configuration</span>
                    </CardTitle>
                    <CardDescription>
                        Configure your Docker container deployment settings
                    </CardDescription>
                </CardHeader>
                    
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="appName" className="mb-4">Application Name</Label>
                                <Input
                                    id="appName"
                                    placeholder="my-awesome-app"
                                    value={formData.appName}
                                    onChange={(e) => setFormData({...formData, appName: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="dockerImage" className="mb-4">Docker Image</Label>
                                <Input
                                id="dockerImage"
                                placeholder="nginx:latest or myregistry/myapp:v1.0"
                                value={formData.dockerImage}
                                onChange={(e) => setFormData({...formData, dockerImage: e.target.value})}
                                required
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="description" className="mb-4">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief description of your application..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Resource Configuration */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Resource Configuration</Label>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="cpu" className="flex items-center space-x-2 mb-3">
                                        <Cpu className="h-4 w-4" />
                                        <span>CPU Cores</span>
                                    </Label>
                                    <Select value={formData.cpu} onValueChange={(value) => setFormData({...formData, cpu: value})}>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="0.5">0.5 cores</SelectItem>
                                        <SelectItem value="1">1 core</SelectItem>
                                        <SelectItem value="2">2 cores</SelectItem>
                                        <SelectItem value="4">4 cores</SelectItem>
                                        <SelectItem value="8">8 cores</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label htmlFor="memory" className="flex items-center space-x-2 mb-3">
                                        <HardDrive className="h-4 w-4" />
                                        <span>Memory (GB)</span>
                                    </Label>
                                    <Select value={formData.memory} onValueChange={(value) => setFormData({...formData, memory: value})}>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="0.5">512 MB</SelectItem>
                                        <SelectItem value="1">1 GB</SelectItem>
                                        <SelectItem value="2">2 GB</SelectItem>
                                        <SelectItem value="4">4 GB</SelectItem>
                                        <SelectItem value="8">8 GB</SelectItem>
                                        <SelectItem value="16">16 GB</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label htmlFor="storage" className="flex items-center space-x-2 mb-3">
                                        <HardDrive className="h-4 w-4" />
                                        <span>Storage (GB)</span>
                                    </Label>
                                    <Input
                                        id="storage"
                                        type="number"
                                        value={formData.storage}
                                        onChange={(e) => setFormData({...formData, storage: e.target.value})}
                                        min="1"
                                        max="1000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Environment Variables */}
                        <div>
                            <Label htmlFor="envVars" className="mb-3">Environment Variables</Label>
                            <Textarea
                                id="envVars"
                                placeholder="KEY1=value1&#10;KEY2=value2&#10;DB_URL=mongodb://..."
                                value={formData.envVars}
                                onChange={(e) => setFormData({...formData, envVars: e.target.value})}
                                rows={4}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            size="lg"
                        >
                            Deploy Application
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}