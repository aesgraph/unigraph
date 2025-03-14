import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import React, { useEffect, useRef } from "react";
import { SceneGraph } from "../core/model/SceneGraph";
import { processYasguiResults } from "../helpers/yasguiHelpers";

interface YasguiPanelProps {
  sceneGraph: SceneGraph;
}

const YasguiPanel: React.FC<YasguiPanelProps> = ({ sceneGraph }) => {
  const yasguiRef = useRef<HTMLDivElement | null>(null);
  const yasguiController = useRef<Yasgui | null>(null);

  useEffect(() => {
    if (yasguiRef.current) {
      yasguiController.current = new Yasgui(yasguiRef.current, {
        requestConfig: {
          endpoint: "https://dbpedia.org/sparql",
        },
      });
    }
  }, []);

  useEffect(() => {
    if (yasguiController.current) {
      // Get the active YASQE editor
      const yasqe = yasguiController.current.getTab()!.getYasqe();

      // Add a listener for when a query is executed
      yasqe.on("queryResponse", (response, duration) => {
        console.log("SPARQL Response:", response);
        console.log("Query execution time:", duration, "ms");
        processYasguiResults(
          JSON.parse(duration.text).results.bindings,
          sceneGraph
        );

        if (response?.results?.bindings) {
          console.log("Formatted Results:", response.results.bindings);
        }

        console.log(duration.text);
      });
    }
  }, [yasguiController, sceneGraph]);

  return <div ref={yasguiRef} style={{ width: "100%", height: "100%" }} />;
};

export default YasguiPanel;
