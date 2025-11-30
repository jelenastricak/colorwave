import { ReactNode } from "react";
import waveTop from "@/assets/wave-top.png";

interface TopWaveBackgroundProps {
  children: ReactNode;
}

export const TopWaveBackground = ({ children }: TopWaveBackgroundProps) => {
  return (
    <div
      className="relative min-h-[500px] sm:min-h-[600px] bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: `url(${waveTop})` }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
};
