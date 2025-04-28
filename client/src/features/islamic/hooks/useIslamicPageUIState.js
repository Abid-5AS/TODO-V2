import { useState, useCallback } from 'react';

export const useIslamicPageUIState = (initialDebugState = false) => {
    const [showDebug, setShowDebug] = useState(initialDebugState);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const toggleDebug = useCallback(() => {
        setShowDebug(prev => !prev);
    }, []);

    const openLocationModal = useCallback(() => {
        setShowLocationModal(true);
    }, []);

    const closeLocationModal = useCallback(() => {
        setShowLocationModal(false);
    }, []);

    const openSettingsModal = useCallback(() => {
        setShowSettingsModal(true);
    }, []);

    const closeSettingsModal = useCallback(() => {
        setShowSettingsModal(false);
    }, []);

    return {
        showDebug,
        showLocationModal,
        showSettingsModal,
        toggleDebug,
        openLocationModal,
        closeLocationModal,
        openSettingsModal,
        closeSettingsModal,
    };
}; 