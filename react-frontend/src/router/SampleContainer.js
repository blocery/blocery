import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom'
import { ImageCompressor,
    KycImageUploader, ArImageUploader, ProducerFileUpload,
    SummerNoteEditor, Billing, Danal, Icon, ArModel, JjalBot } from '../components/sample'
import Layout from '~/components/sample/Layout'
import Components from '~/components/sample/Components'
import {Div, Flex, Link, Space} from "~/styledComponents/shared";

class SampleContainer extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <Fragment>
                <Div px={16} py={16} bc={'light'} bt={0} bl={0} br={0}>
                    <Space flexWrap={'wrap'}>
                        <Link to={'/'}>Home</Link>
                        <Link to={'/sample/imageCompressor'}>ImageCompressor</Link>
                        <Link to={'/sample/kycImage'}>KycImageUploader</Link>
                        <Link to={'/sample/arImage'}>ArImageUploader</Link>
                        <Link to={'/sample/producerFile'}>ProducerFileUpload</Link>
                        <Link to={'/sample/summerNoteEditor'}>SummerNoteEditor</Link>
                        <Link to={'/sample/billing'}>Billing</Link>
                        <Link to={'/sample/danal'}>Danal</Link>
                        <Link to={'/sample/layout'}>Layout</Link>
                        <Link to={'/sample/components'}>Components</Link>
                        <Link to={'/sample/icon'}>Icon</Link>
                        <Link to={'/sample/ar'}>Ar</Link>
                        <Link to={'/sample/jjalbot'}>jjalbot</Link>
                    </Space>
                </Div>
                <Div>
                    <Switch>
                        <Route exact path='/sample' component={ImageCompressor} />
                        <Route exact path='/sample/imageCompressor' component={ImageCompressor} />
                        <Route exact path='/sample/kycImage' component={KycImageUploader} />
                        <Route exact path='/sample/arImage' component={ArImageUploader} />
                        <Route exact path='/sample/producerFile' component={ProducerFileUpload} />
                        <Route exact path='/sample/summerNoteEditor' component={SummerNoteEditor} />
                        <Route exact path='/sample/billing' component={Billing} />
                        <Route exact path='/sample/danal' component={Danal} />
                        <Route exact path='/sample/layout' component={Layout} />
                        <Route exact path='/sample/components' component={Components} />
                        <Route exact path='/sample/icon' component={Icon} />
                        <Route exact path='/sample/ar' component={ArModel} />
                        <Route exact path='/sample/jjalbot' component={JjalBot} />
                        <Route component={Error}/>
                    </Switch>
                </Div>
            </Fragment>
        )
    }
}

export default SampleContainer
