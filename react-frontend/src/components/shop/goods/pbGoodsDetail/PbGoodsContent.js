import React, {useState, useEffect, useRef, Fragment} from 'react'
import {withRouter} from 'react-router-dom'
import {useRecoilState, useSetRecoilState} from "recoil";
import {Div, Divider, Flex, Right, Space, Span, Button, Sticky, Spin} from "~/styledComponents/shared";
import GoodsImagesSwiper from "~/components/shop/goods/components/GoodsImagesSwiper";
import GoodsShareButton from "~/components/common/buttons/GoodsShareButton";
import {BigTitle, GoodsNm, Policy, Section, SubTitle} from "~/components/shop/goods/components/Atoms";
import Components from "~/components/shop/goods/components/Components";
import {IoIosArrowForward} from "react-icons/all";
import {ImQuotesLeft, ImQuotesRight} from "react-icons/im";
import {FaSpinner} from "react-icons/fa";
import {IoIosArrowDown} from 'react-icons/io'

import {
    getRelatedGoodsByTags,
    getGoodsListByProducerNo,
    getGoodsQnAByKeys,
    getGoodsReviewByGoodsNo,
    getJeilPbFarmDiary,
    getOtherGoodsReviewByItemNo
} from "~/lib/shopApi"
import GoodsAuthMarks from "~/components/shop/goods/components/GoodsAuthMarks";
import ComUtil from "~/util/ComUtil";
import {getGoodsContent} from "~/lib/goodsApi";
import GoodsCouponList from "~/components/common/lists/GoodsCouponList";
import {SummerNoteIEditorViewer} from "~/components/common";
import GoodsScore from "~/components/common/cards/GoodsScore";
import GoodsReviewSwiper from "~/components/shop/goods/components/GoodsReviewSwiper";
import GoodsReviewContent from "~/components/shop/goods/components/GoodsReviewContent";
import GoodsQnAContent from "~/components/shop/goods/components/GoodsQnAContent";
import ProfileAuto from "~/components/common/cards/ProfileAuto";
import RoundedFollowButton from "~/components/common/buttons/RoundedFollowButton";
import ProducerGoodsList from "~/components/shop/goods/components/ProducerGoodsList";
import {Icon} from "~/components/common/icons";
import {Collapse} from "reactstrap";
import {optionAlertState, selectedOptionsState} from "~/recoilState";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {isForceUpdate} from "~/lib/axiosCache";
import GoodsListSwiper from "~/components/common/swipers/GoodsListSwiper";

const GOODS_DETAIL = 0
const GOODS_REVIEW = 1;
const GOODS_QNA = 2;

