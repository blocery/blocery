import React, {useEffect, useState} from 'react';
import {withRouter, useParams} from 'react-router-dom'
import ShopXButtonNav from "~/components/common/navs/ShopXButtonNav";
import {
    Div,
    Flex,
    Button,
    Input,
    Span,
    Hr,
    Img,
    Right,
    Divider,
    Link,
    Space,
    JustListSpace
} from "~/styledComponents/shared";
import Skeleton from '~/components/common/cards/Skeleton'
import {
    getGoodsReviewByOrderSeq, reportBoardWriting,
    reportGoodsReview,
} from '~/lib/shopApi'
import {getLoginUser} from "~/lib/loginApi";
import Like from "./Like";
import ReplyContainer from "~/components/common/replyContainer";
import {Server} from "~/components/Properties";
import {IconStarGroup} from "~/components/common";
import ComUtil from "~/util/ComUtil";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import BestGoodsReviewContainer from "./BestGoodsReviewContainer";
import WorstGoodsReviewContainer from "./WorstGoodsReviewContainer";
import ConsumerGoodsReviewListContainer from "./ConsumerGoodsReviewListContainer";
import {ImQuotesLeft, ImQuotesRight} from 'react-icons/im'
import Profile from "~/components/common/cards/Profile";

import GoodsCard from "~/components/common/cards/GoodsCard";
import HashTagList from "~/components/common/hashTag/HashTagList";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import useImageViewer from "~/hooks/useImageViewer";
import ReportButton from "~/components/common/buttons/ReportButton";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import ReportReasonContent from "~/components/common/contents/ReportReasonContent";
import useLogin from "~/hooks/useLogin";
import Zoomable from "react-instagram-zoom";
import {getValue} from "~/styledComponents/Util";

