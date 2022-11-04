import React, {useEffect, useRef, useState} from 'react'
import { Div, Link} from '~/styledComponents/shared'
import {getPrevSuperRewardList} from '~/lib/shopApi'
import {getValue} from "~/styledComponents/Util";

import {Collapse} from 'reactstrap'

import Content from "./Content";
import styled from 'styled-components'
import ComUtil from '~/util/ComUtil'
import {withRouter} from "react-router-dom";
import {isForceUpdate} from "~/lib/axiosCache";

const Wrapper = styled.div`
    position: relative;
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: ${getValue(8)};
        background: rgba(0,0,0,0.3);    
    }
`;
const Image = styled.img`
    width: 100%;
    height: 100%;
    border-top-left-radius: ${getValue(8)};
    border-top-right-radius: ${getValue(8)};
    
`;

const Card = ({goods}) => {
    const {goodsImages, goodsNm, defaultDiscountRate, defaultCurrentPrice, consumerPrice, superRewardReward, superRewardStart, superRewardEnd} = goods
    return (


        <Div p={16} >
            <Link to={`/goods?goodsNo=${goods.goodsNo}`}
                  display={'block'}

            >
                <Wrapper>


                    <Div relative>
                        <Image src={ComUtil.getFirstImageSrc(goodsImages)} alt={goodsNm} />
                        <Div absolute center zIndex={1}>
                            <Div fg={'white'} textAlign={'center'}>
                                <Div fontSize={14} >
                                    이벤트 종료
                                </Div>
                                <Div fontSize={50} fw={500}>
                                    {`${superRewardReward}%`}
                                </Div>
                            </Div>
                        </Div>
                    </Div>

                    <Content goods={goods} />

                </Wrapper>
            </Link>
        </Div>

    )
}

const SuperRewardHistory = (props) => {

    const abortControllerRef = useRef(new AbortController());

    const [data, setData] = useState()


    useEffect(() => {

        search()

        return(() => {
            abortControllerRef.current.abort()
        })

    }, [])

    const search = async () => {
        const {data} = await getPrevSuperRewardList(isForceUpdate(props.history), abortControllerRef.current.signal)
        setData(data)
    }

    if (!data) return null

    return data.map((goods, i) => <Card goods={goods} key={'goods'+i}/>)

};

export default withRouter(SuperRewardHistory);
