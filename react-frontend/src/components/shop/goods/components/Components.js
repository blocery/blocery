import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
    Div,
    Divider,
    Flex,
    GridColumns,
    Hr,
    Link,
    Right,
    Space,
    Span,
    WhiteSpace,
    WordBalon
} from "~/styledComponents/shared";
import {BadgeGoodsEventTypeBig, Bold, EmptyBox} from '~/styledComponents/ShopBlyLayouts'
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import Skeleton from "~/components/common/cards/Skeleton";
import ComUtil from "~/util/ComUtil";
import {IconStarGroup} from "~/components/common";
import {Icon} from "~/components/common/icons";
import {exchangeWon2BLCTHome} from "~/lib/exchangeApi";
import {RiCoupon3Line} from "react-icons/ri";
import {ToggleIconBox, Policy, Section} from "~/components/shop/goods/components/Atoms";
import useScroll from "~/hooks/useScroll";
import usePrevious from "~/hooks/usePrevious";
import {IoIosArrowDown, IoIosArrowForward, IoIosArrowUp} from "react-icons/io";
import {getDeliveryFeeTag} from "~/util/bzLogic";
import AnimationLayouts from "~/styledComponents/shared/AnimationLayouts";
import {WordBalonLeftTop} from "~/styledComponents/shared/Shapes";
import Switch from "react-switch";
import {color} from "~/styledComponents/Properties";
import {BsFillImageFill} from "react-icons/bs";
import {AiOutlineCodeSandbox, AiOutlineInfoCircle} from "react-icons/ai";
import moment from "moment-timezone";
import {Server} from "~/components/Properties";
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {useModal} from "~/util/useModal";
import {Modal, ModalBody, ModalHeader} from "reactstrap";

const navigationHeight = 56

const ARSwitchBar = ({onChange, checked}) => {
    return(
        <Flex bg={'black'} px={16} py={8}>
            <Div height={28} lineHeight={28} fontSize={13} fg={'white'}>AR 체험이 가능한 상품입니다.</Div>
            <Right>
                <Switch onChange={onChange} checked={checked}
                        onColor={color.green}
                    // borderRadius={6}
                        checkedIcon={
                            <ToggleIconBox style={{paddingLeft:1}}>
                                <BsFillImageFill size={16}/>
                            </ToggleIconBox>
                        }

                    // offColor={color.black}
                        uncheckedIcon={
                            <ToggleIconBox style={{paddingRight:1}}>
                                <AiOutlineCodeSandbox size={20}/>
                            </ToggleIconBox>
                        }
                />
            </Right>
        </Flex>
    )
}

{/* 상품 탭 */}
const GoodsTab = ({data, value, onChange}) => {
    const borderColor = '#dee0e4'


    const el = useRef()
    //현재 값 용도
    const valueRef = useRef(16)
    const [padding, setPadding] = useState(16)

    //이전 값 용도
    // const prePadding = usePrevious(16)

    useEffect(() => {

        document.addEventListener('scroll', onScroll)

        return(() =>{
            document.removeEventListener('scroll', onScroll)
        })
    }, [])


    const onScroll = () => {
        const {top} = el.current.getBoundingClientRect()

        if (top <= navigationHeight) {
            if (valueRef.current === 16) {
                valueRef.current = 0
                setPadding(0)
            }
        }else{
            if (valueRef.current === 0) {
                valueRef.current = 16
                setPadding(16)
            }
        }
    }


    return(
        <Div p={padding} bg={'white'} ref={el} cursor={1} custom={`
            transition: 0.2s;
        `}>

            <GridColumns repeat={data.length} colGap={0} rowGap={0} minHeight={40} bg={'white'} bc={borderColor} rounded={2} overflow={'hidden'}
                         custom={`
                    & > div {
                        border-right: 1px solid ${borderColor};
                    }
                    & > div:last-child {
                        border: 0;
                    }
                `}
            >
                {
                    data.map((item, index) =>
                        <Flex
                            key={index}
                            justifyContent={'center'}
                            minHeight={42}
                            fw={700}
                            bg={item.value === value ? '#494d53' : 'background'}
                            fg={item.value === value ? 'white' : 'dark'}
                            onClick={onChange.bind(this, item.value)}>
                            {item.label}
                        </Flex>
                    )
                }
            </GridColumns>
        </Div>
    )
}

