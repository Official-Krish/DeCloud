import axios from "axios";

export const calculatePrice = async (machineType: string, diskSize: number): Promise<Number> => {
    try {
      const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/vm/calculatePrice`, {
        params: {
          machineType,
          diskSize,
        }
      });
      return response.data.price;
    } catch (error) {
      console.error("Error calculating price:", error);
      return 0;
    }
  }; 