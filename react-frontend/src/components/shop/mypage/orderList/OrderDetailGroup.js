import React, {useEffect, useState, Fragment} from 'react'
import { Div } from '~/styledComponents/shared'
import {getOrdersByOrderGroupNo} from '~/lib/shopApi'

export default function OrderDetailGroup(props){
    const [data, setData] = useState()

    useEffect(() => {
        //DB 조회
        async function fetch(){

            let orderGroup;

            orderGroup = [(await getOrdersByOrderGroupNo(props.orderGroupNo)).data]

            console.log(orderGroup)
        }

        fetch()

    }, [])



    return (
        <Div>
            {

            }
        </Div>
    )

}