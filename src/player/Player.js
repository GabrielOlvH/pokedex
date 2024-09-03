import React, {useRef, useEffect, useState, Suspense} from 'react';
import * as THREE from 'three';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import Encounter from "../encounter/Encounter";
import {Group} from "@tweenjs/tween.js";

const MAP_SIZE = 20; // Define o tamanho do mapa (10x10)

function Player({ position }) {
    const playerRef = useRef();
    const playertex = useLoader(THREE.TextureLoader, 'pokeball.png');

    useFrame(() => {
        if (playerRef.current) {
            playerRef.current.position.x = position.x;
            playerRef.current.position.y = position.y;
        }
    });

    return (
        <sprite ref={playerRef} position={[position.x, position.y, 1]}>
            <spriteMaterial attach={"material"} map={playertex}/>
        </sprite>
    );
}

function Tile({ position }) {
    return (
        <mesh position={position}>
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial color="green" />
        </mesh>
    );
}

function Map({ groupRef }) {
    const [encounter, setEncounter ]= useState(null)
    const [playerPosition, setPlayerPosition] = useState({x: 0, y: 0});

    const movePlayer = (event) => {
        const step = 1;
        switch (event.key) {
            case 'ArrowUp':
                setPlayerPosition((pos) => ({
                    x: pos.x,
                    y: Math.min(pos.y + step, MAP_SIZE - 1),
                }));
                break;
            case 'ArrowDown':
                setPlayerPosition((pos) => ({
                    x: pos.x,
                    y: Math.max(pos.y - step, 0),
                }));
                break;
            case 'ArrowLeft':
                setPlayerPosition((pos) => ({
                    x: Math.max(pos.x - step, 0),
                    y: pos.y,
                }));
                break;
            case 'ArrowRight':
                setPlayerPosition((pos) => ({
                    x: Math.min(pos.x + step, MAP_SIZE - 1),
                    y: pos.y,
                }));
                break;
            default:
                return;
        }

        if (Math.random() > 0.95) {
            const id = Math.round(Math.random() * 1000)
            console.log("id: " + id)
            setEncounter(id)
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', movePlayer);
        return () => {
            window.removeEventListener('keydown', movePlayer);
        };
    }, []);

    const tiles = [];
    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            tiles.push(<Tile key={`${x}-${y}`} position={[x, y, 0]}/>);
        }
    }


    return (
        <div>
            <Canvas style={{width: (MAP_SIZE * MAP_SIZE* 4) + "px", height: (MAP_SIZE * MAP_SIZE * 2) + "px"}} orthographic camera={{zoom: 20, position: [MAP_SIZE, MAP_SIZE / 2, 10], up: [0, 0, 0] }} >
                <ambientLight/>
                {tiles}
                <Player position={playerPosition}/>
                <Suspense fallback={"aaa"}>
                    <Encounter groupRef={groupRef} encounter={encounter} setEncounter={() => setEncounter(null)}/>
                </Suspense>
            </Canvas>
        </div>
    );
}

export default Map;