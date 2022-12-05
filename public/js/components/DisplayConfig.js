'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');


class DisplayConfig extends React.Component {

    constructor(props) {
        super(props);
        this.state = {kafkaTopic: '', kafkaBrokers: '', kafkaAPIKey: '',
                      kafkaAPISecret: ''};
        this.doDismiss = this.doDismiss.bind(this);
        this.doConfigure = this.doConfigure.bind(this);
        this.handleTopic = this.handleTopic.bind(this);
        this.handleBrokers = this.handleBrokers.bind(this);
        this.handleAPIKey = this.handleAPIKey.bind(this);
        this.handleAPISecret = this.handleAPISecret.bind(this);
    }

    handleTopic(e) {
        this.setState({kafkaTopic: e.target.value});
    }

    handleBrokers(e) {
        this.setState({kafkaBrokers: e.target.value});
    }

    handleAPIKey(e) {
        this.setState({kafkaAPIKey: e.target.value});
    }

    handleAPISecret(e) {
        this.setState({kafkaAPISecret: e.target.value});
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {displayConfig: false});
    }

    doConfigure(ev) {
        let {kafkaTopic, kafkaBrokers, kafkaAPIKey, kafkaAPISecret} =
            this.state;
        if (kafkaTopic && kafkaBrokers && kafkaAPIKey && kafkaAPISecret) {
            kafkaBrokers = JSON.parse(kafkaBrokers);
            AppActions.config(this.props.ctx, {kafkaTopic, kafkaBrokers,
                                               kafkaAPIKey, kafkaAPISecret});
        } else {
            AppActions.setError(this.props.ctx, new Error('Invalid config'));
        }
        this.doDismiss();
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.displayConfig,
                             onHide: this.doDismiss,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'Configure')
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'topic'},
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.ControlLabel, null, 'Topic')
                             ),
                           cE(rB.Col, {sm: 8, xs: 12},
                              cE(rB.FormControl, {
                                  value: this.state.kafkaTopic,
                                  onChange: this.handleTopic
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'brokers'},
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.ControlLabel, null, 'Brokers')
                             ),
                           cE(rB.Col, {sm: 8, xs: 12},
                              cE(rB.FormControl, {
                                  value: this.state.kafkaBrokers,
                                  onChange: this.handleBrokers
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'apiKey'},
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.ControlLabel, null, 'API Key')
                             ),
                           cE(rB.Col, {sm: 8, xs: 12},
                              cE(rB.FormControl, {
                                  value: this.state.kafkaAPIKey,
                                  onChange: this.handleAPIKey
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'apiSecret'},
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.ControlLabel, null, 'API Secret')
                             ),
                           cE(rB.Col, {sm: 8, xs: 12},
                              cE(rB.FormControl, {
                                  value: this.state.kafkaAPISecret,
                                  onChange: this.handleAPISecret
                              })
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.ButtonGroup, null,
                        cE(rB.Button, {onClick: this.doDismiss}, 'Cancel'),
                        cE(rB.Button, {
                            bsStyle: 'danger',
                            onClick: this.doConfigure
                        }, 'Update')
                       )
                    )
                 );
    }
}

module.exports = DisplayConfig;
