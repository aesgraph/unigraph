import * as THREE from "three";

export interface Moon {
  pivot: THREE.Object3D;
  speed: number;
}

export interface PlanetSystem {
  pivot: THREE.Object3D;
  moons: Moon[];
  speed: number;
}

export const createPlanetSystem = (
  scene: THREE.Scene,
  orbitRadius: number,
  planetSize: number,
  planetColor: number,
  moonCount: number,
  initialAngle: number,
  tiltAngle: number
): PlanetSystem => {
  // Planet orbit
  const orbitGeometry = new THREE.BufferGeometry();
  const orbitPoints = [];
  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    orbitPoints.push(
      orbitRadius * Math.cos(angle),
      0,
      orbitRadius * Math.sin(angle)
    );
  }
  orbitGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(orbitPoints, 3)
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x666666,
    transparent: true,
    opacity: 0.6,
  });
  const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbit);

  // Planet
  const planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
  const planetMaterial = new THREE.MeshPhongMaterial({
    color: planetColor,
    shininess: 50,
    emissive: planetColor,
    emissiveIntensity: 0.2, // Slight glow
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  const planetPivot = new THREE.Object3D();
  scene.add(planetPivot);
  planetPivot.add(planet);
  planet.position.x = orbitRadius * Math.cos(initialAngle);
  planet.position.z = orbitRadius * Math.sin(initialAngle);
  planetPivot.rotation.z = tiltAngle; // Apply tilt angle

  // Moons
  const moons = [];
  for (let i = 0; i < moonCount; i++) {
    const moonRadius = planetSize * 2 + i;
    const moonSize = planetSize * 0.2;

    // Moon orbit
    const moonOrbitGeometry = new THREE.BufferGeometry();
    const moonOrbitPoints = [];
    for (let j = 0; j <= 360; j++) {
      const angle = (j * Math.PI) / 180;
      moonOrbitPoints.push(
        moonRadius * Math.cos(angle),
        0,
        moonRadius * Math.sin(angle)
      );
    }
    moonOrbitGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(moonOrbitPoints, 3)
    );
    const moonOrbit = new THREE.Line(moonOrbitGeometry, orbitMaterial);
    planet.add(moonOrbit);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(moonSize, 16, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: "white",
      shininess: 50,
      opacity: 1,
      emissive: "white",
      emissiveIntensity: 0.2,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    const moonPivot = new THREE.Object3D();
    planet.add(moonPivot);
    moonPivot.add(moon);
    moon.position.x = moonRadius;

    moons.push({ pivot: moonPivot, speed: 0.02 + i * 0.01 });
  }

  return { pivot: planetPivot, moons, speed: 0.005 + orbitRadius * 0.0002 };
};
