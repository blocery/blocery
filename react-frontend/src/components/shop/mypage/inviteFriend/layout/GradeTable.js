import React from 'react';
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {Span} from "~/styledComponents/shared";
import ComUtil from '~/util/ComUtil'
import moment from "moment-timezone";

const Table = styled.table`
    width: 100%;
   font-size: 14px;
    & th {
        font-weight: 500;
    }
    & td {
        color: ${color.dark};
    }
    & th, td {
        border-bottom: 1px solid #ddd;
        text-align: center;
        padding: 10px 5px;
    }
    
    & th:first-child {
        text-align: left;
    }
    
    & td:first-child {
        text-align: left;
    }
    
    & tr:nth-child(4) {
        & td {
            color: ${color.green};
        }
    }
    
    & > tr:last-child {
        & td {
            border: 0;
        }
    }
    
    
`;

const GradeTable = (props) => {
    let rewardWon;
    const today =  moment().format('YYYYMMDD');

    // if(today >= 20220322 && today <= 20220430) {
        rewardWon = 5000;
    // } else {
    //     rewardWon = 2000;
    // }

    return (
        <Table>
            {/*<tr>*/}
            {/*    <th></th>*/}
            {/*    <th colSpan={3} >등급</th>*/}
            {/*</tr>*/}
            <tr>
                <th>항목</th>
                <th>적립금</th>
                <th>지급 시점</th>
                {/*<th>Best</th>*/}
                {/*<th>Excellent</th>*/}
            </tr>
            {/*<tr>*/}
                {/*<td>기준</td>*/}
                {/*<td>1~49명</td>*/}
                {/*<td>50~99명</td>*/}
                {/*<td>100명~</td>*/}
            {/*</tr>*/}
            <tr>
                <td>
                    친구초대 가입 적립금<br/>
                </td>
                <td>{ComUtil.addCommas(rewardWon)}원</td>
                <td>친구의 첫 구매확정시 <br/>(무제한 지급)</td>
                {/*<td>4,000원</td>*/}
                {/*<td>5,000원</td>*/}
            </tr>
            <tr>
                <td>친구 상품구매 적립금 </td>
                <td> 1% </td>
                <td>친구 구매확정시 <br/>(친구 회원가입 후 3개월간 지급)</td>
                {/*<td>4%</td>*/}
                {/*<td>5%</td>*/}
            </tr>
        </Table>
    );
};
export default GradeTable;
