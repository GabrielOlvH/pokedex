import './App.css';
import {Suspense} from "react";
import Encounter from "./encounter/Encounter";

function App() {
    return (
        <div className="App">
            <Suspense fallback={<div>"Loading...."</div>}>
                <Encounter/>
            </Suspense>
        </div>
    );
}

export default App;
