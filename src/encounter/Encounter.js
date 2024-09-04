import { useData } from "../data/Data";
import { useQuery } from "react-query";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {useEffect, useRef, useState, useMemo, Suspense} from "react";
import { TextureLoader, NearestFilter, SpriteMaterial, Sprite, AudioLoader, AudioListener, Audio } from "three";
import TWEEN, { Group } from "@tweenjs/tween.js";
import './Encounter.css';
import Transform from "../transform/Transform";

const Encounter = ({ encounter, setEncounter, groupRef }) => {
    const data = useData();
    const [pkmn, setPkmn] = useState(null)
    useEffect(() => {
        if (encounter != null) {
            fetch(`https://pokeapi.co/api/v2/pokemon/${encounter}/`).then((response) => {
                response.json().then((json) => {
                    setPkmn(json)
                })

            })
        } else {
            setPkmn(null)
        }
    }, [encounter])
    const [showScene, setShowScene] = useState(true);

    const pokeball = Transform([0, 0, -1], [0.1, 0.1, 0.1])
    const [pokemonColor, setPokemonColor] = useState(1)
    const pokemon = Transform([0, 1, -1], [1, 1, 1])

    const group = useMemo(() => new Group(), []);

    useEffect(() => {
        if (groupRef) {
            groupRef.current = group;
        }
    }, [group, groupRef]);

    const throwPokeball = () => {
        let capturing = false;
        group.add(
            new TWEEN.Tween({y: 0})
                .to({ y: 1 }, 1500)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate((pos, elapsed) => {
                    pokeball.setY(elapsed)
                    if (elapsed > 0.9 && !capturing) {
                        capturing = true;
                        group.add(
                            new TWEEN.Tween({ progress: 0.0 })
                                .to({ progress: 1.0 }, 500)
                                .easing(TWEEN.Easing.Linear.InOut)
                                .onUpdate((obj) => {
                                    const animation = 2 * (1 - obj.progress);
                                    const color = 1 + 10 * obj.progress;
                                    pokemon.setScale([animation, animation, 1])
                                    pokemon.setPos([0, 0.75 + obj.progress * 0.5, -1])
                                    setPokemonColor(color)
                                })
                                .onComplete(() => shakePokeball())
                                .start()
                        );
                    }
                })
                .start()
        );
    };

    const shakePokeball = () => {
        let count = 0;
        const totalShakes = 5;

        const shakeLeft = new TWEEN.Tween({ rotation: 0 })
            .to({ rotation: Math.PI / -4 }, 250)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((object) => {
                pokeball.setRotation(object.rotation)
            });

        const idle = new TWEEN.Tween({ rotation: Math.PI / 4 })
            .to({ rotation: 0 }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onUpdate((object) => {
                pokeball.setRotation(object.rotation)
            })
            .onComplete(() => {
                count++;
                if (count < totalShakes) {
                    shakeLeft.start();
                } else {
                    checkCapture();
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

    const checkCapture = () => {
        const success = Math.random() > 0.5;
        if (success) {
            setEncounter();
            data.setCaptured(pkmn.id);
        }
        pokemon.reset()
        pokeball.reset()
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
        }
    }, [pkmn]);

    const EncounterScene = () => {
        const pokemonTexture = useLoader(TextureLoader, pkmn.sprites.front_default);
        pokemonTexture.minFilter = NearestFilter;
        pokemonTexture.magFilter = NearestFilter;

        useFrame((state, delta) => {
            group.update(state.clock.elapsedTime * 1000);
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
        <>
            {!showScene && <button onClick={() => setShowScene(true)} className={"play-button"}>play</button>}
            {showScene && (
                <group position={[30, 0, 2]} scale={[10, 10, 10]}>
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
                </group>
            )}
        </>
    );
};

export default Encounter;
