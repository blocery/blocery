import  React, { Fragment, useState, useEffect } from 'react';
import { ShopXButtonNav, SlideItemHeaderImage, SlideItemContent, HeaderTitle } from '~/components/common'
import {
    getConsumerGoodsByProducerNoSortedWithDealGoods,
    getConsumerGoodsByProducerNoAndItemNoSorted,
    getConsumerGoodsByProducerNoAndItemNoSortedWithDealGoods
} from '~/lib/goodsApi'
import { getItems } from '~/lib/adminApi'
import { Container, Row, Col } from 'reactstrap'
import { ViewButton, NoSearchResultBox, BlocerySpinner } from '~/components/common'
import { MdViewModule, MdViewStream } from "react-icons/md";
import ComUtil from '~/util/ComUtil'
import ModalCheckListGroup from '~/components/common/modals/ModalCheckListGroup'
import { Server } from '~/components/Properties'
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {GridColumns} from "~/styledComponents/shared";
import {GridList} from "~/styledComponents/ShopBlyLayouts";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {getProducerByProducerNo} from "~/lib/producerApi";

const sorters = [
    {value: 1, label: '최신순', sorter: {direction: 'DESC', property: 'timestamp'}},
    {value: 2, label: '인기순'}, //pivot에서 추가
    {value: 4, label: '낮은가격순'}, //, sorter: {direction: 'ASC', property: 'currentPrice'}},
    {value: 5, label: '높은가격순'}, //, sorter: {direction: 'DESC', property: 'currentPrice'}},
    {value: 7, label: '평점순'}, //, sorter: {direction: 'DESC', property: 'avgScore'}},
    {value: 6, label: '할인율순'},
]

const initFilter = {value: -1, label: '전체품목'}
const initSorter = sorters[0].sorter

