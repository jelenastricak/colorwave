import { Link } from "react-router-dom";
import colorwaveLogo from "@/assets/colorwave-logo.png";

export const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="inline-flex items-center gap-0.5 bg-canvas/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <img src={colorwaveLogo} alt="Colorwave Studio" className="h-14 w-14" />
          <span className="text-2xl font-semibold text-ink leading-none">Colorwave Studio</span>
        </Link>
      </div>
    </header>
  );
};
