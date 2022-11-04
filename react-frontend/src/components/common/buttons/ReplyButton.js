import React from 'react';
import PropTypes from 'prop-types';
import {HiOutlineChatAlt} from 'react-icons/hi'
import {BsChat} from 'react-icons/bs'

import {Div, Space, Span} from "~/styledComponents/shared";
import {IoChatbubble} from "react-icons/io5";
import {color} from "~/styledComponents/Properties";

const ReplyButton = ({children}) => {
    return (
        <Space spaceGap={12} fg={'secondary'} cursor={1}>
            <IoChatbubble size={23} color={color.secondary}/>
            <Div fontSize={12}>
                {children}
            </Div>
        </Space>
    );
};

export default ReplyButton;