const PbGoodsContent = (props) => {
    const abortController = useRef(new AbortController());
    //pbFarmDiary 정보
    const [pbFarmDiary, setPbFarmDiary] = useState()

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

    //연관 상품
    const [relatedGoodsList, setRelatedGoodsList] = useState()

    //긍정 리뷰
    const [bestGoodsReviewList, setBestGoodsReviewList] = useState()
    //부정 리뷰
    const [worstGoodsReviewList, setWorstGoodsReviewList] = useState()

    const [optionObj, setOptionObj] = useState()
    const [optionMinMaxPriceObj, setOptionMinMaxPriceObj] = useState()

    useEffect(() => {
        searchGoodsContent()
        searchGoodsListByProducerNo()
        searchRelatedGoods()

        async function fetch() {
            try{
                const {data} = await getJeilPbFarmDiary({farmerCode:props.goods.pbFarmerCode,itemCode:props.goods.pbItemCode, forceUpdate: isForceUpdate(props.history), signal: abortController.current.signal});
                console.log(data)
                setPbFarmDiary(data)
            }catch (error) {
                if (error.message === 'canceled') {
                    console.log("PbGoodsContent fetch canceled")
                }else{
                }
            }

        }
        fetch()

        return(() => {
            abortController.current.abort()
        })

    }, [])

    //상품설명, 구매안내, 재배일자, 후기 클릭
    async function onTabSectionClick(tabId, isFocus){
        switch(tabId){
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

    function onEtcStatusClick(index){
        // const etcStatus = [false, false, false]
        const statusArr = Object.assign([], etcStatus)
        statusArr[index] = !statusArr[index]

        setEtcStatus(statusArr)
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



    //생산자의 다른 상품
    async function searchGoodsListByProducerNo() {
        try{
            const {status, data} = await getGoodsListByProducerNo(props.goods.producerNo, isForceUpdate(props.history), abortController.current.signal)
            console.log({"생산자다른상품": data, status})
            setProducerGoodsList(data)
        }catch (error){
            if (error.message === 'canceled') {
                console.log("PbGoodsContent searchGoodsListByProducerNo canceled")
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
                console.log("PbGoodsContent searchBestGoodsReview canceled")
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
                console.log("PbGoodsContent searchWorstGoodsReview canceled")
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
        }catch (error){

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
        try {
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
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("PbGoodsContent searchGoodsContent canceled")
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
        dealGoodsDesc,      //상품설명
        goodsImages,        //상품이미지
        farmName,
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
        inSuperRewardPeriod,

        pbFarmerCode,
        pbItemCode
    } = props.goods

    //true, false 로 바뀔때마다 푸터가 열림
    const [updateFooterModalOpen, setOptionModalOpen] = useState(false)

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

    const onMoveAllDiary = () => {
        //todo 파라미터 넘기기
        props.history.push(`/jeil/${pbFarmerCode}/${pbItemCode}`);
    }

    if(!pbFarmDiary) return null

    const lastDiaryIndex = pbFarmDiary.diaryList.length-1;
    return (
        <Div pb={100}>
            <GoodsImagesSwiper goodsImages={goodsImages} />

            <Section>
                <GoodsNm mb={20}>{goodsNm}</GoodsNm>
                {/* 상품가격 카드 */}
                <Components.GoodsPriceCard
                    goods={props.goods}
                    // couponMaster={couponMaster}
                    // onReviewClick={onTabSectionClick.bind(this, GOODS_REVIEW, true)}
                />
                 {/*적립 & 배송정보*/}
                <Components.SaveBlyPerLevelAndShippingInfo goods={props.goods} style={{my:20}}/>
            </Section>
            <Divider height={1}/>

            <Section>
                <Flex>
                    <Space>
                        <Span fontSize={13} lineHeight={13} pt={2}>친구에게 공유하기!</Span>
                    </Space>
                    <Flex ml={'auto'} lineHeight={13}>
                        <GoodsShareButton
                            goodsNo={goodsNo}
                            goodsNm={goodsNm}
                            imageUrl={goodsImages[0].imageUrl}
                        >
                            공유
                        </GoodsShareButton>
                    </Flex>
                </Flex>
            </Section>

            <Divider />

            <BigTitle mt={40}>농가 정보</BigTitle>
            {/*<Link to={`local/farmerGoodsList/${props.goods.localfoodFarmerNo}`} display={'block'}>*/}
                <Flex py={27} cursor={1} px={16}>
                    <div style={{width:'100%'}}>
                        <Div fontSize={16} bold mb={5}>{pbFarmDiary.farmerName}</Div>
                        <Div fg={'dark'} fontSize={13}>지역 : {pbFarmDiary.fieldAddress}</Div>
                        <Div fg={'dark'} fontSize={13}>주요품목 : {pbFarmDiary.itemName}</Div>
                    </div>
                    {/*<Right flexShrink={0}>*/}
                    {/*    <IoIosArrowForward size={21}/>*/}
                    {/*</Right>*/}
                </Flex>
            {/*</Link>*/}

            <Divider height={1}/>

            <Div mt={20} px={16}>
                <Div mt={40} mb={27} fontSize={20} bold>매일매일 기록되는 생산일지</Div>
                <Flex mb={10} fontSize={13}>
                    <Div>{pbFarmDiary.diaryList[lastDiaryIndex].work}</Div>
                    <Right fg={'dark'}>{pbFarmDiary.diaryList[lastDiaryIndex].day}</Right>
                </Flex>
                <Div p={15} bg={'background'} rounded={5}>
                    {pbFarmDiary.diaryList[lastDiaryIndex].remark}
                </Div>
            </Div>

            <Div px={16} my={20}>
                <Button block bc={'dark'} py={18} onClick={onMoveAllDiary} rounded={4}>이력정보 전체보기</Button>
            </Div>

            <Divider height={1}/>

            <GoodsAuthMarks
                infoValues={props.goods.authMarkInfo}
            />

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
                            {
                                goodsBannerList.length > 0 && goodsBannerList.map((banner)=> <img key={banner.goodsBannerImages[0].imageUrl} style={{width:'100%',height:'500'}} src={Server.getImageURL() + banner.goodsBannerImages[0].imageUrl} alt="공지배너"/>)
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

                {
                    (relatedGoodsList && relatedGoodsList.length > 0) && (
                        <>
                            <Divider />
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

        </Div>
    )
}

export default withRouter(PbGoodsContent);