{/* 상품 가격 */}
const GoodsPriceCard = ({goods, couponMaster, onReviewClick}) => {
    const goodsEventName = ComUtil.getGoodsEventName(goods)
    return(
        <>

            <Space spaceGap={10}>
                {
                    goodsEventName && (
                        <BadgeGoodsEventTypeBig goodsEventType={goodsEventName}>
                            {goodsEventName === 'POTENTIME' && '포텐타임'}
                            {goodsEventName === 'SUPERREWARD' && '슈퍼리워드'}
                            {goodsEventName === 'DEALGOODS' && '쑥쑥-계약재배'}
                        </BadgeGoodsEventTypeBig>
                    )
                }
                {
                    (goods.discountRate > 0) && (
                        <Bold fg={'danger'} bold fontSize={20}>{Math.round(goods.discountRate)}%</Bold>
                    )
                }
                <Flex>
                    <Bold bold fontSize={20}>{`${ComUtil.addCommas(goods.currentPrice)}`}</Bold>
                    <Div fontSize={14}>원</Div>
                </Flex>
                <Div fontSize={14} fg={'dark'}>
                    {   //event옵션이 상품명과 다를때 출력.
                        ( (goods.inTimeSalePeriod || goods.inSuperRewardPeriod) && (goods.goodsNm !== goods.eventOptionName))?
                            //이벤트옵션명 미출력:220517 <Div fontSize={16} fg={'black'}> {goods.eventOptionName}</Div>
                            <Div> </Div>
                        : (goods.discountRate > 0) && (
                            <del>{ComUtil.addCommas(goods.consumerPrice)}</del>
                        )
                    }
                </Div>
            </Space>

            {/* 포텐타임 안내 */}
            {
                (goods.inTimeSalePeriod && couponMaster) && (
                    <Flex fontSize={12.5} mt={10} fg={'warning'}>
                        <Flex mr={3}><RiCoupon3Line/></Flex>
                        {
                            `구매시 ${ComUtil.addCommas(ComUtil.toNum((goods.currentPrice * couponMaster.potenCouponDiscount/100).toFixed(0)))}원 할인 쿠폰 자동 적용`
                        }
                    </Flex>
                )
            }

            {/* 슈퍼리워드 안내 */}
            {
                (goods.superReward && goods.inSuperRewardPeriod) && (
                    <Div mt={10} fontSize={12.5} fg={'danger'}>
                        카드결제 금액의 &nbsp;<b> {goods.superRewardReward}%</b> &nbsp; 추가 적립
                    </Div>
                )
            }





            {/* 리뷰 & bly 가격 */}
            <Flex justifyContent={'space-between'} mt={18}>
                <Space cursor onClick={onReviewClick}>
                    <IconStarGroup score={goods.avgScore} />
                    <Bold bold pl={10} lineHeight={12}>{ComUtil.toScoreRate(goods.avgScore)}</Bold>
                    {
                        goods.goodsReviewsCount > 0 && (
                            <Span fontSize={13}><u>{ComUtil.addCommas(goods.goodsReviewsCount)}건 리뷰 보기</u></Span>
                        )
                    }
                </Space>
                <div>
                    <Icon name={'blocery'} style={{width: 8, marginRight: 2}}/> <b><exchangeWon2BLCTHome.Tag won={goods.currentPrice}/></b> BLY
                </div>
            </Flex>
        </>
    )
}

