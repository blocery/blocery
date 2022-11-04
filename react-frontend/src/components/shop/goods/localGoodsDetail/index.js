import React, {Fragment, useEffect, useRef, useState} from 'react';
import FooterButtonGroup from "~/components/shop/goods/components/FooterButtonGroup";
import {useRecoilState, useSetRecoilState} from "recoil";
import {optionAlertState, selectedOptionsState} from "~/recoilState";
import {Collapse, Modal, ModalBody, ModalHeader} from "reactstrap";
import {SummerNoteIEditorViewer} from "~/components/common";
import {
    Button,
    Div,
    Divider,
    Flex, GridColumns, Img, Link,
    ListBorder, ListSpace,
    Right,
    Space,
    Span,
    Spin,
    Sticky
} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import {BiWebcam, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import OptionViewerModal from "~/components/common/modals/OptionViewerModal";
import GoodsImagesSwiper from "~/components/shop/goods/components/GoodsImagesSwiper";

import {SubTitle, GoodsNm, Section, Policy, BigTitle} from "~/components/shop/goods/components/Atoms";
import Components from "~/components/shop/goods/components/Components";
import {
    getGoodsBannerList,
    getGoodsListByProducerNo, getGoodsQnAByKeys, getRelatedGoodsByTags,
    getGoodsReviewByGoodsNo,
    getOtherGoodsReviewByItemNo,
    getPotenCouponMaster
} from "~/lib/shopApi";
import moment from "moment-timezone";
import {Webview} from "~/lib/webviewApi";
import {getLoginUser, getLoginUserType} from "~/lib/loginApi";
import {toast} from "react-toastify";
import {getGoodsContent} from "~/lib/goodsApi";
import GoodsShareButton from "~/components/common/buttons/GoodsShareButton";
import GoodsAuthMarks from "~/components/shop/goods/components/GoodsAuthMarks";
import GoodsCouponList from "~/components/common/lists/GoodsCouponList";
import {FaSpinner} from "react-icons/fa";
import GoodsScore from "~/components/common/cards/GoodsScore";
import {ImQuotesLeft, ImQuotesRight} from "react-icons/im";
import GoodsReviewSwiper from "~/components/shop/goods/components/GoodsReviewSwiper";
import GoodsQnAContent from "~/components/shop/goods/components/GoodsQnAContent";
import ProfileAuto from "~/components/common/cards/ProfileAuto";
import RoundedFollowButton from "~/components/common/buttons/RoundedFollowButton";
import ProducerGoodsList from "~/components/shop/goods/components/ProducerGoodsList";
import {Icon} from "~/components/common/icons";
import BlySise from "~/components/common/blySise";
import GoodsReviewContent from "../components/GoodsReviewContent";
import FarmerProfile from "~/components/shop/local/components/FarmerProfile";
import LocalAddressCard from "~/components/shop/local/components/LocalAddressCard";
import UniqueOptionCard2 from "~/components/shop/goods/localGoodsDetail/UniqueOptionCard2";
import ObjectUniqueGoodsBanner from '~/images/about/objectUniqueGoodsBanner.jpg'
import LocalDeliveryInfo from '~/images/background/localDeliveryInfo.jpg'
import LocalDeliveryDawn from '~/images/background/localDeliveryDawn.jpg' //신규 새벽배송 이미지
import {getValue} from "~/styledComponents/Util";
import ShopBlyLayouts, {GridList, VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {isForceUpdate} from "~/lib/axiosCache";
import {withRouter} from 'react-router-dom'
import GoodsListSwiper from "~/components/common/swipers/GoodsListSwiper";

const GOODS_DETAIL = 0
const GOODS_REVIEW = 1;
const GOODS_QNA = 2;


const LocalGoodsDetail = (props) => {
    const abortController = useRef(new AbortController())

    const [selectedOptions, setSelectedOptions] = useRecoilState(selectedOptionsState)
    const setAlertTimes = useSetRecoilState(optionAlertState)
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

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
    const [producerGoodsList, setProducerGoodsList] = useState()

    //연관상품
    const [relatedGoodsList, setRelatedGoodsList] = useState()

    //긍정 리뷰
    const [bestGoodsReviewList, setBestGoodsReviewList] = useState()
    //부정 리뷰
    const [worstGoodsReviewList, setWorstGoodsReviewList] = useState()

    const [optionObj, setOptionObj] = useState()
    const [optionMinMaxPriceObj, setOptionMinMaxPriceObj] = useState()

    useEffect(() => {
        return (() => {
            abortController.current.abort()
        })
    }, [])

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

        if (props.goods.options && props.goods.objectUniqueFlag && props.goods.options.length > 0) {

            const newOption = {}

            props.goods.options.map(option => {

                const date = moment(option.capturedTime, 'YYYYMMDDHHmmss').format('YYYYMMDD')

                if (!newOption[date]) {
                    newOption[date] = []
                }
                newOption[date].push({...option})
            })

            console.log({newOption})

            const newOptionMinMaxPriceObj = {}

            Object.keys(newOption).map(date => {
                const prices = []
                newOption[date].map(option => {
                    prices.push(option.optionPrice)
                })

                const min = Math.min(...prices)
                const max = Math.max(...prices)

                newOptionMinMaxPriceObj[date] = {
                    min, max, selectedOptionCount: 0
                }

                console.log({newOptionMinMaxPriceObj})
            })

            setOptionMinMaxPriceObj(newOptionMinMaxPriceObj)
            setOptionObj(newOption)
        }
    }, [props.goods.goodsNo])

    //옵션 자세히 보기
    const onOptionDetailClick = (optionIndex, e) => {
        e.stopPropagation()

        //배경 스크롤 방지
        ComUtil.noScrollBody()

        console.log({optionIndex})
        setSelected(optionIndex)
        toggle()
    }

    //옵션 자세히 닫기
    const onOptionViewClose = () => {
        ComUtil.scrollBody()
        toggle()
    }


    //옵션추가 or 삭제
    const onOptionClick = (_option, e) => {
        e.stopPropagation()
        console.log(_option)

        if (_option.remainedCnt <= 0) {
            alert('품절 되었습니다.')
            return
        }

        const option = selectedOptions.find(o => o.optionIndex === _option.optionIndex)

        //추가
        if (!option) {
            setSelectedOptions([_option, ...selectedOptions])
            //푸터에 +1 애니메이션
            // setAlertTimes(prev => [...prev, {message: '옵션을 담았어요!'}])
            setAlertTimes(prev => [...prev, {action: 'OPTION_ADDED'}])


        }else{ //삭제
            setSelectedOptions(selectedOptions.filter(o => o.optionIndex !== _option.optionIndex))
        }
    }

    useEffect(() => {

        if (optionMinMaxPriceObj) {

            const copyOptionMinMaxPriceObj = {...optionMinMaxPriceObj}


            Object.keys(optionMinMaxPriceObj).map(date => {
                //선택된 옵션에서 글룹별 몇개 선택 되었는지 카운트
                const groupOptions = selectedOptions.filter(option => {
                    const selectedDate = moment(option.capturedTime, 'YYYYMMDDHHmmss').format('YYYYMMDD')
                    return selectedDate === date
                })

                copyOptionMinMaxPriceObj[date].selectedOptionCount = groupOptions.length

            })

            setOptionMinMaxPriceObj(copyOptionMinMaxPriceObj)
        }

    }, [selectedOptions])



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

            console.log(elTabRef.current, elTabRef)

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
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("LocalGoodsDetail searchGoodsListByProducerNo")
            }else{

            }
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
                localfoodProducerNo: props.goods.producerNo,
                isPaging: true,
                limit: 10,
                page: 1,
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
        try{
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
        try{
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
        try{
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
        }catch (error) {

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
        }catch (error){

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

    const onCancelOptions = (date) => {

        const newSelectedOptions = []

        selectedOptions.map(option => {
            const compDate = moment(option.capturedTime, 'YYYYMMDDHHmmss').format('YYYYMMDD')
            if (compDate !== date) {
                newSelectedOptions.push(option)
            }
        })

        setSelectedOptions(newSelectedOptions)

        const newOptionMinMaxPriceObj = {...optionMinMaxPriceObj}
        newOptionMinMaxPriceObj[date].selectedOptionCount = 0
        setOptionMinMaxPriceObj(newOptionMinMaxPriceObj)
    }

    //true, false 로 바뀔때마다 푸터가 열림
    const [updateFooterModalOpen, setOptionModalOpen] = useState(false)

    //알아서 담기
    const onAutoAddOption = () => {
        let optionPrice = 999999
        let capturedTime = 0
        let optionIndex = -1;
        props.goods.options.map(option => {
            if (option.remainedCnt > 0 && option.optionPrice <= optionPrice) {
                if (option.capturedTime > capturedTime) {
                    optionPrice = option.optionPrice
                    optionIndex = option.optionIndex
                }
            }
        })

        if (optionIndex === -1) {
            alert('담을 옵션이 없습니다.')
            return
        }else{
            alert('옵션을 담았습니다.')

            const option = props.goods.options.find(o => o.optionIndex === optionIndex)

            setSelectedOptions([...selectedOptions, option])
            // setAlertTimes(times => [...times, new Date().getTime()])
            // await ComUtil.delay(600)
            //false 라고 닫히는게 아닌, true, false 로 바뀔때마다 푸터 모달이 뜨도록
            setOptionModalOpen(!updateFooterModalOpen)
        }
    }

    const farmer = props.goods.localfoodFarmer

    return (
        <Div pb={100}>
            <GoodsImagesSwiper goodsImages={props.goods.goodsImages} />
            {props.goods.objectUniqueFlag &&
            <Flex px={16} py={8} minHeight={60} bg={'black'} fg={'white'}>
                <Flex rounded={'50%'} bg={'white'} width={32} height={32} justifyContent={'center'}>
                    <BiWebcam size={20} color={color.primary}/>
                </Flex>
                <Div fontSize={14} ml={15}>
                    실물 확인 가능한 상품입니다.
                    <Div fg={'#ffc600'} fontSize={12}>
                        옵션에서 실제 상품을 보고 구매하세요!
                    </Div>
                </Div>
                {/*<Right>*/}
                {/*    */}
                {/*</Right>*/}
            </Flex>
            }
            <Section>
                <GoodsNm mb={20}>{goodsNm}</GoodsNm>
                {/* 상품가격 카드 */}
                <Components.GoodsPriceCard
                    goods={props.goods}
                    couponMaster={couponMaster}
                    onReviewClick={onTabSectionClick.bind(this, GOODS_REVIEW, true)}
                />
                {/* 적립 & 배송정보 */}
                <Components.SaveBlyPerLevelAndShippingInfo goods={props.goods} producer={props.producer} style={{my:20}}/>
                <LocalAddressCard producerNo={props.goods.producerNo} style={{mx:0, mb: 16}} />

                {/* 0824배포, 당일만 "오픈예정"이미지, 이후 새벽배송이미지 */}
                <img style={{width: '100%', borderRadius: getValue(8)}} src={(ComUtil.getNowYYYYMMDD()==='20220824')?LocalDeliveryInfo:LocalDeliveryDawn} alt={'로컬푸드 상품 배송안내'}/>

                <ShopBlyLayouts.Alert mt={16}>
                    매장 재고 부족시 상품이 부분취소될 수 있습니다.
                </ShopBlyLayouts.Alert>
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

            <Divider />

            <BigTitle mt={40}>농가 정보</BigTitle>
            {/*<FarmerProfile farmerImages={farmer.farmerImages} desc={farmer.desc} />*/}
            <Link to={`local/farmerGoodsList/${props.goods.localfoodFarmerNo}`} display={'block'}>
                <Flex py={27} cursor={1} px={16}>
                    <div style={{width:'100%'}}>
                        <Div fontSize={16} bold mb={5}>{farmer.farmerName}</Div>
                        <Div fg={'dark'} fontSize={13}>지역 : {farmer.address}</Div>
                        <Div fg={'dark'} fontSize={13}>주요품목 : {farmer.mainItems}</Div>
                    </div>
                    <Right flexShrink={0}>
                        <IoIosArrowForward size={21}/>
                    </Right>
                </Flex>
            </Link>

            <GoodsAuthMarks
                infoValues={props.goods.authMarkInfo}
            />

            <Divider/>

            {/* 상세정보, 리뷰, 상품문의 탭 */}
            <Sticky top={55} zIndex={3} ref={elTabRef}>
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

                            {/*{*/}
                            {/*    goodsBannerList.length > 0 && goodsBannerList.map((banner)=> <img style={{width:'100%',height:'500'}} src={serverImageUrl + banner.goodsBannerImages[0].imageUrl} alt="공지배너"/>)*/}
                            {/*}*/}
                            <Components.ProducerNotice producer={props.producer} goods={props.goods} />
                            <GoodsCouponList goodsNo={goodsNo} />
                            {
                                !props.goods.objectUniqueFlag ? (
                                    !goodsContent ? (
                                        <div className='mt-5 text-center' style={{minHeight: 100}}>
                                            <Spin duration={2.5}>
                                                <FaSpinner />
                                            </Spin>
                                        </div>
                                    ) : (
                                        <Components.GoodsDetailCollapseCard>
                                            <SummerNoteIEditorViewer
                                                height="400px"
                                                initialValue={goodsContent}
                                            />
                                        </Components.GoodsDetailCollapseCard>
                                    )
                                ) : (
                                    <>
                                        <Div px={16} py={20}>
                                            <img src={ObjectUniqueGoodsBanner} style={{width: '100%'}} />
                                        </Div>

                                        {/*TODO 바둑배열 (이전버전)*/}
                                        {/*<GridColumns repeat={2} colGap={8} rowGap={0} p={16}>*/}
                                        {/*    {*/}
                                        {/*        props.goods.options.map((option, index) =>*/}
                                        {/*            <UniqueOptionCard*/}
                                        {/*                key={option.optionIndex}*/}
                                        {/*                src={ComUtil.getFirstImageSrc(option.optionImages, 'square')}*/}
                                        {/*                capturedTime={option.capturedTime}*/}
                                        {/*                isAdded={selectedOptions.find(selOption => selOption.optionIndex === option.optionIndex)}*/}
                                        {/*                number={index+1}*/}
                                        {/*                objectUniqueNo={option.objectUniqueNo}*/}
                                        {/*                remainedCnt={option.remainedCnt}*/}
                                        {/*                onDetailClick={onOptionDetailClick.bind(this, option.optionIndex)}*/}
                                        {/*                onAddOptionClick={onOptionClick.bind(this, option)}*/}
                                        {/*            />*/}
                                        {/*        )*/}
                                        {/*    }*/}
                                        {/*</GridColumns>*/}

                                        <ListBorder
                                            bc={'light'} bl={0} br={0}
                                        >
                                            {
                                                optionObj && (
                                                    Object.keys(optionObj).map((date, index) => {
                                                        return(
                                                            <CollapseItem key={date}
                                                                          initialOpen={index === 0}
                                                                          capturedDay={moment(date, 'YYYYMMDD').format('YYYY-MM-DD')}
                                                                          minPrice={ComUtil.addCommas(optionMinMaxPriceObj[date].min)}
                                                                          maxPrice={ComUtil.addCommas(optionMinMaxPriceObj[date].max)}
                                                                          optionCount={optionObj[date].length}
                                                                          selectedOptionCount={optionMinMaxPriceObj[date].selectedOptionCount}
                                                            >
                                                                <ListBorder
                                                                    // bg={'veryLight'}
                                                                    // py={16} bg={'veryLight'} style={{background: color.veryLight}}
                                                                >
                                                                    {/*{*/}
                                                                    {/*    optionMinMaxPriceObj[date].selectedOptionCount > 0 && (*/}
                                                                    {/*        <Div px={16}>*/}
                                                                    {/*            <Button rounded={3} block bg={'white'} bc={'light'} fg={'danger'} minHeight={40} onClick={onCancelOptions.bind(this, date)}>{optionMinMaxPriceObj[date].selectedOptionCount}개 취소</Button>*/}
                                                                    {/*        </Div>*/}
                                                                    {/*    )*/}
                                                                    {/*}*/}
                                                                    {
                                                                        optionObj[date].map(option =>
                                                                            <UniqueOptionCard2
                                                                                key={option.optionIndex}
                                                                                optionPrice={option.optionPrice}
                                                                                capturedTime={option.capturedTime}
                                                                                remainedCnt={option.remainedCnt}
                                                                                optionImages={option.optionImages}
                                                                                isAdded={selectedOptions.find(selOption => selOption.optionIndex === option.optionIndex)}
                                                                                onDetailClick={onOptionDetailClick.bind(this, option.optionIndex)}
                                                                                onAddOptionClick={onOptionClick.bind(this, option)}
                                                                            />
                                                                        )
                                                                    }
                                                                </ListBorder>
                                                            </CollapseItem>
                                                        )
                                                    })
                                                )
                                            }
                                        </ListBorder>

                                        <Div px={16}>
                                            <Button my={25} block bg={'green'} fg={'white'} onClick={onAutoAddOption} disabled={selectedOptions.length > 0}>
                                                <div><small>아직 못 고르셨나요?</small></div>
                                                <Div>알아서 옵션담기</Div>
                                            </Button>
                                        </Div>
                                    </>
                                )
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





                {/*{*/}
                {/*    (relatedGoodsList && relatedGoodsList.length > 0) && (*/}
                {/*        <>*/}
                {/*            <SubTitle pt={12}>연관 상품</SubTitle>*/}
                {/*            <Div px={16} py={20} custom={`*/}
                {/*                & > div {*/}
                {/*                    padding: 0;*/}
                {/*                    padding-bottom: 8px;*/}
                {/*                }*/}
                {/*                & > div:last-child {*/}
                {/*                    padding: 0;*/}
                {/*                }*/}
                {/*            `}>*/}
                {/*                <ProducerGoodsList goodsList={relatedGoodsList} />*/}
                {/*            </Div>*/}
                {/*        </>*/}
                {/*    )*/}
                {/*}*/}

                {
                    (relatedGoodsList && relatedGoodsList.length > 0) && (
                        <>
                            <Divider />
                            <SubTitle pt={12}>연관 상품</SubTitle>
                            <GoodsListSwiper goodsList={relatedGoodsList} />

                            {/*<VerticalGoodsGridList pt={20} pb={30}>*/}
                            {/*    {*/}
                            {/*        relatedGoodsList.map(goods =>*/}
                            {/*            <VerticalGoodsCard.Medium goods={goods} />*/}
                            {/*        )*/}
                            {/*    }*/}

                            {/*</VerticalGoodsGridList>*/}
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
            {/*{*/}
            {/*    props.goods.objectUniqueFlag && props.goods.options.map((option, index) => <div>*/}
            {/*        {*/}
            {/*            <img src={ComUtil.getFirstImageSrc(option.optionImages)} alt={'옵션이미지'} style={{width: 70, height: 70, objectFit: 'cover', borderRadius: 3}}/>*/}
            {/*        }*/}
            {/*        {option.optionName}*/}
            {/*        <button onClick={onOptionDetailClick.bind(this, option.optionIndex)}>자세히</button>*/}
            {/*        <button*/}
            {/*            // disabled={selectedOptions.includes(option)}*/}
            {/*            onClick={onOptionClick.bind(this, option)}>*/}
            {/*            {selectedOptions.find(selOption => selOption.optionIndex === option.optionIndex) ? '선택취소' : '옵션추가'}*/}
            {/*        </button>*/}
            {/*    </div>)*/}
            {/*}*/}





            <FooterButtonGroup goods={props.goods} isOptionModalOpen={updateFooterModalOpen}/>

            {
                modalOpen && <OptionViewerModal goods={props.goods} selectedOptionIndex={selected} onClose={onOptionViewClose} addOption={onOptionClick}/>
            }
        </Div>
    );
};

export default withRouter(LocalGoodsDetail);

function CollapseItem({initialOpen = false, capturedDay, minPrice, maxPrice, optionCount, selectedOptionCount, children}){
    const [isOpen, setOpen] = useState(initialOpen)
    const onHandleClick = async e => {
        await ComUtil.delay(100)
        setOpen(!isOpen)
    }
    return(
        <div>
            <Flex px={16} py={13} bg={'white'} doActive cursor={1}
                  position={'sticky'}
                  top={99}
                  zIndex={2}
                  custom={isOpen && `box-shadow: 0 2px 2px 0px rgb(0 0 0 / 10%);`}
                  onClick={onHandleClick}>
                <Div>
                    <Div fontSize={12} ><Span fg={'darkBlack'}>수확일자</Span> {capturedDay} {selectedOptionCount > 0 && <Span fg={'danger'}>({selectedOptionCount}개 선택됨)</Span>}</Div>
                    <Div fontSize={16} bold fg={'black'}>{minPrice === maxPrice ? `${minPrice}원` : `${minPrice} ~ ${maxPrice}원`} <Span fg={'dark'}>({optionCount}개)</Span></Div>
                </Div>
                <Right>
                    {
                        isOpen ? <IoIosArrowUp size={22}/> : <IoIosArrowDown size={22}/>
                    }
                </Right>
            </Flex>
            <Collapse isOpen={isOpen} >
                <div style={{borderTop: `1px solid ${color.light}`}}>
                    {children}
                </div>
            </Collapse>
        </div>

    )
}