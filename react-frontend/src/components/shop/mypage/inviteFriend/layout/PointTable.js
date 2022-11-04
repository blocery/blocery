import React from 'react';
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {Span} from "~/styledComponents/shared";

const Table = styled.table`
    width: 100%;
   font-size: 15px;
    & th {
        font-weight: 500;
        background-color: ${color.backgroundDark};
    }
    & td {
        color: ${color.dark};
    }
    & th, td {
        border-bottom: 1px solid #ddd;
        // text-align: center;
        padding: 10px 5px;
    }
    
    & th:first-child {
        text-align: center;
    }
    
    & td:first-child {
        text-align: left;
    }
    
    & > tr:last-child {
        & td {
            border: 0;
        }
    }
    
    
`;

const PointTable = (props) => {
    return (
        <Table>
            <tr>
                <th>구분</th>
                <th>포인트</th>
                <th>기준</th>
            </tr>
            <tr>
                <td>로그인</td>
                <td>1p</td>
                <td>일 1회</td>
            </tr>
            <tr>
                <td>도전 룰렛</td>
                <td>1p~ </td>
                <td>일 1회</td>
            </tr>
            <tr>
                <td>투표참여</td>
                <td>10p~</td>
                <td>투표당 1회</td>
            </tr>
            <tr>
                <td>게시글 작성</td>
                <td>10p</td>
                <td>일 최대 10개</td>
            </tr>
            <tr>
                <td>댓글 작성</td>
                <td>2p</td>
                <td>일 최대 10개</td>
            </tr>
            <tr>
                <td>우수 게시글 선정</td>
                <td>500~3,000p</td>
                <td>-</td>
            </tr>
            <tr>
                <td>활동배지</td>
                <td>유동적</td>
                <td>배지에 따라 차등</td>
            </tr>
            {/*<tr>*/}
            {/*    <td rowSpan={2}>친구추천</td>*/}
            {/*    <td>추천인 가입 시</td>*/}
            {/*    <td>1,000p</td>*/}
            {/*    <td>-</td>*/}
            {/*</tr>*/}
            {/*<tr>*/}
            {/*    <td>추천인 상품 첫 구매 시</td>*/}
            {/*    <td>1,000p</td>*/}
            {/*    <td>-</td>*/}
            {/*</tr>*/}
            <tr>
                <td>이벤트</td>
                <td>유동적</td>
                <td>이벤트 종류에 따라 차등</td>
            </tr>
        </Table>
    )
};
export default PointTable;