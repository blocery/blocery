import React from "react";
import {Button} from "~/styledComponents/shared";
import {IoIosArrowDown} from "react-icons/io";


const MoreButton = React.memo(({onClick, children}) =>
    <Button block fontSize={13} bg={'white'} py={10} onClick={onClick}>{children}<IoIosArrowDown /></Button>)
export default MoreButton