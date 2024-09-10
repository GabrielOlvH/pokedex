import React, {useRef, useEffect, useState} from 'react';
import * as THREE from 'three';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {useData} from "../hooks/useData";
import GetZoneData from "./Tiles";
import {useWebSocket} from "../ws/WebSocketProvider";

const MAP_SIZE = 20; // Define o tamanho do mapa (10x10)

function Player({ position }) {
    const playerRef = useRef();
    const playertex = useLoader(THREE.TextureLoader, 'pokeball.png');

    useFrame(() => {
        if (playerRef.current) {
            playerRef.current.position.x = position.x;
            playerRef.current.position.y = position.y;
            playerRef.current.position.zone = position.zone;
        }
    });

    return (
        <sprite ref={playerRef} position={[position.x, position.y, 1]}>
            <spriteMaterial attach={"material"} map={playertex}/>
        </sprite>
    );
}

function Tile({ position, data }) {
    return (
        <mesh position={position}>
            <planeGeometry args={[20, 20]}/>
            {data}
        </mesh>
    );
}

function Map({ setEncounter, openZoneSelector, playerPosition, setPlayerPosition }) {

    const data = useData()

    const { sendMessage } = useWebSocket()
    let canWalk = true
    const movePlayer = (event) => {

        if (!canWalk) return;
        const step = 1;
        switch (event.key) {
            case 'ArrowUp':
                setPlayerPosition((pos) => ({
                    ...pos,
                    x: pos.x,
                    y: Math.min(pos.y + step, MAP_SIZE - 1),
                }));
                break;
            case 'ArrowDown':
                setPlayerPosition((pos) => ({
                    ...pos,
                    x: pos.x,
                    y: Math.max(pos.y - step, 0),
                }));
                break;
            case 'ArrowLeft':
                setPlayerPosition((pos) => ({
                    ...pos,
                    x: Math.max(pos.x - step, 0),
                    y: pos.y,
                }));
                break;
            case 'ArrowRight':
                setPlayerPosition((pos) => ({
                    ...pos,
                    x: Math.min(pos.x + step, MAP_SIZE - 1),
                    y: pos.y,
                }));
                break;
            default:
                return;
        }
        canWalk = false

      /*  data.getEncounter(playerPosition).then(r => {
            if (r === null) {
                setEncounter(null)
            } else {
                setEncounter(r.id)
            }
        })*/

        const timeout = setTimeout(() => {
            canWalk = true
            clearTimeout(timeout)
        }, 1000)
    };

    useEffect(() => {
        window.addEventListener('keydown', movePlayer);
        return () => {
            window.removeEventListener('keydown', movePlayer);
        };
    }, []);

    const [tiles, setTiles] = useState(GetZoneData(playerPosition.zone));
    const mapData = GetZoneData(playerPosition.zone);
    useEffect(() => {
        if (mapData === undefined) return;
        setTiles(mapData)
    }, [mapData])



    return (
        <div className={"game"}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem"}}>
                <button style={{width: "fit-content", padding: ".25rem .5rem .5rem .5rem", marginBottom: ".5rem"}}
                        onClick={openZoneSelector}>Open Map
                </button>
                <p style={{color: "white"}}>X: {playerPosition.x} Y: {playerPosition.y}</p>
            </div>
            <Canvas
                className={"canvas"}
                style={{width: "300px", height: "300px"}}
                orthographic
                camera={{zoom: 15, position: [13.5, 13.5, 8.9], up: [0, 0, 0]}}
                gl={{
                    outputEncoding: THREE.sRGBEncoding,  // Correct color encoding
                    toneMapping: THREE.NoToneMapping,    // Disable tone mapping if needed
                }}

            >
                <ambientLight/>
                {tiles}
                <Player position={{
                    x: playerPosition.x +0.5,
                    y: playerPosition.y+0.5
                }}/>

            </Canvas>
            <div style={{textAlign: "center", marginTop: ".5rem"}}>
                <button onClick={() => movePlayer({key: 'ArrowUp'})}>↑</button>
                <div style={{marginTop: ".5rem", display: "flex", justifyContent: "center", gap: ".5rem"}}>
                    <button onClick={() => movePlayer({key: 'ArrowLeft'})}>←</button>
                    <button onClick={() => movePlayer({key: 'ArrowDown'})}>↓</button>
                    <button onClick={() => movePlayer({key: 'ArrowRight'})}>→</button>
                </div>
            </div>
        </div>
    );
}

export default Map;