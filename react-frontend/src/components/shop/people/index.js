import React, {Suspense} from 'react';
import {Div, Flex, Space} from "~/styledComponents/shared";
import ProducerRankContent from "./ProducerRankContent";
import loadable from "@loadable/component";
import {Route, Switch, useParams, withRouter} from 'react-router-dom'
import BackNavigation from "~/components/common/navs/BackNavigation";

const ConsumerRankContent = loadable(() => import('./ConsumerRankContent'))

const People = ({history}) => {

    //소비자, 생산자
    // const [tabType, setTabType] = useState('producer')
    const {tabId} = useParams()


    const onTabClick = (_tabId) => {
        history.replace(`/people/${_tabId}`)
        // if (tabType !== type) {
        //     setTabType(type)
        // }
    }

    return (
        <div>
            <BackNavigation>피플</BackNavigation>
            <Flex justifyContent={'center'}  bg={'veryLight'} p={16} mb={10}>
                <Space spaceGap={17} fg={'secondary'} lineHeight={'1'}>
                    <Div cursor={1} bold fg={tabId === '1' && 'black'} onClick={onTabClick.bind(this, '1')}>생산자</Div>
                    <span>|</span>
                    <Div cursor={1} bold fg={tabId === '2' && 'black'} onClick={onTabClick.bind(this, '2')}>소비자</Div>
                </Space>
            </Flex>
            <Suspense fallback={''}>
                <Switch>
                    <Route exact path="/people/1" component={ProducerRankContent} />
                    <Route exact path="/people/2" component={ConsumerRankContent} />
                    <Route component={Error}/>
                </Switch>
            </Suspense>
        </div>
    );
};

export default withRouter(People);
