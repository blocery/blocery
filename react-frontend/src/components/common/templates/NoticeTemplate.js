import React from 'react'
import ComUtil from '~/util/ComUtil'
import {Badge} from "~/styledComponents/mixedIn";
import {Div} from "~/styledComponents/shared";
export default function NoticeTemplate(props) {

    function typeRenderer (noticeType) {
        if(noticeType === 'event'){
            return '이벤트'
        }
        else if(noticeType === 'check'){
            return '점검'
        }
        else if(noticeType === 'etc'){
            return '기타'
        }else{
            return '공지'
        }
    }

    return (
        <div>
            {
                (!props.noticeType||props.noticeType==='notice') ? <Badge textAlign={'center'} width={60} px={13} fg={'danger'} bc={'danger'} fontSize={11}>공지사항</Badge> :
                    (props.noticeType === 'event' || props.noticeType === 'etc') ?
                        <Badge textAlign={'center'} width={60} px={13} fg={'primary'} bc={'primary'} fontSize={11}>{typeRenderer(props.noticeType)}</Badge> :
                        <Badge textAlign={'center'} width={60} px={13} fg={'danger'} bc={'danger'} fontSize={11}>{typeRenderer(props.noticeType)}</Badge>
            }
            <Div fontSize={15} fg={'black'} mt={5}>{props.title}</Div>
            <hr/>
            <div className={'text-right f7 text-secondary'}>{ ComUtil.utcToString(props.regDate, 'YY.MM.DD HH:MM')}</div>
            <div style={{whiteSpace: 'pre-line'}}>{props.content}</div>
        </div>
    )
}