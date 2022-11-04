import React, { Fragment, useState, useEffect, useRef } from 'react'
import {withRouter} from 'react-router-dom'
import loadable from "@loadable/component";
import moment from 'moment-timezone'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'
import { Server } from '~/components/Properties'
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import { color } from "~/styledComponents/Properties";
import {IoIosArrowForward} from 'react-icons/io'
import {IconStarGroup, SummerNoteIEditorViewer} from '~/components/common'
import {
    Div,
    Divider,
    Fixed,
    Right,
    Ul,
    Flex,
    Span,
    Spin,
    Hr,
    GridColumns,
    Sticky,
    Space,
    Img, WhiteSpace, Strong
} from '~/styledComponents/shared/Layouts'
import {BadgeGoodsEventTypeBig, BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import {Button} from '~/styledComponents/shared/Buttons'
import {Icon} from '~/components/common/icons'
import {Collapse} from 'reactstrap'
// import "react-image-gallery/styles/css/image-gallery.css"
import { toast } from 'react-toastify'                              //토스트

import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import {
    getGoodsReviewByGoodsNo,
    getGoodsQnAByKeys, getProducerBoardGoodsStepList,
    getOtherGoodsReviewByItemNo,
    getGoodsBannerList,
    getPotenCouponMaster, getCommunityBestGoodsReviewList,
    getGoodsListByProducerNo
} from '~/lib/shopApi'
import {getGoodsByGoodsNo, getGoodsContent} from '~/lib/goodsApi'
import { getDeliveryFeeTag } from '~/util/bzLogic'
import { exchangeWon2BLCTHome, exchangeWon2BLCTPoint } from "~/lib/exchangeApi"

import {AiOutlineCodeSandbox, AiOutlineInfoCircle} from 'react-icons/ai'
import {RiCoupon3Line} from "react-icons/ri";
import {FaSpinner} from "react-icons/fa";
import {ImQuotesLeft, ImQuotesRight} from "react-icons/im";
import GoodsQnAContent from '../components/GoodsQnAContent'
import GoodsCouponList from '~/components/common/lists/GoodsCouponList'
import DealProgress from '~/components/common/progresses/DealProgress'
import GoodsScore from "~/components/common/cards/GoodsScore";
import GoodsReviewSwiper from '../components/GoodsReviewSwiper'
import ProducerGoodsList from "../components/ProducerGoodsList";
import BuyingPeopleCard from "~/components/common/cards/BuyingPeopleCard";
import Toast from "~/components/common/toast/Toast";
import {AboutSsugSsug, AboutExtraRewards} from '../components/ToastContents'
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import DealGoodsShareButton from "~/components/common/buttons/DealGoodsShareButton";
import useInterval from "~/hooks/useInterval";
import MoreButton from '~/components/common/buttons/MoreButton'
import AnimatedTabs from "~/components/common/tabBars/AnimatedTabs";
import ProfileAuto from "~/components/common/cards/ProfileAuto";
import {Link} from "~/styledComponents/shared";

import Components from "~/components/shop/goods/components/Components";
import {Section, StrongTitle, GoodsNm} from "~/components/shop/goods/components/Atoms";
import ZzimButton from "~/components/common/buttons/ZzimButton";
import ShareButton from "~/components/common/buttons/ShareButton";
import InfoButton from "~/components/common/buttons/InfoButton";
import Switch from "react-switch";
import {Policy} from '../components/Atoms'
import {BsFillImageFill} from 'react-icons/bs'
import RoundedFollowButton from "~/components/common/buttons/RoundedFollowButton";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import GoodsAuthMarks from "~/components/shop/goods/components/GoodsAuthMarks";
import GoodsImagesSwiper from "~/components/shop/goods/components/GoodsImagesSwiper";
import {isForceUpdate} from "~/lib/axiosCache";
import GoodsListSwiper from "~/components/common/swipers/GoodsListSwiper";

const DealGoodsStepContent = loadable(()=> import('~/components/shop/goods/dealGoodsDetail/DealGoodsStepContent'))
const ArView = loadable(() => import('~/components/common/Ar'), {
    fallback: 'loading....'
})

// const Components = loadable(() => import('~/components/shop/dealGoods/components') )

const GOODS_DETAIL = 0
const GOODS_REVIEW = 1;
const GOODS_QNA = 2;

// const tabData = [
//     {label: '상세정보', value: GOODS_DETAIL},
//     {label: '리뷰', value: GOODS_REVIEW},
//     {label: '문의', value: GOODS_QNA},
// ]
//
// const
//
// = styled.div`
//     display: flex;
//     height: 100%;
//     color: ${color.white};
//     align-items: center;
//     justify-content: center;
// `

const SubTitle = ({children}) => <Div px={16} pt={24} fontSize={17} bold>{children}</Div>

const swipeOptions = {
    lazy: true,
    spaceBetween: 0,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
}

//적립
const SaveBly = ({
                     goods,
                     searchInterval = 3000 //조회 인터벌(기간에 접어 들었을 경우 자동 조회됨)
                 }) => {


    const abortController = useRef(new AbortController())

    const [data, setData] = useState(goods)
    const [timerInterval, setTimerInterval] = useState(1000)
    const [periodInterval, setPeriodInterval] = useState(null)

    useEffect(() => {
        return (() => {
            abortController.current.abort()
        })
    }, [])

    useEffect(() => {
        const now = moment()

        const startDate = moment(data.dealStartDate, 'YYYYMMDDHHmm')
        const endDate = moment(data.dealEndDate, 'YYYYMMDD')

        //기간에 접어 든 경우라면 최초 조회
        if (
            now.isBetween(
                moment(startDate, 'YYYYMMDDHHmm'),
                moment(endDate, 'YYYYMMDD').endOf('day'),
                undefined, '[]'
            ) || now.isAfter(endDate)){
            search()
        }
    }, [data.goodsNo])

    useInterval(() => {
        search()
    }, periodInterval)

    //1초마다 기간에 접어들었는지 체크
    useInterval(() => {

        const startDate = moment(data.dealStartDate, 'YYYYMMDDHHmm')
        const endDate = moment(data.dealEndDate, 'YYYYMMDD')

        const now = moment()

        //기간 이전일 경우
        if (now.isBefore(startDate)) {
            // console.log('before')
        }
        /*
            기간중
            [ : 시작이 같거나 큰것
            ] : 종료가 같거나 큰것
            ( : 시작보다 큰것
            ) : 종료보다 큰것
      */
        else if (periodInterval === null && now.isBetween(startDate, endDate,undefined, '[]')) {
            setPeriodInterval(searchInterval)
            // console.log('between')
        }
        //기간종료
        else if (now.isAfter(endDate)){
            setPeriodInterval(null)
            setTimerInterval(null)
            // console.log('after')
        }
    }, timerInterval)

    const search = async () => {
        try {
            const {data} = await getGoodsByGoodsNo(goods.goodsNo)
            setData(data)
        }catch (error) {

        }
    }

    return(
        <>
            <Flex>
                <StrongTitle>추가적립</StrongTitle>
                <Flex ml={'auto'} lineHeight={13}>
                    <Toast
                        title={'적립혜택 안내'}
                        bodyStyle={{padding: 0, background: color.white}}
                        content={
                            <AboutExtraRewards
                                extraRewards={data.extraRewards}
                                dealNowExtraReward={data.dealNowExtraReward}
                                goodsNo={data.goodsNo}
                                goodsNm={data.goodsNm}
                                dealRecommenderRate={data.dealRecommenderRate}
                            />
                        }
                        position={'right'}
                    >
                        <InfoButton>
                            적립혜택보기
                        </InfoButton>
                    </Toast>
                </Flex>
            </Flex>
            <Flex mt={16}>
                <Space>
                    <Bold bold fontSize={20} lineHeight={20} fg={'green'}>{data.dealNowExtraReward}%</Bold>
                    <Span fontSize={13} lineHeight={13} pt={2}>
                        {data.dealNextExtraRewardText} <b>UP!</b>
                    </Span>
                </Space>
                {/*<Right fontSize={13} lineHeight={13} fg={'dark'}>*/}
                {/*    {data.dealNextExtraRewardText} <b>UP!</b>*/}
                {/*</Right>*/}
            </Flex>
        </>
    )
}

const DealGoodsContent = (props) => {


    const abortController = useRef(new AbortController())

    // const {data: coupons, loading: couponLoading } = useFetch(getGoodsCouponMasters, props.goods.goodsNo)

    const tabData = [
        {label: '상세정보', value: GOODS_DETAIL},
        {label: `리뷰${props.goods.goodsReviewsCount > 0 ? ` ${ComUtil.addCommas(props.goods.goodsReviewsCount)}` : ''}`, value: GOODS_REVIEW},
        // {label: `리뷰${props.goods.goodsReviewsCount}`, value: GOODS_REVIEW},
        {label: '문의', value: GOODS_QNA},
    ]

    const elTabRef = useRef()

    //hooks
    const [tabId, setTabId] = useState(GOODS_DETAIL)

    //구매후기
    const [goodsReviewData, setGoodsReviewData] = useState()
    const [goodsReviewDataPage,setGoodsReviewDataPage] = useState(0)
    const [goodsReviewDataTotalCount, setGoodsReviewDataTotalCount] = useState(0)
    const [goodsReviewDataAvgScore, setGoodsReviewDataAvgScore] = useState(0)

    //구매후기-다른상품후기
    const [goodsReviewOtherData, setGoodsReviewOtherData] = useState([])
    const [goodsReviewOtherDataPage,setGoodsReviewOtherDataPage] = useState(0)
    const [goodsReviewOtherDataTotalCount, setGoodsReviewOtherDataTotalCount] = useState(0)

    //상품문의
    const [goodsQnAData, setGoodsQnAData] = useState([])
    const [goodsQnADataPage, setGoodsQnADataPage] = useState(0)
    const [goodsQnADataTotalCount, setGoodsQnADataTotalCount] = useState(0)

    //상품 생산이력
    const [goodsStepData, setGoodsStepData] = useState([])
    const [goodsStepDataPage, setGoodsStepDataPage] = useState(0)
    const [goodsStepDataTotalCount, setGoodsStepDataTotalCount] = useState(0)

    //Bly 시세
    const [blySiseModal, setBlySiseModal] = useState(false);

    // AR 스위치
    const [isAr,setIsAr] = useState(false);

    //상품상세, 블리리뷰: toastUI뷰어용 - backEnd를 통해 file에서 조회
    const [goodsContent, setGoodsContent]= useState('')
    const [blyReview, setBlyReview] = useState('')

    const [cartModal, setCartModal] = useState(false);

    const [orderModal, setOrderModal] = useState(false);

    const [finishedSaleGoods, setFinishedSaleGoods] = useState(false);
    const [finishCurrentPrice, setFinishCurrentPrice] = useState(0);

    //상품필수정보 등의 펼침상태
    const [etcStatus, setEtcStatus] = useState([false, false, false, false])

    //구매하기 펼치기 여부
    const [addStatus, setAddStatus] = useState(false)

    //구매수량
    const [orderQty, setOrderQty] = useState(1)

    //블리타임 여부
    // const [blyTimeYn, setBlyTimeYn] = useState(false)

    //슈퍼리워드 여부
    // const [superRewardYn, setSuperRewardYn] = useState(false)


    //상품공지배너
    const [goodsBannerList, setGoodsBannerList] = useState([]);

    const [couponMaster, setCouponMaster] = useState()

    //상품 리뷰 스코어 정보
    // const [goodsScore, setGoodsScore] = useState()

    //생산자의 다른상품
    const [producerGoodsList, setProducerGoodsList] = useState()

    //긍정 리뷰
    const [bestGoodsReviewList, setBestGoodsReviewList] = useState()
    //부정 리뷰
    const [worstGoodsReviewList, setWorstGoodsReviewList] = useState()

    const [isInPeriod, setInPeriod] = useState()

    //상품번호 변경시 재 조회
    useEffect(() => {

        //탭 초기화
        setTabId(GOODS_DETAIL)

        //상세정보 조회
        searchGoodsContent()
        searchGoodsListByProducerNo()
        searchGoodsReviewData(true)
        searchGoodsReviewOtherData(true)
        searchGoodsQnAData(true)
        searchGoodsStepData(true);
        searchGoodsBannerList()
        getPotenCoupon()

        // 판매종료
        const isFinishGoods = isFinishedDate(ComUtil.utcToTimestamp(props.goods.saleEnd));

        if(isFinishGoods || props.goods.saleStopped || props.goods.salePaused) {
            setFinishedSaleGoods(true); // 판매마감 상품인지 판단
            setFinishCurrentPrice(0);
        }

        //마지막 본거 저장.
        // ComUtil.saveLastSeenGoods(props.goods.goodsNo);
        // let lastSeenGoodsList = ComUtil.getLastSeenGoodsList();

        console.log({goods: props.goods})


    }, [props.goods.goodsNo])

    // useEffect(() => {

        // async function fetch() {
        //     if (tabId === GOODS_REVIEW && !goodsScore) {
        //         const {getGoodsScore} = await import('~/lib/shopApi')
        //         const {data} = await getGoodsScore(props.goods.goodsNo)
        //         setGoodsScore(data)
        //
        //         console.log({goodsScore: data})
        //     }
        // }
        //
        // fetch()

    // }, [tabId])


    //포텐타임중 쿠폰 마스터 조회
    const getPotenCoupon = async () => {
        try {
            //포텐타임중인 상품일 경우 쿠폰 마스터 조회
            if (props.goods.inTimeSalePeriod) {
                const {data} = await getPotenCouponMaster(props.goods.goodsNo)
                setCouponMaster(data)
                console.log({data})
            }
        }catch (error) {

        }
    }

    const isFinishedDate = (monentDate) => {
        const now = ComUtil.utcToTimestamp(moment());
        return (monentDate < now);
    }

    const serverImageUrl = Server.getImageURL()
    const serverThumbnailUrl = Server.getImageURL()

    const onCartClick = async () => {
        if(await isOkay()){
            setCartModal(true)
        }
    }

    //구매가능여부 (로그인 및 소비자 인지 체크)
    async function isOkay() {
        if (!(await isUserTypeOf('consumer'))) {
            alert('소비자 로그인 후 이용 가능 합니다')
            Webview.openPopup('/login',  true); //로그인으로 이동팝업
            return false
        }
        return true
    }

    //userType 체크
    const isUserTypeOf = async (userType) => {
        try {
            //로그인 check
            const {data:loginUserType} = await getLoginUserType();
            return loginUserType === userType ? true : false
        }catch (error) {

        }
    }

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    //상품설명, 구매안내, 재배일자, 후기 클릭
    async function onTabSectionClick(tabId, isFocus){
        switch(tabId){
            //구매후기
            case GOODS_REVIEW:

                //긍정 리뷰 조회
                if (!bestGoodsReviewList)
                    searchBestGoodsReview()
                //부정 리뷰 조회
                if (!worstGoodsReviewList)
                    searchWorstGoodsReview()

                //데이터가 없는 경우만 조회함
                !goodsReviewData && searchGoodsReviewData()
                break
            //상품문의
            case GOODS_QNA:
                goodsQnAData.length <= 0 && searchGoodsQnAData()
                break
        }
        setTabId(tabId)

        if (isFocus) {

            //해당 엘리먼트를 최상단으로 스크롤
            elTabRef.current.scrollIntoView(true);

            //윈도우의 전체 세로 길이
            const scrolledY = window.scrollY;
            const yourHeight = 56; //fixed 된 네이게이션 height

            //fixed 된 세로만큰 다시 내려서 스크롤 보정
            if(scrolledY){
                window.scroll(0, scrolledY - yourHeight);
            }
        }
    }

    //생산자의 다른 상품
    async function searchGoodsListByProducerNo() {
        try{
            const {status, data} = await getGoodsListByProducerNo(props.goods.producerNo, isForceUpdate(props.history), abortController.current.signal)
            //console.log({"생산자다른상품": data})
            console.log({producerGoods: data})
            setProducerGoodsList(data)
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("DealGoodsContent searchGoodsListByProducerNo canceled")
            }else{

            }
        }
    }

    //긍정 리뷰 조회
    async function searchBestGoodsReview() {
        try{
            const {getCommunityBestGoodsReviewList} = await import('~/lib/shopApi')
            const {status, data} = await getCommunityBestGoodsReviewList(props.goods.goodsNo, isForceUpdate(props.history), abortController.current.signal)
            setBestGoodsReviewList(data)
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("DealGoodsContent searchBestGoodsReview canceled")
            }else{

            }
        }
    }

    //부정 리뷰 조회
    async function searchWorstGoodsReview() {
        try{
            const {getCommunityWorstGoodsReviewList} = await import('~/lib/shopApi')
            const {status, data} = await getCommunityWorstGoodsReviewList(props.goods.goodsNo, isForceUpdate(props.history), abortController.current.signal)
            setWorstGoodsReviewList(data)
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("DealGoodsContent searchWorstGoodsReview canceled")
            }else{

            }
        }
    }

    //구매후기 db조회 & 렌더링
    async function searchGoodsReviewData(isNewSearch){
        try {
            let page = isNewSearch ? 1 : goodsReviewDataPage + 1
            const { data: {goodsReviews, totalCount} } = await getGoodsReviewByGoodsNo(props.goods.goodsNo, true,5, page)
            setGoodsReviewData(isNewSearch ? [].concat(goodsReviews) : goodsReviewData.concat(goodsReviews))
            setGoodsReviewDataPage(page)
            //-1을 특수용도로 사용.(다른상품후기 개수 존재)setGoodsReviewDataTotalCount(totalCount === -1 ? 0 : totalCount)
            setGoodsReviewDataTotalCount(totalCount)

            //리뷰 평균
            //totalCount > 0 && setGoodsReviewDataAvgScore(ComUtil.roundDown(ComUtil.sum(goodsReviews, 'score') / totalCount, 1))

            console.log({"리뷰": goodsReviews, totalCount, page} )
        }catch (error){

        }
    }

    //구매후기-다른상품후기 db조회 & 렌더링
    async function searchGoodsReviewOtherData(isNewSearch){
        try {
            let page = isNewSearch ? 0 : goodsReviewOtherDataPage + 1
            const { data: {goodsReviews, totalCount} } = await getOtherGoodsReviewByItemNo(props.goods.goodsNo, true,5, page)
            setGoodsReviewOtherData(isNewSearch ? [].concat(goodsReviews) : goodsReviewOtherData.concat(goodsReviews))
            setGoodsReviewOtherDataPage(page)
            setGoodsReviewOtherDataTotalCount(totalCount)
            console.log({"다른상품리뷰": goodsReviews, totalCount, page} )
        }catch (error){}
    }

    //상품문의 db조회 & 렌더링
    async function searchGoodsQnAData(isNewSearch){
        try {
            const page = isNewSearch ? 1 : goodsQnADataPage +1

            const params = {
                goodsNo: props.goods.goodsNo,
                isPaging: true,
                limit: 10,
                page: page
            }

            const {data: {goodsQnas, totalCount}} = await getGoodsQnAByKeys(params)

            setGoodsQnAData(isNewSearch ? [].concat(goodsQnas) : goodsQnAData.concat(goodsQnas))
            setGoodsQnADataPage(page)
            setGoodsQnADataTotalCount(totalCount)
        }catch (error){}

    }

    //상품 생산이력 db조회 & 렌더링
    async function searchGoodsStepData(){
        try {
            const page = 1
            const params = {
                goodsNo: props.goods.goodsNo,
                limit: 2,
                page: page
            }

            const {data: {boards, totalCount}} = await getProducerBoardGoodsStepList(params)

            console.log({boards})

            setGoodsStepData(boards)
            setGoodsStepDataPage(page)
            setGoodsStepDataTotalCount(totalCount)
        }catch (error) {

        }

    }

    //상품상세: toastUI뷰어용 - backEnd를 통해 file에서 조회
    async function searchGoodsContent(){
        try{
            if (props.goods.goodsContent) {
                setGoodsContent(props.goods.goodsContent);
            }else {
                if (props.goods.goodsContentFileName) {
                    const {data: goodsContent} = await getGoodsContent(props.goods.goodsContentFileName, isForceUpdate(props.history), abortController.current.signal)
                    if (goodsContent) {
                        setGoodsContent(goodsContent);
                    }
                }
                // // 상품상세 조회할 때 블리리뷰도 같이 조회해와서 화면에 세팅해 둠
                // if(props.goods.blyReview) {
                //     //     const {data: blyReview} = await getBlyReview(props.goods.blyReviewFileName)
                //     setBlyReview(props.goods.blyReview);
                // }
            }
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("DealGoodsContent searchGoodsContent canceled")
            }else{

            }
        }

    }


    //더보기 클릭
    async function onMoreClick({type}){
        switch (type){
            case 'GOODSREVIEW':         //상품후기
                searchGoodsReviewData()
                break
            case 'GOODSREVIEW_OTHER':   //다른상품후기
                searchGoodsReviewOtherData()
                break
            case 'GOODSQNA':            //상품문의
                searchGoodsQnAData()
                break
            case 'GOODSSTEP':            //상품이력
                searchGoodsStepData()
                break
        }
    }


    let {
        goodsNo,            //순번
        // producerNo,      //생산자번호
        goodsNm,            //상품명
        dealGoodsDesc,      //상품설명
        goodsImages,        //상품이미지
        arGlbFile,          //상품AR파일 glb
        arUsdzFile,         //상품AR파일 usdz ios
        searchTag,          //태그
        // itemNo,          //품목번호
        itemName,           //품목명
        breedNm,            //품종
        productionArea,     //생산지
        // cultivationNo,   //재배방법번호
        cultivationNm,      //재배방법명
        saleEnd,            //판매마감일

        expectShippingStart,//예상발송시작일
        expectShippingEnd,  //예상발송마감일

        hopeDeliveryFlag,
        hopeDeliveryDate,

        pesticideYn,        //농약유무
        packUnit,           //포장단위
        packAmount,         //포장 양
        packCnt,            //판매개수
        //shipPrice,        //출하 후 판매가
        //reservationPrice, //예약 시 판매가
        consumerPrice,      //소비자 가격
        currentPrice,       //현재 가격
        discountRate,       //현재 할인율
        priceSteps,         //3단계 할인단계 [{stepNo, until, price, discountRate}]
        selectedPriceStep,  //할인단계
        //cultivationDiary  //재배일지
        // contractHash,    //블록체인 저장된 해시값

        remainedCnt,        //남은판매개수
        directGoods,        //즉시판매상품 여부

        dealGoods,          //공동구매상품 여부.

        blyTime,            // 블리타임 진행 여부
        blyTimeReward,       // 블리타임 보상 퍼센트
        inBlyTimePeriod,

        superReward,
        superRewardReward,
        inSuperRewardPeriod
    } = props.goods

    async function searchGoodsBannerList() {
        let {data: goodsBannerList} = await getGoodsBannerList();

        if (goodsBannerList) {
            setGoodsBannerList(goodsBannerList)
        }
    }

    const goodsBannerImages = (goodsBannerList.length > 0) && goodsBannerList.map((goodsBanner)=>{
        return goodsBanner.goodsBannerImages[0].imageUrl
    })

    const { name, farmName } = props.producer
    const images = goodsImages.map((image)=>{
        return {
            original: serverImageUrl + image.imageUrl,
            thumbnail: serverThumbnailUrl + image.imageUrl,
        }
    })

    function onIsArChange (ar) {
        setIsAr(ar);
    }

    function onEtcStatusClick(index){
        // const etcStatus = [false, false, false]
        const statusArr = Object.assign([], etcStatus)
        statusArr[index] = !statusArr[index]

        setEtcStatus(statusArr)
    }


    function hasRemainedCnt() {
        let remainedCnt = 0;
        props.goods.options.map(option =>
            remainedCnt += option.remainedCnt
        )
        return remainedCnt
    }


    if(!props.goods) return null

    return(
        <Div pb={100} relative>

            {
                (arGlbFile && arGlbFile.imageUrl) && (
                    <Components.ARSwitchBar onChange={onIsArChange} checked={isAr}/>
                )
            }

            {
                isAr ?
                    <div style={{width:'100vmin',maxWidth:'768px',height:'100vmin'}}>
                        <ArView
                            isTest={false}
                            arSrc={arGlbFile?arGlbFile.imageUrl:null}
                            arIosSrc={arUsdzFile?arUsdzFile.imageUrl:null}
                            //arSrc={'/3dtestContent/RECONLABS_sample.glb'}
                            arIosSec={null}
                            arName={props.goods.goodsNm} />
                    </div>
                    :
                    <GoodsImagesSwiper goodsImages={goodsImages} />
            }




            <div>

                {/* 상품제목 */}
                <Section>
                    <div style={{fontSize: 13}}>
                        <Span fg={'green'} ><b>참여기간</b></Span>
                        <Span fg={'dark'} ml={5}>
                            {`${ComUtil.intToDateString(props.goods.dealStartDate)} ~ ${ComUtil.intToDateString(props.goods.dealEndDate)}`}
                        </Span>
                    </div>
                    <Div my={15}>
                        <GoodsNm>{goodsNm}</GoodsNm>
                    </Div>
                    <WhiteSpace fg={'darkBlack'} fontSize={14}>
                        {dealGoodsDesc}
                    </WhiteSpace>
                </Section>

                <Divider />

                {/* 상품가격 카드 */}
                <Section>
                    <Components.GoodsPriceCard goods={props.goods} onReviewClick={onTabSectionClick.bind(this, GOODS_REVIEW, true)} />
                </Section>

                <Divider height={1} mx={16}/>

                {/* 적립 & 배송정보 */}
                <Section>
                    <Components.SaveBlyPerLevelAndShippingInfo goods={props.goods} />
                </Section>

                <Divider/>

                {/* 달성 및 실시간 구입자 */}
                <div>
                    {/* 프로그래스 */}
                    <Section pb={16}>
                        <StrongTitle>달성</StrongTitle>
                        <DealProgress.AutoUpdate
                            goodsNo={props.goods.goodsNo}
                            startDate={moment(props.goods.dealStartDate, 'YYYYMMDDHHmm')}
                            endDate={moment(props.goods.dealEndDate, 'YYYYMMDD').endOf('day')}

                            value={props.goods.dealCount}
                            minValue={props.goods.dealMinCount}
                            maxValue={props.goods.dealMaxCount}
                            // dealEndDate={props.goods.dealEndDate}
                            showProgressRate
                            showRemainedDaysCount
                            animation={true}
                        />
                        <Flex fontSize={12} mt={10} mb={20}>
                            <Space>
                                <Div rounded={'50%'} width={10} height={10} bg={'green'}></Div>
                                <Span>달성 수량</Span>
                            </Space>
                            <Space ml={30}>
                                <Div rounded={'50%'} width={10} height={10} bg={'secondary'}></Div>
                                <Span>최대 판매 수량</Span>
                            </Space>
                        </Flex>
                    </Section>
                </div>
                <Divider height={1}/>

                {/* 추가 적립 */}
                <Section>
                    <SaveBly goods={props.goods} />
                    <Flex mt={10}>
                        <Space>
                            <Bold bold fontSize={20} lineHeight={20} fg={'green'}>{props.goods.dealRecommenderRate}%</Bold>
                            <Span fontSize={13} lineHeight={13} pt={2}>공유하고 적립받자!</Span>
                        </Space>
                        <Flex ml={'auto'} lineHeight={13}>
                            <DealGoodsShareButton
                                goodsNo={props.goods.goodsNo}
                                goodsNm={props.goods.goodsNm}
                            >
                                공유
                            </DealGoodsShareButton>
                        </Flex>
                    </Flex>
                </Section>

                <Divider />

                {/* 실시간 구입자 */}

                {
                    (hasRemainedCnt() > 0) && (
                        <BuyingPeopleCard goodsNo={props.goods.goodsNo}
                                          startDate={moment(props.goods.dealStartDate, 'YYYYMMDDHHmm')}
                                          endDate={moment(props.goods.dealEndDate, 'YYYYMMDD').endOf('day')}
                        />
                    )
                }



                {/* 쑥쑥이란 */}
                <Section>

                    <Flex>
                        <StrongTitle>쑥쑥 알아두세요!</StrongTitle>
                        <Right>
                            <Toast
                                title={'쑥쑥이 뭔가요?'}
                                bodyStyle={{background: color.white}}
                                content={
                                    <AboutSsugSsug/>
                                }
                                position={'right'}
                            >
                                <InfoButton>
                                    쑥쑥이 뭔가요?
                                </InfoButton>
                                {/*<BadgeSharp bg={'green'} fg={'white'}>*/}
                                {/*    쑥쑥이 뭔가요?*/}
                                {/*</BadgeSharp>*/}
                            </Toast>
                        </Right>
                    </Flex>
                    <Div p={16} bg={'background'} rounded={2} mt={16}>
                        <Div fontSize={13} lineHeight={13} fg={'darkBlack'}>
                            <Flex mb={10}>
                                <Div>주문 종료일</Div>
                                <Right>{ComUtil.intToDateString(props.goods.dealEndDate,"YYYY-MM-DD 24:00")}</Right>
                            </Flex>
                            <Flex mt={10} fg={'green'}>
                                <Div>결제 예정일</Div>
                                <Right>{ComUtil.utcToString((ComUtil.intToDateMoment(props.goods.dealEndDate)).add(24,'h'),"YYYY-MM-DD 10:00")}</Right>
                            </Flex>
                        </Div>
                    </Div>
                    <Div mt={16} fontSize={13} fg={'dark'}>
                        <Flex dot alignItems={'flex-start'}>
                            <div>
                                쑥쑥 상품은 예약결제 이후 실제 <Strong>결제는 결제예정일에 진행</Strong> 됩니다
                            </div>
                        </Flex>
                    </Div>
                </Section>

                <Divider height={1}/>

                <GoodsAuthMarks
                    infoValues={props.goods.authMarkInfo}
                />

                <Divider />

                {/* 상세정보, 리뷰, 문의 탭 */}
                <Sticky top={55} zIndex={2} ref={elTabRef}>
                    <Components.GoodsTab
                        data={tabData}
                        value={tabId}
                        onChange={onTabSectionClick}
                    />
                </Sticky>

                {/*/!* 상세정보, 리뷰, 문의 탭 *!/*/}
                {/*<Components.TabContainer*/}
                {/*    producer={props.producer}*/}
                {/*    goods={props.goods}*/}
                {/*    value={'GOODS_DETAIL'}*/}
                {/*/>*/}

                {
                    //상품정보
                    (tabId === GOODS_DETAIL) && (
                        <div>
                            {
                                goodsBannerList.length > 0 && goodsBannerList.map((banner)=>
                                    <img
                                        key={banner.goodsBannerId}
                                        style={{width:'100%',height:'500'}}
                                        src={ComUtil.getFirstImageSrc(banner.goodsBannerImages, TYPE_OF_IMAGE.IMAGE)}
                                        alt="공지배너"
                                    />)
                            }
                            <Components.ProducerNotice producer={props.producer} goods={props.goods}/>
                            <GoodsCouponList goodsNo={goodsNo} />
                            {
                                !goodsContent ? (
                                        <Div textAlign={'center'} mt={5} minHeight={100}>
                                            <Spin duration={2.5}>
                                                <FaSpinner />
                                            </Spin>
                                        </Div>
                                    )
                                    :
                                    <Components.GoodsDetailCollapseCard>
                                        <SummerNoteIEditorViewer
                                            height="400px"
                                            initialValue={goodsContent}
                                        />
                                    </Components.GoodsDetailCollapseCard>
                            }
                        </div>
                    )
                }

                {
                    //리뷰
                    (tabId === GOODS_REVIEW) && (
                        <>
                            <GoodsScore avgScore={props.goods.avgScore} scoreRates={props.goods.scoreRates} />
                            {
                                goodsReviewData && (
                                    <>
                                        <Divider />
                                        <Flex alignItems={'flex-start'} fontSize={15} m={16} mb={0}><ImQuotesLeft size={12}/><Div bold mx={5}>맘에 들어요</Div><ImQuotesRight size={12}/></Flex>
                                        <GoodsReviewSwiper goodsReviews={bestGoodsReviewList} />
                                        <Divider />
                                        <Flex alignItems={'flex-start'} fontSize={15} m={16} mb={0}><ImQuotesLeft size={12}/><Div bold mx={5}>잘 모르겠어요</Div><ImQuotesRight size={12}/></Flex>
                                        <GoodsReviewSwiper goodsReviews={worstGoodsReviewList} />
                                        <Divider />
                                        <SubTitle>일반상품리뷰</SubTitle>
                                        <Components.GoodsReviewList goodsReviewList={goodsReviewData} />
                                        {
                                            (goodsReviewData.length > 0 && goodsReviewData.length < goodsReviewDataTotalCount && goodsReviewData.length <= 10) && <MoreButton onClick={onMoreClick.bind(this, {type: 'GOODSREVIEW'})} >더보기</MoreButton>
                                        }
                                        {
                                            (goodsReviewData.length > 0 && goodsReviewData.length > 10) && <MoreButton onClick={() => props.history.push(`/goods/goodsReviewList/${props.goods.goodsNo}`)} isArrowRight={true}>{ComUtil.addCommas(goodsReviewDataTotalCount)}개 전체보기</MoreButton>
                                        }
                                    </>
                                )
                            }
                        </>
                    )
                }
                {
                    //리뷰-다른상품후기
                    (tabId === GOODS_REVIEW) && (
                        <>
                            <Divider />
                            <SubTitle>다른상품리뷰</SubTitle>
                            <Components.GoodsReviewList goodsReviewList={goodsReviewOtherData} showGoodsNm={true} />
                            {
                                (goodsReviewOtherData.length < goodsReviewOtherDataTotalCount) && <MoreButton onClick={onMoreClick.bind(this, {type: 'GOODSREVIEW_OTHER'})} />
                            }
                        </>
                    )

                }

                {
                    //상품문의
                    (tabId === GOODS_QNA && goodsQnAData) &&
                    <GoodsQnAContent goods={props.goods} goodsQnAs={goodsQnAData} totalCount={goodsQnADataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSQNA'})} onGoodsQnASaved={searchGoodsQnAData.bind(this, true)} />
                }

                <Divider />


                {/* 이력추적 */}
                <Div pt={29}>
                    <StrongTitle px={16}>이력추적</StrongTitle>
                    <DealGoodsStepContent
                        goodsSteps={goodsStepData}
                    />
                    {
                        goodsStepDataTotalCount > 2 && <MoreButton onClick={() => props.history.push(`/goods/goodsTraceList/${goodsNo}`)} isArrowRight={true}>이력추적 전체보기</MoreButton>
                    }
                </Div>


                <Divider/>

                <Flex px={16} my={24}>
                    <ProfileAuto consumerNo={900000000 + props.producer.producerNo}/>
                    <RoundedFollowButton ml={'auto'} producerNo={props.producer.producerNo} />
                </Flex>
                {
                    (producerGoodsList && producerGoodsList.length > 0) && (
                        <>
                            <SubTitle pt={0}>생산자의 다른 상품</SubTitle>
                            <GoodsListSwiper goodsList={producerGoodsList} />
                            {/*<Div px={16} py={20} custom={`*/}
                            {/*    & > div {*/}
                            {/*        padding: 0;*/}
                            {/*        padding-bottom: 8px;*/}
                            {/*    }*/}
                            {/*    & > div:last-child {*/}
                            {/*        padding: 0;*/}
                            {/*    }*/}
                            {/*`}>*/}
                            {/*    <ProducerGoodsList goodsList={producerGoodsList} />*/}
                            {/*</Div>*/}
                        </>
                    )
                }



                <Divider />

                {/* 정책 관련 */}
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 0)}>
                        <Policy.MenuTitle>딜 정책</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[0] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[0]}>
                        <Components.DealGoodsInfo goods={props.goods}/>
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 1)}>
                        <Policy.MenuTitle>상품 정보</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[1] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[1]}>
                        <Components.GoodsNormalInfo goods={props.goods} producer={props.producer} />
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 2)}>
                        <Policy.MenuTitle>상품 필수 정보</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[2] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[2]}>
                        <Components.GoodsRequiredInfo goods={props.goods} producer={props.producer}/>
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 3)}>
                        <Policy.MenuTitle>배송안내</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[3] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[3]}>
                        <Components.ShippingInfo />
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 4)}>
                        <Policy.MenuTitle>교환 및 반품안내</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[4] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[4]}>
                        <Components.ClaimInfo />
                    </Collapse>
                </Div>
                <Divider height={1}/>
            </div>

        </Div>
    )

}
export default withRouter(DealGoodsContent)

//
// const MenuTitle = ({children}) => <Div fontSize={17} fg={'black'} bold>{children}</Div>
// const MenuContent = ({children}) => <WhiteSpace fontSize={13} fg={'dark'} lineHeight={20} px={16} pb={16}>{children}</WhiteSpace>
// const MenuSectionTitle = ({children}) => <Div fontSize={14} fg={'black'} bold my={10}>{children}</Div>
// const MenuSectionSubTitle = ({children}) => <Div fontSize={13} fg={'black'} bold my={10}>{children}</Div>
// const GoodsProperty = ({children}) => <Div fontSize={13} fg={'black'} bold>{children}</Div>
