import './App.css';
import {Suspense, useRef, useState} from "react";
import Encounter from "./encounter/Encounter";
import Map from "./player/Player";

function App() {
    const [encounter, setEncounter ]= useState(null)
    return (
        <div className="App" >
            {/**/}
             <Suspense fallback={<div>"Loading...."</div>}>
                <Encounter  setEncounter={() =>setEncounter(null)}/>
            </Suspense>
            {<Map setEncounter={() =>setEncounter("aaaa")}/>}
        </div>
    );
}

export default App;
