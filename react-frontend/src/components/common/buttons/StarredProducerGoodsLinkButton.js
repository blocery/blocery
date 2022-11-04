
import React from 'react';
import {IoMdPricetag, IoMdAdd} from 'react-icons/io'
import {useHistory} from 'react-router-dom'
import {Div, Flex} from "~/styledComponents/shared";

const StarredProducerGoodsLinkButton = (props) => {
    const history = useHistory()
    const onClick = () => {
        history.push('/my/favoriteGoodsList')
    }
    return (
        <Flex relative cursor={1} noti={0} notiRight={5} justifyContent={'center'} onClick={onClick}>
            <IoMdAdd size={30} />
        </Flex>
    );
};

export default StarredProducerGoodsLinkButton;
