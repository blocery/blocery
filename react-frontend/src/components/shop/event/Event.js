import React, { Component, Fragment } from 'react'
import {ShopXButtonNav, BlocerySpinner, SummerNoteIEditorViewer} from '~/components/common'
import {getEventInfo} from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'
import BackNavigation from "~/components/common/navs/BackNavigation";
import ReplyContainer from "~/components/common/replyContainer";
import {Div} from "~/styledComponents/shared";
export default class Event extends Component {

    constructor(props){
        super(props);
        //console.log('event props : ', this.props);
        let eventNo = this.props.no ||  ComUtil.getParams(this.props).no;
        this.state = {
            eventNo: eventNo,
            loading: true,
            event: null
        }
    }
    async componentDidMount(){
        await this.search()
    }
    search = async () => {

        this.setState({loading: true});
        const eventNo = this.state.eventNo; //=writingId

        const { data:event } = await getEventInfo(eventNo);
        //console.log('event:',event, event.eventNo);

        this.setState({
            loading: false,
            event: event
        })
    };

    render() {
        const { event } = this.state;
        return (
            <Fragment>
                {this.state.loading && event ? (<BlocerySpinner/>) : null}
                <BackNavigation>상세 내용</BackNavigation>
                <div>
                    <SummerNoteIEditorViewer
                        height="100%"
                        initialValue={event && event.eventContent}
                    />
                </div>
                {
                    (event && !event.replyHide) &&
                    <ReplyContainer
                        onReplied={this.search}
                        replies={event?event.replies:[]}
                        boardType={'event'} //review vote board + 'event'는 예외적.
                        uniqueKey={event && event.eventNo}
                        refresh={this.search}
                    />
                }
            </Fragment>
        )
    }
}

