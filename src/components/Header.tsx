import { Link } from "react-router-dom";
import colorwaveLogo from "@/assets/colorwave-logo.png";

export const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="inline-flex items-center gap-0 bg-canvas/95 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm border border-ink/25">
          <img src={colorwaveLogo} alt="Colorwave Studio" className="h-10 w-10 sm:h-14 sm:w-14" />
          <span className="text-lg sm:text-2xl font-semibold text-ink leading-none -translate-y-0.5">Colorwave Studio</span>
        </Link>
      </div>
    </header>
  );
};
