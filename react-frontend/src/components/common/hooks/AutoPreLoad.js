import React, { useEffect, useState, useRef } from "react";
import ComUtil from "~/util/ComUtil";

const AutoPreLoad = ({ callback = () => null, children }) => {
    const divRef = useRef(null);

    /*
      didMount 시 window 안에 Element가 이미 있을 경우 callback 실행

      사용해야 하는 이유 : <InfiniteScroll> 을 사용할 경우 스크롤 이벤트에만 트리거가 동작하는데 스크롤 없이 이미 화면속에 엘리먼트가 있으면 로드가 되지 않는 문제점 때문임
      페이지 로드시 아래 useEffect 에서 한번만 체크 하여 callback 호출하기 때문에 double callback 호출 이슈는 없음(테스트 완료)
      InfiniteScroll 깃헙 에서도 해당 이슈는 정상적인 스크롤 트리거 이슈라서 preFilled 와 같은 별도의 props 를 제공하지 않기 때문에 유저가 직접 판별하여 수동으로 이벤트를 일으켜 줘야 함.

      추가 tip: minHeight 를 항상 사용하여 페이지 로드시 처음부터 스크롤이 되도록 하면 사실 AutoPageLoad 컴포넌트의 callback 이 호출 할 경우의 수가 줄어듬.
      하지만 굉장히 큰 사이즈의 디바이스 사용 시 로드가 안 될 수 있기 때문에 항상 사용하는게 안정적임.
    */

    useEffect(() => {
        // const innerHeight = window.innerHeight;
        // const offsetTop = divRef.current.offsetTop;
        //
        // console.log({ offsetTop, innerHeight: window.innerHeight });
        //
        // if (offsetTop <= innerHeight) {
        //     console.log("============= AutoPageload =============");
        //     callback();
        // }
        //
        // console.log(React.Children);
        if (ComUtil.isInsideWindow(divRef)) {
            callback();
        }
    }, []);

    return <div ref={divRef}>{children}</div>;
};

export default AutoPreLoad;
