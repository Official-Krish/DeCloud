import { CardHeader, CardTitle, CardDescription, CardContent, Card } from '@/components/ui/card';
import { Globe, Key, Loader2, Server } from 'lucide-react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { operatingSystems, regions } from '@/lib/constants';
import { Button } from '../ui/button';

interface Step1Props {
    handleStep1Submit: () => void;
    formData: {
        machineType: string;
        ipAddress: string;
        cpu: string;
        ram: string;
        diskSize: string;
        region: string;
        os: string;
        Key: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        machineType: string;
        ipAddress: string;
        cpu: string;
        ram: string;
        diskSize: string;
        region: string;
        os: string;
        Key: string;
    }>>;
    isLoading: boolean;
}

export const Step1 = ({ handleStep1Submit, formData, setFormData, isLoading }: Step1Props) => {
    const machineTypes = ["e2-medium", "e2-small", "e2-micro", "e2-standard"];
    return (
        <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Server className="h-5 w-5 text-emerald-500" />
                        <span>Provide Machine Specifications</span>
                    </CardTitle>
                    <CardDescription>
                        Fill out the details of the machine you want to add to the DePIN network.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleStep1Submit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="machineType">
                                    Machine Type
                                </Label>
                                <Select 
                                    value={formData.machineType} 
                                    onValueChange={(value) => setFormData({...formData, machineType: value})} 
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select machine type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {machineTypes.map((type) => 
                                            <SelectItem 
                                                key={type} 
                                                value={type}
                                            >
                                                {type}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ipAddress">
                                    Public IP Address
                                </Label>
                                <Input 
                                    id="ipAddress" 
                                    placeholder="e.g., 203.0.113.1" 
                                    value={formData.ipAddress} 
                                    onChange={(e) => setFormData({...formData, ipAddress: e.target.value})} 
                                    required 
                                />
                            </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label 
                                        htmlFor="cpu"
                                    >
                                        CPU Cores
                                    </Label>
                                    <Input 
                                        id="cpu" 
                                        type="number"
                                        placeholder="e.g., 8" 
                                        value={formData.cpu} 
                                        onChange={(e) => setFormData({...formData, cpu: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ram">
                                        RAM (GB)
                                    </Label>
                                    <Input 
                                        id="ram" 
                                        type="number" 
                                        placeholder="e.g., 16" 
                                        value={formData.ram} 
                                        onChange={(e) => setFormData({...formData, ram: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diskSize">Storage (GB)</Label>
                                    <Input
                                        id="diskSize" 
                                        type="number" 
                                        placeholder="e.g., 500" 
                                        value={formData.diskSize} 
                                        onChange={(e) => setFormData({...formData, diskSize: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="region">Region</Label>
                                    <Select 
                                        value={formData.region} 
                                        onValueChange={(value) => setFormData({...formData, region: value})} 
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map((region) => 
                                                <SelectItem 
                                                    key={region.value} 
                                                    value={region.value}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Globe className="h-4 w-4" />
                                                        <span>{region.value}</span>
                                                    </div>
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="os">
                                        Operating System
                                    </Label>
                                    <Select 
                                        value={formData.os} 
                                        onValueChange={(value) => setFormData({...formData, os: value})} 
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder="Select operating system"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {operatingSystems.map((os) => 
                                                <SelectItem 
                                                    key={os.value} 
                                                    value={os.value}
                                                >
                                                    {os.value}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                        <div className="space-y-2">
                            <Label htmlFor="authKey" 
                                className="flex items-center space-x-2"
                            >
                                <Key className="h-4 w-4" />
                                <span>
                                    Authentication Key
                                </span>
                            </Label>
                            <Input 
                                id="authKey" 
                                type="password" 
                                placeholder="Enter a secure password for your machine" 
                                value={formData.Key} 
                                onChange={(e) => setFormData({...formData, Key: e.target.value})} 
                                required 
                            />
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg cursor-pointer" 
                                size="lg"
                            >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Saving...' : 'Save & Proceed to Verification'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}