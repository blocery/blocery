import React from 'react';
import {AiOutlineInfoCircle} from 'react-icons/ai'
import {Div, Flex} from "~/styledComponents/shared";

const InfoButton = ({onClick, children}) => {
    return (

        <Flex onClick={onClick} fontSize={13} fg={'darkBlack'}>
            <AiOutlineInfoCircle />
            <Div ml={3} lineHeight={12}>
                <u>
                    {children}
                </u>
            </Div>
        </Flex>


    );
};

export default InfoButton;
