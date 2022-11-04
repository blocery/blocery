import React from 'react';
import {withRouter} from "react-router-dom";
import Skeleton from "~/components/common/cards/Skeleton";
import {Button, Div, Flex, Img, Span, WhiteSpace} from "~/styledComponents/shared";

//이미지의 정 사각형을 비유 유지하기 위해
const height = '20vmin'

const AuthMarkCard = React.memo(withRouter(({
                                                authMark,
                                                history,
                                                ...rest
                                            }) => {
    if (!authMark) return <Skeleton.ProductList count={1} />

    const {key, imgUrl, title, desc, authNumber} = authMark

    return(
        <Flex
            bg={'white'}
            alignItems={'flex-start'}
            py={16}
            {...rest}
        >
            <Div width={height} height={height} flexShrink={0} mr={10}>
                <Img src={imgUrl} alt={title} />
            </Div>
            <Div flexGrow={1} textAlign={'left'}>
                <Div fontSize={14} bold fg={'darkBlack'}>
                    {authNumber}
                </Div>
                <WhiteSpace fontSize={13} fg={'black'}>
                    {desc}
                </WhiteSpace>
            </Div>
        </Flex>
    )
}))

export default AuthMarkCard;
