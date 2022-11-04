import React, {useState, useEffect} from 'react';
import BackNavigation from "~/components/common/navs/BackNavigation";
import {downloadCoupon, getDownloadableCouponList} from '~/lib/shopApi'
import {Button, Div, Divider, Flex, Link, Right} from "~/styledComponents/shared";
import {Spinner} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import moment from "moment-timezone";
import useLogin from "~/hooks/useLogin";
import {Bold, GradeBadgeBig, GradeBadgeSmall} from "~/styledComponents/ShopBlyLayouts";
import {gradeStore} from "~/store";
import styled from 'styled-components'
import { Spinner as CmSpinner } from '~/components/common'
import {toast} from "react-toastify";

const CouponDownList = (props) => {

    const {consumer, openLoginModal} = useLogin()

    const [couponMasterList, setCouponMasterList] = useState()
    useEffect(() => {
        console.log("coupondownload didmount =================")
        searchList()
    }, [consumer])

    //다운로드 가능한 쿠폰 조회
    const searchList = async () => {
        // 정렬 : downloadLevel, _id(masterNo) 순
        const {status, data} = await getDownloadableCouponList()
        if (status != 200){
            toast.warn('네트워크를 확인 해 주세요.')
            return
        }
        console.log(data)
        setCouponMasterList(data)
    }

    if (!couponMasterList) return <Flex justifyContent={'center'} height={`calc(100vh - 56px)`}><Spinner color={'success'}/></Flex>

    return (
        <Div bg={'background'}>
            <BackNavigation>쿠폰 다운로드</BackNavigation>
            {/*<DownloadableCouponList data={couponMasterList} />*/}
            <Div px={16} py={16}>
                {
                    consumer && (
                        <Div lineHeight={22} mt={30}>
                            현재 내 등급 <GradeBadgeBig level={consumer.level}>{gradeStore[consumer.level]}</GradeBadgeBig>
                        </Div>
                    )
                }
                {/*<Div fontSize={30} bold>*/}
                {/*    COUPON*/}
                {/*</Div>*/}
                {
                    couponMasterList.map(couponMaster =>
                        <CouponCard key={couponMaster.masterNo} couponMaster={couponMaster} openLogin={openLoginModal} refresh={searchList} />
                    )
                }

                <Div fontSize={13} pb={50}>
                    주의 : 기간 내 <b>쿠폰 소진시까지 다운로드 가능</b>하며, <b> 동일한 쿠폰은 중복으로 받을 수 없습니다.</b>
                </Div>


                {/*<Div bc={'light'} rounded={8} p={16}>*/}
                {/*    기간 내 쿠폰 소진시 까지 다운로드 가능<br/>*/}
                {/*    중복쿠폰은 받을 수 없습니다.*/}
                {/*</Div>*/}
            </Div>
        </Div>
    );
};


export default CouponDownList;

