import React, {Fragment, useState, useEffect, createContext, useContext, useRef} from 'react'
import moment from 'moment-timezone'
import {FaSpinner} from "react-icons/fa";
import ComUtil from '~/util/ComUtil'
import Zoomable from "react-instagram-zoom";
import {
    Div,
    Divider,
    Fixed,
    Flex,
    Span,
    Spin,
    Hr,
    GridColumns,
    Sticky,
    Img,
    Right, Space
} from '~/styledComponents/shared/Layouts'
import GoodsCouponList from '~/components/common/lists/GoodsCouponList'
import { Webview } from '~/lib/webviewApi'

import { SummerNoteIEditorViewer } from '~/components/common'
import { Server } from '~/components/Properties'

import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import {
    getGoodsReviewByGoodsNo,
    getGoodsQnAByKeys,
    getOtherGoodsReviewByItemNo,
    getGoodsBannerList,
    getPotenCouponMaster, getCommunityBestGoodsReviewList,
    getGoodsListByProducerNo, getRelatedGoodsByTags
} from '~/lib/shopApi'
import { getGoodsContent } from '~/lib/goodsApi'

// import "react-image-gallery/styles/css/image-gallery.css"
import { toast } from 'react-toastify'                              //토스트

import GoodsQnAContent from '../components/GoodsQnAContent'
import BlySise from '~/components/common/blySise'

import {Icon} from '~/components/common/icons'
import {Collapse, Modal, ModalHeader, ModalBody} from 'reactstrap'

import loadable from "@loadable/component";

import {withRouter} from 'react-router-dom'
import GoodsScore from "~/components/common/cards/GoodsScore";
import GoodsReviewSwiper from "../components/GoodsReviewSwiper";
import {ImQuotesLeft, ImQuotesRight} from "react-icons/im";
import ProducerGoodsList from "../components/ProducerGoodsList";
import GoodsAuthMarks from '../components/GoodsAuthMarks'
import Components from '../components/Components'
import {SubTitle, GoodsNm, Section} from "~/components/shop/goods/components/Atoms";
import ProfileAuto from "~/components/common/cards/ProfileAuto";
import {Policy} from '../components/Atoms'
import RoundedFollowButton from "~/components/common/buttons/RoundedFollowButton";
import GoodsShareButton from "~/components/common/buttons/GoodsShareButton";
import GoodsImagesSwiper from "~/components/shop/goods/components/GoodsImagesSwiper";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import {isForceUpdate} from "~/lib/axiosCache";
import GoodsListSwiper from "~/components/common/swipers/GoodsListSwiper";

const ArView = loadable(() => import('~/components/common/Ar'))
const GoodsReviewContent = loadable(() => import('../components/GoodsReviewContent'))

const GOODS_DETAIL = 0
const GOODS_REVIEW = 1;
const GOODS_QNA = 2;

