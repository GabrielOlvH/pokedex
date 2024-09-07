import {useEffect, useState} from "react";

const defaultData = () => {
    return {
        last_encounter: new Date(0),
        captured: []
    };
}

const getInitialData = () => {
    const savedData = localStorage.getItem('data');
    return savedData ? JSON.parse(savedData) : defaultData()
}

export const useData = () => {
    const [data, setData] = useState(getInitialData())

    useEffect(() => {
        localStorage.setItem('data', JSON.stringify(data));
    }, [data]);

    const resetData = () => {
        setData(defaultData());
    };

    const setCaptured = (captured) => {
        const newData = defaultData()
        newData["last_encounter"] = new Date(Date.now());
        newData.captured = [...data.captured, captured]
        setData(newData)
    }

    const canEncounter = () => {
        const lastEncounter = new Date(data.last_encounter);
        const today = new Date();

        lastEncounter.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        return lastEncounter < today
    }

    const getEncounter = async (pos) => {
        if (Math.random() > 0.5) {
            const id = Math.round(Math.random() * 1000)
            return {id: id}
        } else {
            return Promise.resolve(null)
        }
        //return (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)).json()
    }

    const getCatchSuccesses = (pkmn) => {
        return getSpecies(pkmn.id).then(species => {
            const catchRate = species.capture_rate * 2
            console.log(catchRate)
            let shakes = 3;
            for (let i = 0; i < shakes; i++) {
                let randomValue = Math.floor(Math.random() * 256);
                if (randomValue > catchRate) {
                    return i
                }
            }
            return 3;
        })

    }

    const getSpecies = async(species) => {
        return (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${species}/`)).json()
    }

    return {
        data,
        canEncounter,
        setCaptured,
        getSpecies,
        getEncounter,
        resetData,
        getCatchSuccesses
    }
}