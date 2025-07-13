import { ForceGraph3DInstance } from "3d-force-graph";

const compactifyForce = () => {
  let nodes: any[];
  const centerStrength = 0.4; // Strength of pull towards center
  const optimalDistance = 100; // Target distance from center
  const maxForce = 5; // Maximum force applied per tick
  const dampening = 0.8; // Reduce oscillation

  function force(alpha: number) {
    nodes.forEach((node) => {
      // Calculate distance from center
      const dx = 0 - (node.x || 0);
      const dy = 0 - (node.y || 0);
      const dz = 0 - (node.z || 0);

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      // Calculate force based on distance from optimal
      const distanceFromOptimal = distance - optimalDistance;
      const forceMagnitude = Math.min(
        Math.abs(distanceFromOptimal) * centerStrength,
        maxForce
      );

      // Apply force towards center if too far, away from center if too close
      const force = forceMagnitude * alpha * Math.sign(distanceFromOptimal);

      // Add velocity towards/away from center
      node.vx = (node.vx || 0) + (dx / distance) * force;
      node.vy = (node.vy || 0) + (dy / distance) * force;
      node.vz = (node.vz || 0) + (dz / distance) * force;

      // Apply dampening
      node.vx *= dampening;
      node.vy *= dampening;
      node.vz *= dampening;
    });
  }

  force.initialize = function (_nodes: any[]) {
    nodes = _nodes;
  };

  return force;
};

export const compactify = (
  forceGraph3dInstance: ForceGraph3DInstance,
  _duration: number = 2000
) => {
  // Store original forces
  const _originalForces = {
    link: forceGraph3dInstance.d3Force("link"),
    charge: forceGraph3dInstance.d3Force("charge"),
    center: forceGraph3dInstance.d3Force("center"),
    collision: forceGraph3dInstance.d3Force("collision"),
  };

  //   // Clear existing forces temporarily
  forceGraph3dInstance
    .d3Force("link", null)
    .d3Force("charge", null)
    .d3Force("center", null);
  // .d3Force("collision", null);

  // Add compactify force
  forceGraph3dInstance.d3Force("compactify", compactifyForce());
  // .d3VelocityDecay(0.3);
  // .cooldownTime(duration);
  //   .d3AlphaTarget(0.3); // Keep some energy in the simulation

  // Reheat simulation
  forceGraph3dInstance.d3ReheatSimulation();

  // Remove compactify force and restore original forces after duration
  //   setTimeout(() => {
  // Remove compactify force
  // forceGraph3dInstance.d3Force("compactify", null);

  // Restore original forces
  // Object.entries(originalForces).forEach(([name, force]) => {
  //   if (force) {
  //     forceGraph3dInstance.d3Force(name, force);
  //   }
  // });

  // Reset simulation parameters
  //     forceGraph3dInstance
  //       .d3VelocityDecay(0.4) // Default velocity decay
  //       //   .d3AlphaTarget(0) // Let simulation cool down naturally
  //       .d3ReheatSimulation(); // Reheat with restored forces
  //   }, duration);
};
