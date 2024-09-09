// usePopup.jsx
import { v4 as uuidv4 } from 'uuid';
import { usePopups } from '../popups/PopupContext';

const usePopup = () => {
    const { addPopup } = usePopups();

    const triggerPopup = (content, duration) => {
        const id = uuidv4();
        addPopup({ id, content, duration });
    };

    return triggerPopup;
};

export default usePopup;
