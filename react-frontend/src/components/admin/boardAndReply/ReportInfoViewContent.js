import React, {useState, useEffect} from 'react';
import {profileReportInfoList, boardBoardReportInfoList, boardReplyReportInfoList} from '~/lib/adminApi'
import {Table} from 'reactstrap'
import {Div, Flex, Span, GridColumns} from "~/styledComponents/shared";

const ReportInfoViewContent = ({type, boardType="board", data}) => {
    const [replyInfoList, setReplyInfoList] = useState(null)

    useEffect(() => {
        getReportView()
    }, [])

    const getReportView = async () => {
        if(type === 'Reply') {
            const {data: replyInfoListData} = await boardReplyReportInfoList({
                boardType: boardType,
                writingId: data.writingId,
                replyId: data.replyId
            });
            setReplyInfoList(replyInfoListData);
        }
        else if(type === 'Board') {
            const {data: replyInfoListData} = await boardBoardReportInfoList({
                boardType: boardType,
                writingId: data.writingId
            });
            setReplyInfoList(replyInfoListData);
        }
        else if(type === 'Profile') {
            const {data: replyInfoListData} = await profileReportInfoList({
                targetConsumerNo: data.targetConsumerNo
            });
            setReplyInfoList(replyInfoListData);
        }
    }

    if(!replyInfoList) return null;
    return(
        <Div>

            <Div maxHeight={500} overflow={'auto'}>
                <Table striped size={'sm'}>
                    <thead>
                    <tr style={{fontSize:12}}>
                        <th>소비자번호</th>
                        <th>신고내역</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        type !== 'Profile' && replyInfoList && replyInfoList.map((d,idx) =>
                            <tr style={{fontSize: 12}}>
                                <td style={{textAlign:'center'}}>{d.reportConsumerNo}</td>
                                <td style={{textAlign:'left'}}>{d.reportReason}</td>
                            </tr>
                        )
                    }
                    {
                        type === 'Profile' && replyInfoList && replyInfoList.map((d,idx) =>
                            <tr style={{fontSize: 12}}>
                                <td style={{textAlign:'center'}}>{d.consumerNo}</td>
                                <td style={{textAlign:'left'}}>{d.reason}</td>
                            </tr>
                        )
                    }
                    </tbody>
                </Table>
            </Div>
        </Div>
    );
};

export default ReportInfoViewContent;
