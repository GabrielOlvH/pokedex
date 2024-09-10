import { useData } from "../hooks/useData";
import { useQuery } from "react-query";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {useEffect, useRef, useState, useMemo, Suspense} from "react";
import { TextureLoader, NearestFilter, SpriteMaterial, Sprite, AudioLoader, AudioListener, Audio } from "three";
import TWEEN, { Group } from "@tweenjs/tween.js";
import './Encounter.css';
import Transform from "../transform/Transform";
import usePopup from "../hooks/usePopup";
import * as THREE from 'three';
import {useWebSocket} from "../ws/WebSocketProvider";

const Encounter = ({ playerPosition, groupRef }) => {

    const data = useData();
    const [pkmn, setPkmn] = useState(null)
    const triggerPopup = usePopup()

    const [waitingCaptureCheck, setWaitingCaptureCheck] = useState(false)

    const { encounterMessage, captureCheck, sendMessage } = useWebSocket()
    const state = useWebSocket()

    useEffect(() => {
        console.log(`received ${encounterMessage}`)
        if (encounterMessage !== null && encounterMessage.toString() !== 'none') {
            const { pokemon_id } = JSON.parse(encounterMessage)
            console.log("fetching!!")
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_id}/`).then((response) => {
                response.json().then((json) => {
                    setPkmn(json)
                    triggerPopup((
                        <>
                            <h2>A wild {json.name.toUpperCase()} has appeared!</h2>
                        </>
                    ), 2000)
                })

            })
        } else {
            console.log("set to null")

            setPkmn(null)
        }
    }, [encounterMessage])

    const [showScene, setShowScene] = useState(true);

    const pokeball = Transform([0, -0.75, -1], [0.1, 0.1, 0.1])
    const [pokemonColor, setPokemonColor] = useState(1)
    const pokemon = Transform([0, 1.5, -1], [2, 2, 2])

    const group = useMemo(() => new Group(), []);

    useEffect(() => {
        if (groupRef) {
            groupRef.current = group;
        }
    }, [group, groupRef]);



    const throwPokeball = () => {
        sendMessage('THROW_POKEBALL', JSON.stringify(playerPosition))
        setWaitingCaptureCheck(true)
        console.log("THROW")
    };

    useEffect(() => {
        if (!waitingCaptureCheck || captureCheck == null) return
        state.captureCheck = null
        const {shakes} = JSON.parse(captureCheck)
        let capturing = false;
        group.add(
            new TWEEN.Tween({y: -0.75})
                .to({ y: 1.5 }, 1500)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate((pos, elapsed) => {
                    pokeball.setY(pos.y)
                    if (elapsed > 0.85 && !capturing) {
                        capturing = true;
                        group.add(
                            new TWEEN.Tween({ progress: 0.0 })
                                .to({ progress: 1.0 }, 500)
                                .easing(TWEEN.Easing.Linear.InOut)
                                .onUpdate((obj) => {
                                    const animation = 2 * (1 - obj.progress);
                                    const color = 1 + 10 * obj.progress;
                                    pokemon.setScale([animation, animation, 1])
                                    pokemon.setPos([0, .5 + 0.75 + obj.progress * 0.5, -1])
                                    setPokemonColor(color)
                                })
                                .onComplete(() => shakePokeball(shakes))
                                .start()
                        );
                    }
                })
                .start()
        );
        setWaitingCaptureCheck(false)
    }, [captureCheck, waitingCaptureCheck])

    const shakePokeball = (totalShakes) => {
        let count = 0;

        const shakeLeft = new TWEEN.Tween({ rotation: 0 })
            .to({ rotation: Math.PI / -4 }, 250)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((object) => {
                pokeball.setRotation(object.rotation)
            });

        const idle = new TWEEN.Tween({ rotation: Math.PI / 4 })
            .to({ rotation: 0 }, 500)
            .easing(TWEEN.Easing.Bounce.Out)
            .onUpdate((object) => {
                pokeball.setRotation(object.rotation)
            })
            .onComplete(() => {
                count++;
                if (count < totalShakes) {
                    shakeLeft.start();
                } else {
                    checkCapture(totalShakes);
                }
            });

        const shakeRight = new TWEEN.Tween({ rotation: Math.PI / -4 })
            .to({ rotation: Math.PI / 4 }, 250)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((object) => {
                pokeball.setRotation(object.rotation)
            })
            .onComplete(() => {
                idle.start();
            });

        group.add(shakeLeft);
        group.add(shakeRight);
        group.add(idle);

        shakeLeft.chain(shakeRight);
        shakeLeft.start();
    };

    const checkCapture = (totalShakes) => {
        const success = totalShakes === 3;
        console.log(totalShakes)
        pokemon.reset()
        pokeball.reset()
        setPokemonColor(1)
        if (success) {
            data.setCaptured(pkmn.id);
            triggerPopup((
                <>
                    <h2>Gotcha!</h2>
                    <p>{pkmn.name.toUpperCase()} was caught!</p>
                </>
            ), 2000)
        }

    };

    useEffect(() => {
        if (pkmn != null) {
            const audioListener = new AudioListener();
            const sound = new Audio(audioListener);
            const audioLoader = new AudioLoader();
            audioLoader.load(pkmn.cries.latest, (buffer) => {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.05);
                sound.play();
            });
        } else {
        }
    }, [pkmn]);

    const EncounterScene = () => {
        const pokemonTexture = useLoader(TextureLoader, pkmn.sprites.front_default);
        pokemonTexture.minFilter = NearestFilter;
        pokemonTexture.magFilter = NearestFilter;

        useFrame((state, delta) => {
            group.update();
        });

        return (
            <>
                <sprite scale={pokemon.scale}
                        position={pokemon.pos}
                        renderOrder={0}>
                    <spriteMaterial attach="material" color={[pokemonColor, pokemonColor, pokemonColor]} map={pokemonTexture}/>
                </sprite>
            </>
        );
    };
    const pokeballTexture = useLoader(TextureLoader, "pokeball.png");

    return (
        <div>
            {!showScene && <button onClick={() => setShowScene(true)} className={"play-button"}>play</button>}
            {showScene && (
                <Canvas
                    className={"encounter canvas"}
                    style={{width: "300px", height: "300px"}}
                    orthographic camera={{zoom: 75, position: [0, 2, 10], up: [0, 0, 0] }}
                    gl={{
                        outputEncoding: THREE.sRGBEncoding,  // Correct color encoding
                        toneMapping: THREE.NoToneMapping,    // Disable tone mapping if needed
                    }}

                >
                    {pkmn != null && <Suspense fallback={""}>
                        <EncounterScene/>
                    </Suspense>}
                    <sprite scale={[0.5, 0.5, 0.5]}
                            position={pokeball.pos}
                            onClick={throwPokeball}
                            renderOrder={10}>
                        <spriteMaterial attach="material" depthTest={false} map={pokeballTexture}
                                        rotation={pokeball.rotation}/>
                    </sprite>
                </Canvas>
            )}
        </div>
    );
};

export default Encounter;
