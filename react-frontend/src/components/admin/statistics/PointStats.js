import React, { Component } from 'react';
import {Button, ButtonGroup, Input, Table} from 'reactstrap'
import "react-table/react-table.css"
import { getAllPointStats } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import moment from 'moment-timezone'
import { ExcelDownload, BlocerySpinner } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import SearchDates from '~/components/common/search/SearchDates'
import {Div, Flex} from "~/styledComponents/shared";

export default class PointStats extends Component {
    constructor(props) {
        super(props);
        console.log("this.props===",this.props)
        this.state = {
            loading: false,
            search:{
                selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()),
                endDate: moment(moment().toDate()),
                isBatch: 'Y',
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
            isBatch: this.state.search.isBatch == 'Y' ? true:false,
            isYearMonth:this.state.search.isYearMonth == 'Y' ? true:false
        };
        const { status, data } = await getAllPointStats(params);

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

    // 확정유무
    onSearchIsBatchChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isBatch = e.target.value;
        await this.setState({
            search: vSearch
        });
        //await this.search();
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
        let pointExcelData = this.getPointExcelData();
        this.setState({
            pointExcelData: pointExcelData
        })

    }
    getPointExcelData = () => {
        const columns = [
            '날짜',
            '로그인(수)', '투표(수)', '룰렛(수)', '배지(수)', '게시글(수)', '댓글(수)', '이벤트(수)', '클레임외(수)', '합계(수)',
            '로그인(액)', '투표(액)', '룰렛(액)', '배지(액)', '게시글(액)', '댓글(액)', '이벤트(액)', '클레임외(액)', '합계(액)'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.pointStats.map((item ,index)=> {
            return [
                item.date,
                item.countLogin, item.countVote, item.countRoulette, item.countBadge,
                item.countBoard, item.countReply,
                item.countEvent, item.countClaim,
                item.countSum,
                item.pointLogin, item.pointVote, item.pointRoulette, item.pointBadge,
                item.pointBoard, item.pointReply,
                item.pointEvent, item.pointClaim,
                item.pointSum
            ]
        })

        const totData = this.state.data.totStats.map((item ,index)=> {
            return [
                "합계",
                item.countLogin, item.countVote, item.countRoulette, item.countBadge,
                item.countBoard, item.countReply,
                item.countEvent, item.countClaim,
                item.countSum,
                item.pointLogin, item.pointVote, item.pointRoulette, item.pointBadge,
                item.pointBoard, item.pointReply,
                item.pointEvent, item.pointClaim,
                item.pointSum
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
                                               name='searchIsBatch'
                                               id='searchIsBatch'
                                               onChange={this.onSearchIsBatchChange}
                                               value={this.state.search.isBatch}
                                        >
                                            <option name='isBatch' value='Y'>적립확정기준</option>
                                            <option name='isBatch' value='N'>적립예정기준</option>
                                        </Input>
                                    </div>

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
                            <td width="900px" colSpan="9" bgcolor="#F3F3F3" align="center" valign="middle" > 수령자수 </td>
                            <td width="800px" colSpan="9" bgcolor="#F3F3F3" align="center" valign="middle" > 항목별총액 </td>
                        </tr>
                        <tr>
                            <td width="400px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 자동지급 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 커뮤니티참여 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 관리자수동 </td>
                            <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 합계 </td>

                            <td width="400px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 자동지급 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 커뮤니티참여 </td>
                            <td width="200px" colSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 관리자수동 </td>
                            <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 합계 </td>
                        </tr>
                        <tr>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 로그인 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 투표 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 룰렛 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 배지 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 게시글 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 댓글 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 이벤트 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 클레임외 </td>

                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 로그인 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 투표 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 룰렛 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 배지 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 게시글 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 댓글 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 이벤트 </td>
                            <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 클레임외 </td>
                        </tr>

                        {
                            (this.state.data.totStats && this.state.data.totStats[0]) &&
                            <tr>
                                <td bgcolor="#A3A3A3" align="center"> 합계</td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countLogin)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countVote)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countRoulette)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countBadge)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countBoard)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countReply)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countEvent)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countClaim)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].countSum)} </td>

                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointLogin)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointVote)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointRoulette)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointBadge)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointBoard)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointReply)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointEvent)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointClaim)} </td>
                                <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.totStats[0].pointSum)} </td>

                            </tr>
                        }

                        {
                            this.state.data.pointStats &&
                            this.state.data.pointStats.map(stat => {
                                return (
                                    <tr>
                                        <td align="center"> {stat.date} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countLogin)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countVote)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countRoulette)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countBadge)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countBoard)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countReply)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countEvent)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.countClaim)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.countSum)}</td>

                                        <td align="center"> {ComUtil.addCommas(stat.pointLogin)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointVote)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointRoulette)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointBadge)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointBoard)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointReply)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointEvent)} </td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointClaim)}</td>
                                        <td align="center"> {ComUtil.addCommas(stat.pointSum)}</td>
                                    </tr>
                                )
                            })
                        }

                    </Table>
                    <div align="center">
                        <ExcelDownload data={this.state.pointExcelData} fileName="포인트통계" />
                    </div>
                    <br/>
                    <br/>

                </div>
            </div>
        );
    }
}