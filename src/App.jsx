import './App.css';
import React, {Suspense, useRef, useState} from "react";
import Encounter from "./encounter/Encounter";
import Map from "./player/Player";
import {Group} from "@tweenjs/tween.js";
import {PopupProvider} from "./popups/PopupContext";
import Popup from "./popups/Popup";
import ZoneSelector from "./zone_selector/ZoneSelector";

function App() {

    const [showZoneSelector, setShowZoneSelector] = useState(false)
    const groupRef = useRef(new Group());
    const [encounter, setEncounter] = useState(null)

    const [playerPosition, setPlayerPosition] = useState({x: 1, y: 1, zone: 1});
    return (
        <PopupProvider>
            <div className="App">
                {/**/}

                {!showZoneSelector && (<Map groupRef={groupRef} setEncounter={setEncounter}
                                            openZoneSelector={() => setShowZoneSelector(true)}
                                            playerPosition={playerPosition}
                                            setPlayerPosition={setPlayerPosition}
                />)}
                {!showZoneSelector &&
                    <Suspense fallback={"aaa"}>
                        <Encounter groupRef={groupRef} encounter={encounter} setEncounter={() => setEncounter(null)}/>
                    </Suspense>}
                {showZoneSelector && <ZoneSelector closeMap={() => setShowZoneSelector(false)} setPlayerPosition={setPlayerPosition}/>}
            </div>
            <Popup/>
        </PopupProvider>
    );
}

export default App;
