import React from 'react';
import {IoMdHeartEmpty} from 'react-icons/io'
import {useHistory} from 'react-router-dom'
import {useRecoilState} from "recoil";
import {consumerZzimListState} from "~/recoilState";
import {Div, Flex} from "~/styledComponents/shared";

const ZzimLinkButton = (props) => {
    const history = useHistory()
    // const [zzimList,] = useRecoilState(consumerZzimListState)

    const onClick = () => {
        history.push('/my/zzimGoodsList')
    }
    //찜 목록은 본다고 noti가 사라지지 않기 때문에 애초에 noti 하지 않도록 주석 처리 함
    return (
        <Flex
            // relative noti={zzimList.length} notiRight={5}
            justifyContent={'center'}
            cursor={1}
        >
            <IoMdHeartEmpty onClick={onClick} size={30} />
        </Flex>
    );
};

export default ZzimLinkButton;
