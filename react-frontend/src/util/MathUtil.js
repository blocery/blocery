import BigNumber from "bignumber.js";
export default class MathUtil {

    /*
    .toFormat()를 사용하면 천단위마다 콤마를 줄수 있고,
    .toFormat(4)는 소수점 4자리까지 표기(원하는 소수점자리수 표현)
    형태를 천단위 콤마가 아니라 다른 형태로도 설정해서 변경가능함
    https://mikemcl.github.io/bignumber.js/#toFor
    위의 링크에서 확인해볼 수 있다.
    */
    static addCommas(vVal) {
        const BN = new BigNumber(vVal);
        if(BN.isNaN()){
            return 0;
        }
        return BN.toFormat();
    }

    // 숫자여부
    static isNumber(vVal) {
        const x = new BigNumber(vVal);  // "NaN"
        if(x.isNaN()){
            return false;
        }
        return true;
    }

    //버릴 부분의 왼쪽에 있는 자리가 홀수인 경우 ROUND_HALF_UP으로 작동하며, 짝수인 경우 ROUND_HALF_DOWN으로 작동합니다.
    static roundHalf(vVal) {
        const BN = new BigNumber(vVal);
        if(BN.isNaN()){
            return 0;
        }
        return BN.dp(0, BigNumber.ROUND_HALF_EVEN).toNumber();
    }

    //소수점 둘째자리까지 ROUND_DOWN
    static roundDown2(vVal) {
        const BN = new BigNumber(vVal);
        if(BN.isNaN()){
            return 0;
        }
        return BN.dp(2, BigNumber.ROUND_DOWN).toNumber();
    }

    //소수점 2째자리까지 표현
    static numberByDP2(vVal) {
        const BN = new BigNumber(vVal);
        if(BN.isNaN()){
            return 0;
        }
        return BN.dp(2).toNumber();
    }

    //곱하기
    static multipliedBy(vVal1, vVal2) {
        const BN = new BigNumber(vVal1).multipliedBy(vVal2);
        if(BN.isNaN()){
            return 0;
        }
        return BN.toNumber();
    }

    //나누기
    static dividedBy(vVal1, vVal2) {
        const BN = new BigNumber(vVal1).dividedBy(vVal2);
        if(BN.isNaN()){
            return 0;
        }
        return BN.toNumber();
    }

    //더하기
    static plusBy(vVal1, vVal2) {
        const BN = new BigNumber(vVal1).plus(vVal2);
        if(BN.isNaN()){
            return 0;
        }
        return BN.toNumber();
    }

    //빼기
    static minusBy(vVal1, vVal2) {
        const BN = new BigNumber(vVal1).minus(vVal2);
        if(BN.isNaN()){
            return 0;
        }
        return BN.toNumber();
    }
}