{/* 적립 & 배송정보,  2208:로컬 배송비 때문에 producer추가 */}
const SaveBlyPerLevelAndShippingInfo = ({goods, producer,  style = {}}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const toggle = () => {
        setModalState(!modalOpen)
    }

    return(
        <Div {...style}>
            <Flex ignItems={'flex-start'} fontSize={13}>
                <Div minWidth={60} fg={'dark'} flexShrink={0}>기본적립</Div>
                <Space>
                    <Span fg={'danger'}><b>최대 5%</b></Span>
                    <Link to={'/levelInfo'} fg={'dark'}>
                        <u>등급 및 혜택 안내<IoIosArrowForward /></u>
                    </Link>
                </Space>
            </Flex>
            <Flex mt={15} alignItems={'flex-start'} fontSize={13}>
                <Div minWidth={60} fg={'dark'} flexShrink={0}>배송비</Div>
                <Div>
                    <Flex>
                        {
                            goods.localfoodFarmerNo ? <Div style={{textDecoration:'line-through'}} mr={5}>6,000원</Div> : <></>
                        }
                        <Div bold><b>{getDeliveryFeeTag(goods, producer)}</b></Div>
                        {
                            goods.localfoodFarmerNo ?
                                <Div onClick={toggle} ml={10}><AiOutlineInfoCircle size={20} /></Div> : <></>
                        }
                    </Flex>
                    {!goods.localfoodFarmerNo &&
                        <Div fg={'dark'} my={3}>
                        (제주 3,000원 추가 / 일부 도서지역 배송불가)
                        </Div>
                    }
                    <Div>
                        {
                            goods.dealGoods ? (
                                `지금 주문하면 ${ComUtil.utcToString(goods.expectShippingStart, 'MM[/]DD')} ~ ${ComUtil.utcToString(goods.expectShippingEnd, 'MM[/]DD')} 사이발송`
                            ) : (
                                goods.producerWrapDelivered ? (goods.localfoodFarmerNo?'묶음배송 상품':'동일생산자 묶음배송 가능 상품')
                                :
                                (`즉시배송 상품${goods.hopeDeliveryFlag ? '(희망 수령일 선택 가능)' : ''}`)
                            )
                        }
                    </Div>
                </Div>
            </Flex>

            <Modal isOpen={modalOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}><b>배송비 안내</b></ModalHeader>
                <ModalBody>
                    <Div mb={10} lineHeight={25}>샵블리는 유통 과정에서의 소요시간을 줄여 소비자에게는 한층 신선한 농산물을, 국내 농민에게는 지속가능성을 전달하고자 합니다. 소중한 농산물을 극강의 신선함으로 매일 새벽 가져다 드릴게요.</Div>
                    <Div mb={10} lineHeight={25}>일반 온라인 농식품 쇼핑몰의 경우 배송비를 상품 가격에 포함시켜 실제 오프라인 매장보다 비싼 가격으로 판매합니다. 하지만 샵블리 로컬푸드는 지역 농부가 건강하고 맛있는 농산물을 계속 생산할 수 있도록, 모든 상품을 오프라인 매장과 동일 가격으로 판매, 배송비를 별도 책정합니다.</Div>
                    <Div mb={10} lineHeight={25}>고객님의 부담을 덜어드리고자, 샵블리가 배송비 일부를 지원합니다.</Div>

                    {/*<Div mb={10} bold lineHeight={25}><b>"지역 농부가 매일 아침 찾아옵니다."</b></Div>*/}
                    {/*<Div mb={10} lineHeight={25}>샵블리는 산지에서 도매 시장, 도매에서 소매로 유통되는 과정에서의 소요시간을 줄여 소비자에게는 한층 신선한 농산물을, 국내 농민에게는 지속가능성을 전달하고자 합니다.</Div>*/}
                    {/*<Div mb={10} lineHeight={25}>배송비는 상품을 가장 신선하고 안전한 상태로 직접 전달해 드리기 위한 비용입니다.*/}
                    {/*    일반 온라인 농식품 쇼핑몰의 경우 배송비를 상품 가격에 포함시켜 실제 오프라인 매장보다 비싼 가격으로 판매하고 있습니다.*/}
                    {/*    하지만 지역 농부가 건강하고 맛있는 농산물을 계속 생산할 수 있도록, 샵블리 로컬푸드는 모든 상품을 오프라인 매장과 동일한 가격으로 판매합니다.</Div>*/}
                    {/*<Div mb={20} lineHeight={25}>샵블리의 로컬푸드 서비스는 국내 지자체, 생산자단체 등과 함께 직거래 형식으로 운영 중이며, 지역 생산자의 부담을 줄이고자 배송비가 별도 책정 되었습니다.*/}
                    {/*    고객님의 부담을 덜어드리고자, 샵블리가 배송비 일부를 지원합니다.(3,000원 지원)*/}
                    {/*    지역 농부들의 소중한 농산물을 여러분의 집 앞까지 극강의 신선함으로 매일 새벽 가져다 드릴게요.</Div>*/}
                    {/*<Div mb={10} lineHeight={25}>로컬푸드 농가의 판로 확대와 지원, 지역 농가 활성화를 위해 소비자와 생산자의 상생을 고민하고, 고객님께 가치 있는 경험을 드릴 수 있도록 계속해서 노력하겠습니다.</Div>*/}

                </ModalBody>
            </Modal>
        </Div>


    )
}

