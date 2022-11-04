import moment from 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import Compressor from 'compressorjs'
import queryString from 'query-string'
import MobileDetect from 'mobile-detect'
import cloneDeep from "lodash/cloneDeep"; //lodash 전체 라이브러리를 가져오던 초기 호출 방식을 변경 필요한 메서드만 가져옴
import { Server } from '~/components/Properties'
import axios from 'axios'
import {getAbuser, checkMultiGifts} from "~/lib/shopApi";
import {Span} from "~/styledComponents/shared";
import React from "react";
import {Webview} from "~/lib/webviewApi";
import {doKakaoLogin, getLoginUser} from "~/lib/loginApi";
import {ModalBody} from "reactstrap";
import {TYPE_OF_IMAGE} from '~/lib/bloceryConst'
export default class ComUtil {

    /*******************************************************
     이유: Object.assign()에게도 한가지 문제점이 있는데요.
     복사하려는 객체의 내부에 존재하는 객체는 완전한 복사가 이루어지지않는다는 점
     # Object 객체 복사 (lodash.cloneDeep 이용) :: Deep Clone
     ex) let 복사할 변수 =  ComUtil.objectAssign(복사할 오브젝트);
     *******************************************************/
    static objectAssign(obj){
        return cloneDeep(obj);
    }

    /*******************************************************
     두날짜 비교해서, 같은지 작은지 큰지 return
     @Param : sDate 일자(yyyy-mm-dd) : String
     @Return :
     -1: sDate1 < sDate2
     0 : sDate1 == sDate2
     1 : sDate1 > sDate2
     *******************************************************/
    static compareDate(sDate1, sDate2) {

        let date1 = this.getDate(sDate1);
        let date2 = this.getDate(sDate2);

        let dt1 = ((date1.getTime()/3600000)/24);
        let dt2 = ((date2.getTime()/3600000)/24);

        if (dt1 === dt2) return 0;
        if (dt1 < dt2) return -1;
        else return 1;
    }

    static getDate(strDate){
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);

