import React from 'react';
import {withRouter} from 'react-router-dom'
import {Button, Div} from "~/styledComponents/shared";
import AboutQAChanner from './AboutQAChanner'

//문의하기
const QAIntroduce = ({history}) => {
    const onClick = () => history.push(`/myPage/myQAReg`) //문의하기 페이지로 이동
    return (
        <Div p={16}>
            <AboutQAChanner />
            <hr/>
            <Button mt={4} fontSize={17} height={50} bg={'green'} fg={'white'} block onClick={onClick}>문의하기</Button>
        </Div>
    );
};

export default withRouter(QAIntroduce);
