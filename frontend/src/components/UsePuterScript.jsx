import { useEffect, useState } from "react";

function usePuterScript() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.puter) {
      // already loaded
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load puter script");
    };

    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return isLoaded;
}
export default usePuterScript;