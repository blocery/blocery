import React from 'react';
import IMP from 'iamport-react-native';
import {View, Text, StyleSheet, Alert} from 'react-native';

function Loading() {
    const { container, items } = styles;
    return (
        <View style={container}>
            <Text style={items}>본인인증 연동 중...</Text>
            <Text style={items}>잠시만 기다려주세요.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center'
    },
    items: {
        fontSize: 18,
        fontWeight: 'bold',
        top: 100
    }
});

function Certification({ navigation }) {
    /* 가맹점 식별코드, 본인인증 데이터 추출 */
    const userCode = navigation.getParam('userCode');
    const data = navigation.getParam('data');
    const callbackUrl = navigation.getParam('callbackUrl');

    // console.log("Certification, userCode : ", userCode)
    // console.log("Certification, data : ", data)

    /* [필수입력] 본인인증 후 실행될 콜백 함수 입력 */
    function callback(response) {
        const isSuccessed = getIsSuccessed(response);
        console.log({response});
        if (isSuccessed) {
            // 본인인증 성공한 경우, 리디렉션 위해 홈으로 이동한다
            const params = {
                ...response, // [jaden] 수정
                type: 'certification',
                callbackUrl: callbackUrl
            };
            //navigation.replace('Home', params);

            navigation.goBack();
            navigation.state.params.onCertificationResult(params);

        } else {
            // 본인인증 실패한 경우, 본래 페이지로 돌아간다
            let alertTitle = '본인인증 실패';
            // let alertContent = response.error_msg;
            let alertContent = '본인인증에 실패하였습니다. 다시 한 번 시도해주세요.';
            Alert.alert(
                alertTitle,
                alertContent,
                [
                    {
                        text: '확인',
                        onPress: () => navigation.goBack()
                    }
                ],
                {cancelable: false},
            )

        }
    }

    function getIsSuccessed(response) {
        const { success } = response;

        if (typeof success === 'string') return success === 'true';
        if (typeof success === 'boolean') return success === true;
    }

    return (
        <IMP.Certification
            userCode={userCode}
            loading={<Loading />}
            // [jaden] 수정
            data={{
                ...data,
                app_scheme: 'test'
            }}
            callback={callback}
        />
    );
}

export default Certification;