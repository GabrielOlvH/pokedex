import './ZoneSelector.css'
import {useState} from "react";

const ZoneSelector = ({closeMap, setPlayerPosition}) => {

    const [selected, setSelected] = useState(-1)

    let zones = []
    for (let i = 0; i < 32; i++) {
        zones.push(<div className={"zone" + (selected === i ? " selected" : "")}
                        onClick={() => setSelected(i)}>Zone {i}</div>)
    }
    return (
        <>
            <div className={"zone-selector"}>
                <div className={"zone-grid"}>
                    <img className={"map"} src={"testmap.png"}/>
                    {zones}
                </div>
            </div>
            <div className={"zone-grid-buttons"}>
                <button className={"zone-menu-button"} onClick={closeMap}>CLOSE</button>
                <button className={"zone-menu-button"} onClick={() => {
                    setPlayerPosition((prev) => ({
                        ...prev,
                        zone: selected
                    }))
                    closeMap()
                }
                }>VISIT
                </button>
            </div>
        </>
    )
}

export default ZoneSelector