'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const {START, READY, RUNNING, STOPPED} = require('./constants');

class Example extends React.Component {

    constructor(props) {
        super(props);
        this.doReset = this.doReset.bind(this);
        this.doRun = this.doRun.bind(this);
        this.doKill = this.doKill.bind(this);
        this.doConfigure = this.doConfigure.bind(this);
        this.doClearConfig = this.doClearConfig.bind(this);
    }

    doConfigure() {
        AppActions.setLocalState(this.props.ctx, {displayConfig: true});
    }

    doRun() {
        AppActions.start(this.props.ctx);
    }

    doKill() {
        AppActions.killProcess(this.props.ctx);
    }

    doReset() {
        AppActions.reset(this.props.ctx);
    }

    doClearConfig() {
        AppActions.clearConfig(this.props.ctx);
    }

    render() {
        const fsmState = this.props.status && this.props.status.state;

        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'info1Id', bsSize: 'large'},
                     cE(rB.Col, {sm:2, xs: 12},
                        cE(rB.ControlLabel, null, 'State')
                       ),
                      cE(rB.Col, {sm:4, xs: 12},
                         cE(rB.FormControl, {
                             type: 'text',
                             readOnly: true,
                             value: fsmState
                         })
                        )
                    ),
                  cE(rB.FormGroup, {controlId: 'info2Id', bsSize: 'large'},
                     cE(rB.Col, {sm:2, xs: 12},
                        cE(rB.ControlLabel, null, 'Topic')
                       ),
                      cE(rB.Col, {sm:4, xs: 12},
                         cE(rB.FormControl, {
                             type: 'text',
                             readOnly: true,
                             value: (this.props.status &&
                                     this.props.status.topic) || 'None'
                         })
                        )
                    ),
                  cE(rB.FormGroup, {controlId: 'info3Id', bsSize: 'large'},
                     cE(rB.Col, {sm:2, xs: 12},
                        cE(rB.ControlLabel, null, 'Epoch')
                       ),
                      cE(rB.Col, {sm:4, xs: 12},
                         cE(rB.FormControl, {
                             type: 'text',
                             readOnly: true,
                             value: this.props.status && this.props.status.epoch
                         })
                        )
                    ),


                  cE(rB.FormGroup, {controlId: 'incId', bsSize: 'large'},
                     cE(rB.Col, {sm:2, xs: 12},
                        cE(rB.ControlLabel, null, 'Actions')
                       ),
                     cE(rB.Col, {sm:4, xs: 12},
                        cE(rB.ButtonGroup, null, [
                            fsmState === START ?
                                cE(rB.Button, {
                                    key: 100,
                                    bsStyle: 'primary',
                                    onClick: this.doConfigure
                                }, 'Change') : null,
                            fsmState === READY ?
                                cE(rB.Button, {
                                    key: 101,
                                    bsStyle: 'primary',
                                    onClick: this.doRun
                                }, 'Run') : null,
                            fsmState === READY ?
                                cE(rB.Button, {
                                    key: 102,
                                    bsStyle: 'danger',
                                    onClick: this.doClearConfig
                                }, 'Clear Config') : null,
                            fsmState === RUNNING ?
                                cE(rB.Button, {
                                    key: 103,
                                    bsStyle: 'primary',
                                    onClick: this.doReset
                                }, 'Reset') : null,
                            fsmState === RUNNING ?
                                cE(rB.Button, {
                                    key: 104,
                                    bsStyle: 'danger',
                                    onClick: this.doKill
                                }, 'Kill Process') : null
                        ].filter(x => !!x)
                       )
                    ),

                  cE(rB.FormGroup, {controlId: 'buttonId', bsSize: 'large'},
                     cE(rB.Col, {smOffset:2 ,sm:4, xs: 12},
                        cE(rB.Button, {
                            bsStyle: 'primary',
                            onClick: this.doIncrement
                        }, 'Change')
                       )
                     )
                 );
    }
}

module.exports = Example;
