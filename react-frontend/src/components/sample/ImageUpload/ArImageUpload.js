import React, { Component } from 'react'

import SingleArImageUploader from '../../common/ImageUploader/SingleArImageUploader'

class ArImageUploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: {}
        }
    }

    //업로드된 이미지 경로 받기
    onChange = (items) => {
        const object = Object.assign({}, this.state);
        object.image = items;

        console.log("onUploadCompleted", object);
        this.setState(object);
    }


    render() {
        return (
            <div className='text-center'>
                <h6>src/components/sample/ArImageUploader.js</h6>
                <h4>Ar 이미지 업로드</h4>
                <div className='text-left'>Ar 업로드</div>
                <SingleArImageUploader image={this.state.image} arType={'glb'} onChange={this.onChange}/>
            </div>
        );
    }
}

export default ArImageUploader