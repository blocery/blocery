import React, {Fragment, useState, useEffect} from 'react'
import {deleteGoodsQna, getGoodsQna} from '~/lib/shopApi'
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";
import {Div, Span, Img, Flex, Right, WhiteSpace, Space, Divider, ListSpace} from '~/styledComponents/shared/Layouts';
import { color } from '~/styledComponents/Properties'
import Skeleton from '~/components/common/cards/Skeleton'
import {withRouter} from 'react-router-dom'
import {BadgeGoodsEventType, BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import MyQATotal from "~/components/shop/mypage/myQA/MyQADashboard";
import {useModal} from "~/util/useModal";
import {IoIosArrowUp, IoIosArrowDown, IoIosArrowForward} from 'react-icons/io'
import useImageViewer from "~/hooks/useImageViewer";
import {toast} from "react-toastify";

// const QA_TYPE = {
//     0: '상품문의',
//     1: '판매자 문의',
//     2: '상담사 문의'
// }

const GOODS_QNA_STAT = {
    ready: '문의접수',
    processing: '처리중',
    success: '답변완료'
}

const QAItem = withRouter(({qaKind, goodsQnaNo, orderSeq, goodsNo, qaType, goodsQnaStat, goodsImages, goodsEventType, goodsName, qaImages, goodsQue, goodsQueDate,
                               answerName, goodsAns, goodsAnsDate, openImageViewer, cancelGoodsQna,
                               qaClaimFlag, qaClaimKind, qaClaimMethod, bankName, bankAccount, bankAccountHolder,
                               history
                }) => {

    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    const onImageClick = () => openImageViewer(qaImages) //modal에서 사용
    const onOrderSeqClick = (e) => {
        e.stopPropagation()
        history.push(`/mypage/orderDetail?orderSeq=${orderSeq}`)
    }

    const goodsClick = (e) => {
        e.stopPropagation()
        history.push(`/goods?goodsNo=${goodsNo}`)
    }

    return (
        <Div bg={'white'} px={16} py={25} style={{borderBottom: `1px solid ${color.light}`}}>
            {
                (goodsNo > 0) && (
                    <>
                        <Div onClick={goodsClick} display={'block'}>
                            <Flex alignItems={'flex-start'} bg={'white'} doActive>
                                {
                                    (goodsImages.length > 0) && (
                                        <Space spaceGap={8} flexShrink={0} width={85} height={85} overflow={'auto'}>
                                            <Img cover rounded={3} src={ComUtil.getFirstImageSrc(goodsImages)} alt={'상품이미지'} />
                                        </Space>
                                    )
                                }
                                <Div ml={18} fontSize={14}>
                                    { (orderSeq > 0) && (
                                            <Space mb={5}>
                                                <Div fg={'green'} lineHeight={14} onClick={onOrderSeqClick}>{orderSeq}</Div>
                                                <IoIosArrowForward color={color.green} />
                                            </Space>
                                        )
                                    }

                                    <Div fontSize={14} lineClamp={2} lineHeight={25} bold>
                                        {
                                            goodsEventType && (
                                                <span style={{marginRight: 10}}>
                                                    <BadgeGoodsEventType goodsEventType={goodsEventType}>
                                                        {goodsEventType === 'potentime' && '포텐타임'}
                                                        {goodsEventType === 'superreward' && '슈퍼리워드'}
                                                    </BadgeGoodsEventType>
                                                </span>
                                            )
                                        }
                                        {goodsName}
                                    </Div>

                                </Div>
                            </Flex>
                        </Div>
                        <Divider height={1} my={11} />
                    </>
                )
            }

            <Div cursor onClick={toggle}>
                <Flex>
                    <Space>
                        <BadgeSharp size={'sm'} bg={(goodsQnaStat === 'ready' || goodsQnaStat === 'processing') ? 'dark' : 'green'}>
                            {GOODS_QNA_STAT[goodsQnaStat]}
                        </BadgeSharp>
                        <Div fg={'dark'} fontSize={13}>
                            {ComUtil.utcToString(goodsQueDate, 'YY.MM.DD HH:mm')}
                        </Div>
                        {
                            goodsQnaStat === 'ready' && (<Span fontSize={13} fg={'dark'} onClick={cancelGoodsQna}><u>문의 취소하기</u></Span>)
                        }
                    </Space>
                    <Right>
                        {
                            modalOpen ? <IoIosArrowUp /> : <IoIosArrowDown />
                        }
                    </Right>
                </Flex>
                <Space mt={9} spaceGap={8} fontSize={12}>
                    <div>{qaKind}</div>
                    {
                        qaClaimKind && <><div>{'>'}</div><div>{qaClaimKind}</div></>
                    }
                    {
                        qaClaimMethod && <><div>{'>'}</div><div>{qaClaimMethod}</div></>
                    }
                </Space>
                <WhiteSpace mt={9} lineClamp={modalOpen ? null : 2} fontSize={14}>{goodsQue}</WhiteSpace>
            </Div>

            {
                modalOpen && (
                    <>

                        {
                            qaClaimMethod === '부분 환불' && (
                                <Div fontSize={12} mt={12}>{`계좌정보 : ${bankName} ${bankAccount} (${bankAccountHolder})`}</Div>
                            )
                        }

                        <Space mt={12} overflow={'auto'}>
                            {
                                qaImages.map(image =>
                                    <Img key={image.imageUrl} cursor width={80} height={80} rounded={3} src={Server.getThumbnailURL() + image.imageUrl} alt={'소비자가 올린 이미지'} onClick={onImageClick}/>
                                )
                            }

                        </Space>
                        <Div mt={18} bg={'background'} px={15} py={18}>
                            {
                                goodsQnaStat === 'success' ? (
                                    <>
                                        <Space fontSize={13}>
                                            <Span fg={'green'}>{answerName} 답변</Span>
                                            <Span fg={'dark'}>{ComUtil.utcToString(goodsAnsDate, 'YYYY-MM-DD HH:mm')}</Span>
                                        </Space>
                                        <WhiteSpace mt={15} fontSize={14}>
                                            {goodsAns}
                                        </WhiteSpace>
                                    </>
                                ) : (
                                    <Div fontSize={13}>
                                        답변을 기다리고 있습니다.
                                    </Div>
                                )
                            }
                        </Div>
                    </>
                )
            }
        </Div>
    )
})

const GoodsQnaList = (props) => {
    const [state, setState] = useState({
        qnaList: undefined,
        isVisible: false,
        index: null
    })
    const [refreshCounte, setRefreshCount] = useState(new Date())

    const {openImageViewer} = useImageViewer()

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const {data : qnaList} = await getGoodsQna();

        console.log({qnaList})
        setState({
            ...state,
            qnaList: (qnaList) ? qnaList : ''
        })
    }

    //문의 취소(삭제)
    const cancelGoodsQna = async (goodsQnaNo, e) => {
        e.stopPropagation()
        if (!window.confirm('문의를 취소 하시겠습니까? 취소된 문의는 삭제 됩니다.')) {
            return
        }
        const {status, data} = await deleteGoodsQna(goodsQnaNo)
        // console.log({data})
        if (status === 200) {
            if (data === -1) {
                toast.info('로그인이 필요합니다.')
            } else if (data === 0) {
                toast.info('문의를 처리중이거나 답변완료되어 취소 할 수 없습니다.')
            }
            else if (data === 1) {
                toast.success('문의가 취소 되었습니다.');
            }
            //카운트 새로고침
            setRefreshCount(new Date())
            //리스트 조회
            search()
        }
    }

    const data = state.qnaList
    return(
        <Fragment>
            <Div bg={'background'} p={16} py={23}>
                <MyQATotal refresh={refreshCounte}/>
            </Div>
            <div>
                {
                    !data ? <Skeleton count={5}/> :
                        <ListSpace>
                            {
                                data.map((item, index) =>
                                    <QAItem key={index} {...item} openImageViewer={openImageViewer} cancelGoodsQna={cancelGoodsQna.bind(this, item.goodsQnaNo)}/>
                                )
                            }
                        </ListSpace>
                }
            </div>
        </Fragment>
    )
}

export default withRouter(GoodsQnaList)