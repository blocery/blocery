import React from 'react';
import { ToastAndroid, View, SafeAreaView, BackHandler, Platform, Alert, Linking, Clipboard } from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import { Server } from './Properties';
import WebView from 'react-native-webview';
import axios from 'axios';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import ComUtil from "./ComUtil";
import ClearCacheModule from './ClearNativeAppCache';
import RNExitApp from 'react-native-exit-app';
//import RNKakaoLink from 'react-native-kakao-links';
import KakaoLink from '@actbase/react-native-kakao-link';
import KakaoLogins, {KAKAO_AUTH_TYPES, login} from "@react-native-seoul/kakao-login";

const VERSION_KEY = "version";
const USER_TYPE = {
    CONSUMER: 'consumer',
    PRODUCER: 'producer',
}


const TAB_KEY = {
    HOME: 'home',
    CATEGORY: 'category',
    SEARCH: 'search',
    MY_PAGE: 'mypage'
}

// 아이콘 검색 - https://materialdesignicons.com/

export default class HomeScreen extends React.Component {

    static navigationOptions = {
        title: 'Home',
        header: null
    };

    webView = {
        canGoBack: false,
        ref: null
    }

    constructor(props){
        super(props);

        console.log('constructor ==== ', props)

        this.state = {
            key: 0,
            isCacheChecked: false,
            source: {uri: Server.getMainPage()},  // 소비자용이 default
            // pressedTabKey: TAB_KEY.HOME,
            // tabs : this.getTabName(false),   //소비자용 TabName이 default.
            serverVersion: '',
            minSupportB2cAndroidVersion: 0,
            minSupportB2cIosVersion: 0
        }
    }

    async componentDidMount() {

        if(this.notificationListener)this.notificationListener.remove()
        if(this.notificationOpenedListener)this.notificationOpenedListener.remove()
        if(this.messageListener)this.messageListener.remove()
        console.log('componentDidMount - homeScreen')

        if (Platform.OS === 'android') {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
        }

        await this.getServerVersion();
        await this.deleteWebviewCache();
        this.alertAppUpdate();

        this.setState({
            key: this.getNewKey(),
            isCacheChecked: true
        }, () => {
            this._listenForNotifications();
        });
    }


    componentWillUnmount() {

        if (Platform.OS === 'android') {
            this.exitApp = false;
            this.backHandler.remove();// removeEventListener('hardwareBackPress');
        }

        this.notificationListener.remove()
        this.notificationOpenedListener.remove()
        this.messageListener.remove()
    }

    getServerVersion = async() => {
        const response = await axios(Server.getRestAPIHost() + '/version', { method: "get", withCredentials: true, credentials: 'same-origin' });
        let versionResult = response.data;
        console.log('============= versionResult : ', versionResult);

        this.setState({
            serverVersion: versionResult.serverVersion,
            minSupportB2cAndroidVersion: versionResult.minSupportB2cAndroidVersion,
            minSupportB2cIosVersion: versionResult.minSupportB2cIosVersion
        })
    }

    alertAppUpdate = () => {
        let minPhoneVersion = Platform.OS === 'android' ? this.state.minSupportB2cAndroidVersion : this.state.minSupportB2cIosVersion;
        if (Server.majorB2cVersion < minPhoneVersion) {
            let alertTitle = '업데이트 안내';
            let alertContent = '중요한 업데이트가 있습니다. 새로운 기능이 추가되었으니, 스토어에서 업데이트 후 실행해 주세요';
            Alert.alert(
                alertTitle,
                alertContent,
                [
                    {
                        text: '확인',
                        onPress: () => this.goAppStoreAndExit()
                    }
                ],
                {cancelable: false},
            )
        }
    }

    goAppStoreAndExit = () => {
        let url = '';
        if (Platform.OS === 'android') {
            url = "market://details?id=com.blocery";
        } else {
            url = 'itms-apps://itunes.apple.com/us/app/%EB%A7%88%EC%BC%93%EB%B8%94%EB%A6%AC/id1471609293?l=ko&ls=1';
        }

        Linking.canOpenURL(url).then(supported => {
            // console.log(supported);
            supported && Linking.openURL(url);
            if (Platform.OS === 'android') {
                RNExitApp.exitApp();
            } else {
                setTimeout(() => {
                    RNExitApp.exitApp();
                }, 1000)
            }
        }, (err) => console.log(err));

    }

