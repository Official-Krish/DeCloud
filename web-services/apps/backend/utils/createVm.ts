require('dotenv').config();
import compute from '@google-cloud/compute';

const networkName = 'global/networks/default';
const projectId = process.env.PROJECT_ID;
const sourceImage = 'projects/debian-cloud/global/images/family/debian-11';

export async function createInstance(instanceName: string, zone: string, machineType: string, diskSizeGb: string, os: string) {
    const instancesClient = new compute.InstancesClient();
  
    const [response] = await instancesClient.insert({
      instanceResource: {
            name: instanceName,
            disks: [
                {
                    initializeParams: {
                    diskSizeGb: diskSizeGb,
                    sourceImage,
                    },
                    autoDelete: true,
                    boot: true,
                    type: 'PERSISTENT',
                },
            ],
            machineType: `zones/${zone}/machineTypes/${machineType}`,
            networkInterfaces: [
                {
                    name: networkName,
                },
            ],
        },
      project: projectId,
      zone,
    });
    const operationsClient = new compute.ZoneOperationsClient();
    await operationsClient.wait({
        operation: response.name,
        project: projectId,
        zone,
    });

    const [instance] = await instancesClient.get({
        project: projectId,
        zone,
        instance: instanceName,
    });
    const networkInterface = instance.networkInterfaces?.[0];
    const ipAddress = networkInterface?.networkIP;
    const instanceId = instance.id;

    return { ipAddress, instanceId };
}


const getSourceImage = (os: string) => {
    switch (os) {
        case 'ubuntu-20.04':
            return 'projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts';
        case 'ubuntu-22.04':
            return 'projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts';
        case 'ubuntu-18.04':
            return 'projects/ubuntu-os-cloud/global/images/family/ubuntu-1804-lts';
        case 'debian-11':
            return 'projects/debian-cloud/global/images/family/debian-11';  
        case 'debian-10':
            return 'projects/debian-cloud/global/images/family/debian-10';
        case 'centos-7':
            return 'projects/centos-cloud/global/images/family/centos-7';
        default:
            return 'projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts';
    }
};