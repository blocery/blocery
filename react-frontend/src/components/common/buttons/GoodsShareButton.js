import React from 'react';
import {Button, Span} from "~/styledComponents/shared";
import {autoLoginCheckAndTryAsync} from "~/lib/loginApi";
import ComUtil from "~/util/ComUtil";
import useLogin from "~/hooks/useLogin";
import {AiOutlineShareAlt} from 'react-icons/ai'

import {Div, Space} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from "~/components/Properties";

const GoodsShareButton = ({goodsNo, goodsNm, children, imageUrl}) => {

    const onClick = async () => {
        ComUtil.kakaoLinkGoodsSimpleShare({
            goodsNo: goodsNo,
            goodsNm: goodsNm,
            goodsImageUrl: imageUrl
        })
    }
    return (
        <Button rounded={15}  bg={'green'} fg={'white'} px={12} py={5} onClick={onClick}>
            <Space spaceGap={4}>
                <AiOutlineShareAlt size={20}/>
                <Span fontSize={15} lineHeight={15}>공유</Span>
            </Space>
        </Button>
    );
};

export default GoodsShareButton;
//
// const GoodsShareButton = ({children}) => {
//     return (
//         <Space spaceGap={12} fg={'secondary'} cursor={1}>
//             <AiOutlineShareAlt size={23} color={color.dark}/>
//             <Div fontSize={15} lineHeight={15}>
//                 {children ? children : ' 공유'}
//             </Div>
//         </Space>
//     );
// };
// export default GoodsShareButton;