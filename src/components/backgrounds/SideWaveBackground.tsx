import { ReactNode } from "react";
import waveSide from "@/assets/wave-side.png";

interface SideWaveBackgroundProps {
  children: ReactNode;
}

export const SideWaveBackground = ({ children }: SideWaveBackgroundProps) => {
  return (
    <div
      className="relative min-h-screen bg-cover bg-right bg-no-repeat"
      style={{ backgroundImage: `url(${waveSide})` }}
    >
      <div className="relative z-10 h-full mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
        {children}
      </div>
    </div>
  );
};
