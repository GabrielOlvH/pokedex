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

    const getEncounter = async () => {
        const id = Math.floor((Date.now() * Math.random()) % 1000)
        return (await fetch(` https://pokeapi.co/api/v2/pokemon/${id}/`)).json()
    }

    const getSpecies = async(species) => {
        return (await fetch(` https://pokeapi.co/api/v2/pokemon-species/${species}/`)).json()
    }

    return {
        data,
        canEncounter,
        setCaptured,
        getSpecies,
        getEncounter,
        resetData
    }
}