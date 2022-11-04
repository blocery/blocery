import React, {useEffect} from 'react';
import {Div, Fixed, Flex} from "~/styledComponents/shared";
import {MdClose} from "react-icons/md";
import ComUtil from "~/util/ComUtil";
const NewModalFull = ({isOpen, onClose, children}) => {

    useEffect(() => {
        if (isOpen) {
            ComUtil.noScrollBody()
        }else{
            ComUtil.scrollBody()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <Fixed bg={'black'} top={0} right={0} left={0} bottom={0} zIndex={1051} noResponsive>
            <Flex absolute zIndex={2} top={'5vmin'} right={'5vmin'} onClick={onClose} bg={'rgba(0,0,0, 15%)'} cursor rounded={5} p={5}><MdClose color={'white'} size={30} /></Flex>
            {/*<Div height={'100%'} overflow={'auto'}>*/}
                {children}
            {/*</Div>*/}
        </Fixed>
    );
};

export default NewModalFull;
