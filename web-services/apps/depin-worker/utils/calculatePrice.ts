export const calculatePricePerHour = (cpuCores: number, ramGb: number, diskGb: number): number => {
    const basePrice = 0.0005; 
    const cpuPrice = 0.0001;
    const ramPrice = 0.0002;
    const diskPrice = 0.00005;
    let price = basePrice;
    if (cpuCores > 2) {
        price += (cpuCores - 2) * cpuPrice;
    }
    if (ramGb > 1) {
        price += (ramGb - 1) * ramPrice;
    }
    if (diskGb > 10) {
        price += (diskGb - 10) * diskPrice;
    }
    
    if (price > 0.05) {
        price = 0.05;
    }
    return price;
}