        return new Date(pYear, pMonth, pDay);
    }

    static yyyymmdd2DateStr(yyyymmdd) {
        const strYYYYMMDD = yyyymmdd.toString();
        let pYear 	= strYYYYMMDD.substr(0,4);
        let pMonth 	= strYYYYMMDD.substr(4,2);
        let pDay 	= strYYYYMMDD.substr(6,2);
        return pYear + '-'  + pMonth + '-' + pDay;
    }
    /*******************************************************
     날짜 연산 함수 - 날짜 더하기 빼기
     예) addDate('2019-01-05', 5) =>  returns 2019-01-10
     addDate('2019-01-06', -5) =>  returns 2019-01-01
     */
    static addDate(strDate, date) {
        let inputDate = this.getDate(strDate);

        inputDate.setDate( inputDate.getDate() + date);

        let returnDate = inputDate.getFullYear() + '-' + this.zeroPad(inputDate.getMonth() + 1) + '-' + this.zeroPad(inputDate.getDate())

        //console.log(returnDate);
        return returnDate;

    }

    /*******************************************************
     INT 날짜타입 => String 변환
     @Param : intDate, formatter
     @Return : yyyy-MM-dd (formatter 형식에 맞게 반환)
     *******************************************************/
    static longToDateTime(intDate, formatter) {
        let strDate = intDate.toString();
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);
        let pHour   = dateTo.substr(8,2);
        let pMin    = dateTo.substr(10, 2);
        let pSec    = dateTo.substr(12, 2);

        const vDate = new Date(pYear, pMonth, pDay, pHour, pMin, pSec);

        const format = formatter ? formatter : "YYYY-MM-DD HH:mm:ss";

        const utcDate = moment(vDate);
        return utcDate.tz(moment.tz.guess()).format(format);
    }

    /*******************************************************
     INT 날짜타입 => Moment 변환
     @Param : intDate
     @Return : moment
     *******************************************************/
    static intToDateMoment(intDate) {

        let strDate = intDate.toString();
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);

        const vDate = new Date(pYear, pMonth, pDay);

        const utcDate = moment(vDate);
        return utcDate.tz(moment.tz.guess());
    }

    /*******************************************************
     LONG 날짜타입 => Moment 변환
     @Param : longDate
     @Return : moment
     *******************************************************/
    static longToDateMoment(longDate) {

        let strDate = longDate.toString();
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);
        let pHour 	= dateTo.substr(8,2);

        const vDate = new Date(pYear, pMonth, pDay, this.toNum(pHour));

        const utcDate = moment(vDate);
        return utcDate.tz(moment.tz.guess());
    }

    /*******************************************************
     INT 날짜타입 => String 변환
     @Param : intDate, formatter
     @Return : yyyy-MM-dd (formatter 형식에 맞게 반환)
     *******************************************************/
    static intToDateString(intDate, formatter) {
        if (intDate===0) return '-'

        let strDate = intDate.toString();
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);

        const vDate = new Date(pYear, pMonth, pDay);

        const format = formatter ? formatter : "YYYY-MM-DD";

        const utcDate = moment(vDate);
        return utcDate.tz(moment.tz.guess()).format(format);
    }

    /*******************************************************
     UTC 날짜타입 => String 변환
     @Param : utcTime, formatter
     @Return : yyyy-MM-dd (formatter 형식에 맞게 반환)
     *******************************************************/
    static utcToString(utcTime, formatter) {

        if (!utcTime)
            return null

        const format = formatter ? formatter : "YYYY-MM-DD";

        const utcDate = moment(utcTime);
        return utcDate.tz(moment.tz.guess()).format(format)
    }

    /*******************************************************
     UTC 날짜타입 => number로 변환 [비교 및 sorting용도]
     @Param : utcTime, formatter
     @Return : (long-type) seconds.
     ******************************************************/
    static utcToTimestamp(utcTime) {

        const utcDate = moment(utcTime);
        //console.log('utcToTimestamp:', utcTime, utcDate.unix());
        return utcDate.unix();
    }

    /*******************************************************
     날짜 및 시간-10보다 작은 숫자 호출시 앞에 0 format
     @Param : number
     @Return : number
     *******************************************************/
    static zeroPad(number) {
        if (number < 10) return '0' + number;
        else return number;
    }

    /**
     * 현재시간을 UTCTime으로 가져오기
     */
    static getNow(serverDate) {
        if(serverDate){
            return new Date(serverDate).getTime();
        }
        return new Date().getTime();
    }

    /*******************************************************
     날짜 포맷 세팅
     @Param : time
     @Return : yyyy-MM-ddThh:mm:00(년-월-일T시간:분:초)
     *******************************************************/
    static setDate(time) {
        let date = new Date();
        //return date.getFullYear() + '-' + this.zeroPad(date.getMonth() + 1) + '-' + this.zeroPad(date.getDate()) + 'T' + time + ":00";
        const localDate = date.getFullYear() + '-' + this.zeroPad(date.getMonth() + 1) + '-' + this.zeroPad(date.getDate()) + 'T' + time + ":00";

        return moment.tz(localDate, moment.tz.guess()).format()
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    static getCellStyle = ({cellAlign,color,textDecoration,whiteSpace,fontWeight}) => {
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }

    /*******************************************************
     숫자 및 문자(숫자)에 comma 추가
     [잘못된 값 이외엔 항상 0 이상을 반환 하는 함수]  (2022.3.14 음수도 적용가능)
     @Param : 1234567
     @Return : 1,234,567
     *******************************************************/
    static addCommas(value) {
        //숫자로 변환 불가능한 잘못된 값일 경우 null로 리턴 하도록 함
        if((typeof value !== 'number' && !value) || isNaN(value)){
            return null;
        }
        return ComUtil.toNum(value).toLocaleString(undefined, {maximumFractionDigits : 20})
    }
    /*******************************************************
     string, number 판별 후 숫자가 아닌 잘못 된 값이면 0, 올바른 값이면 숫자변환
     [계산시 에러가 나지 않도록 항상 숫자로만 리턴하는 함수]
     @ex :
     가나abc304100마바사 => 304100
     '6,700' => 6700
     undefined => 0
     'undefined' => 0
     null => 0
     @Param : number or string(숫자)
     @Return : number
     *******************************************************/
    static toNum(value, isParsingNumber = true) {
        try{
            let removedValue = value.toString().replace(/\,/g,'')     //콤마제거
            removedValue = removedValue.replace(/\s/gi, '');			//공백제거
            //계산 가능한 숫자인지 판별
            if(isNaN(removedValue) || removedValue === '')
                return 0
            else {
                if (isParsingNumber)
                    return parseFloat(removedValue)
                else
                    return removedValue
            }
        }catch(e){
            return 0
        }
    }

    /*******************************************************
     금액 형식으로 리턴
     [값이 0 보다 작으면 '' 반환]
     @Param : 304100
     @Return :304,100
     *******************************************************/
    static toCurrency(value) {
        const number = ComUtil.toNum(value)
        if(number >= 0)
            return ComUtil.addCommas(number)
        else {
            return ''
        }
    }

    /*******************************************************
     Eth 금액 형식으로 리턴
     [값이 0 보다 작으면 '' 반환]
     @Param : 304100.121111
     @Return :304,100.12
     *******************************************************/
    static toEthCurrency(value) {
        const number = ComUtil.toNum(value)
        // 소수점 2 째 자리까지 표현
        const ethNumber = ComUtil.roundDown(number,2);
        if(ethNumber >= 0)
            return ComUtil.addCommas(ethNumber)
        else {
            return ''
        }
    }

    /*******************************************************
     Integer 금액 형식으로 리턴 (소수점자리 버림)
     [값이 0 보다 작으면 '' 반환]
     @Param : 304100.111
     @Return :304,100
     *******************************************************/
    static toIntegerCurrency(value) {
        const number = ComUtil.toNum(value)
        // 소수점 2 째 자리까지 표현
        const intNumber = ComUtil.roundDown(number,0);
        if(intNumber >= 0)
            return ComUtil.addCommas(intNumber)
        else {
            return ''
        }
    }


    /*******************************************************
     시간에 분 추가
     @Param : dt, minutes
     @Return :
     *******************************************************/
    static addMinutes(dt, minutes) {
        return new Date(dt.getTime() + minutes*60000)
    }

    /*******************************************************
     이미지 파일을 받아 압축율을 적용 (안씀 버그있음 샘플의 이미지업로드 에서만 사용중)
     @Param : { file, opacity }
     @Return : file
     *******************************************************/
    static imageCompressor({file, quality, callback}) {
        return new Compressor(file, {
            quality: !quality && 0.6,       //압축률
            convertTypes: ['image/webp'],
            success(result) {
                const formData = new FormData();
                formData.append('file', result, result.name);
                callback(formData)
            },
            error(err) {
                console.log(err.message);
            },
        }).file;
    }

    /*******************************************************
     이미지 압축
     @Param : file, quality(압축률[0.6 추천])
     @Return : file
     *******************************************************/
    static getCompressoredFile = (file, quality = 0.6) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: quality,
                convertTypes: ['image/webp'],
                success: async (result) => {
                    resolve(result)
                },
                error(err) {
                    console.log(err.message);
                    reject(err)
                },
            });
        })
    }

    /*******************************************************
     배송시작일 표시용 날짜 포맷
     @Param : yyyy-MM-dd(date)
     @Return : MM/dd(요일)
     *******************************************************/
    static simpleDate(date) {
        var week = ['일', '월', '화', '수', '목', '금', '토'];
        var dayOfWeek = week[new Date(date).getDay()];
        return date.substring(5,7) + '/' + date.substring(8,10) + '(' + dayOfWeek + ')';
    }

    /*******************************************************
     밸리데이션용 함수(밸리데이션 체크에 걸렸을 경우 alert()을 띄워주며 걸린 키와 함께 결과값을 반환 합니다)
     @Param : 검증할 object, 밸리데이션 체크 해야할 키 Array(key, msg)
     @Return : {result: true or false, inavlidKey: '밸리데이션 체크에 걸린 키'}
     @Usage :

     const data = {name:'jaden', age: null, cell: '010-6679-0080'};

     const validArr = [
     {key: 'name', msg: '성명'},
     {key: 'age', msg: '나이'}
     ]

     validate(data, validArr)
     *******************************************************/
    static validate(data, validationArr) {

        let invalidKey;
        let result = true;

        for (let i = 0; i < validationArr.length; i++) {
            const vObj = validationArr[i];
            const key = vObj.key;

            //console.log(key in data);

            if (key in data === false) {
                console.log(`${key} 는 data 필드에 에 없습니다.`);
                invalidKey = key;
                result = false;
                break;
            }

            const value = data[key];

            if (!value) {
                alert(vObj.msg + '를 입력해 주세요');
                invalidKey = key;
                result = false;
                break;
            }

            let type = typeof value;

            if (type === 'string') {
                if (value.length <= 0) {
                    alert(vObj.msg + '를 입력해 주세요')
                    invalidKey = key;
                    result = false;
                    break;
                }
            }
            else if (type === 'number') {
                if (value <= 0) {
                    alert(vObj.msg + '를 입력해 주세요')
                    invalidKey = key;
                    result = false;
                    break;
                }
            }
            else if (type === 'object') {
                if (Array.isArray(value)) {
                    if (value.length <= 0) {
                        alert(vObj.msg + '를 입력해 주세요')
                        invalidKey = key;
                        result = false;
                        break;
                    }

                }
            }
        }
        return {result: result, inavlidKey: invalidKey};
    }

    /*******************************************************
     오브젝트의 attribute들의 value들을 copy,
     @Param : target - 타겟 오브젝트, copy가 필요한 attribute가 존재해야 함
     source - 소스 오브젝트
     *******************************************************/
    static objectAttrCopy(target, source) {
        for (let key in target) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];  //value만 copty
            }
        }
    }

    /*******************************************************
     email 확인 정규식(ㅁㅁㅁ@ㅁㅁㅁ.co.kr/com 형식)
     @Param : (string)
     @Return : true/false
     *******************************************************/
    static emailRegex(email) {
        if (email && (email.indexOf(',') > 0 || email.indexOf(' ') > 0)) { //콤마, 빈칸 방어.
            return false;
        }
        var emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

        return emailRule.test(email)
    }

    /*******************************************************
     valword 형식 확인 정규식(8~16자 영문자, 숫자, 특수문자 필수포함)
     @Param : (string)
     @Return : true/false
     *******************************************************/
    static valwordRegex(valword) {
        var valRule = /^.*(?=^.{8,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+*=]).*$/;

        return valRule.test(valword)
    }

    /*******************************************************
     숫자만 입력 정규식
     @Param : Number
     @Return : true/false
     *******************************************************/
    static onlyNumber(number) {
        var onlyNumber = /[^0-9]/g;

        return !onlyNumber.test(number)
    }

    /*******************************************************
     전화번호 입력 정규식
     @Param : Number
     @Return : 전화번호 유형별 정규식
     *******************************************************/
    static phoneRegexChange(phone) {
        console.log(phone)
        if (phone.length == 9) {                     // 02-000-0000
            var phoneNo = phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (phone.length == 10) {
            if (phone.indexOf('02') == 0) {          // 02-0000-0000
                var phoneNo = phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            } else {                                // 031-000-0000
                var phoneNo = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            }
        } else {                                    // 핸드폰 번호 및 031-0000-0000
            var phoneNo = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        return phoneNo;
    }

    /*******************************************************
     쿼리스트링을 파상하여 object 로 반환
     @Param : props
     @Return : object
     *******************************************************/
    static getParams(props) {
        return queryString.parse(props.location.search)
    }

    /*******************************************************
     url + 쿼리스트링으로 만들어 리턴
     @Param : pathnames, object
     @Return : url
     *******************************************************/
    static makeQueryStringUrl(pathname, params) {
        return  pathname + '?' + new URLSearchParams(params).toString()
    }

    /*******************************************************
     현재부터 미래 날짜 사이의 시간차를 구하여 포맷에 맞게 반환
     @Param : Number(Millisecond), string
     @Return : string
     *******************************************************/
    static setupDone = false;

    static getDateDiffTextBetweenNowAndFuture(date, formatter){

        if (!this.setupDone) { //duration을 formatting 하기위한 plugin초기화.
            momentDurationFormatSetup(moment);
            this.setupDone = true;
        }

        const format = formatter || 'DD[일] HH[시] mm[분] ss[초]';
        let future  = moment(date);
        const now = moment();

        const length = moment.duration( future.diff(now)).format(format).length

        let result
        if(length === 8) {
            result = moment.duration( future.diff(now)).format(format).slice(0,6) + "00:00:" + moment.duration( future.diff(now)).format(format).slice(6,8)
        } else {
            result = moment.duration( future.diff(now)).format(format)
        }

        return result

        //month Diff는 자동으로 되지않아서, 별도로 추가.
        //const monthDiff = moment.utc(moment(future,"YYYY-MM-DD").diff(moment(now,"YYYY-MM-DD"),'months'));

        //monthDiff가 1개월 이상이면  now에 Month를 더해서 비교 - Number()함수 꼭필요.
        // return ((monthDiff > 0)? monthDiff+'개월 ' + moment.duration( future.diff(moment().add(Number(monthDiff),'M'))).format(format)
        //     : ''+ moment.duration( future.diff(now)).format(format) );
    }

    /*******************************************************
     array object 를 정렬하여 반환
     @Param : array object, date Type(정렬 할 key), bool(desc 여부)
     @Return : rowData 자체를 바꿔서 다시 return.(return 없다고 봐도 됨)
     *******************************************************/
    static sortDate = (rowData, key, isDesc) => {

        if (!rowData || rowData.length <= 0)
            return []

        return rowData.sort((a, b) => {
            const aVal = ComUtil.utcToTimestamp(a[key]);
            const bVal = ComUtil.utcToTimestamp(b[key]);

            if (isDesc)
                return bVal - aVal;
            else
                return aVal - bVal;
        })
    }

    /*******************************************************
     array object 를 숫자키를 이용해 정렬하여 반환
     @Param : array object, number(정렬 할 key), bool(desc 여부)
     @Return :  rowData 자체를 바꿔서 다시 return. (return 없다고 봐도 됨)
     *******************************************************/
    static sortNumber = (rowData, key, isDesc) => {

        return rowData.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (isDesc) {
                return Number(bVal) - Number(aVal);
            }
            else {
                return Number(aVal) - Number(bVal);
            }
        })
    }

    /**
     * 현재 환경이 모바일 App(React Native App)일 때, true 반환
     */
    static isMobileApp() {
        if (navigator.userAgent.startsWith('BloceryApp')) {
            return true;
        }
        return false;
    }

    //android만 체크..
    static isMobileAppAndroid() {
        if (navigator.userAgent.startsWith('BloceryAppQR-Android')) {
            return true;
        }
        return false;
    }

    static isMobileAppIos() {
        if (navigator.userAgent.startsWith('BloceryAppQR-iOS')) {
            return true;
        }
        return false;
    }

    /**
     * 현재 환경이 모바일 App-iOS 이면서 apple사의 검수중일때 kakaoLogin방지용.(애플에서 카카오로그인 하려면 apple로그인도 해야한다고 202004월부터 정책)
     */
    static isMobileAppIosAppleReivew() {
        // alert(navigator.userAgent);

        // if (navigator.userAgent.startsWith('BloceryAppQR-iOS')) {  //test code
        if (navigator.userAgent.startsWith('BloceryAppQR-iOS-apple')) { //real code
            return true;
        }
        return false;
    }

    /**
     * 현재 환경이 모바일 App(React Native App)이고 QR이 지원되는 경우에만 true 반환
     * (android, ios 모두 가능)
     */
    static isMobileAppAndQrEnabled() {
        if (navigator.userAgent.startsWith('BloceryAppQR')) {
            return true;
        }
        return false;
    }

    /**
     * 현재 환경이 모바일 Web일 때, true 반환
     */
    static isMobileWeb() {
        if (this.isPcWeb() || this.isMobileApp()) {
            return false;
        }
        return true;
    }

    /**
     * 현재 환경이 IOS 모바일 Web일 때, true 반환
     */
    static isMobileWebIos() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
    }

    static delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }

    /**
     * 현재 환경이 PC용 웹브라우저일 때, true 반환 -> 생산자쪽에서 화면을 크게 그리는데 사용
     */
    static isPcWeb() {
        if (this.isMobileApp())
            return false;
        //console.log(navigator.userAgent);
        let md = new MobileDetect(navigator.userAgent);
        //console.log(md.mobile());

        if (!md.mobile()) //mobile이 아니면 PcWeb으로 인식.
            return true;

        return false; //mobile 브라우저
    }

    /**
     * 현재 환경이 PC용 IE웹브라우저일 때, true 반환: 첫페이지에서 IE미지원용도
     */
    static isIeBrowser() {
        if (!this.isPcWeb()) {
            return false;
        }

        let agent = navigator.userAgent.toLowerCase();

        if( navigator.appName == 'Netscape' && navigator.userAgent.indexOf('Trident') != -1 || (agent.indexOf("msie") != -1)) {
            console.log("Internet Explorer 브라우저입니다.");
            return true;
        }

        return false; //mobile 브라우저
    }
    /*******************************************************
     소수점 자리수 버림
     @Param : number, midPointRoundingNumber(소수점 자릿수)
     @Return : number
     *******************************************************/
    static roundDown(number, midPointRoundingNumber=0){
        return this.decimalAdjust('floor', number, midPointRoundingNumber * (-1));
    }

    static decimalAdjust(type, value, exp){
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    /*******************************************************
     배열 숫자 합계
     @Param : number
     @Return : number
     *******************************************************/
    static sum(arr, key){
        let val = 0;
        arr.map(x => val += parseFloat(x[key]) || 0)
        return val;
    }

    /*******************************************************
     월별 마지막 일자 구하기
     @Param : month
     @Return : dd(28, 30, 31)
     *******************************************************/
    static lastDay(month) {
        var dd;     // 월별 말일
        if(month === 2) {
            dd = 28  //TODO add 29
        } else if (month === 4 || month === 6 || month === 9 || month === 11) {
            dd = 30
        } else {
            dd = 31
        }
        return dd;
    }

    /*******************************************************
     정산 기간 조회
     @Param : year, month
     @Return : yyyy.MM.01~yyyy.MM.dd
     *******************************************************/
    static payoutTerm(year, month) {
        var dd;     // 월별 말일
        if(month === 2) {
            dd = 28  //TODO add 29
        } else if (month === 4 || month === 6 || month === 9 || month === 11) {
            dd = 30
        } else {
            dd = 31
        }
        return year+'.'+month+'.01~'+year+'.'+month+'.'+dd
    }

    /*******************************************************
     정산 지급일(예정일) 조회 - 매달 마지막 날 기준 5영업일 후
     @Param : date
     @Return : yyyy.MM.dd
     *******************************************************/
    static payoutDate(date) {
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var expectDate;

        // 전월 마지막 날짜 구하기
        var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        var lastDayOfMonth = new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1));

        var week = ['일', '월', '화', '수', '목', '금', '토'];
        var dayOfweek = week[new Date(lastDayOfMonth).getDay()];

        if(dayOfweek === '일') {
            expectDate = '05';
        } else if(dayOfweek === '토') {
            expectDate = '06';
        } else {
            expectDate = '07';
        }

        return year + '.' + month + '.' + expectDate;
    }

    /*******************************************************
     현재시간과의 차이 리턴.
     @Param : datte
     @Return : 2시간전 1일전 1달전 1년전 등.
     *******************************************************/
    static timeFromNow(targetTime) {

        if (!this.setupDone) { //duration을 formatting 하기위한 plugin초기화.
            momentDurationFormatSetup(moment);
            this.setupDone = true;
        }
//moment.duration(future.diff(now)).format(format);

        const past  = moment(targetTime);
        const now = moment();

        const yearDiff = moment.duration(now.diff(past)).format('Y')
        // if (yearDiff > 0) return yearDiff + '년 전';

        const monthDiff = moment.duration(now.diff(past)).format('M')
        // if (monthDiff > 0) return monthDiff + '달 전';

        const dayDiff = moment.duration(now.diff(past)).format('D')
        if (yearDiff > 0 || monthDiff > 0 || dayDiff > 7)
            return ComUtil.utcToString(targetTime);

        if (dayDiff > 0) return dayDiff + '일 전';

        const hourDiff = moment.duration(now.diff(past)).format('H')
        if (hourDiff > 0) return hourDiff + '시간 전';

        const minDiff = moment.duration(now.diff(past)).format('m')
        if (minDiff > 0)
            return minDiff + '분 전';
        else
            return '방금 전';
    }

    //간단한 암호화 - 비번저장용
    static encrypt(str) {   //입력이 length=7자리 정도는 된다고 보면  'ABCDEFG'

        if (!str || str.length < 4) {
            console.log("============ Valword ERROR: " + str);
            return '';
        }
        //ascii값에 (index+1)더하기.   A+1, B+2, C+3..  G+7
        let rotatedStr = '';
        for (let i = 0; i < str.length; i ++) {
            rotatedStr = rotatedStr + String.fromCharCode(str.charCodeAt(i) + ( i +1 ))
        }
        //로테이션 시키고    //중간에 양념넣기
        let randomDigit = str.length % 10; //한자리
        let tempStr = '0xe' + randomDigit + rotatedStr.substring(3) + 't0n3' + rotatedStr.substring(0,3);  //(4) + 4 + (4) +[3] : DEFG + TEMP + ABC
        return tempStr;

    }

    //간단한 복호화 - 비번복호용
    static decrypt(tempStr) {  //length:11
        let str = '';
        //양념빼면서 로테이션 해제  //3+4로 복귀
        if(tempStr && tempStr.length > 0) {
            let rotatedStr = tempStr.substring(tempStr.length - 3) + tempStr.substring(4, tempStr.length - 7); //뒤 + 앞.
            for (let i = 0; i < rotatedStr.length; i++) {
                str = str + String.fromCharCode(rotatedStr.charCodeAt(i) - (i + 1));
            }
        }
        return str;
    }

    //max 10개로 cookie에서 관리.
    static saveLastSeenGoods(goodsId) {

        //TEST_CODE localStorage.removeItem('lastSeenGoods')

        let list = this.getLastSeenGoodsList();

        //이미 존재하면 미추가.
        if (list.includes(goodsId)) {
            console.log('lastSeenGoods', goodsId)
            return;
        }

        const MAX_SEEN = 15;

        //list가 15개 넘으면 앞에꺼 제거.
        if (list.length >= MAX_SEEN) {
            //list.unshift();
            list.splice(MAX_SEEN-1, list.length - (MAX_SEEN-1));
        }
        list.splice(0,0,goodsId)

        localStorage.setItem('lastSeenGoods', JSON.stringify(list));
    }

    static getLastSeenGoodsList() {

        let cookieList = localStorage.getItem('lastSeenGoods');
        if (!cookieList) return [];

        let list = JSON.parse(cookieList);

        return list;
    }

    static noScrollBody(){
        console.log('overflow = hidden')
        let body = document.body
        body.style.overflow = 'hidden'
    }
    static scrollBody(){
        console.log('overflow = auto')
        let body = document.body
        body.style.overflow = 'auto'
    }

    static getGroupKeys(arr, groupKey) {
        const keys = [];

        arr.map(item => {
            if (keys.indexOf(item[groupKey]) === -1) {
                keys.push(item[groupKey]);
            }
        })
        return keys;
    }
    //랜덤 array 적용템
    static shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // 랜덤 아이
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // 섞기 (랜덤으로 뽑은 아이템과 currentIndex 를 swap)
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /*******************************************************
     이미지파일 서버 업로드
     @Param : file
     @Return : Image (Back-end dbdata 참조)
     *******************************************************/
    static editorUploadFile = async (file) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            // The third parameter is required for server
            formData.append('image', file, file.name);

            const method = '/contentImgFile';

            //서버에 파일 업로드
            axios(Server.getRestAPIFileServerHost() + method, {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            }).then((result) => {
                resolve(result.data)
            })
        })
    }
    /*******************************************************
     소수점자리수 8자까지만 허용하고 리턴하 bly 전용 함수
     @Param : number or string
     @Return : number or null
     *******************************************************/
    static getBlyNumber(value) {
        let newValue = ComUtil.toNum(value, false)
        newValue = (newValue.toString()).substring(0, newValue.toString().indexOf('.')+(8+1));

        // newValue = newValue.toString()

        // newValue = ComUtil.roundDown(newValue, 8)

        // const splitNewValue = newValue.split('.')
        //
        // if(splitNewValue.length >= 2) {
        //     console.log(splitNewValue[1].length)
        //     // if (splitNewValue[1].length > 8) {
        //     //     newValue = ComUtil.roundDown(parseFloat(newValue), 8)
        //     newValue = parseFloat(newValue)
        //     // }
        // }

        if (parseFloat(newValue) <= 0) {
            return '';
        }else{
            return newValue
        }
    }

    static doubleAdd(a, b) {
        return (ComUtil.toNum(a) + ComUtil.toNum(b)).toFixed(2);
    }

    static doubleSub(a, b) {
        return (ComUtil.toNum(a) - ComUtil.toNum(b)).toFixed(2);
    }
    static doubleMultiple(a, b) {
        return  ComUtil.roundDown(ComUtil.toNum(a) * ComUtil.toNum(b),2);
    }

    static doubleDivide(a, b) {
        return ComUtil.roundDown(ComUtil.toNum(a) / ComUtil.toNum(b), 2);
    }

    static getFirstImageSrc(images, type) {

        if (images && images.length > 0) {
            const image = images[0]
            let imageTypeUrl = Server.getThumbnailURL();
            if(type === TYPE_OF_IMAGE.SQUARE){
                imageTypeUrl = Server.getThumbnailURL('square');
            } else if(type === TYPE_OF_IMAGE.SMALL_SQUARE){
                imageTypeUrl = Server.getThumbnailURL('small');
            } else if(type === TYPE_OF_IMAGE.WIDE){
                imageTypeUrl = Server.getThumbnailURL('wide');
            } else if(type === TYPE_OF_IMAGE.IMAGE){
                imageTypeUrl = Server.getImageURL();
            }
            const src = imageTypeUrl + image.imageUrl;
            return src
        }
        return null//'https://askleo.askleomedia.com/wp-content/uploads/2004/06/no_image-300x245.jpg'
    }

    static getRandomProfileImg() {
        let randomProfiles = ["3Ux7NZBnXYaz.png", "f5Uln8dvqco3.png", "C9axO5iq20OK.png", "MngRyTqvloIv.png", "OwKul6R8PWH3.png", "PtMbgsQ5jVtH.png"]

        let randomIndex = Math.floor(Math.random() * 10) % 6;
        return Server.getImageURL() + randomProfiles[randomIndex]
    }

    static encodeInviteCode(consumerNo) {
        //cobak하드코딩
        if (consumerNo == 21530) {
            return 'AAAAA'; //코박유저 하드코딩
        }

        let hex = consumerNo.toString(16);

        while (hex.length < 5) { //총 5자리코드
            hex = '0' + hex;
        }
        return 'CM' + hex.toUpperCase();
    }

    static decodeInviteCode(inviteCode) {
        if (!inviteCode) return 0; //에러방지. 0은 없는 회원으로 취급.

        if (inviteCode.toUpperCase() === 'AAAAA' ) {
            return 21530; //코박유저 하드코딩
        }

        // isoj333 등이 들어가면 NaN 발생으로 방어코드 추가
        let consumerNo = parseInt(inviteCode.substring(2), 16);
        if(consumerNo === NaN){
            return 0;
        }

        return consumerNo;
    }

    static execCopy(text, successMsg, failedMsg) {
        return new Promise((resolve) => {

            const fallbackCopyTextToClipboard = (text) => {
                let textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.top = 0;
                textArea.style.left = 0;
                textArea.style.position = "fixed";

                // document.body.appendChild(textArea);
                document.body.prepend(textArea);

                textArea.readOnly = true;
                // focus() -> 사파리 브라우저 서포팅
                textArea.focus();
                // select() -> 사용자가 입력한 내용을 영역을 설정할 때 필요
                textArea.select();

                try{

                    let successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return successful

                }catch (err) {
                    return false
                }
            }

            if (!navigator.clipboard) {
                resolve(fallbackCopyTextToClipboard(text));
            }
            // (IE는 사용 못하고, 크롬은 66버전 이상일때 사용 가능합니다.)
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    // alert("코드가 복사되었습니다");
                    resolve(true)
                })
                .catch(err => {
                    // This can happen if the user denies clipboard permissions:
                    resolve(fallbackCopyTextToClipboard(text));
                });
        })
    }

    static async copyTextToClipboard(text, successMsg, failedMsg) {
        const isCopied = await this.execCopy(text)
        console.log({isCopied})
        if (isCopied && successMsg) {
            alert(successMsg)
        }else{
            if (failedMsg)
                alert(failedMsg)
        }

        return isCopied
    }

    static async isBlockedAbuser() {

        const {data: abuser} = await getAbuser()

        if (!abuser)
            return false

        if (abuser && abuser.blocked) {
            const userMessage = abuser.userMessage ? abuser.userMessage : '어뷰징 유사 사례로 판단되어 자동 차단 되었습니다. 고객센터 메일 cs@blocery.io 로 문의 부탁 드립니다.'
            alert(userMessage)
            return true;
        }
        return false;
    }

    static async isMultiGifts() {
        const {data:check} = await checkMultiGifts();
        return check;
    }

    static millisecondsToMinutesSeconds(ms) {
        let duration = moment.duration(ms, 'milliseconds');
        let fromMinutes = Math.floor(duration.asMinutes());
        let fromSeconds = Math.floor(duration.asSeconds() - fromMinutes * 60);

        return Math.floor(duration.asSeconds()) >= 60 ? (fromMinutes<= 9 ? '0'+fromMinutes : fromMinutes) +':'+ (fromSeconds<= 9 ? '0'+fromSeconds : fromSeconds)
            : '00:'+(fromSeconds<= 9 ? '0'+fromSeconds : fromSeconds);

    };

    //배열의 해당 인덱스에 새로운 값 추가
    static replaceItemAtIndex(arr, index, newValue) {
        return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
    }

    //배열의 해당 인덱스의 값 제거
    static removeItemAtIndex(arr, index) {
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
    }


    static secureEmail(email) {
        const secureEmail = email.split('@');   // @를 기준으로 string 분할
        return `${secureEmail[0].substring(0, 3)}***@${secureEmail[1]}`
    }

    static csvToArray(strData, strDelimiter){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        const objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        const arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        let arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            let strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            let strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }


    static isInsideWindow(elementRef) {
        const innerHeight = window.innerHeight;
        const offsetTop = elementRef.current.offsetTop;

        if (offsetTop <= innerHeight) {
            return true
        }
        return false
    }

    static isConsumerLoggedIn = (consumer) => {
        if (!consumer) {
            Webview.openPopup('/login')
            return false
        }
        return true
    }

    static getImagesUrlByHtmlString(htmlString) {
        const imagesUrl = []
        const el = document.createElement('html');
        el.innerHTML = htmlString;
        const images = el.getElementsByTagName('img')

        if (images.length > 0){

            for (const img of images) {
                const src = img.src
                console.log({src})
                const index = src.indexOf('/imagesContents')

                if (index === -1) {
                    imagesUrl.push(src)
                }else {
                    const imageUrl = src.slice(index, src.length)
                    imagesUrl.push(imageUrl)
                }


            }
        }
        return imagesUrl
    }


    static getConsumerByLoginUser(loginUser) {
        console.log({loginUser})
        if(loginUser){
            return {
                consumerNo: loginUser.uniqueNo,
                email: loginUser.email,
                userType: loginUser.userType,
                name: loginUser.name,
                nickname: loginUser.nickname,
                profile: loginUser.profile,
                account: loginUser.account,
                point: loginUser.point,
                producerFlag: loginUser.producerFlag, //생산자 로그인인지 구분
                level: loginUser.level
            }
        }else{
            return null
        }
    }

    //제주도 인지 여부 반환
    static isJeju = async (zipNo) => {
        const {jejuZipNoList} = await import('~/store')
        console.log(jejuZipNoList.includes(zipNo))
        return jejuZipNoList.includes(zipNo)
    }

    //consumer 이메일 로그인 후, 정보들 저장 => producer용 consumer(9억번대)도 사용 : recoil로 변경후 잘 쓰지는 않음.
    static setLocalStorageLogin(data) {
        localStorage.removeItem('authType');
        localStorage.removeItem('userType');
        //localStorage.removeItem('account'); //geth Account
        localStorage.removeItem('email');
        localStorage.removeItem('valword');
        localStorage.removeItem('autoLogin');

        //쿠키(localStorage)에 login된 userType저장. - 필요하려나.
        localStorage.setItem('authType', 0);
        localStorage.setItem('userType', data.userType);
        //localStorage.setItem('account', loginInfo.account); //geth Account
        localStorage.setItem('email', data.email);
        localStorage.setItem('valword', ComUtil.encrypt(data.valword));
        //localStorage.setItem('autoLogin', state.autoLogin? 1:0);
        localStorage.setItem('autoLogin', 1); //pivot개발시 항상 1로 세팅.
        //localStorage.setItem('today', ComUtil.utcToString(new Date()));

        sessionStorage.setItem('logined', 1); //1 : true로 이용중

        //console.log('loginInfo : ===========================',loginInfo);
        //Webview.appLog('Login valword:' + data.valword);
        //Webview.appLog('LoginlocalStorage Val:' + localStorage.getItem('valword'));

    }

    /*******************************************************
     int를 binary값으로 변환 후 1값인 리스트 반환. 소비자 보유 배지에 활용
     @Param : number
     @Return : number List.
     *******************************************************/
    static intToBinaryArray(num) {
        const binaryNum = num.toString(2);
        let result = [];
        for(let i = binaryNum.length ; i > 0; i--) {  // 맨 오른쪽 자리부터 왼쪽으로 검사.
            if(binaryNum.charAt(i-1) === '1') {
                result.push(binaryNum.length - i + 1);  // 맨 오른쪽 자리가 1이 되도록 바꿔서 리스트에 저장
            }
        }
        return result;
    }

    // 카카오톡 공유하기
    static shareKakaoLink(title, description, url, imageUrl) {
        let urlObject = {
            title     : title,
            desc      : description,
            url       : url,
            imageUrl  : imageUrl,
        };
        Webview.kakaoDetailLink(urlObject);
    }

    /*******************************************************
     날짜가 해당 기간에 포함되어있는지 여부
     @Param : number
     @Return : number List.
     *******************************************************/
    static isInPeriod(startDate, endDate, formatter = 'YYYYMMDD') {
        const now = moment()
        return now.isAfter(moment(startDate, formatter).endOf('day')) &&
               now.isBefore(moment(endDate, formatter).endOf('day'))
    }


    //카카오톡 상품 공유하기 (공동구매상품일 경우 추가적립 됨) - pc는 URL복사
    static kakaoLinkGoodsShare = async({consumerNo, goodsNo, goodsNm}) => {
        //home에서 inviteCode를 localStorage에 저장 함
        const url = `${Server.getFrontURL()}/goods?goodsNo=${goodsNo}&inviteCode=${consumerNo ? ComUtil.encodeInviteCode(consumerNo) : ''}`

        if (ComUtil.isMobileApp() && !ComUtil.isMobileAppIos()) {  //android만 적용.
        //if (ComUtil.isMobileApp()) {  //android, ios 모두 적용
            const title = '샵블리 쑥쑥-계약재배';
            const desc = '[모이면 추가적립 UP!]' + goodsNm;
            const imageUrl = 'https://shopbly.shop/images/YP8BMgIo98I4.png';
            ComUtil.shareKakaoLink(title,desc, url, imageUrl);
        }
        //web 환경 일 경우 url 복사
        else {
            await this.copyTextToClipboard(url,'URL이 복사 되었습니다!','URL 복사가 실패하였습니다')
        }
    }

    //카카오톡 상품 공유하기 - pc는 URL복사
    static kakaoLinkGoodsSimpleShare = async({goodsNo, goodsNm, goodsImageUrl}) => {
        const url = `${Server.getFrontURL()}/goods?goodsNo=${goodsNo}`

        if (ComUtil.isMobileApp() && !ComUtil.isMobileAppIos()) {  //android만 적용.
            //if (ComUtil.isMobileApp()) {  //android, ios 모두 적용
            const title = '샵블리';
            const desc = goodsNm;
            const imageUrl = `${Server.getFrontURL()}/images/${goodsImageUrl}` // 'https://shopbly.shop/images/' + goodsImageUrl;
            ComUtil.shareKakaoLink(title, desc, url, imageUrl);
        }
        //web 환경 일 경우 url 복사
        else {
            await this.copyTextToClipboard(url,'URL이 복사 되었습니다!','URL 복사가 실패하였습니다')
        }
    }


    //카카오톡 게시판 공유하기  - pc는 URL복사
    static kakaoLinkBoardShare = async(writingId, content) => {
        const url = `${Server.getFrontURL()}/community/board/${writingId}`
        content = content.length > 15 ? content.substr(0, 14) + '...' : content;

        if (ComUtil.isMobileApp() && !ComUtil.isMobileAppIos()) {  //android만 적용.
        //if (ComUtil.isMobileApp()) {  //android, ios 모두 적용
            const title = '샵블리 토크';
            // const desc = '샵블리 게시글을 공유합니다.';
            const desc = content;
            const imageUrl = 'https://shopbly.shop/images/YP8BMgIo98I4.png';
            ComUtil.shareKakaoLink(title,desc, url, imageUrl);
        }
        //web 환경 일 경우 url 복사
        else {
            await this.copyTextToClipboard(url,'URL이 복사 되었습니다!','URL 복사가 실패하였습니다')
        }
    }
    //카카오톡 상품리뷰 공유하기  - pc는 URL복사
    static kakaoLinkReviewShare = async(orderSeq, content) => {
        const url = `${Server.getFrontURL()}/goodsReviewDetail/${orderSeq}`
        content = content.length > 15 ? content.substr(0, 14) + '...' : content;

        if (ComUtil.isMobileApp() && !ComUtil.isMobileAppIos()) {  //android만 적용.
        //if (ComUtil.isMobileApp()) {  //android, ios 모두 적용
            const title = '샵블리 상품리뷰';
            // const desc = '샵블리 상품리뷰를 공유합니다.';
            const desc = content;
            const imageUrl = 'https://shopbly.shop/images/YP8BMgIo98I4.png';
            ComUtil.shareKakaoLink(title,desc, url, imageUrl);
        }
        //web 환경 일 경우 url 복사
        else {
            await this.copyTextToClipboard(url,'URL이 복사 되었습니다!','URL 복사가 실패하였습니다')
        }
    }


    //평점 리턴
    static toScoreRate(number) {
        if (Number.isInteger(number)) return number
        else return number.toFixed(1)
    }

    //소비자 번호로 생산자 번호 조회
    static getProducerNoByConsumerNo(consumerNo) {
        if (this.isProducer(consumerNo)) {
            return consumerNo - 900000000
        }
        return consumerNo
    }

    //생산자인지 여부
    static isProducer(consumerNo) {
        if (consumerNo > 900000000) {
            return true
        }
        return false
    }

    static checkAndMoveDownloadAppPage() {
        //모바일앱 에서만 가능한 서비스

        //개발모드: 개발자 체크 제외.
        // const isProduction = Server._serverMode() === 'production' ? true:false;
        // if (!isProduction && Server.getServerURL().includes('localhost')) {
        //     return true;
        // }

        if (!this.isMobileApp()) {
            if (!window.confirm('모바일 앱 에서 이용 가능한 서비스 입니다. 앱을 다운 받으시겠습니까?')) {
                return false
            }
            if(this.isMobileWebIos()){
                window.location.assign('https://apps.apple.com/kr/app/%EB%A7%88%EC%BC%93%EB%B8%94%EB%A6%AC/id1471609293');
                return false
            } else {
                window.location.assign('https://play.google.com/store/apps/details?id=com.blocery&hl=ko')
                return false
            }
        }
        return true
    }

    //ReactNative(RN)공용사용을 위해  분리. 202012
    // code: -1 - 가져오기 실패
    // code: 0  - 가져오기 성공 (로그인 성공)
    // code: 1 -  회원가입 중=>  결제비번 입력창으로 redirect 필요.
    // code: 20210101 - 8자리면서 날짜가 나오면 재가입 가능일
    static kakaoLoginWithAccessKey = async(access_token, refresh_token) => {

        const {data:res} = await doKakaoLogin(access_token, refresh_token);
        //console.log("doKakaoLogin===",res)

        const code = res.code;
        if(code > 1 && code.toString().length == 8){
            return {
                result: 'FIRED',
                data: {
                    stopLoginReJoinDate:code,
                    // stopLoginOpen:true
                }
            }


            //console.log("doKakaoLogin2=code==",code)
            // setState({
            //     ...state,
            //     stopLoginReJoinDate:code,
            //     stopLoginOpen:true
            // })
        } else if(code == 1){
            //consumerNo (0보다 크면) -  회원가입 중인 consumerNo =>  결제비번 입력창으로.
            const consumerInfo = res.consumer;

            return {
                result: 'NEED_KAKAO_JOIN',
                data: {
                    consumer:consumerInfo,
                    // token:consumerInfo.token,
                    // refreshToken:consumerInfo.refreshToken
                }
            }

            // setState({
            //     ...state,
            //     kakaoJoinInfo:{
            //         consumer:consumerInfo,
            //         token:consumerInfo.token,
            //         refreshToken:consumerInfo.refreshToken
            //     },
            //     kakaoJoinOpen:true
            // })

        } else if(code == 0){
            // 로그인 처리
            // 0  - 가져오기 성공 (로그인 성공)
            const consumerInfo = res.consumer;
            const loginInfo = res.loginInfo;
            // const {data:loginInfo} = await getLoginUser();


            //recoil 세팅
            // setConsumer({
            //     consumerNo: consumerInfo.consumerNo,
            //     email: consumerInfo.email,
            //     userType: consumerInfo.userType,
            //     name: consumerInfo.name,
            //     nickname: consumerInfo.nickname,
            //     profile: consumerInfo.profile,
            // })

            localStorage.removeItem('authType');
            localStorage.removeItem('userType');
            localStorage.removeItem('email');
            localStorage.removeItem('valword');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            localStorage.setItem('authType', 1);
            localStorage.setItem('userType', 'consumer');
            localStorage.setItem('token', consumerInfo.token);
            localStorage.setItem('refreshToken', consumerInfo.refreshToken);
            localStorage.setItem('autoLogin', 1);
            sessionStorage.setItem('logined', 1); //1 : true로 이용중
            Webview.updateFCMToken({userType: 'consumer', userNo: loginInfo.uniqueNo})

            return {
                result: 'SUCCESS',
                data: this.getConsumerByLoginUser(loginInfo)
            }


            //console.log('kakao Login OK: + history.goback');
            // closePopup();

            // movePage()

        } else{
            if(code == -1){
                // -1 - 가져오기 실패
                //console.log("-1 카카오톡 정보 가져오기 실패");
            }else{
                //console.log("-1 카카오톡 정보 가져오기 실패");
            }
        }

    }

    static getGoodsEventName = (goods) => {
        //포텐타임
        if (goods.timeSale && goods.inTimeSalePeriod) {
            return 'POTENTIME'
        }else if (goods.superReward && goods.inSuperRewardPeriod) {
            return 'SUPERREWARD'
        }else if (goods.dealGoods) {
            return 'DEALGOODS'
        }
        return null
    }

    //마지막 클릭 후 delay 시간이 지나야 fn이 실행 됨
    //사용법 debounce(onClick, 500) or debounce(onClick.bind(this, '파라미터'), 500)
    static debounce = (fn, delay) =>{
        let timeoutId = null;
        return function(...args){
            if(timeoutId){
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(()=>{
                fn(...args);
            }, delay)
        }
    }

    //사업자등록번호 체크
    static checkCoRegistrationNo = (bizID) =>{
        // bizID는 숫자만 10자리로 해서 문자열로 넘긴다.
        let checkID = new Array(1, 3, 7, 1, 3, 7, 1, 3, 5, 1);
        let tmpBizID, i, chkSum=0, c2, remander;
        bizID = bizID.replace(/-/gi,'');

        for (i=0; i<=7; i++) chkSum += checkID[i] * bizID.charAt(i);
        c2 = "0" + (checkID[8] * bizID.charAt(8));
        c2 = c2.substring(c2.length - 2, c2.length);
        chkSum += Math.floor(c2.charAt(0)) + Math.floor(c2.charAt(1));
        remander = (10 - (chkSum % 10)) % 10 ;

        if (Math.floor(bizID.charAt(9)) == remander) return true ; // OK!
        return false;
    }

    static replaceAll = (str, searchStr, replaceStr) => {
        // return str.split(searchStr).join(replaceStr);

        const regexAllCase = new RegExp(searchStr, 'gi');
        return str.replace(regexAllCase, replaceStr)
    }

    //문자열의 길이 (한, 영, 숫자 등)
    static getTextLength (str) {

        const type = typeof  str

        if(type === 'number' || type === 'string') {
            str = str.toString()
        }else {
            str = ''
        }
        var len = 0;
        for (let i = 0; i < str.length; i++) {
            if (escape(str.charAt(i)).length == 6) {
                len++;
            }
            len++;
        }
        return len;
    }

    static getNow() {
        return new Date().getTime();
    }
    static getNowYYYYMM() {
        return moment(ComUtil.getNow()).format('YYYYMM')
    }
    static getNowYYYYMMDD() {
        return moment(ComUtil.getNow()).format('YYYYMMDD')
    }

    //개발자 전요 모드인지 구분(화면에 정보를 보여주기 위해)
    static isDeveloperMode() {
        //쿠키 devMode 에 오늘 날짜가 있으면 화면에 정보를 보여줌
        return localStorage.getItem('developerMode') === moment().format("YYYYMMDD").toString()
    }

    //로그인 상태 체크
    static getIsLoginStatus(data) {
        return ![-1,0,null].includes(data);
    }

    static maskingPhone(str){
        if (!str || str.length < 5)
            return "*******"

        return '*'.repeat(str.toString().length -4) + str.slice(-4)
    }

    static maskingName(str){
        if (!str)
            return "****"

        return str.substr(0,1) + "*".repeat(3)
    }



    /**
     * 배열의 키가 달라졌는지 여부 리턴
         ex) list.map((item, index, arr) => {
                isNewGroup('orderSubGroupNo', item, index, arr)
            }
     * @param compareKey
     * @param item
     * @param index
     * @param arr
     * @returns {boolean|*}
     */
    static isNewGroup(compareKey, item, index, arr) {
        return (index === 0) || (arr[index-1] && item[compareKey] !== arr[index-1][compareKey])
    }
    // 현재 스크롤이 아래로 향하는지 useScrollPos(scrollObj => ) 내에서 사용 가능
    static isDownScrolling = ({ previous, current }) => previous > 0 && previous < current;
    // 현재 스크롤이 젤 위에 있는지 useScrollPos(scrollObj => ) 내에서 사용 가능
    static isTopScrolling = currentScrollTop => currentScrollTop < 4;

    static getLocalStorage(key, defaultValue) {
        const storageValue = localStorage.getItem(key) || defaultValue
        // let convertedValue = storageValue;

        try{
            if (storageValue) {
                return JSON.parse(storageValue)
            }
        }catch (err) {
            return storageValue
        }
    }

    /**
     * 배열의 값을 구분자(divider) 에 맞게 붙임.
     * 단 undefined, null, false, 0(숫자) 는 붙이지 않음
     * @param divider
     * @param args : join('_', []) or join('_', '','','') 모두허용
     * @returns {string}
     */
    static join(divider, ...args) {
        return args.filter(Boolean).join(divider);
    }


    /**
     * value 가 있으면 combinedStr 반환. 이외는 '' 반환
     * @param combinedStr
     * @param orgStr
     * @returns {string|*}
     */
    static getCombinedString(combinedStr, value) {
        if(!value)
            return ''
        else
            return combinedStr
    }
}