import React, {useState, useEffect, useRef} from 'react';
import {getCurrentReservedDealGoods, getFinishedDealGoods} from '~/lib/dealApi'
import {Div, Flex, GridColumns, Img, Link, Space, Span, Sticky} from "~/styledComponents/shared";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {IoEllipse} from 'react-icons/io5'
import BannerSsugSsug from '~/images/background/banner_ssugssug.png'
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import Skeleton from "~/components/common/cards/Skeleton";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {isForceUpdate} from "~/lib/axiosCache";
import {withRouter} from "react-router-dom";
const Tab = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    ${props => props.active && `color:${color.black}`};        
`
const DEALGOODS_PRG = 0
const DEALGOODS_END = 2;

//dealGoods home
const DealGoods = (props) => {
    const abortControllerRef = useRef(new AbortController());

    //hooks
    const [tabId, setTabId] = useState(DEALGOODS_PRG)
    const [loading, setLoading] = useState(true)

    const [nowList, setNowList] = useState(null)
    const [endList, setEndList] = useState(null)

    const forceUpdate = isForceUpdate(props.history)

    useEffect(() => {
        getCurrentReservedDealGoods(forceUpdate, abortControllerRef.current.signal).then(res => {
            setNowList(res.data);
            setLoading(false);
        })

        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    // 탭 버튼
    async function onTabSectionClick(tabId){
        setTabId(tabId)
        setLoading(true)
        switch(tabId){
            //진행중인 딜 (진행중,예정중)
            case DEALGOODS_PRG:
                //이전 조회 abort 처리
                // if (!abortController.current.signal.aborted) {
                    abortControllerRef.current.abort()
                // }
                //새로운 signal 생성
                abortControllerRef.current = new AbortController()
                await getCurrentReservedDealGoods(true, abortControllerRef.current.signal).then(res => {
                    setNowList(res.data);
                })
                break;
            //종료된 딜
            case DEALGOODS_END:
                //이전 조회 abort 처리
                // if (!abortController.current.signal.aborted) {
                    abortControllerRef.current.abort()
                // }
                //새로운 signal 생성
                abortControllerRef.current = new AbortController()
                await getFinishedDealGoods(true, abortControllerRef.current.signal).then(res => {
                    setEndList(res.data);
                })
                break;
        }
        setLoading(false);
    }

    return (
        <div>
            <Link to={'/about/ssugssug'}>
                <img style={{width: '100%'}} src={BannerSsugSsug} alt={'쑥쑥이란?'} />
            </Link>
            <Flex justifyContent={'flex-end'} p={16} fg={'secondary'}>
                <Space spaceGap={15}>
                    <Tab active={tabId === DEALGOODS_PRG} onClick={onTabSectionClick.bind(this, DEALGOODS_PRG)}>
                        <Space spaceGap={8}>
                            <IoEllipse size={10}/>
                            <span>진행중인 딜</span>
                        </Space>
                    </Tab>
                    <Tab active={tabId === DEALGOODS_END} onClick={onTabSectionClick.bind(this, DEALGOODS_END)}>
                        <Space spaceGap={8}>
                            <IoEllipse size={10}/>
                            <span>종료된 딜</span>
                        </Space>
                    </Tab>
                </Space>
            </Flex>
            <Div px={16}>
                {
                    loading ? <Skeleton.VerticalProductList count={1} /> :
                        <>
                            {
                                tabId === DEALGOODS_PRG && (
                                    (nowList && nowList.length > 0) ?
                                        nowList.map(goods =>
                                            <VerticalGoodsCard.DealGoods
                                                key={goods.goodsNo}
                                                goods={goods}
                                                isWide={true}
                                                imageType={TYPE_OF_IMAGE.THUMB}
                                            />
                                        )
                                        :
                                        <Div rounded={4} bc={'light'} mb={50}>
                                            <EmptyBox py={20}>
                                                진행중인 딜이 없습니다.
                                                <Div my={8} textAlign={'center'}>
                                                    종료된 딜은 <b><u style={{cursor: 'pointer'}}
                                                                 onClick={onTabSectionClick.bind(this, DEALGOODS_END)}
                                                >여기</u></b>서 확인 해 주세요.<br/>
                                                </Div>
                                                이전에 진행했던 다양한 스토리를 확인할 수 있어요!
                                            </EmptyBox>
                                        </Div>
                                )
                            }
                            {
                                tabId === DEALGOODS_END && (
                                    (endList && endList.length > 0) ?
                                        endList.map(goods =>
                                            <VerticalGoodsCard.DealGoods
                                                key={goods.goodsNo}
                                                goods={goods}
                                                isWide={true}
                                                imageType={TYPE_OF_IMAGE.THUMB}
                                            />
                                        )
                                        :
                                        <Div rounded={4} bc={'light'} mb={50}>
                                            <EmptyBox>
                                                종료된 딜이 없습니다.
                                            </EmptyBox>
                                        </Div>
                                )
                            }
                        </>
                }
            </Div>

            <Div bg={'backgroundDark'}>
                <Flex pl={10} pt={16} fontSize={12}>
                    참고해주세요!
                </Flex>
                <Div mt={0} ml={10} mb={16} mr={14} pl={10} pb={16} fontSize={10} lineHeight={17} color={'#929292'} whiteSpace={'pre-line'}>
                    - 상품구매시 결제예약 상태로 되며, 딜 종료일 다음날 오전 10시에 결제가 됩니다.<br/>
                    - 딜 미달성시 결제가 되지 않습니다.<br/>
                    - 딜 달성수량 이후 구간에 해당되는 %만큼 추가 적립이 됩니다.<br/>
                    &nbsp;&nbsp;(적립은 구매 확정 시 기본 적립금과 함께 지급 됩니다.)<br/>
                    {/*- 내 공동구매 코드로 지인 등이 상품구매시 인당 0.5%씩 추가 적립됩니다.(무제한)<br/>*/}
                    - 딜 종료전에는 결제예약 취소가 가능합니다.<br/>
                    - 내부 상황에 따라 변동되거나 조기 종료될 수 있습니다.<br/>
                </Div>
            </Div>
        </div>
    );
};
export default withRouter(DealGoods);