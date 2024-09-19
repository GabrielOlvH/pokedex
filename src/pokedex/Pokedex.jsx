import './Pokedex.css'
import axios from "axios";
import {useEffect, useState} from "react";

const Pokedex = ({ visible, setVisible }) => {
    const [entries, setEntries] = useState([])
    useEffect(() => {
        axios.get("http://localhost:4001/pokedex").then((resp) => {

            const entries = []
            for (let i = 1; i <= 151; i++) {
                for (let datum of resp.data) {
                    entries[datum.id] = (
                        <div key={datum.id} className={"entry"}>
                            <div className={"caught"}>
                                <img height={16} className={"caught-icon"} src={"pokeball.png"}/>
                                <p>0</p>
                            </div>
                            <img src={`data:image/png;base64,${datum.sprite}`}/>
                            <p className={"pokedex-number"}>#{datum.id}</p>
                            <p className={"name"}>{datum.name}</p>
                        </div>)
                }

            }
            setEntries(entries)
        });
    }, [])


    console.log("rerender!!")
    return (
        <div className={`pokedex${visible ? " visible" : ""}`}>
            <h2>Pokedex</h2>
            <div className={"entries"}>
                {entries}
            </div>
        </div>
    )
}

export default Pokedex