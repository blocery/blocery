import {Div, Flex, Link} from "~/styledComponents/shared";
import React from "react";

const EmptyCard = ({url, onClick}) =>
    <Flex justifyContent={'center'} minHeight={100} fontSize={13} flexDirection={'column'} lineHeight={25}>
        <Div>검색 결과가 없습니다.</Div>
        <Link to={url} onClick={onClick}><u>전체 둘러보기</u></Link>
    </Flex>
export default EmptyCard