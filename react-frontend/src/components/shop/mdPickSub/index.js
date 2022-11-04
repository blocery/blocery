import React, {useState, useEffect, Fragment} from 'react'

import Css from './MdPickSub.module.scss'

import IconReserOff from '~/images/icons/ic_reser_off.svg'
import IconReserOn from '~/images/icons/ic_reser_on.svg'
import IconArrow from '~/images/icons/arrow.svg'
// import {B2cBackHeader} from '~/components/common/headers'
import {Sticky} from '~/components/common/layouts'

import {Server} from '~/components/Properties'
import {getMdPick} from '~/lib/adminApi'

import ComUtil from '~/util/ComUtil'
import {HeaderTitle, ShopXButtonNav, ViewButton} from "~/components/common";
import BackNavigation from "~/components/common/navs/BackNavigation";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import ModalCheckListGroup from "~/components/common/modals/ModalCheckListGroup";
import {Div, Span} from "~/styledComponents/shared";
import {MdViewModule, MdViewStream} from "react-icons/md";
import GoodsCard from "~/components/common/cards/GoodsCard";

const sorters = [ //producersGoodsList에도 존재.
    {value: 1, label: '최신순', sorter: {direction: 'DESC', property: 'timestamp'}},
    {value: 2, label: '인기순'}, //pivot에서 추가
    {value: 4, label: '낮은가격순'}, //, sorter: {direction: 'ASC', property: 'currentPrice'}},
    {value: 5, label: '높은가격순'}, //, sorter: {direction: 'DESC', property: 'currentPrice'}},
    {value: 7, label: '평점순'}, //, sorter: {direction: 'DESC', property: 'avgScore'}},
    {value: 6, label: '할인율순'}, //, sorter: {direction: 'DESC', property: 'discountRate'}},
]

// function FilterBar(props){
//     const {count, onChange} = props
//     const [filtered1, setFiltered1] = useState(false)   //true 예약상품
//     const [filtered2, setFiltered2] = useState(true)    //true 최신순
//
//     function onFilterClick(type){
//         if(type === 1){
//             const f = !filtered1
//             setFiltered1(f)
//             onChange({
//                 reserved: f,
//                 newest: filtered2
//             })
//         }else{
//             const f = !filtered2
//             setFiltered2(f)
//             onChange({
//                 reserved: filtered1,
//                 newest: f
//             })
//         }
//
//     }
//
//     return(
//         <div className={Css.bar}>
//             <div className={Css.left}>
//                 <div><span className={Css.green}>{count}</span>개 상품</div>
//             </div>
//             <div className={Css.right}>
//                 <div onClick={onFilterClick.bind(this, 1)}>
//                     <img src={filtered1 ? IconReserOn : IconReserOff} alt={""} />
//                     <div>예약상품</div>
//                 </div>
//
//                 <span className={Css.line}></span>
//                 <div onClick={onFilterClick.bind(2)}>
//                     <img src={IconArrow} alt={""} />
//                     <div>{filtered2 ? '최신순' : '과거순'}</div>
//                 </div>
//
//                 {/*<div>|</div>*/}
//                 {/*<div>*/}
//                 {/*<img src={IconList} alt={""} />*/}
//                 {/*</div>*/}
//
//             </div>
//         </div>
//     )
// }

const MdPickSub = (props) => {

    const {id} = ComUtil.getParams(props)

    const [orgGoodsList, setOrgGoodsList] = useState()
    const [data, setData] = useState()
    const [goods, setGoods] = useState([])

    useEffect(() => {
        search()
    }, [])

    async function search(){
        const {data} = await getMdPick(id)
        setOrgGoodsList(data.mdPickGoodsList)
        setData(data)
        setGoods(data.mdPickGoodsList)
    }



    function onClick(goods){
        props.history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }
    // function onFilterChange(filter){
    //
    //     let mdPickGoodsList = Object.assign([], orgGoodsList)
    //
    //     //예약 상품만
    //     if(filter.reserved){
    //         mdPickGoodsList = mdPickGoodsList.filter(goods => goods.directGoods === false)
    //     }
    //
    //     //최신순 , 과거순 정렬
    //     ComUtil.sortNumber(mdPickGoodsList, 'goodsNo', filter.newest ? true : false)
    //
    //     console.log({mdPickGoodsList})
    //
    //     const newData = Object.assign({}, data)
    //     newData.mdPickGoodsList = mdPickGoodsList
    //     setData(newData)
    // }


    function onSorterChange(filter){
        let filteredList = Object.assign([], orgGoodsList)

        //정렬
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

        setGoods(filteredList)
    }



    if(!goods) return null;

    return(
        <div>
            {/*<B2cBackHeader title={'기획전'} history={props.history} />*/}
            {/*<ShopXButtonNav fixed historyBack isVisibleCart={true}>기획전</ShopXButtonNav>*/}
            <BackNavigation rightContent={<CartLinkButton />}>기획전</BackNavigation>
            {   data &&
                <img className={Css.topBg}
                     src={data.mdPickDetailImages[0]  ? Server.getImageURL() +  data.mdPickDetailImages[0].imageUrl : ''}/>
            }

            {/*<Sticky>*/}
            {/*    <FilterBar count={data.mdPickGoodsList.length} onChange={onFilterChange}/>*/}
            {/*</Sticky>*/}
            <HeaderTitle
                sectionLeft={<Div fontSize={18} bold><Span fg='green'>{goods.length}개</Span> 상품</Div>}
                sectionRight={
                    <Fragment>
                        <ModalCheckListGroup
                            title={'정렬 설정'}
                            className={'f5 mr-2 text-secondary'}
                            data={sorters}
                            value={sorters[0].value}
                            onChange={onSorterChange}
                        />

                        {/*<ViewButton icons={[<MdViewModule />, <MdViewStream />]} onChange={onViewChange} />*/}
                    </Fragment>
                }
            />

            {
                goods.map(item =>
                    <GoodsCard key={item.goodsNo} goods={item} pt={0}/>
                )
            }
        </div>
    )
}
export default MdPickSub
