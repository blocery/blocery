import React from 'react'
// import {IconBackArrow} from '~/components/common/icons'
import {Button, Div, Flex} from "~/styledComponents/shared";
import {BsArrowLeftShort} from 'react-icons/bs'
import {IoIosArrowBack} from 'react-icons/io'

const XButton = ({onClick}) => (
    <Button onClick={onClick} bg={'white'} width={36} height={36}>
        <IoIosArrowBack size={20}/>
    </Button>
)
export default XButton