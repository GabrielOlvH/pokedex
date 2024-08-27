import { useData } from "../data/Data";
import { useQuery } from "react-query";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import TWEEN, {Group} from "@tweenjs/tween.js";
import './Encounter.css'

const Encounter = () => {
    const data = useData();
    const pkmn = useQuery("pokemon", data.getEncounter, {suspense: true}).data;
    const mountRef = useRef(null);
    const [showScene, setShowScene] = useState(false);

    useEffect(() => {
        if (!showScene) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);
        renderer.setClearColor(0xffffff, 0);
        camera.position.z = 5;

        // TextureLoader and sprite creation
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");

        const createSprite = (loc) => {
            const texture = loader.load(loc);
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            const material = new THREE.SpriteMaterial({map: texture});
            const sprite = new THREE.Sprite(material);
            return {
                texture,
                material,
                sprite
            };
        };

        // Pokemon sprite
        const pokemon = createSprite(pkmn.sprites.front_default);
        pokemon.sprite.scale.set(2, 2, 1);
        pokemon.sprite.position.set(0, 1, 0);

        scene.add(pokemon.sprite);

        // Pokeball sprite
        const pokeball = createSprite("pokeball.png");
        pokeball.sprite.position.set(0, -2, 1);
        pokeball.sprite.scale.set(.5, .5, 1)
        scene.add(pokeball.sprite);

        // Text canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.font = "Bold 48px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("Click to capture", canvas.width / 2, canvas.height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({map: texture});
        const textSprite = new THREE.Sprite(material);
        textSprite.scale.set(5, 2.5, 1);
        textSprite.position.set(0, -1.2, 0);
        scene.add(textSprite);

        // Audio setup
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(pkmn.cries.latest, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.02);
            sound.play();
        });

        // Click event
        const onClick = (event) => {
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(pokeball.sprite);
            if (intersects.length > 0) {
                console.log("clicked");
                throwPokeball();
            }
        };

        const group = new Group()

        const throwPokeball = () => {
            let capturing = false
            group.add(new TWEEN.Tween(pokeball.sprite.position)
                .to({x: 0, y: 1, z: 1}, 1500)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate((pos, elapsed) => {
                    if (elapsed > 0.9 && !capturing) {
                        capturing = true
                        group.add(new TWEEN.Tween({progress: 0.0})
                            .to({progress: 1.0}, 500)
                            .easing(TWEEN.Easing.Linear.InOut)
                            .onUpdate((obj) => {
                                const animation = 2 * (1 - obj.progress);
                                pokemon.sprite.scale.set(animation, animation, 1)
                                const color = 1 + 10 * (obj.progress)
                                pokemon.sprite.material.color = new THREE.Color(color, color, color)
                                pokemon.sprite.position.set(0, 1 + obj.progress * 0.5, 0)
                            })
                            .onComplete(() => shakePokeball())
                            .start())
                    }
                })
                .start());


        };

        // Shaking animation
        const shakePokeball = () => {
            let count = 0
            const totalShakes = 5;
            if (count >= totalShakes) {
                checkCapture(); // Perform capture check after finishing all shakes
                return;
            }

            const shakeLeft = new TWEEN.Tween({rotation: 0})
                .to({rotation: (Math.PI / -4)}, 250)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((object) => {
                    pokeball.sprite.material.rotation = object.rotation;
                })
                .onComplete(() => {

                })

            const idle = new TWEEN.Tween({rotation: Math.PI / 4})
                .to({rotation: 0}, 1000)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate((object) => {
                    pokeball.sprite.material.rotation = object.rotation;
                })
                .onComplete(() => {
                    count++
                    if (count < 5) {
                        shakeLeft.start()
                    } else {
                        checkCapture()
                    }

                })

            const shakeRight = new TWEEN.Tween({rotation: Math.PI / -4})
                .to({rotation: (Math.PI / 4)}, 250)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((object) => {
                    pokeball.sprite.material.rotation = object.rotation;
                })
                .onComplete(() => {
                    idle.start()
                })

            group.add(shakeLeft)
            group.add(shakeRight)
            group.add(idle)

            shakeLeft.chain(shakeRight)
            shakeLeft.start()

        };


        // Capture check
        function checkCapture() {
            const success = Math.random() > 0.5;
            if (success) {
                console.log("Capture successful!");
                data.setCaptured(pkmn.id);
            } else {
                console.log("Capture failed!");
                pokemon.sprite.material.color.set(0xFFFFFF)
                pokemon.sprite.scale.set(2, 2, 2)
                pokeball.sprite.position.set(0, -2, 1);
                pokeball.sprite.material.rotation = 0;
            }
        }

        document.addEventListener("click", onClick);

        // Animation loop
        const animate = (time) => {
            requestAnimationFrame(animate);
            group.update(time); // Pass time to TWEEN.update()
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            document.removeEventListener("click", onClick);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [showScene]);

    return (
        <>
            <div className={"bg"}></div>

            <div>

                {!showScene && <button onClick={() => setShowScene(true)} className={"play-button"}>play</button>}
                <div ref={mountRef}/>
            </div>
        </>
    );
};

export default Encounter;
