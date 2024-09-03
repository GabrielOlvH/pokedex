import './App.css';
import {Suspense, useRef, useState} from "react";
import Encounter from "./encounter/Encounter";
import Map from "./player/Player";
import {Group} from "@tweenjs/tween.js";

function App() {

    const groupRef = useRef(new Group());
    return (
        <div className="App" >
            {/**/}

            {<Map groupRef={groupRef}/>}
        </div>
    );
}

export default App;
