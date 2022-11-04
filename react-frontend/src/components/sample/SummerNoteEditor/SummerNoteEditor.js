import React, { Component } from 'react'

import SummernoteEditor from '~/components/common/summernoteEditor'

class SummerNoteEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: null
        }
    }

    //내용 체인
    onChange = (items) => {
        const object = Object.assign({}, this.state);
        object.content = items;

        console.log("onUploadCompleted", object);
        this.setState(object);
    }


    render() {
        return (
            <div className='text-center'>
                <h6>src/components/sample/SummerNoteEditor.js</h6>
                <h4>SummerNoteEditor Test</h4>
                <SummernoteEditor onChange={this.onChange} value={this.state.content} />
            </div>
        );
    }
}

export default SummerNoteEditor