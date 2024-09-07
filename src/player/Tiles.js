import React from "react";
import * as THREE from 'three';

const Tiles = {
    Grass: (<meshBasicMaterial color="green" depthTest={false}/>),
    Sand: (<meshBasicMaterial color="yellow" depthTest={false}/>),
    Water: (<meshBasicMaterial color="blue" depthTest={false}/>),
    Stone: (<meshBasicMaterial color="gray" depthTest={false}/>),
    Snow: (<meshBasicMaterial color="white" depthTest={false}/>),
    Lava: (<meshBasicMaterial color="red" depthTest={false}/>)
}

const textureLoader = new THREE.TextureLoader();

const zones = []

textureLoader.load('testmap.png', (texture) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    context.drawImage(texture.image, 0, 0);

    const sectionSize = 20; // 20x20 grid

    // Calcula o número de seções por linha e coluna
    const numSectionsX = Math.floor(canvas.width / sectionSize);
    const numSectionsY = Math.floor(canvas.height / sectionSize);

    // Calcula as coordenadas da zona
    for(let zone = 0; zone < 32; zone++ ){
        const zoneX = zone % numSectionsX;
        const zoneY = Math.floor(zone / numSectionsX);

        // Obtém a seção da zona selecionada
        const imageData = context.getImageData(zoneX * sectionSize, zoneY * sectionSize, sectionSize, sectionSize);

        // Cria uma matriz 2D para armazenar os materiais
        const materials2DArray = [];

        // Preenche a matriz 2D com os materiais baseados nos pixels
        for (let y = 0; y < sectionSize; y++) {

            const row = [];
            for (let x = sectionSize-1; x >= 0; x--) {
                const index = (x * sectionSize + y) * 4; // Cada pixel tem 4 valores (RGBA)
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const color = `rgb(${r}, ${g}, ${b})`;

                row.push(
                    <meshBasicMaterial key={`${zone} ${x}-${y}`} color={color} depthTest={false} />
                );
            }
            materials2DArray.push(row);

        }
        zones.push(materials2DArray)
    }
});

const GetZoneData = (zone) => {
    return zones[zone]
};

export default GetZoneData