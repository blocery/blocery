import React, {Fragment, Suspense} from 'react'
import {Space, Divider} from '~/styledComponents/shared/Layouts';
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Route, Switch, useParams} from 'react-router-dom'
import {BottomDotTab} from "~/styledComponents/ShopBlyLayouts";
import MyQAList from "./MyQAList";
import QAIntroduce from "./QAIntroduce";
import {withRouter} from 'react-router-dom'

const MyQA = ({history}) => {
    const {tabId} = useParams()

    const onTabClick = (_id) => {
        // setId(_id)
        if (_id !== tabId)
            history.replace(`/myPage/myQA/${_id}`)
    }

    return(
        <Fragment>
            <BackNavigation>1:1 문의</BackNavigation>
            <Space justifyContent={'center'} spaceGap={20}>
                <BottomDotTab active={tabId === '1'} onClick={onTabClick.bind(this, '1')}>문의 내역</BottomDotTab>
                <BottomDotTab active={tabId === '2'} onClick={onTabClick.bind(this, '2')}>문의 하기</BottomDotTab>
            </Space>
            <Divider height={1} />
            <Suspense fallback={''}>
                <Switch>
                    <Route exact path="/myPage/myQA/1" component={MyQAList} />
                    <Route exact path="/myPage/myQA/2" component={QAIntroduce} />
                    <Route component={Error}/>
                </Switch>
            </Suspense>
        </Fragment>
    )
}

export default withRouter(MyQA)