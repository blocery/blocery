import React, {useEffect, useState} from 'react';
import {Div, Flex} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {getRegularShopMembers} from "~/lib/producerApi";
import ComUtil from "~/util/ComUtil";
import Skeleton from "~/components/common/cards/Skeleton";
import Profile from "~/components/common/cards/Profile";
import BackNavigation from "~/components/common/navs/BackNavigation";


const ConsumerItem = ({consumer}) => {
    return(
        <Flex alignItems={'flex-start'} px={16} py={30}>
            {
                consumer.consumerNo > 900000000 ?
                    <Profile
                        consumerNo={consumer.consumerNo}
                        producerNo={consumer.consumerNo}
                        profileImages={consumer.profileImages}
                        nickname={consumer.nickname}
                        level={consumer.level}              //사용자 레벨(board, goodsReview)
                        desc={null}               //고령농장 감자. 산지직송 등등(producer 일 경우만 사용)
                        producerFlag={true}
                    />:
                    <Profile
                        consumerNo={consumer.consumerNo}
                        producerNo={null}
                        profileImages={consumer.profileImages}
                        nickname={consumer.nickname}
                        level={consumer.level}              //사용자 레벨(board, goodsReview)
                        desc={null}               //고령농장 감자. 산지직송 등등(producer 일 경우만 사용)
                        producerFlag={false}
                    />
            }

        </Flex>
    )
};



const ProducerFollowerList = (props) => {

    const { producerNo } = ComUtil.getParams(props)
    const [list, setList] = useState()

    useEffect(() => {
        search()
    }, []);

    const search = async() => {
        const {data:list} = await getRegularShopMembers(producerNo);
        console.log("ProducerFollowerList");
        console.log(list);

        setList(list);
    }

    return (
        <Div pb={40}>
            <BackNavigation>단골</BackNavigation>
            <Div>
                {
                    !list ? <Skeleton.List count={10} /> :
                        list.map((item, index) =>
                            <div key={item.consumerNo}
                                 style={{borderBottom: `1px solid ${color.light}`}}>
                                <ConsumerItem consumer={item}/>
                            </div>
                        )
                }
            </Div>
        </Div>
    );
}

export default ProducerFollowerList;