const CmGoodsReviewDetail = ({orderSeq}) => {
    const [goodsReview, setGoodsReview] = useState()
    const [goods, setGoods] = useState()
    // const [consumer, setConsumer] = useState(null)

    const {consumer, isServerLoggedIn} = useLogin()

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const {openImageViewer} = useImageViewer()

    const [reportModalOpen, setReportModalOpen] = useState()



    //orderSeq가 바뀌었을때 새로고침
    useEffect(() => {
        console.log("useEffect orderSeq changed "+orderSeq)
        search()
        // getConsumer()
    }, [orderSeq])

    // useEffect(() => {
    //     if (goodsReview) {
    //         searchGoods()
    //     }
    // }, [goodsReview])

    const search = async () => {
        const {data: goodsReview} = await getGoodsReviewByOrderSeq(orderSeq)
        console.log({goodsReview: goodsReview})
        setGoodsReview(goodsReview)

        const {data: goods} = await getGoodsByGoodsNo(goodsReview.goodsNo)
        setGoods(goods)
    }

    // const searchGoods = async () => {
    //     const {data} = await getGoodsByGoodsNo(goodsReview.goodsNo)
    //     setGoods(data)
    // }

    // const getConsumer = async () => {
    //     const consumer = await getLoginUser()
    //     if (consumer) {
    //         setConsumer({
    //             consumerNo: consumer.uniqueNo,
    //             name: consumer.name,
    //             userType: consumer.userType
    //         })
    //     }
    // }


    const onReplied = () => search()

    const onTagClick = ({index, tag}) => {
        setTagModalState({
            isOpen: true,
            tag: tag
        })
    }

    const onImageClick = (index) => {
        openImageViewer(goodsReview.goodsReviewImages, index)
    }

    //신고하기 클릭
    const onReportClick = async () => {
        //신고처리여부
        if (getReported()) {
            alert('이미 신고처리 되었습니다.')
            return
        }
        if (await isServerLoggedIn()){
            reportToggle()
        }
    }




    //신고하기 모달 토글
    const reportToggle = async () =>{
        setReportModalOpen(!reportModalOpen)
    }

    //신고하기
    const report = async (reason) => {
        const res = await reportGoodsReview({orderSeq: goodsReview.orderSeq, reason: reason})
        if (res.status !== 200) {
            alert('에러가 발생 하였습니다. 다시 시도해 주세요.')
            return
        }
        if (res.data.resCode) {
            alert(res.data.errMsg);
            return
        }
        search()
        reportToggle()
    }

    //이미 신고 했는지 여부
    const getReported = () => {
        if (consumer) {
            const report = goodsReview.reports.find(report => report.consumerNo === consumer.consumerNo)
            if (report) {
                return true
            }
        }
        return false
    }

    return (
        <div>
            <BackNavigation showShopRightIcons>글보기</BackNavigation>
            {
                (!goodsReview || !goods) ? <Skeleton.List count={4} /> : (
                    <Div>
                        <Div textAlign={'center'} my={30} minHeight={85}>
                            <Div fontSize={30} mb={10}>
                                <Bold bold>
                                    {ComUtil.toScoreRate(goodsReview.score)}
                                </Bold>
                            </Div>
                            <IconStarGroup score={goodsReview.score} size={30} />
                        </Div>
                        <Flex fg={'dark'} bg={'veryLight'} bc={'light'} bl={0} br={0} bb={0} py={11} px={16}>
                            <Profile {...goodsReview.profileInfo} />
                            {/*<Div width={25} height={25}>*/}
                            {/*    <Img width={'100%'} height={'100%'} rounded={'50%'}*/}
                            {/*         cover*/}
                            {/*         src={'https://2.gall-img.com/hygall/files/attach/images/82/163/326/253/9155740d3c5d22097b451b1f5985d97e.jpg'} alt={'사용자'} />*/}
                            {/*</Div>*/}
                            {/*<Div fg={'black'} ml={10}>{goodsReview.consumerName}</Div>*/}
                            <Right>{ComUtil.timeFromNow(goodsReview.goodsReviewDate)}</Right>
                        </Flex>


                        <GoodsCard goods={goods} />


                        <Divider />

                        <Div minHeight={200}>


                                <div>
                                    {
                                        goodsReview.goodsReviewImages.map((image, index) =>
                                            <Zoomable key={`img${image.imageUrl}`} releaseAnimationTimeout={200}>
                                                <Img lazy
                                                     height={'unset'}
                                                     src={Server.getImageURL() + image.imageUrl} alt={image.imageNm}
                                                     onClick={onImageClick.bind(this, index)}
                                                />
                                            </Zoomable>
                                        )
                                    }
                                </div>
                                <Div
                                    style={{
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                    p={16}
                                    lineHeight={30}
                                >
                                    {goodsReview.goodsReviewContent}
                                </Div>


                            <Div p={16}>

                                <HashTagList tags={goodsReview.tags} isViewer={true} onClick={onTagClick} />

                                <Flex width={'100%'} pt={12}>
                                    <Like type={'goodsReview'} uniqueKey={goodsReview.orderSeq} myLike={goodsReview.myLike}
                                        // goodsReview={goodsReview}
                                    />
                                    <Right>
                                        <Space>

                                            {
                                                (!consumer || consumer.consumerNo !== goodsReview.consumerNo) && <ReportButton onClick={onReportClick} reported={getReported()} />
                                            }
                                        </Space>
                                    </Right>
                                </Flex>
                            </Div>


                        </Div>
                        <Divider />
                        <ReplyContainer
                            consumer={consumer}
                            // goodsReview={goodsReview}
                            onReplied={onReplied}
                            replies={goodsReview.replies}
                            boardType={'review'} //review vote board
                            uniqueKey={goodsReview.orderSeq}
                            refresh={onReplied}
                        />
                        <Divider />

                        <Div>
                            <Flex alignItems={'flex-start'} fontSize={15} m={16}><ImQuotesLeft size={12}/><Div bold mx={5}>맘에 들어요</Div><ImQuotesRight size={12}/></Flex>
                            <BestGoodsReviewContainer reviewerConsumerNo={goodsReview.consumerNo} goodsNo={goodsReview.goodsNo} orderSeq={goodsReview.orderSeq} />
                        </Div>

                        <Div>
                            <Flex alignItems={'flex-start'} fontSize={15} m={16}><ImQuotesLeft size={12}/><Div bold mx={5}>잘 모르겠어요</Div><ImQuotesRight size={12}/></Flex>
                            <WorstGoodsReviewContainer reviewerConsumerNo={goodsReview.consumerNo} goodsNo={goodsReview.goodsNo} orderSeq={goodsReview.orderSeq} />
                        </Div>

                        <Divider />

                        <Div>
                            <Div fontSize={17} py={29} px={16}><strong><Span fg={'green'}>{goodsReview.profileInfo.nickname}</Span>님 최신 리뷰</strong></Div>
                            <ConsumerGoodsReviewListContainer consumerNo={goodsReview.consumerNo} orderSeq={goodsReview.orderSeq} />
                        </Div>
                    </Div>
                )
            }
            <Modal isOpen={reportModalOpen} centered>
                <ModalHeader toggle={reportToggle}>
                    리뷰 신고
                </ModalHeader>
                <ModalBody>
                    <ReportReasonContent //selected={selected}
                        additionalReason={[
                            '상품과 관계없는 사진',
                            '이미지도용(저작권침해)/캡쳐',
                        ]}
                        onReportClick={report}
                        onClose={reportToggle}
                    />
                </ModalBody>
            </Modal>
        </div>
    );
};

export default CmGoodsReviewDetail;