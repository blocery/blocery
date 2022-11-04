import React, {useEffect, useState} from 'react'
import {Button, Input} from 'reactstrap'
import {Flex, Div, Span, A, Button as StyledButton} from "~/styledComponents/shared";
import 'react-toastify/dist/ReactToastify.css'
import {getAllGoodsStepList, getAllGoodsListForStep} from "~/lib/adminApi";
import ComUtil from '~/util/ComUtil'
import GoodsStepUpd from '~/components/admin/goodsStep/GoodsStepUpd'
import { AdminModalFullPopupWithNav } from '~/components/common'
import { AgGridReact } from 'ag-grid-react';
import { Server } from '~/components/Properties'
import {useHistory} from 'react-router-dom'

import moment from "moment-timezone";


const GoodsStepList = (props) => {

    const history = useHistory();

    const [gridApi, setGridApi] = useState(null);

    const [dataList, setDataList] = useState([]);

    const [stepSeq, setStepSeq] = useState(null);
    const [consumerNo, setConsumerNo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectGoods, setSelectGoods] = useState({
        goodsNo:0,
        goodsNm:'',
    });

    const agGrid = {
        columnDefs: [
            {
                headerName: "승인", field: "adminConfirm", width: 80,
                valueGetter: function(params) {
                    if(params.data.adminConfirm){return 'Y'}
                    return 'N'
                },
                cellRenderer: 'txHashRenderer'
            },
            {
                headerName: "writingId", field: "writingId", cellRenderer: 'stepSeqRenderer'
            },
            {
                headerName: "단계", field: "stepIndex", width: 100,
                valueGetter: function(params) {
                    let v_Data = "시작";
                    if(params.data.stepIndex === 0) {
                        return '시작';
                    } else if(params.data.stepIndex === 100) {
                        v_Data = "생산";
                    } else if(params.data.stepIndex === 200) {
                        v_Data = "포장";
                    } else if(params.data.stepIndex === 300) {
                        v_Data = "발송";
                    }
                    return v_Data;
                },
            },
            {
                headerName: "작업명", field: "stepTitle", width: 150
            },
            {
                headerName: "작업내용", field: "content", width: 150
            },
            {
                headerName: "이미지", field: "images", width: 150,
                cellRenderer: 'diaryImageRenderer'
            },
            {
                headerName: "등록일시", field: "writeDate", width: 200,
                cellClass: "ag-grid-cell-link",
                cellRenderer: "diaryRegDateRenderer"
            }
        ],
        defaultColDef: {
            width: 100,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        components: {
            diaryRegDateRenderer: diaryRegDateRenderer
        },
        frameworkComponents: {
            stepSeqRenderer: stepSeqRenderer,
            diaryImageRenderer: diaryImageRenderer,
            txHashRenderer: txHashRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        rowSelection: 'single',
        rowHeight:35,
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    function stepSeqRenderer ({value, data:rowData}) {
        return (<Span className='text-primary' cursor onClick={onStepSeqClick.bind(this, rowData)}><u>{rowData.writingId}</u></Span>);
    }

    function txHashRenderer ({value, data:rowData}) {
        if(rowData.adminConfirm){
            if(!rowData.txHash) return(<Span>Y</Span>);
            return (<A href={`${"https://www.iostabc.com/tx/"}${rowData.txHash}`} target={'_blank'} fg={'primary'}>Y(기록)</A>);
        }else{
            return (<Span>N</Span>);
        }
    }

    //이미지 렌더러
    function diaryImageRenderer ({value: images}) {
        if(images){
            return images.map(image => {
                let src = Server.getThumbnailURL() + image.imageUrl
                if(image.imageUrlPath){
                    src = Server.getImgTagServerURL() + image.imageUrlPath + image.imageUrl;
                }
                const Style = {
                    width: 30, height: 30, paddingRight: '1px'
                }
                return <img src={src} style={Style} alt={image.imageNm}/>
            })
        }else{
            return null
        }

    }

    //등록일시 렌더러
    function diaryRegDateRenderer ({value, data:rowData}) {
        return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm')
    }

    const onStepSeqClick = (data) => {
        console.log(data);
        setStepSeq(data.writingId);
        setConsumerNo(data.consumerNo);
        setIsOpen(true);
    }

    useEffect(() => {
        async function fetch() {
            await getSearch();
        }
        fetch();

    }, []);

    useEffect(() => {
        if(selectGoods.goodsNo > 0) {
            getSearch();
        }
    }, [selectGoods.goodsNo]);

    // 조회
    const getSearch = async () => {
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const { data } = await getAllGoodsStepList(selectGoods.goodsNo)
        setDataList(data)

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.hideOverlay();
        }
    }

    // 상품 온체인지
    const onGoodsChange = (data) => {
        setSelectGoods( data)
    }

    const onClose = (data) => {
        setStepSeq(null);
        setIsOpen(false);
        if(data.isSearch){
            getSearch();
        }
    }

    const onNewPostClick = () => {
        setStepSeq(null);
        setIsOpen(true);
    }


    return(
        <>
            <Div mt={2} pr={5} textAlign={'right'}>
                {
                    selectGoods.goodsNo > 0 &&
                    <span>선택한상품:({selectGoods.goodsNo}){selectGoods.goodsNm}</span>
                }
            </Div>

            <Flex>
                <Div p={1} flexGrow={1}>
                    <GoodsList onChange={onGoodsChange} />
                </Div>
                <Div p={1} flexGrow={2}>
                    <Flex p={2} alignItems='center'>
                        <Div>총 {ComUtil.addCommas(dataList.length)} 개</Div>
                        <Div flexGrow={1} textAlign='right'>
                            {/*<Button color={'info'} size={'sm'} onClick={onNewPostClick} disabled={selectGoods.goodsNo === 0 ? true:false} >생산일지 등록</Button>*/}
                        </Div>
                    </Flex>

                    <div
                        id="myGrid"
                        style={{
                            height: "calc(100vh - 200px)"
                        }}
                        className="ag-theme-balham"
                    >
                        <AgGridReact
                            columnDefs={agGrid.columnDefs}  //컬럼 세팅
                            defaultColDef={agGrid.defaultColDef}
                            rowSelection={agGrid.rowSelection}  //멀티체크 가능 여부
                            rowHeight={agGrid.rowHeight}
                            overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                            overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                            rowData={dataList}
                            components={agGrid.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            frameworkComponents={agGrid.frameworkComponents}
                            onGridReady={onGridReady}   //그리드 init(최초한번실행)
                        >
                        </AgGridReact>
                    </div>
                </Div>
            </Flex>

            <AdminModalFullPopupWithNav show={isOpen} title={'생산이력수정'} onClose={onClose}>
                <GoodsStepUpd writingId={stepSeq} goodsNo={selectGoods.goodsNo} consumerNo={consumerNo}/>
            </AdminModalFullPopupWithNav>
        </>
    )

}

const GoodsList = (props) => {

    const [gridApi, setGridApi] = useState(null);


    const [goodsState, setGoodsState] = useState("0");
    const [dataList, setDataList] = useState([]);



    const agGrid = {
        columnDefs: [
            {headerName: "상품번호", field: "goodsNo", sort:'desc', width: 110},
            {headerName: "생산자No", field: "producerNo", width: 90},
            {headerName: "생산자", field: "producerFarmNm", width: 100},
            {headerName: "상품명", field: "goodsNm", width: 150},
            {headerName: "상품상태", field: "confirm", width: 120, cellRenderer: 'goodsStateRenderer'},
            {headerName: "대기", field: "stepCount", width: 100},
            {headerName: "승인", field: "stepConfirmCount", width: 100},
            {headerName: "전체", field: "stepAllCount", width: 100}
        ],
        defaultColDef: {
            width: 100,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        // components: {
        //     diaryRegDateRenderer: diaryRegDateRenderer
        // },
        frameworkComponents: {
            goodsStateRenderer: goodsStateRenderer,
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        rowSelection: 'single',
        rowHeight:35,
    };


    const getStatus = (rowData) => {
        let toDate = ComUtil.utcToString(moment());
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd) : null;

        //console.log(rowData.goodsNo, toDate,saleDateEnd);

        let status;

        if (!rowData.confirm) {
            status = '임시저장'
        } else {
            status = '판매중'
            if (rowData.salePaused) {
                status = '일시중지'
            }
            if (rowData.saleStopped) {
                status = '판매중단'
            }
            if (rowData.remainedCnt <= 0) {
                status += '|품절'
            }

            if (saleDateEnd) {
                let newResult = saleDateEnd.replace(/\./gi, "-")
                let diffSaleResult = ComUtil.compareDate(newResult, toDate);
                if (diffSaleResult === -1) {
                    status += '|판매기한만료'
                }
            }
        }
        return status
    }

    function goodsStateRenderer({data:rowData}) {
        const status = getStatus(rowData)
        return <div>{status}</div>
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    useEffect(() => {
        async function fetch() {
            await getSearch();
        }
        fetch();

    }, [goodsState]);

    const getSearch = async () => {

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const { data } = await getAllGoodsListForStep({goodsState:goodsState, deleted:true});

        const resData = await Promise.all(data.filter(goods=>goods.dealGoods))
        //setDataList(data) //전체상품 출력시.
        setDataList(resData) //공구상품만 출력

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.hideOverlay();
        }
    }

    const onSelectionChanged = (event) => {
        const rowNodes = event.api.getSelectedNodes();
        const rows = rowNodes.map((rowNode => rowNode.data));
        const row = rows[0];
        //console.log("goodsSelected===",row);
        props.onChange(row)
    }

    // 조회할 상품상태 change
    const onStateChange = async (e) => {
        setGoodsState(e.target.value)
    }

    return(
        <Div p={1}>
            <Flex>
                <Div p={2}>
                    <Input type='select' name='select' id='goodsState' style={{width:'200px'}} onChange={onStateChange}>
                        <option name='radio1' value='0'>판매중(기간내)</option>
                        <option name='radio2' value='1'>판매중</option>
                        <option name='radio3' value='2'>품절</option>
                        <option name='radio4' value='3'>판매중단</option>
                        <option name='radio5' value='4'>일시중지</option>
                    </Input>
                </Div>
                <Div p={2}>총 {ComUtil.addCommas(dataList.length)} 개</Div>
            </Flex>
            <div
                id="myGrid"
                style={{
                    height: "calc(100vh - 260px)"
                }}
                className="ag-theme-balham"
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={agGrid.rowSelection}  //멀티체크 가능 여부
                    rowHeight={agGrid.rowHeight}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    rowData={dataList}
                    components={agGrid.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                    frameworkComponents={agGrid.frameworkComponents}
                    onRowClicked={onSelectionChanged.bind(this)}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                >
                </AgGridReact>
            </div>
        </Div>
    )
}

export default GoodsStepList