const GoodsReviewList = ({goodsReviewList, showGoodsNm}) => {
    if (!goodsReviewList) return <Skeleton.VerticalProductList count={2} />
    return goodsReviewList.length > 0 ? (
        goodsReviewList.map((goodsReview, index) =>
            <Fragment key={goodsReview.orderSeq}>
                {index !== 0 && <Hr mx={16} />}
                <GoodsReviewCard data={goodsReview} showGoodsNm={showGoodsNm} />
            </Fragment>
        )
    ) : (
        <EmptyBox>아직 리뷰가 없습니다.</EmptyBox>
    )
};

//딜 정보
const DealGoodsInfo = ({goods}) => {
    return(
        <Policy.MenuContent>
            본 딜의 계약(결제) 시 예약 상태로 유지되며, 딜 마감일 다음 영업일인 {ComUtil.utcToString((ComUtil.intToDateMoment(goods.dealEndDate)).add(24,'h'),"YYYY.MM.DD")} 10시에 결제가 진행됩니다.<br/>
            결제 정보 변경은 결제가 진행되기 전까지 언제나 가능합니다.
            <Policy.MenuSectionSubTitle>
                계약 정보 변경 및 계약금 반환 안내
            </Policy.MenuSectionSubTitle>
            딜 참여 기간 마감 후, 아래 정책에 따라 계약금 반환 신청을 할 수 있습니다. 계약금 반환은 회원님께서 계약한 카드 결제 건을 취소하는 방식으로 이뤄집니다.
            계약금 반환은 ‘마이페이지 > 구매내역 > 계약재배’에서 신청하실 수 있습니다.
            <Policy.MenuSectionSubTitle>
                1) 상품 옵션 변경, 배송지 변경 안내
            </Policy.MenuSectionSubTitle>
            결제 정보 변경은 결제가 진행되기 전까지 언제나 가능합니다.<br/>
            참여한 딜의 정보 변경은 ‘마이페이지 > 구매내역 > 계약재배’에서 진행해주세요. 딜 마감일 이후에는 본 계약에 대한 상품의 생산 및 배송이 시작되어, 취소와 더불어 배송지 및 옵션 변경은 {ComUtil.utcToString((ComUtil.intToDateMoment(goods.dealEndDate)),"YYYY.MM.DD")} 이후로는 불가합니다.
            <Policy.MenuSectionSubTitle>
                2) 상품 발송이 지연될 경우
            </Policy.MenuSectionSubTitle>
            - 딜 계약 후, 상품을 생산할 수 있는 계약재배의 특성과 생산 과정에서의 예상치 못한 상황으로 인하여 상품 발송이 지연되거나 발송이 불가할 수 있습니다. 이 경우 상품 발송일 변동이 예상되는 시점에 즉시 소식과 SMS 등으로 변경된 상품 발송일을 알려 드립니다.<br/>
            - 상품의 최대 발송 지연 가능일까지 상품을 발송하지 않을 경우, 본 계약금(결제금) 반환 신청을 할 수 있습니다. 최대 발송 지연 가능일은 농산물 특성을 고려하여 상품 발송 시작의 마지막 날로부터 30일 이후 입니다.
            <Policy.MenuSectionSubTitle>
                3) 상품에 하자가 있을 경우
            </Policy.MenuSectionSubTitle>
            수령한 상품이 아래 하자 기준에 해당할 경우, 배송 완료일로부터 7일 이내에 계약금 반환 신청을 할 수 있습니다. 이때 생산자(판매자)는 하자 판단을 위한 증빙자료, 상품 반송을 회원님에게 요청할 수 있습니다.<br/>
            - 상품 수령 7일 내 하자가 확인 되면 개봉하거나 일부 드셨더라도 재배송 해 드립니다.<br/>
            - 동일한 하자가 2회 이상 발생 시 전액 반환(환불)해 드립니다.<br/>
            단, 아래 어느 하나에 해당될 경우 계약금 반환은 불가합니다.<br/>
            - 회원님의 귀책 사유로 상품의 일부 혹은 전체가 멸실 또는 훼손된 경우<br/>
            (농산물이기 때문에 상품을 직접 수령하시는 것을 권해 드립니다)<br/>
            - 생산자(판매자)가 ‘스토리’ 메뉴 내에 명시적으로 고지한 하자 불인정 사유에 해당하는 경우
            <Policy.MenuSectionSubTitle>
                4) 기타 주의 사항
            </Policy.MenuSectionSubTitle>
            - 계약재배의 특성상 딜 참여 기간 종료 후 회원님의 단순변심으로 인한 계약금 반환은 불가합니다.<br/>
            - 회사는 생산자(판매자)와 상호 협의 하에 본 계약재배를 취소할 수 있으며, 딜 종료 후 본 딜이 취소될 경우에는 계약금이 반환됩니다.<br/>
            - 하자가 있는 경우, 상품 반송을 위한 배송비는 생산자(판매자)가 부담하여야 하고 하자가 없는 경우에는 상품 반송 및 재반송에 대한 배송비를 회원님에게 청구될 수 있습니다.
        </Policy.MenuContent>
    )
}

