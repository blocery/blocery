import React, {useState, useEffect} from 'react';
import {getGoodsReviewReportList} from '~/lib/adminApi'
import {Table} from 'reactstrap'
import {Div, Flex, Span, GridColumns} from "~/styledComponents/shared";

const ReportInfoViewContent = ({data}) => {
    const [reportInfoList, setReportInfoList] = useState(null)

    useEffect(() => {
        getReportView()
    }, [])

    const getReportView = async () => {
        const {data:reportInfoListData} = await getGoodsReviewReportList({orderSeq:data.orderSeq})
        setReportInfoList(reportInfoListData)
    }

    if(!reportInfoList) return null;
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
                        reportInfoList && reportInfoList.map((d,idx) =>
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
