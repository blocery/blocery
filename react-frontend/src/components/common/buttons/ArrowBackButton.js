import React from 'react'
import {Button, Div} from "~/styledComponents/shared";
import {IoIosArrowBack} from 'react-icons/io'

const ArrowBackButton = ({onClick}) => (
    <Div cursor={1} onClick={onClick} bg={'white'}>
        <IoIosArrowBack size={30}/>
    </Div>
)
export default ArrowBackButton