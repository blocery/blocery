import React, {useLayoutEffect} from "react";
import { throttle } from "lodash";

//스크롤 이동 시 (이전,현재) 값을 함수를 호출해 줌
export default function useScrollPos(effect) {
    const scrollObj = {
        previous: 0,
        current: 0,
    };
    // throttle 250ms: https://css-tricks.com/debouncing-throttling-explained-examples/
    // 사용자의 스크롤 이벤트 시 정해진 시간 (250ms) 동안 한번만 호출되는 함수. 250ms 내에서는 함수 호출 무시됨.
    // 시간차 계산인 throttle 을 이용하지 않으면 미세한 손가락 움직임에 의해 반응 하기 때문
    const scrollEventHandlerThrottled = throttle(() => {
        const currentScrollTop =
            window.scrollY || document.documentElement.scrollTop;
        // IE9 not supporting scrollY: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
        scrollObj.previous = scrollObj.current;
        scrollObj.current = currentScrollTop;
        effect(scrollObj);
    }, 250);

    useLayoutEffect(() => {
        document.addEventListener("scroll", scrollEventHandlerThrottled);
        return () =>
            document.removeEventListener("scroll", scrollEventHandlerThrottled);
    }, []);
}
