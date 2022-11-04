import React, {useEffect, useState} from 'react';
import {getPeopleProducerTop10, getPeopleProducerTop1List} from "~/lib/shopApi";
import {Div, Flex, Space} from "~/styledComponents/shared";
import {getValue} from "~/styledComponents/Util";
import ComUtil from "~/util/ComUtil";

import {
    CircleButton,
    CircleButtonList,
    PeopleConsumerCard,
    PeopleProducerCard
} from "~/components/shop/home_bef/components";
import Skeleton from "~/components/common/cards/Skeleton";
import {color} from "~/styledComponents/Properties";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";


const defaultStore = [
    {label: '#판매왕', value: 'sell', src: 'https://shopbly.shop/images/C9axO5iq20OK.png'},
    {label: '#평점왕', value: 'score', src: 'https://shopbly.shop/images/MngRyTqvloIv.png'},
    {label: '#인싸왕', value: 'follower', src: 'https://shopbly.shop/images/3Ux7NZBnXYaz.png'},
    {label: '#피드왕', value: 'feed', src: 'https://shopbly.shop/images/OwKul6R8PWH3.png'},
]
const ProducerRankContent = (props) => {
    const [selectedValue, setSelectedValue] = useState(defaultStore[0].value)
    const [list, setList] = useState()

    const [top1List, setTop1List] = useState()
    const [store, setStore] = useState(defaultStore)

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)

    const onHashTagClick = ({tag}) => {
        setTagModalState({
            isOpen: true,
            tag: tag
        })
    }

    useEffect(() => {
        search()
    }, [selectedValue])

    const search = async () => {
        const {data} = await getPeopleProducerTop10({type: selectedValue})
        //console.log({data})
        setList(data)

        //top1들 profile 설정.
        let tempStore = Object.assign([],store);
        const {data:topProfile} = await getPeopleProducerTop1List()
        topProfile.map( (profile, index) => {
            if (profile && profile.profileImages.length > 0) {
                tempStore[index].src = ComUtil.getFirstImageSrc(profile.profileImages);//Server.getImageURL() + profile.profileInfo.profileImages[0].imageUrl;
            }
        })
        setStore(tempStore);
    }

    const onCircleClick = async (value) => {
        setSelectedValue(value)
    }
    return (
        <div>
            <CircleButtonList data={store} onClick={onCircleClick} selectedValue={selectedValue} />
            <Div>
                {
                    !list ?
                        <Skeleton.ProductList count={10} /> :
                        list.map((item, index) =>
                            <div key={item.producer.producerNo}
                                 style={{borderBottom: `1px solid ${color.light}`}}>
                                <PeopleProducerCard {...item} type={selectedValue} onHashTagClick={onHashTagClick}/>
                            </div>
                        )
                }
            </Div>
        </div>
    );
};

export default ProducerRankContent;
