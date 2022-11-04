import React, {useEffect, useState} from 'react';
import {getPeopleConsumerTop10, getPeopleConsumerTop1List} from "~/lib/shopApi";
import {Div, Flex, Space} from "~/styledComponents/shared";
import {getValue} from "~/styledComponents/Util";
import {
    CircleButton,
    CircleButtonList,
    PeopleConsumerCard,
    PeopleProducerCard
} from "~/components/shop/home_bef/components";
import Skeleton from "~/components/common/cards/Skeleton";
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";

const defaultStore = [
    {label: '#소통왕', value: 'board', src: 'https://shopbly.shop/images/3Ux7NZBnXYaz.png'},
    {label: '#저축왕', value: 'bly', src: 'https://shopbly.shop/images/f5Uln8dvqco3.png'},
    {label: '#활동왕', value: 'point', src: 'https://shopbly.shop/images/C9axO5iq20OK.png'},
    {label: '#구매왕', value: 'buy', src: 'https://shopbly.shop/images/MngRyTqvloIv.png'},
    {label: '#참견왕', value: 'reply', src: 'https://shopbly.shop/images/OwKul6R8PWH3.png'},
    {label: '#섭외왕', value: 'friend', src: 'https://shopbly.shop/images/PtMbgsQ5jVtH.png'},
]
const ConsumerRankContent = (props) => {
    const [selectedValue, setSelectedValue] = useState(defaultStore[0].value)
    const [list, setList] = useState()

    const [top1List, setTop1List] = useState()
    const [store, setStore] = useState(defaultStore)


    useEffect(() => {
        search()
    }, [selectedValue])

    const search = async () => {
        const {data} = await getPeopleConsumerTop10({type: selectedValue})
        console.log(data)
        setList(data)

        //top1들 profile 설정.
        let tempStore = Object.assign([],store);
        const {data:topProfile} = await getPeopleConsumerTop1List()
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
                            <div key={item.consumer.consumerNo}
                                style={{borderBottom: `1px solid ${color.light}`}}>
                                <PeopleConsumerCard {...item} rank={index+1} type={selectedValue} />
                            </div>
                        )
                }
            </Div>
        </div>
    );
};

export default ConsumerRankContent;
