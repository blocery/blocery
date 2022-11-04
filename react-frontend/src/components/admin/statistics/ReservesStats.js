import React, { Component } from 'react';
import {Button, ButtonGroup, Input, Table} from 'reactstrap'
import "react-table/react-table.css"
import { getAllReservesStats } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import moment from 'moment-timezone'
import { ExcelDownload, BlocerySpinner } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import SearchDates from '~/components/common/search/SearchDates'
import {Div, Flex} from "~/styledComponents/shared";

export default class ReservesStats extends Component {
    constructor(props) {
        super(props);
        console.log("this.props===",this.props)
        this.state = {
            loading: false,
            search:{
                selectedGubun: 'week', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()).add(-8,"days"),
                endDate: moment(moment().toDate()).add(-1,"days"),
                isYearMonth:'N'   //실적현황 년월별 구분자
            },
            data: {},
        }
    }

    async componentDidMount() {
        console.log("this.props===",this.props)
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    search = async (searchButtonClicked) => {
        if (searchButtonClicked) {
            if(this.state.search.selectedGubun !== 'all'){
                if (
                    !this.state.search.startDate || !this.state.search.endDate
                ) {
                    alert('시작일과 종료일을 선택해주세요')
                    return false;
                }
            }
        }
        this.setState({loading: true});

        const params = {
            startDate:this.state.search.startDate ? moment(this.state.search.startDate).format('YYYYMMDD'):null,
            endDate:this.state.search.endDate ? moment(this.state.search.endDate).format('YYYYMMDD'):null,
            isYearMonth:this.state.search.isYearMonth == 'Y' ? true:false
        };
        const { status, data } = await getAllReservesStats(params);

        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }
        this.setState({
            data: data
        });

        this.setExcelData();

        this.setState({loading: false});
    }

    // 월별 또는 일별
    onIsYearMonthChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isYearMonth = e.target.value;
        await this.setState({
            search: vSearch
        });
    }

    onDatesChange = async (data) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.startDate = data.startDate;
        vSearch.endDate = data.endDate;
        vSearch.selectedGubun = data.gubun;
        await this.setState({
            search: vSearch
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    setExcelData = () => {
        let reservesExcelData = this.getReservesExcelData();
        this.setState({
            reservesExcelData: reservesExcelData
        })

    }
    getReservesExcelData = () => {
        const columns = [
            '날짜',
            'BLY당일시세',
            '슈퍼리워드(수)', '리뷰(수)', '구매보상(수)', '친구추천(수)', '친구구매(수)',
            '이벤트(수)', '클레임외(수)',
            '입금(수)', '출금(수)', '전환(수)',
            '합계(수)',
            '슈퍼리워드(액)', '리뷰(액)', '구매보상(액)', '친구추천(액)', '친구구매(액)',
            '이벤트(액)', '클레임외(액)',
            '입금(액)', '출금(액)', '전환(액)',
            '합계(액)'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.reservesStats.map((item ,index)=> {
            return [
                item.date,
                item.blctToWon > 0 ? item.blctToWon:'',
                item.superReward, item.review, item.buyReward, item.friendInvite, item.friendBuy,
                item.adminEvent, item.adminClaim,
                item.deposit, item.withdraw, item.point2bly,
                item.sum,
                item.superRewardWon, item.reviewWon, item.buyRewardWon, item.friendInviteWon, item.friendBuyWon,
                item.adminEventWon, item.adminClaimWon,
                item.depositWon, item.withdrawWon, item.point2blyWon,
                item.sumWon
            ]
        })

        const totData = this.state.data.totStats.map((item ,index)=> {
            return [
                "합계",
                '',
                item.superReward, item.review, item.buyReward, item.friendInvite, item.friendBuy,
                item.adminEvent, item.adminClaim,
                item.deposit, item.withdraw, item.point2bly,
                item.sum,
                item.superRewardWon, item.reviewWon, item.buyRewardWon, item.friendInviteWon, item.friendBuyWon,
                item.adminEventWon, item.adminClaimWon,
                item.depositWon, item.withdrawWon, item.point2blyWon,
                item.sumWon
            ]
        })

        data.unshift(totData[0]);

        return [{
            columns: columns,
            data: data
        }]
    }

    render() {

        return(
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <div className="ml-3 mt-3 mr-3">

                    <div className="ml-2 mt-2 mr-2">
                        <Flex bc={'secondary'} m={3} p={7}>
                            <Div pl={10} pr={20} py={1}> 기 간 </Div>
                            <Div ml={10} >
                                <Flex>
                                    <SearchDates
                                        gubun={this.state.search.selectedGubun}
                                        startDate={this.state.search.startDate}
                                        endDate={this.state.search.endDate}
                                        isHiddenAll={true}
                                        isNotOnSearch={true}
                                        onChange={this.onDatesChange}
                                    />

                                    <div className='ml-2'>
                                        <Input type='select'
                                               name='searchIsYearMonth'
                                               id='searchIsYearMonth'
                                               onChange={this.onIsYearMonthChange}
                                               value={this.state.search.isYearMonth}
                                        >
                                            <option name='isYearMonth' value='N'>일별</option>
                                            <option name='isYearMonth' value='Y'>월별</option>
                                        </Input>
                                    </div>

                                    <Button className="ml-3" color="primary" onClick={this.search.bind(this,true)}> 검 색 </Button>
                                </Flex>
                            </Div>
                        </Flex>
                    </div>

                    <div className="pt-3 pb-3">
                        {
                            (this.state.data.startDate && this.state.data.endDate) &&
                            <>{this.state.data.startDate}~{this.state.data.endDate}</>
                        }
                    </div>
                    <Table bordered>
                        <tr>
                            <td width="100px" rowSpan="3" bgcolor="#F3F3F3" align="center" valign="middle" > 날짜 </td>
                            <td width="100px" rowSpan="3" bgcolor="#F3F3F3" align="center" valign="middle" > BLY당일시세 </td>
                            <td width="900px" colSpan="11" bgcolor="#F3F3F3" align="center" valign="middle" > BLY수량 </td>
                            <td width="800px" colSpan="11" bgcolor="#F3F3F3" align="center" valign="middle" > 원화환산 </td>
                        </tr>
                        <tr>
                            <td width="400px" colSpan="5" bgcolor="#F3F3F3" align="center" valign="middle" > 자동적립 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 관리자수동 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 입출금 </td>
                            <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 포인트전환 </td>
                            <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 합계 </td>

                            <td width="400px" colSpan="5" bgcolor="#F3F3F3" align="center" valign="middle" > 자동적립 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 관리자수동 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 입출금 </td>
                            <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 포인트전환 </td>
                            <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 합계 </td>
                        </tr>
                        <tr>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 슈퍼리워드 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 리뷰 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 구매보상 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 친구추천 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 친구구매 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 이벤트 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 클레임외 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 입금 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 출금 </td>

                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 슈퍼리워드 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 리뷰 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 구매보상 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 친구추천 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 친구구매 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 이벤트 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 클레임외 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 입금 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 출금 </td>
                        </tr>

                        {
                            (this.state.data.totStats && this.state.data.totStats[0]) &&
                            <tr>
                                <td bgcolor="#A3A3A3" align="center"> 합계</td>
                                <td bgcolor="#A3A3A3" align="center"></td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].superReward)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].review)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].buyReward)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].friendInvite)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].friendBuy)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].adminEvent)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].adminClaim)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].deposit)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].withdraw)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].point2bly)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].sum)} </td>

                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].superRewardWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].reviewWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].buyRewardWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].friendInviteWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].friendBuyWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].adminEventWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].adminClaimWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].depositWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].withdrawWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].point2blyWon)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].sumWon)} </td>

                            </tr>
                        }

                        {
                            this.state.data.reservesStats &&
                            this.state.data.reservesStats.map(stat => {
                                return (
                                    <tr>
                                        <td align="center"> {stat.date} </td>
                                        <td align="center"> {stat.blctToWon > 0 && ComUtil.addCommas(stat.blctToWon)} </td>

                                        <td align="center"> {ComUtil.addCommas(stat.superReward)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.review)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.buyReward)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.friendInvite)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.friendBuy)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.adminEvent)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.adminClaim)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.deposit)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.withdraw)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.point2bly)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.sum)} </td>

                                        <td align="center"> {ComUtil.addCommas(stat.superRewardWon)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.reviewWon)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.buyRewardWon)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.friendInviteWon)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.friendBuyWon)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.adminEventWon)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.adminClaimWon)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.depositWon)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.withdrawWon)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.point2blyWon)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.sumWon)}</td>
                                    </tr>
                                )
                            })
                        }

                    </Table>
                    <div align="center">
                        <ExcelDownload data={this.state.reservesExcelData} fileName="적립금(BLY)현황" />
                    </div>
                    <br/>
                    <br/>

                </div>
            </div>
        );
    }
}