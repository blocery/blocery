import React, { useState } from 'react'
import Style from './HeaderSectionTab.module.scss'
import {isTimeSaleBadge, isBlyTimeBadge, isSuperRewardBadge} from '~/lib/shopApi'
import classNames from 'classnames'
import {withRouter} from 'react-router-dom'
import {Link} from '~/styledComponents/shared'

const store = [
    {value: 1, label: '스토어 홈', to: '/store'},
    // {value: 2, label: '블리타임', to: '/home/2'},
    {value: 4, label: '쑥쑥-계약재배', to: '/store/deal'},
    {value: 2, label: '기획전', to: '/store/mdPick'},
    {value: 3, label: '포텐타임', to: '/store/potenTime'},
    {value: 'superReward', label: '슈퍼리워드', to: '/store/superReward'},
    {value: 5, label: '특가딜', to: '/store/specialPriceDeal'},
    {value: 6, label: '베스트', to: '/store/best'},
    {value: 7, label: '신상품', to: '/store/new'},
    {value: 8, label: '단골상품', to: '/my/favoriteGoodsList'},
]

const HeaderSectionTab = (props) => {
    const { tabId, history, onClick } = props

    console.log(history)

    const [timeSaleBadge, setTimeSaleBadge] = useState(false);
    const [blyTimeBadge, setBlyTimeBadge] = useState(false);
    const [superRewardBadge, setSuperRewardBadge] = useState(false);

    //라우터가 변경될 때마다 계속 조회
    getTimeSaleBadge(); //need await?
    //getBlyTimeBadge();
    getSuperRewardBadge()


    const swipeOptions = {
        lazy: false,
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 4.5,
        // slidesPerView: 'auto',
        initialSlide: tabId, //디폴트 0
        freeMode: true,
        on: {
            init: function () {
            },
            slideChange: function(){
            },
            slideChangeTransitionEnd: function () {

            },
            click: function () {
            }
        }
    }

    async function getTimeSaleBadge() {
        let {data} = await isTimeSaleBadge();
        setTimeSaleBadge(data);
        //console.log('timeSaleBadge:' + data);
    }

    // async function getBlyTimeBadge() {
    //     let {data} = await isBlyTimeBadge();
    //     setBlyTimeBadge(data);
    //     //console.log('blyTimeBadge:' + data);
    // }

    async function getSuperRewardBadge() {
        let {data} = await isSuperRewardBadge();
        setSuperRewardBadge(data);
        //console.log('blyTimeBadge:' + data);
    }

    const SectionLink = ({item}) => {

        let notiNew = false;

        if(item.label === '포텐타임') {
            notiNew = timeSaleBadge
        }else if (item.label === '블리타임') {
            notiNew = blyTimeBadge
        }else if (item.label === '슈퍼리워드') {
            notiNew = superRewardBadge
        }

        return (
            <Link fontSize={14} notiNew={notiNew ? 1 : 0} notiTop={5} className={classNames(Style.link, history.location.pathname === item.to && Style.active)}
                  to={item.to}
            >
                {item.label}
            </Link>
        )
    }

    return (
        <div className={Style.wrap}>
            {
                store.map((item, index) =>
                    <div key={'sectionTab'+index} className={Style.tab}>
                        <SectionLink item={item} />
                    </div>
                )
            }
        </div>
    )
}
export default withRouter(HeaderSectionTab)