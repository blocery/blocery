import React, {useEffect, useState} from 'react';
import {getGoodsQnaCount} from "~/lib/shopApi";
import {Div, Flex, GridColumns} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Bold} from "~/styledComponents/ShopBlyLayouts";

const Item = ({count, text}) =>
    <Flex justifyContent={'center'} flexDirection={'column'}>
        <Bold bold fontSize={23} lineHeight={23} fg={'green'}>{count}</Bold>
        <Div fontSize={14}>{text}</Div>
    </Flex>

//내 문의내역 카운트 대시보드
const MyQADashboard = ({refresh}) => {
    const [state, setState] = useState();
    useEffect(() => {
        search()
        // console.log("refresh============")
    }, [refresh])

    const search = async () => {
        const {data} = await getGoodsQnaCount()
        console.log(state)
        setState(data)
    }

    return (
        <Div py={16} bg={'white'} bc={'green'} rounded={4} height={83} overflow={'hidden'}>
            <GridColumns repeat={4} height={'100%'} rowGap={0} colGap={0} custom={`
                    & > div {
                        border-right: 1px solid ${color.light};
                    }
                    & > div:last-child {
                        border: 0;
                    }
                `}>
                <Item count={state ? state[0] : '-'} text={'문의 접수'} />
                <Item count={state ? state[1] : '-'} text={'처리 중'} />
                <Item count={state ? state[2] : '-'} text={'답변 완료'} />
                <Item count={state ? state[0] + state[1] + state[2] : '-'} text={'총 문의'} />
            </GridColumns>
        </Div>
    );
};

export default MyQADashboard;
