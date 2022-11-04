import React from 'react';
import {Button, Div, Space} from "~/styledComponents/shared";
import {RiAlarmWarningLine} from "react-icons/ri";

const ReportButton = ({onClick, reported}) => <Button //px={12}
                                                      fg={'secondary'}
                                                      // bc={'secondary'}
                                                      // bw={3}
                                                      rounded={19}
                                                      fontSize={15}
                                                      height={36}
                                                      onClick={onClick}>
    <Space>

        <RiAlarmWarningLine size={20} style={{marginBottom: 3}}/>

        <Div lineHeight={20}>
            {reported ? '신고됨' : '신고'}
        </Div>
    </Space>

</Button>

export default ReportButton;
