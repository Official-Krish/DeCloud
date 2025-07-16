import { VelocityScroll } from "@/components/ui/scroll-based-velocity";

export default function LaneText() {
  return (
    <div className="">
      <VelocityScroll>⚠️ Devnet Limitation: Currently, only e2-micro instances (Debian 11, 10 GB disk) are available, and each session is limited to 10 minutes of runtime.</VelocityScroll>
    </div>
  );
}