const ProducersGoodsList = (props) => {
    //const { producerNo } = props.match.params
    const { producerNo } = ComUtil.getParams(props)
    const [producer, setProducer] = useState()
    const { producerWrapDeliver } = ComUtil.getParams(props)


    const [goodsList, setGoodsList] = useState()                          //상품목록
    const [viewIndex, setViewIndex] = useState(0)

    const [loading, setLoading] = useState(true)

    const [filters, setFilters] = useState([initFilter])
    const [filter, setFilter] = useState(initFilter)
    const [sorter, setSorter] = useState(initSorter)

    useEffect(() => {
        async function fetch(){

            //생산자 바인딩
            let {data:producer} = await getProducerByProducerNo(producerNo) //.then(res => setProducer(res.data))
            if ( producer.localfoodFlag) { //로컬푸드는 상품화면으로 이동.

                props.history.replace('/localStore/' + producer.producerNo + '/goods')

            }else {
                setProducer(producer)

                const {data} = await getItems(true)       //품목
                const _filters = data.map(item => ({value: item.itemNo, label: item.itemName}))
                setFilters(filters.concat(_filters))

                search(filter, sorters[0].sorter)   //상품조회
            }
            // window.scrollTo(0,0)
        }
        fetch()
    }, [])

    async function search(filter, sorter) {
        setLoading(true)

        if(producerNo){
            let data;
            //필터의 품목이 전체선택일 경우 정렬만 적용하여 상품조회
            if(filter.value === -1){
                const ret = await getConsumerGoodsByProducerNoSortedWithDealGoods(producerNo, sorter)
                data = ret.data
            }
            //필터의 품목이 있을 경우 품목, 정렬 둘다 적용하여 상품조회
            else{
                const ret = await getConsumerGoodsByProducerNoAndItemNoSortedWithDealGoods(producerNo, filter.value, sorter)
                data = ret.data
            }

            //묶음배송(producerWrapDeliver=true) 일때, 필터추가.
            setGoodsList( (!producerWrapDeliver)? data : data.filter(oneGoods => oneGoods.producerWrapDelivered===true))

        }

        setLoading(false)
    }

    function onViewChange(iconIndex) {
        setViewIndex(iconIndex)
    }

    function onFilterChange(item) {
        setFilter(item)         //선택한 필터 저장
        search(item, sorter)
    }

    // function onSortChange(item) {
    //     setSorter(item.sorter)  //선택한 정렬 저장
    //     search(filter, item.sorter)
    // }

    function onSortChange(filter){
        let filteredList = Object.assign([], goodsList)

        //정렬
        // ComUtil.sortNumber(filteredList, 'goodsNo', filter.newest ? true : false)
        if(filter.label == "최신순") {
            ComUtil.sortNumber(filteredList, 'goodsNo', true)
        } else if(filter.label == "낮은가격순") {
            ComUtil.sortNumber(filteredList, 'currentPrice', false)
        } else if(filter.label == "높은가격순") {
            ComUtil.sortNumber(filteredList, 'currentPrice', true)
        } else if(filter.label == "할인율순") {
            ComUtil.sortNumber(filteredList, 'discountRate', true)
        } else if(filter.label == "평점순") { //pivot 추가
            ComUtil.sortNumber(filteredList, 'avgScore', true)
        } else if(filter.label == "인기순") { //pivot 추가
            ComUtil.sortNumber(filteredList, 'soldCount', true)
        }

        setGoodsList(filteredList)
    }

    function movePage(goodsNo) {
        // Webview.closePopupAndMovePage(`/goods?goodsNo=${goodsNo}`)
        props.history.push(`/goods?goodsNo=${goodsNo}`)
    }

    return(
        <div>
            {
                loading && <BlocerySpinner/>
            }
            {/*<ShopXButtonNav fixed*/}
            {/*    //forceBackUrl={`/farmersDetailActivity?producerNo=${producerNo}`}*/}
            {/*                history={props.history} historyBack>판매상품</ShopXButtonNav>*/}
            <BackNavigation showShopRightIcons>
                {
                    producer && producer.farmName
                }
                {producerWrapDeliver?' 묶음배송 가능 상품':' 판매상품'}
            </BackNavigation>

            <HeaderTitle
                sectionLeft={
                    null
                    // <div>총 {ComUtil.addCommas(goodsList.length)}개 상품</div>
                }
                sectionRight={
                    <Fragment>
                        <ModalCheckListGroup
                            title={'필터 설정'}
                            className={'f6 mr-2'}
                            data={filters}
                            value={filters[0].value}
                            onChange={onFilterChange}
                        />
                        <ModalCheckListGroup
                            title={'정렬 설정'}
                            className={'f6 mr-2'}
                            data={sorters}
                            value={sorters[0].value}
                            onChange={onSortChange}
                        />
                        <ViewButton icons={[<MdViewModule />, <MdViewStream />]} onChange={onViewChange} />
                    </Fragment>
                }
            />
            {/*<hr className='mt-0 mb-2'/>*/}

            <GridList p={16} repeat={viewIndex === 0 ? 2 : 1}>
                {
                    !goodsList ?
                        <>
                            <Skeleton.VerticalProductList count={4} p={0} />
                            <Skeleton.VerticalProductList count={4} p={0} />
                        </> :
                        goodsList.map(goods => <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} isWide={viewIndex === 1} imageType={TYPE_OF_IMAGE.SQUARE}/>)
                }
            </GridList>

            {/*{*/}
            {/*    goodsList.length <= 0 ? <NoSearchResultBox>조회된 내용이 없습니다</NoSearchResultBox> : (*/}
            {/*        <div className='mb-2 ml-2'>*/}
            {/*            <Container>*/}
            {/*                <Row>*/}
            {/*                    {*/}
            {/*                        goodsList.map(goods =>*/}
            {/*                            <Col*/}
            {/*                                key={'goods'+goods.goodsNo}*/}
            {/*                                xs={viewIndex === 0 ? 6 : 12}*/}
            {/*                                sm={viewIndex === 0 ? 4 : 12}*/}
            {/*                                lg={viewIndex === 0 ? 3 : 12}*/}
            {/*                                xl={viewIndex === 0 ? 2 : 12}*/}
            {/*                                className='p-0'*/}
            {/*                                onClick={movePage.bind(this, goods.goodsNo)}*/}
            {/*                            >*/}
            {/*                                <div className='mr-2 mb-2'*/}
            {/*                                    // onClick={movePage.bind(this, {type: 'GOODS_DETAIL', payload: {goodsNo: goods.goodsNo}})}*/}
            {/*                                >*/}
            {/*                                    <SlideItemHeaderImage*/}
            {/*                                        imageHeight={viewIndex === 0 ? 150 : 250}*/}
            {/*                                        // saleEnd={goods.saleEnd}*/}
            {/*                                        imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}*/}
            {/*                                        discountRate={Math.round(goods.discountRate)}*/}
            {/*                                        remainedCnt={goods.remainedCnt}*/}
            {/*                                        blyReview={goods.blyReviewConfirm}*/}
            {/*                                        buyingRewardFlag={goods.buyingRewardFlag}*/}
            {/*                                    />*/}
            {/*                                    <SlideItemContent*/}
            {/*                                        className={'p-2'}*/}
            {/*                                        directGoods={goods.directGoods}*/}
            {/*                                        goodsNm={goods.goodsNm}*/}
            {/*                                        currentPrice={goods.currentPrice}*/}
            {/*                                        consumerPrice={goods.consumerPrice}*/}
            {/*                                        discountRate={goods.discountRate}*/}
            {/*                                    />*/}
            {/*                                </div>*/}
            {/*                            </Col>*/}
            {/*                        )*/}
            {/*                    }*/}

            {/*                </Row>*/}
            {/*            </Container>*/}
            {/*        </div>*/}
            {/*    )*/}
            {/*}*/}
        </div>
    )
}

export default ProducersGoodsList