    deleteWebviewCache = async() => {
        let oldVersion = await AsyncStorage.getItem(VERSION_KEY);
        console.log('=============== oldVersion', oldVersion);

        if(oldVersion === null || oldVersion !== this.state.serverVersion) {
            if(this.state.serverVersion)
                AsyncStorage.setItem(VERSION_KEY, this.state.serverVersion);
            console.log('============= is different Version');
            const kakaoUpdateTime = new Date(2020, 11, 30, 9, 0, 0); // ios는 2020년 12월 18일 금요일 오전 9시 이후에 update 하도록
            const now = new Date();
            const isOverStartTime = kakaoUpdateTime.getTime() - now.getTime();
            if(isOverStartTime < 0 || Platform.OS === 'android') {
                ClearCacheModule.deleteCache();
            }
            return true;
        }
        console.log('=============== version is not updated');
        return false;
    };


    onAndroidBackPress = () => {

        if (this.webView.ref) {  //this.webView.canGoBack 오작동 -
            this.webView.ref.postMessage();
            this.webView.ref.goBack();
        }
        return true;
    }

    finishApp = async (currentUrl) => {
        if (this.exitApp === undefined || !this.exitApp) {
            let mainUrl = Server.getMainPage();
            let homeUrl = Server.getHomePage();
            if (mainUrl === currentUrl || [homeUrl].includes(currentUrl)) {
                ToastAndroid.show('한 번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
                this.exitApp = true;

                this.timeout = setTimeout(
                    () => {
                        this.exitApp = false;
                    }, 2000
                );
            }
        } else {
            clearTimeout(this.timeout);
            // BackHandler.exitApp();
            RNExitApp.exitApp();
        }
    }

    getNewKey = () => {
        return this.state.key +1
    }

    _listenForNotifications = async() => {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            console.log('onNotification ', notification);  // 앱이 실행되어있을 때 푸쉬가 오면 실행됨
            const params = {
                action: 'APP_PUSH',
                params: {
                    title: notification._title, //  타이틀
                    body: notification._body,   //  내용 xx님이 내 게시물에 댓글을 남겼어요
                    data: notification._data,   //  { url: '/mypage?moveTo=boardList' }
                },
            }

            if(this.webView.ref) {
                console.log('ref 있음 ')
                this.webView.ref.postMessage(JSON.stringify(params)); //TODO
            }

        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            console.log('onNotificationOpened ', notificationOpen);
            // ?? 앱이 foreground나 background에 있을 때 호출된다고 하는데.. 실제로 테스트해보니 아래의 getInit이 호출되고 있음
        });

