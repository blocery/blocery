import React, {Fragment, useEffect, useState} from 'react'
import {Div, Flex, TriangleUp, TriangleDown, Span, Mask, Right} from '~/styledComponents/shared'
import {HeaderTitle, ShopXButtonNav, ViewButton} from "~/components/common";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import {getItems} from "~/lib/adminApi";
import {getGiftSet} from "~/lib/goodsApi";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import BackNavigation from "~/components/common/navs/BackNavigation";
import ModalCheckListGroup from "~/components/common/modals/ModalCheckListGroup";
import {MdViewAgenda, MdViewList, MdViewModule, MdViewStream} from "react-icons/md";
import Pagination from "~/components/common/pagination";
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import RoundedBoxItems from "~/components/common/layouts/RoundedBoxItems";
import {goodsSorterList} from "~/lib/bloceryConst";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";

const Modal = styled(Div)`
    background-color: ${color.white};
    padding: 22px 0;
    & > div{
        margin-bottom: 19px;
    }
    & > div:last-child{
        margin-bottom: 0;
    }
`;

const Item = styled.div`
    font-size: ${getValue(16)};
    color: ${props => props.active ? color.green : color.dark};
    font-weight: ${props => props.active && 'bold'};
    cursor: pointer;
    text-align: center;
`;

const VIEW_TYPE = {
    LIST: 0,
    BIG_LIST: 1
}

const GiftSet = (props) => {
    // const rops.match.params.itemKindCode
    // const [itemNo, setItemNo] = useState(0)

    const [items, setItems] = useState()
    const [name, setName] = useState('선물세트')

    const [goodsList, setGoodsList] = useState()
    // const [viewType, setViewType] = useState(VIEW_TYPE.LIST)

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    /** 쿼리스트링 파싱 **/
    const params = ComUtil.getParams(props)

    const itemNo = params.itemNo ? parseFloat(params.itemNo) : 0
    const page = params.page ? parseFloat(params.page) : 1
    const limit = params.limit ? parseFloat(params.limit) : 20
    const sortNum = params.sortNum ? parseFloat(params.sortNum) : 1
    const [totalCount, setTotalCount] = useState(0)


    useEffect(()=>{
        searchItems()
        // searchGoods()
    }, [])

    useEffect(() =>{
        if(modalOpen)
            ComUtil.noScrollBody()
        else
            ComUtil.scrollBody()

    }, [modalOpen])

    //url 변경시 동작
    useEffect(() =>{
        searchGoods()
    }, [props.history.location])

    async function searchItems() {
        const {data} = await getItems(true)
        setItems(data)
    }

    async function searchGoods() {

        const params = {
            itemNo, isPaging: true, limit: limit, page: page, sortNum: sortNum //낮은 가격순
        }

        const {data} = await getGiftSet(params)
        console.log("===searchGoods",data)
        setGoodsList(data.goodsList)
        setTotalCount(data.totalCount)

        // if(itemNo == 0){
        //     const {data} = await getGiftSet(0);
        //     setGoodsList(data)
        // }else{
        //     const {data} = await getGiftSet(itemNo)
        //     setGoodsList(data)
        // }
    }

    function onNavClick(){
        setModalOpen(!modalOpen)
    }

    async function onClickItemName(itemNo, itemName) {
        onNavClick();
        // setItemNo(itemNo)

        if(itemNo == 0) {
            setName('선물세트(전체)')
        } else {
            setName(itemName)
        }

        const url = ComUtil.makeQueryStringUrl(props.history.location.pathname, {itemNo: itemNo, page, limit: limit, sortNum: sortNum})
        props.history.replace(url)

        // const {data} = await getGiftSet(itemNo)
        // setGoodsList(data)
    }
    function onSorterChange(filter){
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

    // function onViewChange(iconIndex) {
    //     setViewType(iconIndex)
    // }
    const onPageChange = (page) => {

        const url = ComUtil.makeQueryStringUrl(props.history.location.pathname, {itemNo: itemNo, page, limit: limit, sortNum: sortNum})
        props.history.replace(url)

        //최상단으로 이동
        window.scrollTo(0,0)

    }
    const onSorterClick = (sorter) => {
        //검색 조건이 바꼈을 경우 page:1로 설정
        const url = ComUtil.makeQueryStringUrl(props.history.location.pathname, {itemNo: itemNo, page: 1, limit: limit, sortNum: sorter.value})
        props.history.replace(url)
    }

    if (!goodsList) return <BlocerySpinner />
    return(
        <Div>
            <BackNavigation showShopRightIcons>
                <Div display={'-webkit-inline-box'} alignItems={'center'} onClick={onNavClick} justifyContent={'center'}>
                    {name}
                    {
                        modalOpen ? <TriangleUp ml={7} /> : <TriangleDown ml={7}/>
                    }
                </Div>
            </BackNavigation>

            {
                modalOpen &&
                <Mask underNav onClick={onNavClick}>
                    <Modal onClick={(e)=> e.stopPropagation()}>
                        <Item active={itemNo == 0} onClick={onClickItemName.bind(this, 0)}>선물세트(전체)</Item>
                        {
                            items &&
                            items.map(item =>
                                <Item key={'item'+item.itemNo}
                                      active={itemNo == item.itemNo}
                                      onClick={onClickItemName.bind(this, item.itemNo, item.itemName)}
                                >
                                    {item.itemName}
                                </Item>
                            )
                        }
                    </Modal>
                </Mask>
            }

            {/*<ItemKind*/}
            {/*    isOpen={modalOpen}*/}
            {/*    item={item}*/}
            {/*    itemKindCode={itemKindCode}*/}
            {/*    onClose={()=> setModalState(false)}*/}
            {/*    onClick={onItemKindClick}/>*/}

            {/*<HeaderTitle*/}
            {/*    sectionLeft={<Div fontSize={18} bold><Span fg='green'>{goodsList.length}개</Span> 상품</Div>}*/}
            {/*    sectionRight={*/}
            {/*        <Fragment>*/}
            {/*            <ModalCheckListGroup*/}
            {/*                title={'정렬 설정'}*/}
            {/*                className={'f5 mr-2 text-secondary'}*/}
            {/*                data={sorters}*/}
            {/*                value={sorters[0].value}*/}
            {/*                onChange={onSorterChange}*/}
            {/*            />*/}
            {/*            /!*<Div onChange={onViewChange}><Icon name={viewType === 'list' ? 'viewTypeList' : 'viewTypeHalfCard'}/></Div>*!/*/}
            {/*            <ViewButton icons={[<MdViewModule />, <MdViewStream />]} onChange={onViewChange} />*/}
            {/*        </Fragment>*/}
            {/*    }*/}
            {/*/>*/}

            {/*<Flex px={16} minHeight={50}>*/}
            {/*    <Div fontSize={18} bold><Span fg='green'>{totalCount}개</Span> 상품</Div>*/}
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
        </Div>
    )

}

export default GiftSet