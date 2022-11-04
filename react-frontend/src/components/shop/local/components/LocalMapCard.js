import React from 'react'
import {Div} from "~/styledComponents/shared";
import KakaoMap from "~/components/common/map/KakaoMap";
import {Ul} from "~/styledComponents/shared/Layouts";
import styled from "styled-components";
const LocalMapCard = (props) => {
    const {title, addr} = props
    return (
        <div>
            <div>
                <KakaoMap title={title} addr={addr}/>
            </div>
            <Div p={16} fontSize={12} textAlign={'center'}>
                주소 : {addr}
            </Div>
        </div>
    )
}
export default LocalMapCard