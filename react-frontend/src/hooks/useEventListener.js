import React, {useEffect, useRef} from "react";

const useEventListener = (type, handler, el ) => {
    const savedHandler = useRef();

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {


        const listener = e => savedHandler.current(e);

        if(el) {
            el.addEventListener(type, listener);
        }

        return () => {
            if(el) {
                el.removeEventListener(type, listener);
            }
        };
    }, [type, el]);
};
export default useEventListener