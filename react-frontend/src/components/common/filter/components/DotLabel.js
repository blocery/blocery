import {Flex} from "~/styledComponents/shared";
import React from "react";
import {MAIN_COLOR_NAME} from "~/components/common/filter/FilterStore";

/**
 * [공통 라벨] dot 이 있는 디자인 된 라벨
 * @param isActive
 * @param onClick
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
const DotLabel = ({isActive, onClick, children}) =>
    <Flex
        px={16}
        minHeight={44}
        cursor={1}
        dot
        fg={isActive && MAIN_COLOR_NAME}
        bold={isActive}
        onClick={onClick}
    >
        {children}
    </Flex>

export default DotLabel