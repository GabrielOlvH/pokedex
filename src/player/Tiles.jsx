import React from "react";
import * as THREE from 'three';


const textureLoader = new THREE.TextureLoader();
const zones = [];

textureLoader.load('testmap2.png', (texture) => {
    texture.encoding = THREE.sRGBEncoding; // Ensure correct color encoding
    texture.magFilter = THREE.NearestFilter; // Maintain pixel sharpness
    texture.flipY = false; // Fix the vertical flip

    const sectionSize = 20; // 20x20 grid
    const numSectionsX = Math.floor(texture.image.width / sectionSize);
    const numSectionsY = Math.floor(texture.image.height / sectionSize);

    for (let zone = 0; zone < 32; zone++) {
        const zoneX = zone % numSectionsX;
        const zoneY = Math.floor(zone / numSectionsX);

        const uvX = zoneX * sectionSize / texture.image.width;
        const uvY = zoneY * sectionSize / texture.image.height;
        const uvWidth = sectionSize / texture.image.width;
        const uvHeight = sectionSize / texture.image.height;

        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // Apply UV coordinates directly on the geometry
        const uvs = geometry.attributes.uv.array;
        uvs[0] = uvX; uvs[1] = uvY;
        uvs[2] = uvX + uvWidth; uvs[3] = uvY;
        uvs[4] = uvX; uvs[5] = uvY + uvHeight;
        uvs[6] = uvX + uvWidth; uvs[7] = uvY + uvHeight;

        geometry.attributes.uv.needsUpdate = true;

        zones.push(
            <mesh
                key={zone}
                geometry={geometry}
                material={material}
                position={[9.5, 9.5, 0]}
            />
        );
    }

    console.log('loaded all zones!');
});

const GetZoneData = (zone) => {
    return zones[zone]
};

export default GetZoneData