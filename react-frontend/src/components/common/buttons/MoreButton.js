import React from 'react'
import {IoIosArrowDown, IoIosArrowForward} from 'react-icons/io'
import {Flex, Space} from "~/styledComponents/shared";
const MoreButton = ({onClick, isArrowRight, children}) =>
    <Flex onClick={onClick} minHeight={50} justifyContent={'center'} bc={'light'} cursor fontSize={14}>
        <Space lineHeight={12} spaceGap={3}>
            <span>{children ? children : '더보기'}</span>
            {!isArrowRight ? <IoIosArrowDown /> : <IoIosArrowForward/>}
        </Space>
    </Flex>
export default MoreButton