        this.messageListener = firebase.messaging().onMessage((message) => {
            console.log('messageListener : ', message);
            // background에서 message를 핸들링 할 수 있다고 하는데. 콘솔이 안찍힘 필요할 경우 추가 테스트 필요
        })

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if(notificationOpen) {

            console.log('getInitNotification ', notificationOpen); // 앱 종료상태, 앱 백그라운드상태 에서 푸쉬를 타고 앱이 실행되면 실행됨

            const { notificationType } = notificationOpen.notification._data
            const { url } = notificationOpen.notification._data

            // console.log(url);
            // backend에서 url을 지정해서 푸쉬를 보낼 경우 모두 여기에서 이동(notificationType 의미없음)
            if(url) {
                await this.changeConsumerUrl(Server.getServerURL() + url);
                return;
            }

            // 2021.11.22 이후로 notificationType 변경으로 모두 url 분기처리되고 아래 이동 안함.
            //각 해당하는 탭으로 이동
            // switch (notificationType){
            //     case 'deliveryStart': //배송시작
            //     case 'producerCancelOrder': //생산자 주문취소
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=orderList');
            //         break;
            //
            //     case 'favoriteNewGoods':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/store/7'); // TODO
            //         break;
            //     case 'goodsQnaAnswer':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=myQA/1');
            //         break;
            //     case 'coupon':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=couponList');
            //         break;
            //
            //     case 'favoriteNewFarmDiary': //생산일지 (라운지로 보내기)
            //         await this.changeConsumerUrl( Server.getMainPage());
            //         break;
            //
            //     case 'boardReply':  // 내 게시글에 댓글이 달린경우 게시글 리스트
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=boardList');
            //         break;
            //
            //     case 'reviewReply': // 리뷰에 댓글이 달린 경우 리뷰리스트
            //         await this.changeConsumerUrl( Server.getServerURL() + '/goodsReviewList/2');   // TODO
            //         break;
            //
            //     case 'getBadge':    // 뱃지 획득 푸쉬도 마이페이지로 이동
            //     case 'kycAuth':
            //     case 'transferBly':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage');
            //         break;
            //
            //
            //     //생산자 --
            //     case 'goodsQnaAsk':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=producer/qnalist');
            //         break;
            //
            //     case 'newOrder':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=producer/orderList');
            //         break;
            //
            //     case 'cancelOrder':
            //         await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=producer/cancelList');
            //         break;
            //     default:
            //         await this.changeConsumerUrl( Server.getMainPage());
            //         break;
            // }
        }
    };

    changeConsumerUrl = async (uri) => {
        // console.log("changeConsumerUrl : ", uri);
        this.setState({
            key: this.getNewKey(),
            // pressedTabKey: tabKey,
            source: {uri: uri}
        });
    }

    kakaoLink = async (urlObject) => {
        console.log(urlObject);

        const linkObject = {
            webURL: urlObject.url,
            mobileWebURL : urlObject.url
        };

        const contentObject = {
            title     : urlObject.title,
            link      : linkObject,
            imageURL  : urlObject.imageUrl,
            desc      : urlObject.desc
        }

        try {
            const options = {
                content: contentObject,
            };

            const response = await KakaoLink.sendFeed(options);
            console.log(response);
        } catch (e) {
            // alert("catch : " + e);
            console.warn(e);
        }
    };

    // popup
    onMessageFromFront = async(event) => {
        console.log({eventData: event.nativeEvent.data});
        if (!event.nativeEvent.data) {
            return; //empty URL - 왜 호출되는지..
        }

        const { url, type, param, payload } = JSON.parse(event.nativeEvent.data);

        if(type === 'CURRENT_URL') {
            console.log('url : ', url);
            this.finishApp(url);
            return;
        }

        if(type === 'UPDATE_FCMTOKEN'){
            ComUtil.checkPermission({...param})
            return;
        }

        if(type === 'KAKAO_LINK') {
            this.kakaoLink(url);
            return;

        } else if (type === 'APP_REFRESH') { //isNoUsePopup 용도로 추가. 로그인후 refresh문제 해결. - 현재 미사용.
            this.setState({key: this.getNewKey()});
            //alert('app_refresh');

        } else if (type === 'JUST_POPUP') {

            this.props.navigation.navigate('Popup', {
                url: Server.getServerURL() + url,
                onPopupClose: this.popupClosed //no refresh
            });

        } else if (type === 'NEW_POPUP') {

            this.props.navigation.navigate('Popup', {
                url: Server.getServerURL() + url,
                onPopupClose: this.popupCloseAndRefresh //callback-refresh
            });

        }else if (type === 'CLOSE_POPUP') {
            console.log('###  HomeScreen: CLOSE_POPUP');

        }else if (type === 'MOVE_PAGE') {
            console.log('###  HomeScreen: MOVE PAGE:,', url);

            const uri = {uri: Server.getServerURL() + url};
            //uri가 /mypage 및 /producer/mypage 간 이동때문에 최초 추가.

            let isProducer = url.includes('/producer/');
            // let tabs = this.getTabName(isProducer);
            this.setState({
                // tabs: tabs,
                key: this.getNewKey(),
                source: uri
            });
        } else if(type === 'KAKAO_LOGIN') {
            let self = this;
            login()
                .then(result => {
                    console.log("KAKAO_SUCCESS : ", result);
                    let url = '/login?accessToken=' + result.accessToken + '&refreshToken=' + result.refreshToken;
                    // console.log(url);

                    const serverUrl = Server.getServerURL() + url;
                    self.setState({
                        key: self.state.key + 1,  //새로고침을 위해
                        url: serverUrl
                    })
                })
        } else if(type === 'LOGOUT_UPDATE') {
            console.log('###  HomeScreen: LOGOUT_UPDATE:');

            AsyncStorage.setItem('userType', 'consumer');

            // let tabs = this.getTabName(false);
            this.setState({
                // tabs: tabs,
                key: this.getNewKey()
            });

        } else if(type === 'QRCODE_SCAN') {
            this.props.navigation.navigate('Qrcode', {
                onQrScanResult: this.qrcodeScanResult.bind(this, payload)
            });
        } else if(type === 'CLIPBOARD_TEXT') {

            this.copyFromClipboard();

        } else if(type === 'CAMERA_PERMISSION') {

            let data = await ComUtil.askCameraPermission();
            const jsonData = JSON.stringify(data)
            this.webView.ref.postMessage(jsonData)

        } else if(type === 'OPEN_BROWSER') {
            // 외부 웹브라우저로 띄우기
            Linking.canOpenURL(url).then(supported => {
                Linking.openURL(url);
            }, (err) => console.log(err));

        } else { //APP_LOG
            console.log(url); //url에 변수를 넣어서 찍기
        }
    };

    copyFromClipboard = async() => {
        let accountData = await Clipboard.getString();

        let data = ({
            accountFromPhone: accountData
        })
        console.log("copyFromClipboard : ", data);

        const jsonData = JSON.stringify(data)
        this.webView.ref.postMessage(jsonData)

    }

    qrcodeScanResult = (payload, data) => {
        // { qrcodeResult: 'I love you' }  이렇게 들어오는 데이터 중에 value만 webView로 넘겨야 하는디.....
        const jsonData = JSON.stringify({data, payload})
        this.webView.ref.postMessage(jsonData)

    }

    popupClosed = (data) => {

        const { url, param } = JSON.parse(data)
        console.log('#######################HomeScreen : just popupClosed -' + url);

        //페이지 Redirection : ClosePopupAndMovePage
        if (url) { //URL refresh
            const uri = {uri: Server.getServerURL() + url}
            this.setState({
                key: this.getNewKey(),  //새로고침을 위해
                source: uri
            })
        }
    }


    //popup이 닫힐 때 callback.   string으로 넘어옴
    popupCloseAndRefresh = (data) => {

        console.log('#######################HomeScreen : popupClosed');

        const { url, param } = JSON.parse(data)
        console.log('#######################HomeScreen : popupClosed -' + url);
        const isRefresh = (param && param.isRefresh) ? param.isRefresh : true;

        //페이지 Redirection : ClosePopupAndMovePage
        if (url) { //URL refresh
            const uri = {uri: Server.getServerURL() + url}
            this.setState({
                key: this.getNewKey(),  //새로고침을 위해
                source: uri
            })
        } else {
            //팝업 닫을 때 refresh. : CLOSE_POPUP
            //this.setState({key: this.state.key + 1});// - 혹시 refresh 필요시. 호출
            if (isRefresh) {
                this.webView.ref.reload();
            }
        }

    }

    //웹뷰가 완전히 로드 되었을 경우
    onLoadEnd = () => {
        SplashScreen.hide();
        //스플래시 이미지가 너무 빨리 닫히면 볼 수가 없어서 1초의 여유를 줌
        // setTimeout(SplashScreen.hide, 1000)
    }

    checkBlyUrl = (url) => {
        if (url.includes("blocery.com") || url.includes("marketbly.com") ||
            url.includes("shopbly.shop") || url.includes("shopbly.com") || url.includes(Server.getServerURL())) {
            return true;
        }
        return false;
    }

    onNavigationStateChange = (navState) => {
        console.log("onNavigationStateChange ");
        this.webView.canGoBack = navState.canGoBack;
        const url = navState.url;
        if (!this.checkBlyUrl(url)) {
            // 새 탭 열기
            Linking.canOpenURL(url).then(supported => {
                supported && Linking.openURL(url);
            }, (err) => console.log(err));

            return false;
        }
    }

    onShouldStartLoadWithRequest = (event) => {
        console.log("onShouldStartLoadWithRequest ");
        const url = event.url;
        if (!this.checkBlyUrl(url)) {
            // 새 탭 열기
            Linking.canOpenURL(url).then(supported => {
                Linking.openURL(url);
            }, (err) => console.log(err));
            return false;
        }
        return true;
    }

    render() {

        if(!this.state.isCacheChecked) return null

        return (
            <View style={{flex: 1}}>
                {Platform.select({
                    android: () =>
                        <WebView
                            //source={{ uri: 'https://mobilehtml5.org/ts/?id=23' }}
                            userAgent = {'BloceryAppQR-Android'}
                            key={this.state.key}
                            source={this.state.source}
                            ref={(webView) => {
                                this.webView.ref = webView;
                            }}
                            onNavigationStateChange={this.onNavigationStateChange}
                            onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                            onMessage={this.onMessageFromFront}
                            onLoadEnd={this.onLoadEnd}
                        />,

                    ios:  () =>
                        // https://facebook.github.io/react-native/docs/0.59/safeareaview
                        <SafeAreaView style={{flex: 1, backgroundColor: 'rgb(255,255,255)'}}>
                            <WebView
                                style={{flex: 1}}
                                //source={{ uri: 'https://mobilehtml5.org/ts/?id=23' }}
                                // iOS WebView 는 AppDelegate.m 에서 설정 https://stackoverflow.com/questions/36590207/set-user-agent-with-webview-with-react-native
                                // iOS WKWebView 는 여기서 설정된 것 사용
                                userAgent = {'BloceryAppQR-iOS'}
                                useWebKit={true}
                                sharedCookiesEnabled={true}
                                key={this.state.key}
                                source={this.state.source}
                                ref={(webView) => {
                                    this.webView.ref = webView;
                                }}
                                onNavigationStateChange={this.onNavigationStateChange}
                                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                                onMessage={this.onMessageFromFront}
                                onLoadEnd={this.onLoadEnd}
                            />
                        </SafeAreaView>
                })()}

            </View>

        );
    }
}