import { useState } from "react";

// Define a generic type T that enforces a structured modal state
export const useModalState = <T extends Record<string, boolean>>(initialStates: T) => {

    // Use state with the inferred type
    const [modalState, setModalState] = useState<T>(initialStates);

    // Toggle function with proper typing
    const toggleModal = (type: keyof T) => {
        setModalState(prev => ({
            ...prev,
            [type]: !prev[type] // Ensures boolean toggling
        }));
    };

    return { toggleModal, modalState };
};
