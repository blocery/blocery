import React, { Component } from 'react'

import SingleFileUploader from '../../common/ImageUploader/SingleFileUploader'

class ProducerFileUploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: {},
            fileKey: '123456789'
        }
    }

    //업로드된 경로 받기
    onChange = (name, items) => {
        const object = Object.assign({}, this.state);
        object.file = items;

        console.log("onUploadCompleted", object);
        this.setState(object);
    }


    render() {
        return (
            <div className='text-center'>
                <h6>src/components/sample/SingleFileUploader.js</h6>
                <h4>생산자 입점 서류 파일업로드</h4>
                <div className='text-left'>파일 업로드</div>
                <SingleFileUploader name={'sampleFile'} file={this.state.file} fileKey={this.state.fileKey} onChange={this.onChange}/>
            </div>
        );
    }
}

export default ProducerFileUploader