//상품정보
const GoodsNormalInfo = ({goods, producer}) => {
    return(
        <Policy.MenuContent>
            <GridColumns repeat={2} rowGap={10} colGap={10}>
                <div>농장/생산자</div><Policy.GoodsProperty>{producer.farmName}</Policy.GoodsProperty>
                <div>생산지</div><Policy.GoodsProperty>{goods.productionArea}</Policy.GoodsProperty>
                <div>판매단위</div><Policy.GoodsProperty>{goods.packUnit}</Policy.GoodsProperty>
                <div>중량/용량</div><Policy.GoodsProperty>{goods.packAmount}{goods.packUnit}</Policy.GoodsProperty>
                <div>재배방법</div><Policy.GoodsProperty>{goods.cultivationNm}</Policy.GoodsProperty>
                <div>농약유무</div><Policy.GoodsProperty>{goods.pesticideYn}</Policy.GoodsProperty>
                <div>배송방법</div><Policy.GoodsProperty>택배</Policy.GoodsProperty>
                {
                    goods.dealGoods && (
                        <>
                            <div>예상 발송일</div>
                            <Policy.GoodsProperty>
                                {ComUtil.utcToString(goods.expectShippingStart)} ~ {ComUtil.utcToString(goods.expectShippingEnd)}
                            </Policy.GoodsProperty>
                        </>
                    )
                }
            </GridColumns>
        </Policy.MenuContent>
    )
}

