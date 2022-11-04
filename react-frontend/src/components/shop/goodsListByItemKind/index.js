import React, {useState, useEffect, Fragment} from 'react'
import {getItemByItemNo } from '~/lib/adminApi'
import {
    getConsumerGoodsList,
    getConsumerGoodsByItemKindCode,
    getConsumerGoodsByProducerNoSorted, getConsumerGoodsByProducerNoAndItemNoSorted
} from '~/lib/goodsApi'

import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";

import {
    HeaderTitle,
    NoSearchResultBox,
    ShopXButtonNav,
    SlideItemContent,
    SlideItemHeaderImage,
    ViewButton
} from '~/components/common'
import ItemKind from './ItemKind'
import ComUtil from '~/util/ComUtil'

import {Flex, TriangleUp, TriangleDown, Span, Div, Right} from '~/styledComponents/shared'
import { useModal } from '~/util/useModal'
import {MdViewModule, MdViewStream} from "react-icons/md";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import BackNavigation from "~/components/common/navs/BackNavigation";
import Pagination from '~/components/common/pagination'
import {withRouter} from 'react-router-dom'
import RoundedBoxItems from "~/components/common/layouts/RoundedBoxItems";
import {goodsSorterList} from "~/lib/bloceryConst";
import {color} from "~/styledComponents/Properties";
import {MdViewList, MdViewAgenda} from 'react-icons/md'
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";


const VIEW_TYPE = {
    LIST: 0,
    BIG_LIST: 1
}