const GoodsContent = (props) => {

    console.log('goodsContent props', props)

    // const Policy = Components.Policy

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
    const [goodsReviewData, setGoodsReviewData] = useState([])
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

    //Bly 시세
    const [blySiseModal, setBlySiseModal] = useState(false);

    // AR 스우치
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

    //상품공지배너
    const [goodsBannerList, setGoodsBannerList] = useState([]);

    const [couponMaster, setCouponMaster] = useState()

    //생산자의 다른상품
    const [producerGoodsList, setProducerGoodsList] = useState([])

    //연관 상품
    const [relatedGoodsList, setRelatedGoodsList] = useState()

    //긍정 리뷰
    const [bestGoodsReviewList, setBestGoodsReviewList] = useState()
    //부정 리뷰
    const [worstGoodsReviewList, setWorstGoodsReviewList] = useState()

    //화면 로드시 생산일지, 구매후기, 다른상품구매후기, 상품문의, 공지배너 조회(이때 하는 이유는 사용자 리뷰를 미리 바인딩 해야 하기 때문)
    // useEffect(() => {
    //     searchGoodsContent()
    //     // searchFarmDiaryData()
    //     searchGoodsReviewData()
    //     searchGoodsReviewOtherData()
    //     searchGoodsQnAData()
    //     searchGoodsBannerList()
    //     getPotenCoupon()
    //
    //     // 판매종료
    //     const isFinishGoods = isFinishedDate(ComUtil.utcToTimestamp(props.goods.saleEnd));
    //
    //     if(isFinishGoods || props.goods.saleStopped) {
    //         setFinishedSaleGoods(true); // 판매마감 상품인지 판단
    //         setFinishCurrentPrice(0);
    //     }
    //
    // }, [])

    const abortController = useRef(new AbortController())

    useEffect(() => {
        return (() => {
            abortController.current.abort()
        })
    }, [])

    //상품번호 변경시 재 조회
    useEffect(() => {

        //탭 초기화
        setTabId(GOODS_DETAIL)

        //상제정보 조회
        searchGoodsContent()
        searchGoodsListByProducerNo()
        searchRelatedGoods()
        searchGoodsReviewData(true)
        searchGoodsReviewOtherData(true)
        searchGoodsQnAData(true)
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

    }, [props.goods])



    useEffect(() => {

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

    }, [tabId])




    //포텐타임중 쿠폰 마스터 조회
    const getPotenCoupon = async () => {
        try {
            //포텐타임중인 상품일 경우 쿠폰 마스터 조회
            if (props.goods.inTimeSalePeriod) {
                const {data} = await getPotenCouponMaster(props.goods.goodsNo)
                setCouponMaster(data)
                console.log({data})
            }
        }catch (error){

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

    // const onCartPopupClose = (res) => {
    //     //장바구니담기 팝업에서 구매하거가기 눌렀을 경우 /cartList 로 이동
    //     if(res) props.history.push(res)
    //     else
    //         setCartModal(!cartModal)
    // }

    //BLY 시세 모달 toggle
    const onBlySiseModalToggle = () => {
        setBlySiseModal(!blySiseModal);
    }
    //BLY 시세 모달
    const onBlySiseClick = () => {
        setBlySiseModal(true);
    }

    //즉시구매 클릭
    // const onBuyClick = async () => {
    //     if(await isOkay()){
    //         alert('success')
    //         setOrderModal(true) //구매하기 모달
    //     }
    // }

    //즉시구매 모달 닫기
    // const onOrderPopupClose = (res) => {
    //     setOrderModal(!orderModal)
    // }

    //즉시구매 모달에서 확인 클릭
    // async function moveDirectBuy(res) {
    //     if(await isOkay()){
    //         if(res.multiGift) {
    //             Webview.openPopup(`/multiGiftBuy?goodsNo=${props.goods.goodsNo}&qty=${res.qty}`, true)
    //         } else {
    //             if (props.goods.dealGoods)
    //                 Webview.openPopup(`/directBuy?goodsNo=${props.goods.goodsNo}&optionQty=${res.optionQty}`, true)
    //             else
    //                 Webview.openPopup(`/directBuy?goodsNo=${props.goods.goodsNo}&qty=${res.qty}&gift=${res.gift}`, true) //구매로 이동 : true=noRefresh.(단순 팝업 닫아서 상세화면이 refresh될때 Home으로 가능현상 방지
    //         }
    //     }
    // }

    const onIsArChange = () => {
        setIsAr(!isAr);
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
        //로그인 check
        const {data:loginUserType} = await getLoginUserType();
        return loginUserType === userType ? true : false
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
            //상품설명
            // case 1:
            //     return tabContent.goodsExplanation = tabContent.goodsExplanation || GoodsExplanation()
            //구매안내
            // case 2:
            //     return tabContent.buyingInfo = tabContent.buyingInfo || BuyingInfo()
            // //생산일지
            // case 3:
            //     console.log(tabId)
            //     //데이터가 없는 경우만 조회함
            //     farmDiaryData.length <= 0 && searchFarmDiaryData()
            //     break
            //구매후기
            case GOODS_REVIEW:

                //긍정 리뷰 조회
                if (!bestGoodsReviewList)
                    searchBestGoodsReview()
                //부정 리뷰 조회
                if (!worstGoodsReviewList)
                    searchWorstGoodsReview()

                //데이터가 없는 경우만 조회함
                goodsReviewData.length <= 0 && searchGoodsReviewData()
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

    // //생산일지 db조회 & 렌더링
    // async function searchFarmDiaryData(){
    //     const page = farmDiaryDataPage
    //     const { data: {farmDiaries, totalCount} } = await getFarmDiaryBykeys({producerNo: props.goods.producerNo, itemNo: props.goods.itemNo}, true, page, 5)
    //
    //     setFarmDiaryData(farmDiaryData.concat(farmDiaries))
    //     setFarmDiaryDataPage(page+1)
    //     setFarmDiaryDataTotalCount(totalCount)
    // }




    //생산자의 다른 상품
    async function searchGoodsListByProducerNo() {
        try{
            const {status, data} = await getGoodsListByProducerNo(props.goods.producerNo, isForceUpdate(props.history), abortController.current.signal)
            console.log({"생산자다른상품": data, status})
            setProducerGoodsList(data)
        }catch (e){
            console.error(e.message)
        }
    }

    //연관 상품 조회
    async function searchRelatedGoods() {
        try {
            if (!props.goods.tags.length)
                return

            const {data} = await getRelatedGoodsByTags({
                tags: props.goods.tags,
                goodsNo: props.goods.goodsNo,
                isPaging: true,
                page: 1,
                limit: 10,
                forceUpdate: isForceUpdate(props.history),
                signal: abortController.current.signal});
            console.log({data})
            setRelatedGoodsList(data.goodsList)
        } catch(error) {
            if(error.message === 'canceled') {
                console.log('request canceled : goodsDetail searchRelatedGoods')
            } else {

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
                console.log("Direct GoodsContent searchBestGoodsReview canceled")
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
                console.log("Direct GoodsContent searchWorstGoodsReview canceled")
            }else{

            }
        }
    }

    //구매후기 db조회 & 렌더링
    async function searchGoodsReviewData(isNewSearch){
        try {
            let page = isNewSearch ? 1 : goodsReviewDataPage + 1
            const { data: {goodsReviews, totalCount} } = await getGoodsReviewByGoodsNo(props.goods.goodsNo, true,10, page)
            setGoodsReviewData(isNewSearch ? [].concat(goodsReviews) : goodsReviewData.concat(goodsReviews))
            setGoodsReviewDataPage(page)
            //-1을 특수용도로 사용.(다른상품후기 개수 존재)setGoodsReviewDataTotalCount(totalCount === -1 ? 0 : totalCount)
            setGoodsReviewDataTotalCount(totalCount)

            //리뷰 평균
            //totalCount > 0 && setGoodsReviewDataAvgScore(ComUtil.roundDown(ComUtil.sum(goodsReviews, 'score') / totalCount, 1))

            console.log({"리뷰": goodsReviews, totalCount, page} )
        }catch (error) {

        }
    }

    //구매후기-다른상품후기 db조회 & 렌더링
    async function searchGoodsReviewOtherData(isNewSearch){
        try {
            let page = isNewSearch ? 0 : goodsReviewOtherDataPage + 1
            const { data: {goodsReviews, totalCount} } = await getOtherGoodsReviewByItemNo(props.goods.goodsNo, true,10, page)
            setGoodsReviewOtherData(isNewSearch ? [].concat(goodsReviews) : goodsReviewOtherData.concat(goodsReviews))
            setGoodsReviewOtherDataPage(page)
            setGoodsReviewOtherDataTotalCount(totalCount)

            console.log({"다른상품리뷰": goodsReviews, totalCount, page} )
        }catch (error) {

        }
    }

    //상품문의 db조회 & 렌더링
    async function searchGoodsQnAData(isNewSearch){
        try {
            let page = isNewSearch ? 1 : goodsQnADataPage +1

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
        }catch (error){

        }
    }

    //상품상세: toastUI뷰어용 - backEnd를 통해 file에서 조회
    async function searchGoodsContent() {
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
            }
            // // 상품상세 조회할 때 블리리뷰도 같이 조회해와서 화면에 세팅해 둠
            // if(props.goods.blyReview) {
            //     //     const {data: blyReview} = await getBlyReview(props.goods.blyReviewFileName)
            //     setBlyReview(props.goods.blyReview);
            // }
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("Direct GoodsContent searchGoodsContent canceled")
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
        }
    }


    let {
        goodsNo,            //순번
        // producerNo,      //생산자번호
        goodsNm,            //상품명
        goodsImages,        //상품이미지
        arGlbFile,          //상품AR파일 (glb)
        arUsdzFile,         //상품AR파일 (usdz) ios
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

        dealGoods, //공동구매상품 여부.

        blyTime,            // 블리타임 진행 여부
        blyTimeReward,       // 블리타임 보상 퍼센트
        inBlyTimePeriod,

        superReward,
        superRewardReward,
        inSuperRewardPeriod
    } = props.goods

    // console.log(props.goods)

    // async function isBlyTime() {
    //     let {data: blyTimeYn} = await isBlyTimeBadge();
    //
    //     setBlyTimeYn(blyTimeYn)
    // }

    // async function isSuperReward() {
    //     let {data: superRewardYn} = await isSuperRewardBadge();
    //
    //     setSuperRewardYn(superRewardYn)
    // }

    async function searchGoodsBannerList() {
        try {
            let {data: goodsBannerList} = await getGoodsBannerList();

            if (goodsBannerList) {
                setGoodsBannerList(goodsBannerList)
            }
        }catch (error) {

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

    // function GoodsPriceCard() {
    //     const content = [];
    //
    //     if(finishedSaleGoods) {
    //         currentPrice = finishCurrentPrice;
    //         content.push(<HrGoodsPriceCard key={'goodsPriceCard'+props.goods.goodsNo} {...props.goods} currentPrice/>);
    //
    //     } else {
    //         content.push(<HrGoodsPriceCard key={'goodsPriceCard'+props.goods.goodsNo} {...props.goods}/>);
    //     }
    //
    //     return content;
    // }


    function onEtcStatusClick(index){
        // const etcStatus = [false, false, false]
        const statusArr = Object.assign([], etcStatus)
        statusArr[index] = !statusArr[index]

        setEtcStatus(statusArr)
    }


    function onQtyChange(value){
        setOrderQty(value)
    }

    function addStatusToggle(){
        setAddStatus(!addStatus)
    }
    function onFarmNameClick(){
        props.history.push(`/consumersDetailActivity?consumerNo=${props.producer.consumerNo}`)
    }

    const buyCouponGoodsClick = () => {
        props.history.push({
            pathname: '/buyCouponGoods',
            state: {
                couponNo: props.couponNo,
                producerNo: props.producer.producerNo,
                goodsNo: props.goods.goodsNo
            }
        })
    }

    const goodsErrorState = () => {
        if (props.goods.remainedCnt <= 0)
            return '품절'
        if (props.goods.salePaused)
            return '일시중지된 상품'
        if (isFinishedDate(ComUtil.utcToTimestamp(props.goods.saleEnd)))
            return '판매종료'
        return null
    }

    // TODO 카카오톡 공유하기
    const kakaoLinkClick = async() => {
        if (!(await isUserTypeOf('consumer'))) {
            alert('로그인을 해야 공유적립포인트를 받을 수 있습니다.');
            return;  // TODO 로그인을 안해도 공유는 할 수 있게 할 것인지 확인 필요.
        }

        const loginUser = await getLoginUser()
        console.log(loginUser);
        if (ComUtil.isMobileApp()) {  //android, ios 모두 적용

            const title = '샵#블리';
            const desc = goodsNm;
            const url = Server.getFrontURL() + '/goods?goodsNo=' + goodsNo + '&inviteCode=' + ComUtil.encodeInviteCode(loginUser.uniqueNo);   //home에서 inviteCode를 localStorage에 저장 함
            const imageUrl = 'https://shopbly.shop/images/YP8BMgIo98I4.png';
            ComUtil.shareKakaoLink(title,desc, url, imageUrl);

        }
        else { //ios Only -20200104(ios검수포기)  - //Web에서는 이부분 타고 설정은 componentDidMount를 이용함.
            Webview.openPopup('/goods?goodsNo=' + goodsNo + '&userNo=' + loginUser.uniqueNo);
        }
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
                    <div style={{width:'100vw',maxWidth:'768px',height:'60vmin'}}>
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

            <Section>
                <GoodsNm mb={20}>{goodsNm}</GoodsNm>
                {/* 상품가격 카드 */}
                <Components.GoodsPriceCard
                    goods={props.goods}
                    couponMaster={couponMaster}
                    onReviewClick={onTabSectionClick.bind(this, GOODS_REVIEW, true)}
                />
            </Section>
            <Divider height={1} mx={16}/>
            <Section>
                {/* 적립 & 배송정보 */}
                <Components.SaveBlyPerLevelAndShippingInfo goods={props.goods} producer={props.producer}/>
            </Section>

            <Divider height={1}/>

            <Section>
                <Flex>
                    <Space>
                        <Span fontSize={13} lineHeight={13} pt={2}>친구에게 공유하기!</Span>
                    </Space>
                    <Flex ml={'auto'} lineHeight={13}>
                        <GoodsShareButton
                            goodsNo={props.goods.goodsNo}
                            goodsNm={props.goods.goodsNm}
                            imageUrl={props.goods.goodsImages[0].imageUrl}
                        >
                            공유
                        </GoodsShareButton>
                    </Flex>
                </Flex>
            </Section>

            <Divider height={1}/>

            <GoodsAuthMarks
                infoValues={props.goods.authMarkInfo}
            />

            <Divider/>

            {/* 상세정보, 리뷰, 상품문의 탭 */}
            <Sticky top={55} zIndex={2} ref={elTabRef}>
                <Components.GoodsTab data={tabData}
                                     value={tabId}
                                     onChange={onTabSectionClick}
                />
            </Sticky>

            <div>

                {
                    // (packCnt - remainedCnt) >= 50 && (
                    //     <>
                    //         <div>
                    //             <span>수량 </span><span className={Css.black}><b>구매건수 {ComUtil.addCommas(packCnt - remainedCnt)} / 잔여 {ComUtil.addCommas(remainedCnt <= 0 ? 0 : remainedCnt)}</b></span>
                    //         </div>
                    //         <hr className={Css.lineLight} style={{margin: '0 16px'}}/>
                    //     </>
                    // )
                }


                {
                    //상품정보
                    (tabId === GOODS_DETAIL) && (
                        <div>
                            {
                                goodsBannerList.length > 0 && goodsBannerList.map((banner)=> <img key={banner.goodsBannerImages[0].imageUrl} style={{width:'100%',height:'500'}} src={serverImageUrl + banner.goodsBannerImages[0].imageUrl} alt="공지배너"/>)
                            }
                            <Components.ProducerNotice producer={props.producer} goods={props.goods}/>
                            <GoodsCouponList goodsNo={goodsNo} />
                            {
                                !goodsContent ? (
                                        <div className='mt-5 text-center' style={{minHeight: 100}}>
                                            <Spin duration={2.5}>
                                                <FaSpinner />
                                            </Spin>
                                        </div>
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
                    (tabId === GOODS_REVIEW && goodsReviewData) &&
                    <>
                        <GoodsScore avgScore={props.goods.avgScore} scoreRates={props.goods.scoreRates} />
                        <Divider />
                        <Flex alignItems={'flex-start'} fontSize={15} m={16} mb={0}><ImQuotesLeft size={12}/><Div bold mx={5}>맘에 들어요</Div><ImQuotesRight size={12}/></Flex>
                        <GoodsReviewSwiper goodsReviews={bestGoodsReviewList} />
                        <Divider />
                        <Flex alignItems={'flex-start'} fontSize={15} m={16} mb={0}><ImQuotesLeft size={12}/><Div bold mx={5}>잘 모르겠어요</Div><ImQuotesRight size={12}/></Flex>
                        <GoodsReviewSwiper goodsReviews={worstGoodsReviewList} />
                        <Divider />
                        <SubTitle>일반상품리뷰</SubTitle>
                        <GoodsReviewContent
                            goodsReviews={goodsReviewData}
                            showGoodsNm={false}
                            totalCount={goodsReviewDataTotalCount}
                            onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW'})}
                            isVisibleStar={true}
                            isVisibleTitle={false}
                        />
                    </>
                }
                {
                    //리뷰-다른상품후기
                    (tabId === GOODS_REVIEW && goodsReviewOtherData) &&
                    <Fragment>
                        <Divider />
                        <SubTitle>다른상품리뷰</SubTitle>
                        <GoodsReviewContent goodsReviews={goodsReviewOtherData} showGoodsNm={true}
                                            totalCount={goodsReviewOtherDataTotalCount}
                                            onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW_OTHER'})}
                                            isVisibleStar={false}
                                            isVisibleTitle={true}/>
                    </Fragment>
                }

                {
                    //상품문의
                    (tabId === GOODS_QNA && goodsQnAData) && <GoodsQnAContent goods={props.goods} goodsQnAs={goodsQnAData} totalCount={goodsQnADataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSQNA'})} onGoodsQnASaved={searchGoodsQnAData.bind(this, true)} />
                }
                <Divider />
                {
                    (relatedGoodsList && relatedGoodsList.length > 0) && (
                        <>
                            <SubTitle pt={12}>연관 상품</SubTitle>
                            <GoodsListSwiper goodsList={relatedGoodsList} />
                        </>
                    )
                }

                <Divider />
                <Flex px={16} my={24}>
                    <ProfileAuto consumerNo={900000000 + props.producer.producerNo}/>
                    <Right>
                        <RoundedFollowButton producerNo={props.producer.producerNo} />
                    </Right>
                </Flex>

                {
                    (producerGoodsList && producerGoodsList.length > 0) && (
                        <>
                            <SubTitle pt={0}>생산자(판매자)의 다른 상품</SubTitle>
                            <GoodsListSwiper goodsList={producerGoodsList} />
                        </>
                    )
                }

                <Divider />

                {/* 정책 관련 */}
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 0)}>
                        <Policy.MenuTitle>상품 정보</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[0] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[0]}>
                        <Components.GoodsNormalInfo goods={props.goods} producer={props.producer} />
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 1)}>
                        <Policy.MenuTitle>상품 필수 정보</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[1] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[1]}>
                        <Components.GoodsRequiredInfo goods={props.goods} producer={props.producer}/>
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 2)}>
                        <Policy.MenuTitle>배송안내</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[2] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[2]}>
                        <Components.ShippingInfo />
                    </Collapse>
                </Div>
                <Divider height={1}/>
                <Div>
                    <Flex px={14} py={16} fontSize={14} cursor doActive bg={'white'} onClick={onEtcStatusClick.bind(this, 3)}>
                        <Policy.MenuTitle>교환 및 반품안내</Policy.MenuTitle>
                        <Div ml={'auto'}><Icon name={etcStatus[3] ? 'arrowUpGray':'arrowDownGray' }/></Div>
                    </Flex>
                    <Collapse isOpen={etcStatus[3]}>
                        <Components.ClaimInfo />
                    </Collapse>
                </Div>
                <Divider height={1}/>


            </div>

            {
                blySiseModal &&
                <Modal isOpen={true} toggle={onBlySiseModalToggle} centered>
                    <ModalHeader toggle={onBlySiseModalToggle}><b>BLY 시세</b></ModalHeader>
                    <ModalBody>
                        <BlySise open={blySiseModal} />
                    </ModalBody>
                    {/*<ModalFooter>*/}
                    {/*</ModalFooter>*/}
                </Modal>
            }

            {/*<ModalWithNav onClose={onOrderPopupClose} title={'즉시구매'} show={orderModal} noPadding>*/}
            {/*    <AddOrder {...props.goods} onClick={moveDirectBuy}/>*/}
            {/*</ModalWithNav>*/}
        </Div>
    )

}
export default withRouter(GoodsContent)