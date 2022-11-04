import React from 'react'
import {FaBackspace, FaRandom} from 'react-icons/fa'
import {Div, Flex, GridColumns} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";

const DotItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    display: flex;
    justify-content: center;
    justify-content: center;
    border-radius: ${getValue(3)};
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
    
    width: 10vmin;
    height: 12vmin;    
    max-width: 60px;
    max-height: 72px;
    
    ${props => props.showCircle && `
        &::after {
            content: "";
            position: absolute;
            width: 4vmin;
            height: 4vmin;
            max-width: 20px;
            max-height: 20px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background-color: ${color.white};
        }
    `}
}
`


const NumberItem = styled(Flex)`
    justify-content: center;
    height: 18vmin;
    max-height: ${getValue(145)};
    font-size: ${getValue(23)};
    font-weight: ${700};    
    cursor: pointer;
`

class PassPhrase extends React.Component {

    //컴포넌트 생성자 메소드
    constructor(props) {
        super(props);

        this.state = {
            pad:[],
            passPhraseClass1:null,
            passPhraseClass2:null,
            passPhraseClass3:null,
            passPhraseClass4:null,
            passPhraseClass5:null,
            passPhraseClass6:null,
        };
        this.passPhraseAuthNo='';
        //this.pad = []
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.clearPassPhrase !== this.props.clearPassPhrase && this.props.clearPassPhrase === true) {
            this.setState({
                passPhraseClass1:null,
                passPhraseClass2:null,
                passPhraseClass3:null,
                passPhraseClass4:null,
                passPhraseClass5:null,
                passPhraseClass6:null
            });
            this.passPhraseAuthNo='';
            this.props.onChange('');
        }
    }

    //컴포넌트 렌더링 시에 호출됨
    componentDidMount() {
        this.random();
    }

    // 0~9 의 랜덤 숫자 생성(중복x)
    random = () => {
        let pad = this.state.pad;

        while(true) {
            for (let i = 0; i < 10; i++) {
                const rand = Math.floor(Math.random() * 10) + 0

                pad.push(rand); //기존에 실패해도 앞부분 데이터 재활용

                pad = pad.reduce(function (a, b) {
                    if (a.indexOf(b) < 0) a.push(b);
                    return a;
                }, []);
            }
            if (pad.length >= 10 ) {
                break;
            }
        }
        this.setState({pad:pad})
    }

    //6자리 비번 조인Join)해서 결과 리턴
    getPassPhrase = () => {
        let passPhrase = this.passPhraseAuthNo;
        return passPhrase;
    }

    //doClick
    passPhraseDoClick = (e) => {
        let curUpw='',i=1;
        let pincode = e.currentTarget.textContent;
        //console.log("pincode",pincode);
        if(
            !(
                String(pincode) === "0" ||
                String(pincode) === "1" ||
                String(pincode) === "2" ||
                String(pincode) === "3" ||
                String(pincode) === "4" ||
                String(pincode) === "5" ||
                String(pincode) === "6" ||
                String(pincode) === "7" ||
                String(pincode) === "8" ||
                String(pincode) === "9"
            )
        ){
            return false;
        }
        //console.log(e.currentTarget.textContent);
        //return;
        curUpw = String(this.passPhraseAuthNo);
        if (curUpw.length >= 6) {
            //alert('6자리까지만 입력가능합니다.');
            return false;
        }
        //console.log(curUpw.length);
        this.passPhraseAuthNo = (String(curUpw) + String(pincode));

        let passPhraseClass1=null, passPhraseClass2=null, passPhraseClass3=null;
        let passPhraseClass4=null, passPhraseClass5=null, passPhraseClass6=null;
        for(i = 1; i <= (curUpw.length + 1); i++){
            if(i == 1) passPhraseClass1 = "on";
            if(i == 2) passPhraseClass2 = "on";
            if(i == 3) passPhraseClass3 = "on";
            if(i == 4) passPhraseClass4 = "on";
            if(i == 5) passPhraseClass5 = "on";
            if(i == 6) passPhraseClass6 = "on";
        }
        this.setState({
            passPhraseClass1: passPhraseClass1,
            passPhraseClass2: passPhraseClass2,
            passPhraseClass3: passPhraseClass3,
            passPhraseClass4: passPhraseClass4,
            passPhraseClass5: passPhraseClass5,
            passPhraseClass6: passPhraseClass6
        });

        //6자리 입력 값 가져오기
        let result = this.getPassPhrase();
        //console.log("===result==="+result);

        //부모의 onChange 속성 이벤트로 결과값을 넘겨줌
        this.props.onChange(result);
    }

    //doClear (백스페이스)
    passPhraseDoClearClick = (e) => {
        var curUpw='',i=1;
        if(this.passPhraseAuthNo !== '') {
            curUpw = String(this.passPhraseAuthNo);
            this.passPhraseAuthNo = curUpw.substr(0,curUpw.length -1);
            let passPhraseClass1=null, passPhraseClass2=null, passPhraseClass3=null;
            let passPhraseClass4=null, passPhraseClass5=null, passPhraseClass6=null;
            for(i = 1; i < curUpw.length; i++){
                if(i == 1) passPhraseClass1 = "on";
                if(i == 2) passPhraseClass2 = "on";
                if(i == 3) passPhraseClass3 = "on";
                if(i == 4) passPhraseClass4 = "on";
                if(i == 5) passPhraseClass5 = "on";
                if(i == 6) passPhraseClass6 = "on";
            }

            this.setState({
                passPhraseClass1: passPhraseClass1,
                passPhraseClass2: passPhraseClass2,
                passPhraseClass3: passPhraseClass3,
                passPhraseClass4: passPhraseClass4,
                passPhraseClass5: passPhraseClass5,
                passPhraseClass6: passPhraseClass6
            });

            //6자리 입력 값 가져오기
            let result = this.getPassPhrase();
            //console.log("===result==="+result);

            //부모의 onChange 속성 이벤트로 결과값을 넘겨줌
            this.props.onChange(result);
        }
    }

    //doAllClear (전체삭제)
    passPhraseDoAllClearClick = (e) => {
        this.random();
        let passPhraseClass1=null, passPhraseClass2=null, passPhraseClass3=null;
        let passPhraseClass4=null, passPhraseClass5=null, passPhraseClass6=null;
        this.passPhraseAuthNo='';
        this.setState({
            passPhraseClass1: passPhraseClass1,
            passPhraseClass2: passPhraseClass2,
            passPhraseClass3: passPhraseClass3,
            passPhraseClass4: passPhraseClass4,
            passPhraseClass5: passPhraseClass5,
            passPhraseClass6: passPhraseClass6
        });
        //6자리 입력 값 가져오기
        let result = this.getPassPhrase();
        //console.log("===result==="+result);
        //부모의 onChange 속성 이벤트로 결과값을 넘겨줌
        this.props.onChange(result);
    }

    render() {
        return(
            <div>
                <Flex flexDirection={'column'} justifyContent={'center'} px={20} py={30}
                    custom={`
                        background-image: linear-gradient(45deg, ${color.green}, #65906A);
                    `}

                >
                    <Div fg={'white'} fontSize={16} fw={400} mb={25}>결제 비밀번호 6자리를 입력해 주세요.</Div>

                    <GridColumns repeat={6} colGap={10} rowGap={0}>
                        <DotItem showCircle={this.state.passPhraseClass1} />
                        <DotItem showCircle={this.state.passPhraseClass2} />
                        <DotItem showCircle={this.state.passPhraseClass3} />
                        <DotItem showCircle={this.state.passPhraseClass4} />
                        <DotItem showCircle={this.state.passPhraseClass5} />
                        <DotItem showCircle={this.state.passPhraseClass6} />
                    </GridColumns>
                </Flex>
                <GridColumns repeat={3} colGap={0} rowGap={0} bg={'veryLight'}>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[0]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[1]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[2]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[3]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[4]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[5]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[6]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[7]}</NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[8]}</NumberItem>
                    <NumberItem fg={'dark'} onClick={this.passPhraseDoAllClearClick}><FaRandom /></NumberItem>
                    <NumberItem onClick={this.passPhraseDoClick}>{this.state.pad[9]}</NumberItem>
                    <NumberItem fg={'dark'} onClick={this.passPhraseDoClearClick}><FaBackspace /></NumberItem>
                </GridColumns>
            </div>
        );
    }
}
export default PassPhrase
