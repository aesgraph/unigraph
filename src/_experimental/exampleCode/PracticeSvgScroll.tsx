import React from "react";
import practiceSvg from "../../svgs/practice.svg";
import practice2Svg from "../../svgs/practice2.svg";

export const SvgBase64Component = (svgString: string) => {
  // Convert SVG string to base64
  const base64Svg = btoa(svgString);
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

  return (
    <div className="w-full h-96 bg-gray-100 mt-4">
      <img src={dataUrl} alt="SVG using base64" className="w-full h-full" />
    </div>
  );
};

const PracticeSvgScroll: React.FC = () => {
  return (
    <div style={{ height: "200vh", padding: "20px" }}>
      <div style={{ marginBottom: "100vh" }}>
        <img
          src={practiceSvg}
          alt="Practice SVG"
          style={{ width: "100%", height: "10%" }}
        />
        {SvgBase64Component(practiceSvg)}
      </div>
      <div>
        <img
          src={practice2Svg}
          alt="Practice 2 SVG"
          style={{ width: "100%" }}
        />
        {SvgBase64Component(practice2Svg)}
      </div>
    </div>
  );
};

export default PracticeSvgScroll;
