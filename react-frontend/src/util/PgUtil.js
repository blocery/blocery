// 외부 jquery, iamport 라이브러리
export const initIMPHeadScript = () => {
    //외부 Jquery 라이브러리
    if (!document.getElementById('jQuery')) {
        const scriptjQueryJS = document.createElement('script');
        scriptjQueryJS.id = 'jQuery';
        scriptjQueryJS.src = '//code.jquery.com/jquery-1.12.4.min.js';
        document.body.appendChild(scriptjQueryJS);
    }
    //외부 아임포트 라이브러리
    if (!document.getElementById('iamport')) {
        const scriptiamportJS = document.createElement('script');
        scriptiamportJS.id = 'iamport';
        scriptiamportJS.src = '//cdn.iamport.kr/js/iamport.payment-1.1.8.js';
        document.body.appendChild(scriptiamportJS);
    }
}