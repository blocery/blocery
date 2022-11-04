import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Div, Flex, Img} from "~/styledComponents/shared";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {getEventList} from "~/lib/shopApi";
import {withRouter} from "react-router-dom";
import ComUtil from "~/util/ComUtil";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {isForceUpdate} from "~/lib/axiosCache";

const Event = ({event,history}) => {
    const onClick = e => {
        e.stopPropagation()

        if(event.eventType === 1){
            if(event.eventLink) {
                history.push(`${event.eventLink}`)
            }else{
                history.push(`/event?no=${event.eventNo}`)
            }
        }else{
            history.push(`/event?no=${event.eventNo}`)
        }
    }

    return(
        <Div mt={25} onClick={onClick} cursor={1}>
            <Div relative>
                {
                    !(event.running) && //bottom 변수로 높이 조절중.
                    <Flex justifyContent={'center'} zIndex={2} rounded={4} absolute top={0} right={0} bottom={45} left={0} fontSize={30} fg={'white'} bg={'rgba(0,0,0, 0.5)'}>
                        <strong>{`이벤트 종료`}</strong>
                    </Flex>
                }
                <Img rounded={4} cover src={ComUtil.getFirstImageSrc(event.images, TYPE_OF_IMAGE.THUMB)} alt={event.eventTitle} />
                <Div mt={5} font-size={14}>{event.eventTitle}</Div>
                <Div >
                    <Div fg={'secondary'} mb={5} fontSize={12}>
                        {`${ComUtil.intToDateString(event.startDay)} ~ ${ComUtil.intToDateString(event.endDay)}`}
                    </Div>
                </Div>
            </Div>
        </Div>
    )
}

const EventList = (props) => {

    const abortControllerRef = useRef(new AbortController());

    const [list, setList] = useState([])

    useEffect(() => {
        search()
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])


    async function search() {
        const { data } = await getEventList("running", isForceUpdate(props.history), abortControllerRef.current.signal);
        setList(data)
    }

    return (
        <div>
            <BackNavigation>이벤트</BackNavigation>
            <Div px={16}>
                {
                    list.map(oneEvent =>
                            <Event event={oneEvent} history={props.history}/>
                        )
                }
            </Div>
        </div>
    );
};
export default withRouter(EventList);