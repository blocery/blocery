import React from 'react';
import {Button} from "~/styledComponents/shared";
import {AiOutlineShareAlt} from 'react-icons/ai'
import {IoMdShare} from 'react-icons/io'
const ShareButton = React.memo(({onClick}) => {
    return (
        <Button relative
            //px={12}
                // bc={'dark'}
                fg={'secondary'}
                // bw={3}
                rounded={19}
                custom={`
                    line-height: 0;
                `}
                onClick={onClick}
        >
            <IoMdShare size={25} />
            {/*<AiOutlineShareAlt size={20} />*/}
        </Button>
    );
});


export default ShareButton;
