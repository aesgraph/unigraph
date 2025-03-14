import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import React, { useEffect, useRef } from "react";

const YasguiPanel: React.FC = () => {
  const yasguiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (yasguiRef.current) {
      new Yasgui(yasguiRef.current, {
        requestConfig: {
          endpoint: "https://dbpedia.org/sparql",
        },
      });
    }
  }, []);

  return <div ref={yasguiRef} style={{ width: "100%", height: "100%" }} />;
};

export default YasguiPanel;
