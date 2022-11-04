import React, {useEffect, useRef, useState} from "react";
import {producerReplaceOrderCheck} from "~/lib/producerApi";
import {Div, Input} from "~/styledComponents/shared";

function BarcodeInput({orderSeq, barcodeInfoList, callback}) {
    const inputRef = useRef()
    const [barcodeValue, setBarcodeValue] = useState()
    const [errMsg, setErrMsg] = useState()
    useEffect(() => {
        inputRef.current.focus()
    }, [])
    // const onHandleChange = async (e) => {
    //     let barcode = e.target.value
    //     setBarcodeValue(barcode)
    //
    //     //옥천은 19자리로 진행.
    //     if (barcode.length === 19) {
    //
    //         //DB 호출하여 정보 리턴
    //         const {status, data} = await producerReplaceOrderCheck(orderSeq, barcode)
    //         console.log(data)
    //
    //         if (status === 200) {
    //             if ([-1, 1].includes(data.resCode)) {
    //                 setErrMsg(data.errMsg)
    //                 inputRef.current.select()
    //                 return
    //             }
    //
    //             callback(orderSeq, JSON.parse(data.retData))
    //         }
    //
    //         //다시 찍도록 클리어
    //         inputRef.current.value = '';
    //     }
    // }

    const onHandleKeyPress = async e => {
        const barcode = e.target.value
        console.log({barcode: barcode})

        if (e.key === 'Enter') {

            //바코드 중복이면..
            if (isDuplicatedBarcode(barcode)) {



                //중복된 바코드
                callback({action: 'duplicated', data: {barcode: barcode}})
            }else {
                //DB 호출하여 정보 리턴
                const {status, data: errorRes} = await producerReplaceOrderCheck(orderSeq, barcode)
                console.log(errorRes)

                if (status === 200) {
                    //에러
                    if ([-1, 1].includes(errorRes.resCode)) {
                        setErrMsg(errorRes.errMsg)
                        inputRef.current.select()
                        return
                    }

                    console.log(errorRes.retData)
                    //{"optionName":"노각 1개","optionPrice":4000,"optionIndex":0,"producerNo":157,"localfoodFarmerNo":28,"localFarmerName":"[옥]이선미"}


                    const data = JSON.parse(errorRes.retData)

                    //db 값 + 프론트에서 값 추가
                    data.orderSeq = orderSeq
                    data.barcode = barcode
                    data.barcodeOrderCount = 1

                    //성공
                    callback({action: 'success', data})


                }
            }
            //다시 찍도록 클리어
            inputRef.current.value = "";

            setErrMsg(null)
        }
    }

    const isDuplicatedBarcode = (barcode) => {
        //중복 된 바코드라면
        if (barcodeInfoList.findIndex(barcodeInfo => barcodeInfo.barcode === barcode) > -1) {
            return true;
        }
        //중복안됨
        return false;
    }


    return <div style={{marginBottom: 10}}>
        {/* onChange 는 state 업데이트 된 이후 바인딩 되기 때문에 ref.current.value 와 동기화가 되지 않아 이상현상 발생 됨 */}
        {/*<Input ref={inputRef} type='number' block  placeholder={'클릭 후 바코드스캔'} value={barcodeValue} onChange={onHandleChange}/>*/}
        <Input ref={inputRef} type='search' block bc={errMsg ? 'danger' : 'secondary'} placeholder={'클릭 후 바코드스캔'} onKeyPress={onHandleKeyPress} />
        {errMsg && <Div fg={'danger'} mt={5}>[에러] {errMsg}</Div>}
    </div>
}
export default BarcodeInput