//상품 필수 정보
const GoodsRequiredInfo = ({goods, producer}) => {
    const { goodsTypeCode  } = goods

    //식품(농수산물) Agricultural food
    if(goodsTypeCode === 'A'){
        return(
            <Policy.MenuContent>
                <GridColumns repeat={2} rowGap={10} colGap={10}>
                    <div>포장단위별 용량(중량), 수량, 크기</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>생산자/수입자</div><Policy.GoodsProperty>{`${producer.farmName} / ${producer.name}`}</Policy.GoodsProperty>
                    <div>제조연월일(포장일/생산연도), 유통기한/품질유지기한</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>농축수산물 표시사항</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>제품구성</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>보관방법/취급방법</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>소비자상담관련 전화번호</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>비고</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>AS 정보</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                </GridColumns>
            </Policy.MenuContent>
        )
    }
    //가공식품 Processed food
    else if(goodsTypeCode === 'P'){
        return(
            <Policy.MenuContent>
                <GridColumns repeat={2} rowGap={10} colGap={10}>
                    <div>식품유형</div><div>상품정보참조</div>
                    <div>생산자/수입자</div><Policy.GoodsProperty>{`${producer.name} / ${producer.farmName}`}</Policy.GoodsProperty>
                    <div>제조연월일(포장일/생산연도), 유통기한/품질유지기한</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>원재료명 및 함량</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>영양성분</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>표시광고 사전심의필</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>소비자상담관련 전화번호</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>유전자재조합식품여부(유/무)</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>수입여부(유/무)</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>비고</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>AS 정보</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                </GridColumns>
            </Policy.MenuContent>
        )
    }
    //건강기능식품 Health functional food
    else if(goodsTypeCode === 'H'){
        return(
            <Policy.MenuContent>
                <GridColumns repeat={2} rowGap={10} colGap={10}>
                    <div>식품유형</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>생산자/수입자</div><Policy.GoodsProperty>{`${producer.name} / ${producer.farmName}`}</Policy.GoodsProperty>
                    <div>제조연월일(포장일/생산연도), 유통기한/품질유지기한</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>원재료명 및 함량</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>영양정보</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>기능정보</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>주의사항</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>표시광고 사전심의필</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>소비자상담관련 전화번호</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>유전자재조합식품여부(유/무)</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>수입여부(유/무)</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>의약품여부(유/무/해당없음)</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>비고</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                    <div>AS 정보</div><Policy.GoodsProperty>상품정보참조</Policy.GoodsProperty>
                </GridColumns>
            </Policy.MenuContent>
        )
    }


    // //식품(농수산물) Agricultural food
    // if(goodsTypeCode === 'A'){
    //     return(
    //         <ul className={classNames(Css.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
    //             <li>·포장단위별 용량(중량), 수량, 크기</li><li>상품정보참조</li>
    //             <li>·생산자/수입자</li><li>{`${props.producer.farmName} / ${props.producer.name}`}</li>
    //             <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
    //             <li>·농축수산물 표시사항</li><li>상품정보참조</li>
    //             <li>·제품구성</li><li>상품정보참조</li>
    //             <li>·보관방법/취급방법</li><li>상품정보참조</li>
    //             <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
    //             <li>·비고</li><li>상품정보참조</li>
    //             <li>·AS 정보</li><li>상품정보참조</li>
    //         </ul>
    //     )
    // }
    // //가공식품 Processed food
    // else if(goodsTypeCode === 'P'){
    //     return(
    //         <ul className={classNames(Css.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
    //             <li>·식품유형</li><li>상품정보참조</li>
    //             <li>·생산자/수입자</li><li>{`${props.producer.name} / ${props.producer.farmName}`}</li>
    //             <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
    //             <li>·원재료명 및 함량</li><li>상품정보참조</li>
    //             <li>·영양성분</li><li>상품정보참조</li>
    //             <li>·표시광고 사전심의필</li><li>상품정보참조</li>
    //             <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
    //             <li>·유전자재조합식품여부(유/무)</li><li>상품정보참조</li>
    //             <li>·수입여부(유/무)</li><li>상품정보참조</li>
    //             <li>·비고</li><li>상품정보참조</li>
    //             <li>·AS 정보</li><li>상품정보참조</li>
    //         </ul>
    //     )
    // }
    // //건강기능식품 Health functional food
    // else if(goodsTypeCode === 'H'){
    //     return(
    //         <ul className={classNames(Css.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
    //             <li>·식품유형</li><li>상품정보참조</li>
    //             <li>·생산자/수입자</li><li>{`${props.producer.name} / ${props.producer.farmName}`}</li>
    //             <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
    //             <li>·원재료명 및 함량</li><li>상품정보참조</li>
    //             <li>·영양정보</li><li>상품정보참조</li>
    //             <li>·기능정보</li><li>상품정보참조</li>
    //             <li>·주의사항</li><li>상품정보참조</li>
    //             <li>·표시광고 사전심의필</li><li>상품정보참조</li>
    //             <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
    //             <li>·유전자재조합식품여부(유/무)</li><li>상품정보참조</li>
    //             <li>·수입여부(유/무)</li><li>상품정보참조</li>
    //             <li>·의약품여부(유/무/해당없음)</li><li>상품정보참조</li>
    //             <li>·비고</li><li>상품정보참조</li>
    //             <li>·AS 정보</li><li>상품정보참조</li>
    //         </ul>
    //     )
    // }

    return null
}

