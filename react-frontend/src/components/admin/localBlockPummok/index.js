import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {Button, Div, Flex, Hr, Right, Space} from "~/styledComponents/shared";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {AgGridReact} from "ag-grid-react";
import {Col, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row} from "reactstrap";
import BlockPummokReg from "./BlockPummokReg";
import {getLoginAdminUser} from "~/lib/loginApi";
import {getBlockPummokList} from "~/lib/adminApi";

const LocalBlockPummokList = (props) => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null)

    const [searchObj, setSearchObj] = useState({
        producerNo: 157,
        localFarmerNoInt: 0,
        itemNo: 0,
    });

    const [data, setData] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [pummokData, setPummokData] = useState(null)

    const defaultColDef = useMemo(() => {
        return {
            width: 150,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        };
    }, []);

    const [columnDefs, setColumnDefs] = useState([
        // {headerName: '키', field: "itemNoDotLocalFarmerNo"},
        {headerName: '품목번호', field: "itemNo", cellRenderer: "pummokRenderer"},
        {headerName: '품목명', field: "itemName"},
        {headerName: '사유', field: "desc", width:300},
        {headerName: '차단시작일', field: "blockStartDate", width:170,
            valueGetter: function(params) {
                return (params.data.blockStartDate === 0) ? "-" : params.data.blockStartDate;
            }
        },
        {headerName: '차단종료일', field: "blockEndDate", width:170,
            valueGetter: function(params) {
                return (params.data.blockEndDate === 0) ? "-" : params.data.blockEndDate;
            }
        },
        {headerName: '농가바코드번호 ', field: "localFarmerNoInt",
            valueGetter: function(params) {
                return (params.data.localFarmerNoInt === 0) ? "-" : params.data.localFarmerNoInt;
            }
        },
    ]);

    useEffect(() => {
        onSearch();
    }, []);

    const onGridReady = useCallback((params) => {
        //API init
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }, []);

    async function checkLogin() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    function PummokRenderer({value, data:rowData}) {
        return (
            <div onClick={selectPummok.bind(this,rowData)} style={{color:'blue'}}>
                <u>{rowData.itemNo}</u>
            </div>
        )
    }

    const onSearch = async () => {
        const tempSearchObj = Object.assign({}, searchObj);
        
        if(searchObj.itemNo === "")
            tempSearchObj.itemNo = 0;

        if(searchObj.localFarmerNoInt === "" || isNaN(searchObj.localFarmerNoInt))
            tempSearchObj.localFarmerNoInt = 0;

        const {data} = await getBlockPummokList(tempSearchObj);
        setData(data);
        setPummokData(null);
    }

    const savePummokData = async() => {
        toggle()
        await onSearch();
    }

    const toggle = () => {
        setIsOpen(!isOpen)
    }

    const selectPummok = (data) => {
        setPummokData(data);
        toggle();
    }

    const regBlockPummok = () => {
        // setData({});
        toggle()
    }

    const onInputChange = (e) => {
        let {name, value} = e.target
        if(name === 'localFarmerNoInt') {
            value = parseInt(value)
        }

        setSearchObj({
            ...searchObj,
            [name]: value
        })
    }

    return (
        <Div p={16}>
            <Div p={10} mb={10}>
                <Space>
                    <Flex mr={50}>
                        <Label style={{width: 150}} >농가바코드번호</Label>
                        <Input type={'number'} name={'localFarmerNoInt'} value={searchObj.localFarmerNoInt || ''} onChange={onInputChange} />
                    </Flex>
                    <Flex mr={30}>
                        <Label style={{width: 130}} >품목번호</Label>
                        <Input type={'text'} name={'itemNo'} value={searchObj.itemNo || ''} onChange={onInputChange} />
                    </Flex>
                    <Right>
                        <MenuButton onClick={onSearch}>검색</MenuButton>
                    </Right>
                </Space>
            </Div>

            <Space my={10}>
                <MenuButton bg={'green'} onClick={regBlockPummok}>차단품목 등록</MenuButton>
            </Space>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    rowData={data}
                    columnDefs={columnDefs}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    rowHeight={40}
                    defaultColDef={defaultColDef}
                    overlayLoadingTemplate={'<span class="ag-overlay-loading-center">...로딩중입니다...</span>'}
                    overlayNoRowsTempalte={'<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'}
                    frameworkComponents={{
                        pummokRenderer:PummokRenderer,
                        // btnCellRenderer:BtnCellRenderer,
                    }}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                />

                <Modal isOpen={isOpen} toggle={toggle} size={'lg'} centered>
                    <ModalHeader toggle={toggle}>차단품목등록</ModalHeader>
                    <ModalBody>
                        <BlockPummokReg data={pummokData} onClose={savePummokData}/>
                    </ModalBody>
                </Modal>

            </div>
        </Div>
    )

}

export default LocalBlockPummokList