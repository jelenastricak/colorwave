import { ReactNode } from "react";
import waveBottom from "@/assets/wave-bottom.png";

interface BottomWaveBackgroundProps {
  children: ReactNode;
}

export const BottomWaveBackground = ({ children }: BottomWaveBackgroundProps) => {
  return (
    <div
      className="relative min-h-[300px] sm:min-h-[400px] bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: `url(${waveBottom})` }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
};
