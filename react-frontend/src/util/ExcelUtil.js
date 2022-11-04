import moment from 'moment-timezone'
import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ComUtil from '~/util/ComUtil';

//array 잘라서 리턴
function sliceData(data, sliceTo) {
    if (data.length > sliceTo) {
        return data.slice(0, sliceTo)
    }else{
        return data
    }
}

//헤더의 컬럼 길이 반환 [{wch: 10}, {wch: 23}...]
function formatExcelHeaderCols(headers) {
    return headers.map(key => {
        return { wch: ComUtil.getTextLength(key) } // plus 2 to account for short object keys
    })
}


/** 
    셀의 길이 자동계산하여 반환 : data 가 array ['', ''] 일 경우 사용    
**/
function getExcelColsByArray(
    //한글 헤더 ['', '']
    headers,
    //데이터 ['', '']
    data,
    //셀의 최대길이 제한
    maxCellLength = 50
) {

    //헤더의 컬럼 길이
    let widthArr = formatExcelHeaderCols(headers)

    //데이터를 loop 를 통해 가장 긴 길이 측정
    for (let i = 0; i < data.length; i++) {
        let value = Object.values(data[i]);

        for (let j = 0; j < value.length; j++) {

            //셀별 길이 측정
            const len = ComUtil.getTextLength(value[j])

            // console.log({key: value[j], keyLength: len})

            if (value[j] !== null && len > widthArr[j].wch) {
                widthArr[j].wch = len > maxCellLength ? maxCellLength : len
            }
        }
    }
    return widthArr
}

/**
 셀의 길이 자동계산하여 반환 : data 가 object in array [{obj}, {obj}...] 인 경우 사용
 **/
function getExcelColsByArrayObject(
    //한글 헤더 ['', '']
    headers,
    //컬럼명 ['', '']
    columns,
    //데이터 [{}, {}]
    data,
    //셀의 최대길이 제한
    maxCellLength = 50) {

    const widthArr = formatExcelHeaderCols(headers)

    Object.values(data).map(obj => {
        columns.map((column, index) => {
            //헤더에서 지정된 가로값
            const col = widthArr[index]
            const value = obj[column]
            const len = ComUtil.getTextLength(value)
            if (len > col.wch) {
                col.wch = len > maxCellLength ? maxCellLength : len
            }
        })
    })

    return widthArr;
}

const ExcelUtil = {
    s2ab(s) {
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    },

    //기존 ezfarm ExcelDownload 대용으로 사용.
    download: function(fileName, excelData){
        //console.log('download Headers', excelData[0].columns)
        //console.log('download data', excelData[0].data)

        let data = ComUtil.objectAssign(excelData[0].data)
        this.downloadForAoa(fileName, excelData[0].columns, data );
    },

    downloadForAoa: function(fileName, headers, data){
        console.log("================downloadForJson============")
        console.log({headers, data})
        // workbook 생성
        let wb = XLSX.utils.book_new();

        // 시트 만들기
        let v_SheetName = "sheet1";

        // if(headers) data.unshift(headers);

        const copiedData = Object.assign([], data)
        copiedData.unshift(headers)

        // aoa 데이터 삽입
        let ws = XLSX.utils.aoa_to_sheet(copiedData);

        // workbook에 새로만든 워크시트에 이름을 주고 붙인다.
        XLSX.utils.book_append_sheet(wb, ws, v_SheetName);

        //컬럼 가로길이 지정
        //wch : width charactor

        // const checkingData = data.length > 30 ? data.slice(1, data.length) : data
        let excelCols = getExcelColsByArray(headers, sliceData(data, 20))
        ws['!cols'] = excelCols


        // 엑셀 파일 만들기
        let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'array'});

        // 엑셀 파일 내보내기
        const v_momentDate = moment().toDate();
        const currentDate = moment(v_momentDate).format("YYYYMMDDHHmmss");
        let v_ExcelFileName = fileName + "_" + currentDate + ".xlsx";
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), v_ExcelFileName);
    },
    downloadForJson: function(fileName, headers, columns, data){
        console.log("================downloadForJson============")
        console.log({headers, columns, data})
        //let v_order_data_list = this.state.data;

        // step 1. workbook 생성
        let wb = XLSX.utils.book_new();

        // step 2. 시트 만들기
        let v_SheetName = "sheet1";

        let Heading = [];   //[["Employee Details"],["Emp Name", "Emp Sal"]];
        let Data = [];      //[{name:"xyz", sal:1000}, {name:"abc", sal:2000}];
        if(headers){
            Heading = [headers];
        }

        let Columns = [];//["sal", "name"]
        if(columns){
            Columns = columns;
        }

        if(data){
            Data = data;
        }

        let ws = XLSX.utils.aoa_to_sheet(Heading);

        ws['!cols'] = getExcelColsByArrayObject(headers, columns, sliceData(data, 20))

        // append to bottom of worksheet starting on first column
        let v_origin_position = "A1";
        if(Heading.length === 1){
            v_origin_position = "A2";
        } else if(Heading.length > 1){
            v_origin_position = -1;
        }

        // json 데이터 삽입
        XLSX.utils.sheet_add_json(ws, Data, {
            header:Columns,
            skipHeader:true,
            origin:v_origin_position
        });

        // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.
        XLSX.utils.book_append_sheet(wb, ws, v_SheetName);

        // step 4. 엑셀 파일 만들기
        let wbout = XLSX.write(wb, {bookType:'xlsx', type: 'array'});

        // step 5. 엑셀 파일 내보내기
        const v_momentDate = moment().toDate();
        const currentDate = moment(v_momentDate).format("YYYYMMDDHHmmss");
        let v_ExcelFileName = fileName + "_" + currentDate + ".xlsx";
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), v_ExcelFileName);
    },
    excelExportJson: function(file, callback) {
        var reader = new FileReader();
        reader.onload = function(evt){
            if (evt.target.readyState == FileReader.DONE) {
                var fileData = reader.result;
                var wb = XLSX.read(fileData, {type: 'binary'});
                var sheetNameList = wb.SheetNames; // 시트 이름 목록 가져오기
                var firstSheetName = sheetNameList[0]; // 첫번째 시트명
                var firstSheet = wb.Sheets[firstSheetName]; // 첫번째 시트
                var jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 0, defval: ""});
                callback(jsonData);
            }
        };
        reader.readAsBinaryString(file);
    }
}

export default ExcelUtil