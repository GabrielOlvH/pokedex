import './App.css';
import React, {Suspense, useEffect, useRef, useState} from "react";
import Encounter from "./encounter/Encounter";
import Map from "./player/Player";
import {Group} from "@tweenjs/tween.js";
import {PopupProvider} from "./popups/PopupContext";
import Popup from "./popups/Popup";
import ZoneSelector from "./zone_selector/ZoneSelector";
import {useWebSocket} from "./ws/WebSocketProvider";

function App() {

    const [showZoneSelector, setShowZoneSelector] = useState(false)
    const groupRef = useRef(new Group());

    const [playerPosition, setPlayerPosition] = useState({x: 1, y: 1, zone: 1});

    const { sendMessage } = useWebSocket()

    useEffect(() => {
        sendMessage('MOVE_PLAYER', JSON.stringify(playerPosition))
    }, [playerPosition])
    return (
        <PopupProvider>
            <div className="App">
                {/**/}

                {(<Map groupRef={groupRef}
                                            openZoneSelector={() => setShowZoneSelector(true)}
                                            playerPosition={playerPosition}
                                            setPlayerPosition={setPlayerPosition}
                />)}
                {
                    <Suspense fallback={"aaa"}>
                        <Encounter groupRef={groupRef} playerPosition={playerPosition}/>
                    </Suspense>}
                {showZoneSelector && <ZoneSelector closeMap={() => setShowZoneSelector(false)} setPlayerPosition={setPlayerPosition}/>}
            </div>
            <Popup/>
        </PopupProvider>
    );
}

export default App;
