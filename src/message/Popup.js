// Popup.js
import React, {useEffect, useState} from 'react';
import { usePopups } from './PopupContext';
import './Message.css'

const Popup = () => {
    const { popups } = usePopups();
    const [animatedPopups, setAnimatedPopups] = useState(popups);

    useEffect(() => {
        setAnimatedPopups(popups);
    }, [popups]);


    return (
        <div className={"message-container"}>
            {animatedPopups.map((popup) => (
                <div key={popup.id} className={"message-background" + (popup.show ? " show" : " hide")}>
                    {popup.content}
                </div>
            ))}
        </div>
    );
};

export default Popup;
