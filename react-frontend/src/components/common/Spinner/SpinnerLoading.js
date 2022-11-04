import React from 'react';
import {Flex} from "~/styledComponents/shared";
import {Spinner} from "reactstrap";


//isMore true : 인피티트 더 보기
//       false: 페이지로드시
const SpinnerLoading = ({isMore, ...rest}) => {
    return (
        <Flex justifyContent={'center'} height={isMore ? 70 :'50vmin'} {...rest}>
            <Spinner color={'info'} />
        </Flex>
    );
};

export default SpinnerLoading;
