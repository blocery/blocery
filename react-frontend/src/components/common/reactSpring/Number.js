import React, {useState} from "react";
import {animated, config, useSpring} from "react-spring";
import ComUtil from "~/util/ComUtil";

function Number({value = 220}) {
    const props = useSpring({ val: value, from: { val: 0 },
        delay: 200,
        config: config.molasses,
    });

    return <animated.span>{props.val.interpolate(val => ComUtil.addCommas(Math.floor(val)))}</animated.span>
}
export default Number
