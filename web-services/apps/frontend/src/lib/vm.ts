import axios from "axios";

export const calculatePrice = async (machineType: string, diskSize: number, duration: number): Promise<Number> => {
    try {
      const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/vm/calculatePrice`, {
        params: {
          machineType,
          diskSize,
        },
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      const price = response.data.price; // for 30 days
      const perDayPrice = price / 30; // Convert to per day price
      const Inhours = perDayPrice / (24 * 60); // Convert to mins
      return Inhours * duration; 
    } catch (error) {
      console.error("Error calculating price:", error);
      return 0;
    }
  }; 