//배송안내 정보
const ShippingInfo = () => {
    return(
        <Policy.MenuContent>
            <Policy.MenuSectionTitle>
                1. 배송비는 얼마인가요?
            </Policy.MenuSectionTitle>
            신선한 상품 공급을 위해 주문 완료시 해당 상품을 공급하는 공급업체에서 직발송됩니다.<br/>
            따라서 공급업체 지역, 묶음 배송 가능여부 등에 따라 상품별로 배송비가 차등 적용되며, 주문시 상품상세 설명에 안내된 배송비를 포함한 주문금액이 결제됩니다.<br/>
            ※ 도서 산간지역은 추가 배송비 발생됨
            <Policy.MenuSectionTitle>
                2. 제품은 언제 발송되나요?
            </Policy.MenuSectionTitle>
            ① 일반상품의 경우 주문 당일 또는 주문일로부터 1~2일 이내에 발송되며, 발송일로부터 1~5일 이내에 수령이 가능합니다.<br/>
            ② 예약상품의 경우 생산자(판매자)가 설정한 예상 발송일 사이에 발송되며, 발송일로부터 1~5일 이내에 수령이 가능합니다.<br/>
            ※ 공휴일은 포함되지 않으며, 도서 산간 지역의 경우 지연될 수 있습니다.<br/>
            ※ 설/추석/휴가 기간 등 장기 배송지연 발생시 공지사항 별도 안내<br/>
            <Policy.MenuSectionTitle>
                3. 교환 및 반품에 따른 배송비는?
            </Policy.MenuSectionTitle>
            - 고객 변심에 의한 교환/반품의 경우 왕복배송비 고객 부담<br/>
            - 제품 이상(하자)로 인한 경우 왕복배송비 판매자 부담<br/>
            ※ 반드시 교환이나 반품 전 운영센터에 접수해 주세요
        </Policy.MenuContent>
    )
}

//교환 및 반품 안내
const ClaimInfo = () => {
    return(
        <Policy.MenuContent>
            <Policy.MenuSectionTitle>1. 제품 교환 및 반품이 가능한 경우는?</Policy.MenuSectionTitle>
            상품 수령후 7일 이내(로컬푸드 상품의 경우 3일 이내) 다음의 사유에 의한 교환, 반품 및 환불을 보장합니다.<br/>
            - 상품 수령후 7일 이내(로컬푸드 상품의 경우 3일 이내)에 상품 및 포장상태가 재판매가 가능한 경우    <br/>
            - 주문한 상품과 수령한 상품이 다르거나, 사이트에 제공된 상품정보와 다른 경우 (단순한 화면상의 차이 제외) <br/>
            - 상품 자체의 이상 및 결함이 있을 경우     <br/>
            - 배송된 상품이 파손, 손상, 오염되었을 경우(수령 당일 접수 요망)  <br/>
            ※ 신선식품(생품/냉장) 상품은,                          <br/>
            - 발송 완료후 재판매가 어려워 상품의 이상(하자)로 인한 교환/반품만 가능 <br/>
            - 상품의 이상(하자)로 인한 교환/반품은 상품 수령후 24시간 이내 접수 요망
            <Policy.MenuSectionTitle>2. 제품 교환 및 반품이 불가한 경우는?</Policy.MenuSectionTitle>
            - 이용자에게 책임있는 사유로 상품이 멸실 또는 훼손된 경우    <br/>
            - 포장을 개봉하였거나 포장이 훼손되어 상품가치가 상실한 경우    <br/>
            - 이용자의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우
        </Policy.MenuContent>
    )
}

