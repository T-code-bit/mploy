import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | M-Ploy` : "M-Ploy | Kenya's Trusted Career Platform";
    return () => { document.title = prev; };
  }, [title]);
};

export default usePageTitle;