function CouponCard({couponMaster, openLogin}) {

    const [couponMasterData, setCouponMasterData] = useState(couponMaster)
    const [downLoadProcess,setDownLoadProcess] = useState(false);

    const couponDownload = async () => {
        setDownLoadProcess(true);
        let {data:errRes} = await downloadCoupon(couponMasterData.masterNo)
        console.log({errRes})
        if (![0].includes(errRes.resCode)) {
            toast.info(errRes.errMsg)
            setDownLoadProcess(false);
            //로그인 필요
            if (errRes.resCode === -1) {
                openLogin()
                return
            }
        }else {
            // 쿠폰 받을때 마다 얼럿은 스트레스 쌓일듯 함.
            // alert('쿠폰이 발급되었습니다.');
            setCouponMasterData({...couponMasterData, downloaded: true})
            setDownLoadProcess(false);
        }

    }

    const isDisabled = couponMasterData.remainCount <= 0 || couponMasterData.downloaded

    return(
        <Div my={20} p={16}
             bc={'light'}
            // bg={isDisabled ? 'veryLight' : 'white'}
             bg={'white'}
             rounded={2} >
            <Flex>
                {
                    ![0].includes(couponMasterData.downloadLevel) &&  <GradeBadgeSmall level={couponMasterData.downloadLevel}><b>{gradeStore[couponMasterData.downloadLevel]} 전용</b></GradeBadgeSmall>
                }
            </Flex>
                {
                    couponMaster.couponType == 'deliveryCoupon' ?
                        <Div fontWeight={'lighter'}>
                            <Div fontSize={25} bold>무료배송</Div>
                            <Div fontSize={14} mb={5}><b>{couponMasterData.couponTitle} {couponMasterData.onlyAppCoupon ? ' [APP전용]' : ''}</b></Div>
                            <Div fontSize={12} mb={20}>상품금액에서 배송비 할인 적용</Div>
                            <Divider height={1} />
                            <Flex mt={20}>
                                <Div fontSize={12}>{moment(couponMasterData.startDay, 'YYYYMMDD').format('YYYY.MM.DD')} ~ {moment(couponMasterData.endDay, 'YYYYMMDD').format('YYYY.MM.DD')}</Div>
                                <Right flexShrink={0}>
                                    <Button px={16} py={8} fg={'white'} bg={'green'} disabled={downLoadProcess ? true:isDisabled} onClick={couponDownload}>
                                        <Div textAlign={'center'}>
                                            {
                                                downLoadProcess ? <CmSpinner/> :
                                                    couponMasterData.downloaded ? "받기완료" :
                                                        (
                                                            couponMasterData.remainCount <= 0 ? "모두소진" : "쿠폰받기"
                                                        )
                                            }
                                        </Div>
                                    </Button>
                                </Right>
                            </Flex>
                        </Div>
                        :
                        <Div fontWeight={'lighter'}>
                            <Bold fontSize={34} bold>{`${ComUtil.addCommas(couponMasterData.fixedWon)}`}</Bold>
                            {/*<Div fontSize={24} bold fg={'black'}>{`${ComUtil.addCommas(couponMaster.fixedWon)}`}</Div>*/}
                            <Div fontSize={14} mb={5}><b>{couponMasterData.couponTitle} {couponMasterData.onlyAppCoupon ? ' [APP전용]' : ''}</b></Div>
                            <Div fontSize={12} mb={20}>{couponMasterData.minGoodsPrice > 0 ? `${ComUtil.addCommas(couponMasterData.minGoodsPrice)}원 이상 주문` : `${ComUtil.addCommas(couponMasterData.fixedWon)}원 이상 주문`}</Div>

                            <Divider height={1}/>

                            <Flex mt={20}>
                                <div>
                                    <Div fontSize={12} mb={5}>{moment(couponMasterData.startDay, 'YYYYMMDD').format('YYYY.MM.DD')} ~ {moment(couponMasterData.endDay, 'YYYYMMDD').format('YYYY.MM.DD')}</Div>
                                    {/*<Div fontSize={12}>사용기간: {useDuration}일</Div>*/}
                                    <Div fontSize={13}>
                                        {
                                            couponMasterData.targetProducerNo ? <Right>생산자 쿠폰 <Link fg={'darkBlack'} to={`/producersGoodsList?producerNo=${couponMasterData.targetProducerNo}`} textDecoration={'underline'}><b>바로 사용하기</b></Link></Right> : null
                                        }
                                        {
                                            (couponMasterData.couponGoods && couponMasterData.couponGoods.targetGoodsNo) ? <Right>상품 쿠폰 <Link fg={'darkBlack'} to={`goods?goodsNo=${couponMasterData.couponGoods.targetGoodsNo}`} textDecoration={'underline'}><b>바로 사용하기</b></Link></Right> : null
                                        }
                                    </Div>
                                </div>
                                <Right flexShrink={0}>
                                    <Button px={16} py={8} fg={'white'} bg={'green'} disabled={downLoadProcess ? true:isDisabled} onClick={couponDownload}>
                                        <Div textAlign={'center'}>
                                            {
                                                downLoadProcess ? <CmSpinner/> :
                                                    couponMasterData.downloaded ? "받기완료" :
                                                        (
                                                            couponMasterData.remainCount <= 0 ? "모두소진" : "쿠폰받기"
                                                        )
                                            }
                                        </Div>
                                    </Button>
                                </Right>
                            </Flex>

                        </Div>
                }

        </Div>
    )
}