const ProducerNotice = ({producer,goods}) => {

    let now = ComUtil.utcToString(moment(), "YYYY-MM-DDThh:mm:ss");
    let validNotice, notYetNotice;
    if (producer.noticeImages.length > 0) {
        validNotice = ComUtil.compareDate(ComUtil.utcToString(producer.noticeStartDate), now);
        notYetNotice = ComUtil.compareDate(ComUtil.utcToString(producer.noticeEndDate), now);
    }


    return (
        <>
            {
                (producer.noticeImages != null && producer.noticeImages.length > 0) && (validNotice <= 0 && notYetNotice >= 0) &&
                <img style={{width: '100%', height: '500'}} src={Server.getImageURL() + producer.noticeImages[0].imageUrl} alt="판매자 공지 배너"/>
            }
            {
                (producer.noticeNormalImages != null && producer.noticeNormalImages.length > 0) &&
                <img style={{width: '100%', height: '500'}} src={Server.getImageURL() + producer.noticeNormalImages[0].imageUrl} alt="판매자 일반 배너"/>
            }
            {
                (producer.noticeObjectUniqueImages != null && producer.noticeObjectUniqueImages.length > 0) && goods.objectUniqueFlag &&
                    <img style={{width: '100%', height: '500'}} src={Server.getImageURL() + producer.noticeObjectUniqueImages[0].imageUrl} alt="판매자 개체인식 배너"/>
            }
        </>
    )
}

const GoodsContentWrapper = styled.div`    
    overflow: hidden;    
    height: ${getValue(400)};
    
    ${p => p.visible && `
        height: max-content;
    `}
    
    & img {
        width: 100%!important;
    }
`

const ExpandButton = styled(Flex)`
    cursor: pointer;
    box-shadow: 0px 0px 8px rgb(0 0 0 / 10%);
`


const GoodsDetailCollapseCard = ({children}) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)
    return (
        <div>
            <GoodsContentWrapper visible={visible}>
                {children}
            </GoodsContentWrapper>
            <Div p={16} mt={visible && 40}>
                <ExpandButton
                    minHeight={50}
                    justifyContent={'center'}
                    doActive
                    onClick={toggle}
                    bc={'dark'}
                    bg={'white'}
                >
                    상세정보 {visible ? '접기' : '펼치기'}
                    <Span ml={10} fontSize={20} mb={4}>
                        {visible ? <IoIosArrowUp/> : <IoIosArrowDown />}
                    </Span>
                </ExpandButton>
            </Div>
        </div>
    );
};

const MoreButton = ({onClick, children}) =>
    <Flex onClick={onClick} py={10} justifyContent={'center'} bc={'light'} cursor fontSize={14}>
        <Space>{children ? children : '더보기'}<IoIosArrowDown /></Space>
    </Flex>

//하단 정책 관련 컴포넌트
// const MenuTitle = ({children}) => <Div fontSize={17} fg={'black'} bold>{children}</Div>
// const MenuContent = ({children}) => <WhiteSpace fontSize={13} fg={'dark'} lineHeight={20} px={16} pb={16}>{children}</WhiteSpace>
// const MenuSectionTitle = ({children}) => <Div fontSize={14} fg={'black'} bold my={10}>{children}</Div>
// const MenuSectionSubTitle = ({children}) => <Div fontSize={13} fg={'black'} bold my={10}>{children}</Div>
// const GoodsProperty = ({children}) => <Div fontSize={13} fg={'black'} bold>{children}</Div>



export default {
    //AR 지원 바
    ARSwitchBar,
    GoodsTab,
    GoodsPriceCard,
    SaveBlyPerLevelAndShippingInfo,
    GoodsReviewList,

    //딜 상품 정보
    DealGoodsInfo,
    //상품 정보
    GoodsNormalInfo,
    //상품 필수 정보
    GoodsRequiredInfo,
    //배송안내 정보
    ShippingInfo,
    //교환 및 반품 안내
    ClaimInfo,
    //하단 정책 관련 컴포넌트
    // Policy: {
    //     MenuTitle,
    //     MenuContent,
    //     MenuSectionTitle,
    //     MenuSectionSubTitle,
    //     GoodsProperty
    // },
    //생산자 공지
    ProducerNotice,
    //상품상세 펼치기 버튼
    GoodsDetailCollapseCard,

    //더보기 버튼
    MoreButton
}