import { useState, useEffect } from 'react';

export function useLocalStorageState (initialState, key) {
    const [value, setValue] = useState(function () {
        const localWatched = localStorage.getItem('key');
        return localWatched ? JSON.parse(localWatched) : initialState;
    });

    useEffect(
        function () {
            localStorage.setItem('key', JSON.stringify(value));
        },
        [value, key]
    );

    return [value, setValue];
}