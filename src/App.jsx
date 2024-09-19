import './App.css';
import React, {Suspense, useEffect, useRef, useState} from "react";
import Encounter from "./encounter/Encounter";
import Map from "./player/Player";
import {Group} from "@tweenjs/tween.js";
import ZoneSelector from "./zone_selector/ZoneSelector";
import {useWebSocket} from "./ws/WebSocketProvider";
import {useAuth} from "./auth/AuthContext";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Pokedex from "./pokedex/Pokedex";

function App() {

    const {user, authenticated, logout} = useAuth();

    if (!authenticated) {
        return (
            <div className="App">
                <Login/>
                <Signup/>
            </div>);
    }


    const [showZoneSelector, setShowZoneSelector] = useState(false)
    const [playerPosition, setPlayerPosition] = useState({x: 1, y: 1, zone: 1});
    const [pokedexVisible, setPokedexVisible] = useState(false)

    const groupRef = useRef(new Group());

    const {sendMessage} = useWebSocket()

    useEffect(() => {
        sendMessage('MOVE_PLAYER', JSON.stringify(playerPosition))
    }, [playerPosition])

    return (
        <div className="App">
            <div className={"toolbar"}>
                <div style={{gap: "1rem", display: "flex"}}>
                    <button className={"game-button"}
                            onClick={() => setShowZoneSelector(true)}>M
                    </button>
                    <button className={"game-button"}
                            onClick={() => logout()}>L
                    </button>
                    <button className={"game-button"}
                            onClick={() => setPokedexVisible(true)}>P
                    </button>
                </div>
                <p style={{color: "white"}}>{user?.username}</p>
                <p style={{color: "white"}}>X: {playerPosition.x} Y: {playerPosition.y}</p>
            </div>
            <Map
                openZoneSelector={() => setShowZoneSelector(true)}
                playerPosition={playerPosition}
                setPlayerPosition={setPlayerPosition}
            />

            <Suspense fallback={"aaa"}>
                <Encounter groupRef={groupRef} playerPosition={playerPosition}/>
            </Suspense>
            {showZoneSelector &&
                <ZoneSelector
                    closeMap={() => setShowZoneSelector(false)}
                    setPlayerPosition={setPlayerPosition}
                />
            }
            <Suspense fallback={"loading..."}>
                <Pokedex setVisible={setPokedexVisible} visible={pokedexVisible}/>
            </Suspense>
        </div>
    );
}

export default App;
