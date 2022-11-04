import React  from 'react'
import { Server } from '~/components/Properties'
//import Css from './PopularCategories.module.scss'
import {
    IconCateVeggies,
    IconCateFruit,
    IconCateRice,
    IconCateGongsanPum,
    IconCateMeat,
    IconCateSeaFood,
    IconCateGift
} from "~/components/common/icons/Icons";
import styled from "styled-components";
// import {color} from "~/styledComponents/Properties";
// import {getValue} from "~/styledComponents/Util";
import {Flex, Divider, Div, GridColumns, Link} from "~/styledComponents/shared";
import {useHistory} from 'react-router-dom'

import Cate_all_new from '~/images/icons/category/cate_all_new.jpg'
import Cate_fruit_new from '~/images/icons/category/cate_fruit_new.jpg'
import Cate_gagong_new from '~/images/icons/category/cate_gagong_new.jpg'
import Cate_meat_new from '~/images/icons/category/cate_meat_new.jpg'
import Cate_package_new from '~/images/icons/category/cate_package_new.jpg'
import Cate_rice_new from '~/images/icons/category/cate_rice_new.jpg'
import Cate_susan_new from '~/images/icons/category/cate_susan_new.jpg'
import Cate_veggies_new from '~/images/icons/category/cate_veggies_new.jpg'


const Card = styled(Link)`
  text-align: center;
  cursor: pointer;
  display: block;
`

//인기 카테고리
const PopularCategories = (props) => {

    const history = useHistory()

    const data = (Server._serverMode() === 'production') ?
        [
            {icon: Cate_package_new, label: '선물세트', to: '/giftSet'},
            {icon: Cate_veggies_new, label: '채소', to: '/category/5/all'},
            {icon: Cate_fruit_new, label: '과일', to: '/category/6/all'},
            {icon: Cate_rice_new, label: '쌀/잡곡/견과', to: '/category/7/all'},
            {icon: Cate_gagong_new, label: '가공식품', to: '/category/8/all'},
            {icon: Cate_meat_new, label: '정육/계란류', to: '/category/9/all'},
            {icon: Cate_susan_new, label: '수산물/건해산', to: '/category/10/all'}
        ]
        : [
            {icon: Cate_package_new, label: '선물세트', to: '/giftSet'},
            {icon: Cate_veggies_new, label: '채소', to: '/category/1/all'}, //Stage:225
            {icon: Cate_fruit_new, label: '과일', to: '/category/2/all'},
            {icon: Cate_rice_new, label: '쌀/잡곡/견과', to: '/category/3/all'},
            {icon: Cate_gagong_new, label: '가공식품', to: '/category/33/all'},
            //{icon: Cate_meat_new, label: '정육/계란류', to: '/category/5/all'},
            //{icon: Cate_susan_new, label: '수산물/건해산', to: '/category/6/all'}
        ]


    function onClick(url){
        history.push(url)
    }

    return(
        <Div mb={30}>
            <GridColumns repeat={4} colGap={0} rowGap={0} fontSize={12} px={16} mt={25}>
                <Card to={'/goodsList'} >
                    <img src={Cate_all_new} alt={'전체'} style={{width:'100%'}}/>
                    <div><b>전체상품</b></div>
                </Card>
                {
                    data.map(({icon, label, to}, index)=>(
                        <Card key={'category'+index} to={to} >
                            <img src={icon} alt={label} style={{width:'100%'}} />
                            <div>
                                {label}
                            </div>
                        </Card>
                    ))
                }
            </GridColumns>
        </Div>
    )

    // return(
    //     <div className={Css.wrap}>
    //         <div className={Css.titleBox}>
    //             <div className={Css.titleLarge}>
    //                 인기 카테고리
    //             </div>
    //             <div className={Css.titleSmall}>
    //                 <LightGray>가장 많이 찾는 카테고리를 만나보세요!</LightGray>
    //             </div>
    //         </div>
    //
    //         <div className={Css.categoryBox}>
    //
    //             {/* selected 된것 */}
    //             <div className={Css.category}>
    //                 {/* circle */}
    //                 <div className={[Css.circle, Css.circleActive].join(' ')}>
    //                     <IconTomato />
    //                 </div>
    //             </div>
    //
    //             {/* selected 안된것 */}
    //             {
    //                 [0,1,2,3,4,5,6,7,8,9].map((item, index) =>
    //                     <div
    //                         key={'store'+index}
    //                         className={Css.category}
    //                     >
    //                         {/* circle */}
    //                         <div className={Css.circle}>
    //                             <IconTomato />
    //                         </div>
    //                     </div>
    //                 )
    //             }
    //         </div>
    //     </div>
    // )

}

export default PopularCategories