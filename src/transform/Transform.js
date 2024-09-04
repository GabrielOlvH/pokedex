import {useState} from "react";

const Transform = (initialPos = [0, 0, 0], initialScale = [1, 1, 1]) => {

    const [pos, setPos] = useState(initialPos)
    const [scale, setScale] = useState(initialScale)
    const [rotation, setRotation] = useState(0)

    const setY = (y) => {
        return setPos((prev) => {
            return [prev[0], y, prev[2]]
        })
    }

    const reset = () => {
        setPos(initialScale)
        setScale(initialScale)
    }

    return {
        pos, setPos, setY,
        scale, setScale,
        rotation, setRotation,
        reset
    }
}

export default Transform