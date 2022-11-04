import React, {Component} from "react";
import { getLoginAdminUser } from "~/lib/loginApi";
import {Div, Flex, Right} from '~/styledComponents/shared'
import {getAllBlctToWonCachedLog} from "~/lib/adminApi";
import {AgGridReact} from "ag-grid-react";
import ComUtil from '~/util/ComUtil'
import moment from "moment-timezone";

export default class BlySiseWithoutCoupon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "날짜", field: "day", cellRenderer: "dateRenderer"},
                {headerName: "시세", field: "blctToWon"},
            ],
            defaultColDef: {
                width: 130,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                dateRenderer:this.dateRenderer,
            },
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
        await this.search();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi

        //리스트 조회
        this.search()
    }

    search = async () => {
        this.setState({loading: true})
        const params = {
            startDate: moment(moment().toDate()).add(-1,"months").format("YYYYMMDD"),
            endDate: moment(moment().toDate()).format("YYYYMMDD")
        };
        const {status, data} = await getAllBlctToWonCachedLog(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        this.setState({
            data: data,
            loding: false
        })
    }

    // cell Renderer...
    dateRenderer = ({value, data:rowData}) => {
        return(
            <span>{ComUtil.intToDateString(rowData.day)}</span>
        )

    }

    render() {
        if (this.state.data.length <= 0)
            return null;

        return (
            <Div>
                <Flex>
                    <Div></Div>
                    <Right>
                        (한달 기준)
                    </Right>
                </Flex>
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        rowSelection={'multiple'}
                        defaultColDef={this.state.defaultColDef}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                    >
                    </AgGridReact>
                </div>
            </Div>
        )
    }
}