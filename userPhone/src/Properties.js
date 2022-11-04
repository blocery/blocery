import DeviceInfo from 'react-native-device-info'

export const Server = {

    //private TEST 용도
    _isDeviceEmulator: function() {
        // return true;  //폰에서도 pc개발환경 강제 접속용 - 안드로이드는 adb reverse tcp:8080 tcp:8080 -> 3000, 8080 둘 다 필요 + main/res/values/strings.xml 에 kakao_app_key를 test로 변경필요.
        return DeviceInfo.isEmulatorSync(); // master소스는 항상 이걸로 세팅.   4.0에서 Sync()
    },

    /* 중요: google Play 배포용도 */
    _isDeploy: function () {
        // return false;  //stage server(225 server)용
        return true;   //AWS서버 이용
    },

    majorB2cVersion: 8, //강제업그레이듯시 단말앱 먼저 버전 변경후 배포하고, 한참 시간이 지난 후 서버support버전을 변경하도록 함.
    useTabMenu: false, //서버버전이 0(.xx)로 시작하면 true로 세팅해서 베타이전버전 대응. 1.xx이후에서는 tabMenu삭제

    getServerURL: function() {
        const serverUrl = this._isDeploy() ? 'https://shopbly.shop' : 'http://210.92.91.225:8080'; //AWS IP: 'http://13.209.43.206'

        return this._isDeviceEmulator() ? 'http://localhost:3000' : serverUrl;
        // return 'http://localhost:3000';
    },
    // getMainPage: function() {
    //     return (this.getServerURL()+ '/home/1');
    // },
    getHomePage: function() {
        return (this.getServerURL()+ '/home');
    },
    getMainPage: function() {
        return (this.getServerURL()+ '/');
    },
    // getHomePage: function() {
    //     return (this.getServerURL()+ '/');
    // },
    // getStorePage: function() {
    //     return (this.getServerURL() + '/store');
    // },
    // getCommunityPage: function() {
    //     return (this.getServerURL() + '/community');
    // },
    // getSearchPage: function() {
    //     return (this.getServerURL()+'/search');
    // },
    // getLocalPage: function() {
    //     return (this.getServerURL()+'/local');
    // },
    // getDiaryPage: function(isProducer) {
    //     return  isProducer ? (this.getServerURL() + '/producer/orderList') : (this.getServerURL()+'/fintech/home/1');
    // },
    // getMyPage: function() {
    //     return (this.getServerURL()+'/mypage');
    // },
    getRestAPIHost: function() {
        return this._isDeviceEmulator() ? 'http://localhost:8080/restapi' : this.getServerURL() + '/restapi';
    }

};
