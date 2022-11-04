import React from 'react';
import {Button, Span} from "~/styledComponents/shared";
import {autoLoginCheckAndTryAsync} from "~/lib/loginApi";
import ComUtil from "~/util/ComUtil";
import useLogin from "~/hooks/useLogin";
import {AiOutlineShareAlt} from 'react-icons/ai'

import {Div, Space} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from "~/components/Properties";

const DealGoodsShareButton = ({goodsNo, goodsNm, children}) => {
    const {consumer, reFetch, openLoginModal, isServerLoggedIn} = useLogin()

    const onClick = async () => {

        if (await isServerLoggedIn()) {
            setTimeout(() => {
                ComUtil.kakaoLinkGoodsShare({
                    consumerNo: consumer.consumerNo,
                    goodsNo: goodsNo,
                    goodsNm: goodsNm
                })
            }, 500)
        }


        // isServerLoggedIn().then(loginUser => {
        //     if (loginUser) {
        //         ComUtil.kakaoLinkGoodsShare({
        //             consumerNo: consumer.consumerNo,
        //             goodsNo: goodsNo,
        //             goodsNm: goodsNm
        //         })
        //     }
        // })



        // //마켓블리 버전 (로그인 된 사용자만 공유 가능 하도록 변경)
        // if (await isServerLoggedIn()) {
        //     await ComUtil.kakaoLinkGoodsShare({
        //         consumerNo: consumer.consumerNo,
        //         goodsNo: goodsNo,
        //         goodsNm: goodsNm
        //     })
        // }

        //
        // //로그인 되어있지 않았을경우 자동 로그인 시도
        // if (!consumer) {
        //     await autoLoginCheckAndTryAsync()
        //     await reFetch()
        // }
        //
        // //시간차 이후 consumer 확인(recoil)
        // setTimeout(async () => {
        //     if (consumer) {
        //         console.log('========================================1111')
        //         await ComUtil.kakaoLinkGoodsShare({
        //             consumerNo: consumer.consumerNo,
        //             goodsNo: goodsNo,
        //             goodsNm: goodsNm
        //         })
        //     }else {
        //         if (window.confirm('로그인 되어있지 않아 친구초대시 적립을 받을 수 없습니다. 로그인 하시겠습니까?')){
        //             //로그인 모달 강제 오픈
        //             openLoginModal()
        //         }else{
        //             console.log('========================================2222')
        //             await ComUtil.kakaoLinkGoodsShare({
        //                 consumerNo: null,
        //                 goodsNo: goodsNo,
        //                 goodsNm: goodsNm
        //             })
        //         }
        //     }
        // }, 500)
    }
    return (
        <Button rounded={15}  bg={'danger'} fg={'white'} px={12} py={5} onClick={onClick}>
            <Space spaceGap={4}>
                <AiOutlineShareAlt size={20}/>
                <Span fontSize={15} lineHeight={15}>공유</Span>
            </Space>
        </Button>
    );
};

export default DealGoodsShareButton;
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