const GoodsListByItemKind = (props) => {

    const itemNo = props.match.params.itemNo
    const itemKindCode = props.match.params.itemKindCode

    const [item, setItem] = useState()//품목[품종]들
    const [name, setName] = useState()

    const [goodsList, setGoodsList] = useState()
    // const [viewType, setViewType] = useState(VIEW_TYPE.LIST)

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    /** 쿼리스트링 파싱 **/
    const params = ComUtil.getParams(props)

    /** 페이징 관련 **/
    const page = params.page ? parseFloat(params.page) : 1
    const limit = params.limit ? parseFloat(params.limit) : 20
    const sortNum = params.sortNum ? parseFloat(params.sortNum) : 1
    const [totalCount, setTotalCount] = useState(0)

    useEffect(()=>{
        searchItemKind()
        // searchGoods()
    }, [])

    useEffect(()=>{
        if (item) {
            console.log({item, itemKindCode})

            //array
            if (item) {

                //품종코드가 없을때는 품목 전체
                if (itemKindCode === 'all') {
                    setName(item.itemName + '(전체)')
                }else{
                    const itemKind = item.itemKinds.find(itemKind => itemKind.code === parseFloat(itemKindCode))
                    setName(itemKind.name)
                }

            }
        }
    }, [itemKindCode])

    //url 변경시 동작
    useEffect(() =>{
        searchGoods()
    }, [props.history.location])


    useEffect(() =>{

        if(modalOpen)
            ComUtil.noScrollBody()
        else
            ComUtil.scrollBody()

    }, [modalOpen])



    //품목 조회
    async function searchItemKind() {
        const {data} = await getItemByItemNo(itemNo)
        setItem(data)
        setName(data.itemName)
    }



    async function searchGoods() {

        const params = {
            itemNo, itemKindCode: itemKindCode === 'all' ? null : parseFloat(itemKindCode), isPaging: true, limit: limit, page: page, sortNum: sortNum//낮은 가격순
        }

        console.log({searchParams: params})

        // if(itemKindCode === 'all'){
        const {data} = await getConsumerGoodsList(params)
        // setOrgGoodsList(data.goodsList)
        setGoodsList(data.goodsList)
        setTotalCount(data.totalCount)
        // }else{
        //     const {data} = await getConsumerGoodsByItemKindCode(itemKindCode)
        //     // setOrgGoodsList(data)
        //     setGoodsList(data)
        // }
    }

    //품종 클릭
    function onItemKindClick(code) {     //itemKindCode

        console.log("품종 모달 클릭"+code)

        const url = ComUtil.makeQueryStringUrl(`/category/${itemNo}/${code}`, {page, limit: limit, sortNum: sortNum})
        console.log("url==========="+url)
        props.history.replace(url)

        // historyReplace({history: props.history, pathname: `/category/${itemNo}/${code}`, params: {page, limit: limit, sortNum: sortNum}})

        // searchGoods(code)
        // if(code === 'all'){
        //     setName(item.itemName + '(전체)')
        // }else{
        //     const _name = item.itemKinds.find(itemKind => itemKind.code === code).name
        //     setName(_name)
        // }
    }

    // function onViewChange(iconIndex) {
    //     setViewType(iconIndex)
    //     // if(iconIndex === 0) {
    //     //     setViewType('halfCard')
    //     // } else {
    //     //     setViewType('list')
    //     // }
    // }

    function onSorterChange(sorter){

        searchGoods(sorter.value)

        // // let filteredList = Object.assign([], orgGoodsList)
        // let filteredList = Object.assign([], goodsList)
        //
        // //정렬
        // // ComUtil.sortNumber(filteredList, 'goodsNo', filter.newest ? true : false)
        // if(filter.label == "최신순") {
        //     ComUtil.sortNumber(filteredList, 'goodsNo', true)
        // } else if(filter.label == "낮은가격순") {
        //     ComUtil.sortNumber(filteredList, 'currentPrice', false)
        // } else if(filter.label == "높은가격순") {
        //     ComUtil.sortNumber(filteredList, 'currentPrice', true)
        // } else if(filter.label == "할인율순") {
        //     ComUtil.sortNumber(filteredList, 'discountRate', true)
        // } else if(filter.label == "평점순") { //pivot 추가
        //     ComUtil.sortNumber(filteredList, 'avgScore', true)
        // } else if(filter.label == "인기순") { //pivot 추가
        //     ComUtil.sortNumber(filteredList, 'soldCount', true)
        // }
        //
        // setGoodsList(filteredList)
    }

    function onNavClick(){
        setModalState(!modalOpen)
    }

    const onPageChange = (page) => {

        const url = ComUtil.makeQueryStringUrl(props.history.location.pathname, {page, limit: limit, sortNum: sortNum})
        props.history.replace(url)

        //최상단으로 이동
        window.scrollTo(0,0)

    }

    const onSorterClick = (sorter) => {
        //검색 조건이 바꼈을 경우 page:1로 설정
        const url = ComUtil.makeQueryStringUrl(props.history.location.pathname, {page: 1, limit: limit, sortNum: sorter.value})
        props.history.replace(url)
    }

    if (!goodsList) return <BlocerySpinner />

    return(
        <div>
            <BackNavigation showShopRightIcons>
                <Div display={'-webkit-inline-box'} cursor={1} onClick={onNavClick} alignItems={'center'} justifyContent={'center'}>
                    <div>
                        {name}
                    </div>

                    {
                        modalOpen ? <TriangleUp ml={7} /> : <TriangleDown ml={7}/>
                    }
                </Div>
            </BackNavigation>

            <ItemKind
                isOpen={modalOpen}
                item={item}
                itemKindCode={itemKindCode}
                onClose={()=> setModalState(false)}
                onClick={onItemKindClick}
            />

            {/*<Flex px={16} minHeight={50}>*/}
                {/*<Div fontSize={18} bold><Span fg='green'>{totalCount}개</Span> 상품</Div>*/}
                {/*<Right>*/}
                {/*    <ViewButton icons={[*/}
                {/*        <MdViewAgenda size={24} color={color.darkBlack}/>,*/}
                {/*        <MdViewList size={26} color={color.darkBlack}/>*/}
                {/*    ]} onChange={onViewChange} />*/}
                {/*</Right>*/}
            {/*</Flex>*/}

            {/** 정렬 **/}
            <RoundedBoxItems data={goodsSorterList} value={sortNum} onClick={onSorterClick} />
            {/** 상품리스트 **/}
            <VerticalGoodsGridList>
                {
                    goodsList.map(goods => <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods}/>)
                }
            </VerticalGoodsGridList>

            {/** 페이징 **/}
            <Pagination totalCount={totalCount}
                        limit={limit}
                        currentPage={page}
                        onPageChange={onPageChange}
            />
        </div>
    )
}
export default withRouter(GoodsListByItemKind)


// const PagedGoodsList = ({page, limit, itemNo, itemKindCode}) => {
//
//     useEffect(() => {
//         searchGoods()
//     }, [page])
//
//     const [totalCount, setTotalCount] = useState(0)
//
//     async function searchGoods() {
//
//         console.log(page, limit, itemNo, itemKindCode)
//
//         // if(itemKindCode === 'all'){
//         const {data} = await getConsumerGoodsList({itemNo, itemKindCode, isPaging: true, limit: limit, page: page})
//         console.log("================all",data)
//         // setOrgGoodsList(data.goodsList)
//         setGoodsList(data.goodsList)
//         setTotalCount(data.totalCount)
//         // }else{
//         //     const {data} = await getConsumerGoodsByItemKindCode(itemKindCode)
//         //     // setOrgGoodsList(data)
//         //     setGoodsList(data)
//         // }
//     }
//
//
//
//     return(
//         <>
//             <GoodsList data={goodsList} viewType={viewType}/>
//             <Pagination itemsCount={totalCount}
//                         pageSize={limit}
//                         currentPage={page}
//                         onPageChange={onPageChange}
//             />
//         </>
//     )
// }
