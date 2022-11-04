import axios from 'axios'

// tMap 구주소 => 도로명 주소 변경 조회 API
/*
    // {reqAdd: 상도동 210-133} 으로 요청한 리턴 결과
    {
        "ConvertAdd": {
            "resCount": "1",
            "resMulti": "S",
            "reqAddress": "",
            "upperDistCode": "11",
            "upperDistName": "서울",                 //중요
            "middleDistCode": "590",
            "middleDistName": "동작구",               //중요
            "legalLowerDistCode": "102",
            "legalLowerDistName": "상도동",           //중요
            "legalDetailCode": "00",
            "legalDetailName": "",
            "adminLowerDistCode": "560",
            "adminDistName": "상도동",
            "primary": "210",                       //중요
            "secondary": "133",                     //중요
            "mlClass": "1",
            "oldLat": "37.49843368",
            "oldLon": "126.94224847",
            "newAddressList": {
                "newAddress": [
                    {
                        "newLat": "37.49840591",
                        "newLon": "126.94227625",
                        "roadName": "양녕로25나길",        //[도로명] 중요
                        "bldNo1": "13",                 //[도로명] 중요
                        "bldNo2": "0",
                        "roadId": "00721"
                    }
                ]
            }
        }
    }

    //사용법
    const {status, data} = await convertToRoadAddress({reqAdd: orderSubGroup.addr})
    const {upperDistName, middleDistName, newAddressList} = data.ConvertAdd
    if (newAddressList.newAddress.length > 0) {
        const newAddress = newAddressList.newAddress[0]
        //변환된 도로명 주소
        const roadAddr = `${upperDistName} ${middleDistName} ${newAddress.roadName} ${newAddress.bldNo1}`
    }

 */
export const convertToRoadAddress = ({
                                         version =  1,
                                         searchTypCd = 'OtoN',
                                         reqAdd = '', //구주소 입력
                                         reqMulti = 'S',
                                         resCoordType = 'WGS84GEO'
                                     }) => axios(`https://apis.openapi.sk.com/tmap/geo/convertAddress`, {
    method: "get",
    params: {version, searchTypCd, reqAdd, reqMulti, resCoordType, appKey: 'l7xxc045d7b9c14b4ce6948f9178e99821bf'},
    headers: {Accept: 'application/json', appKey: 'l7xxc045d7b9c14b4ce6948f9178e99821bf'},
})